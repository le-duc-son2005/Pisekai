import Monster from "../models/Monster.js";
import Character from "../models/Character.js";
import User from "../models/User.js";

// GET /api/battle/levels
export const listLevels = async (_req, res) => {
  try {
    // Fetch full documents to ensure any top-level stat fields (hp, attack, defense, speed) are included
    const monsters = await Monster.find({})
      .sort({ level: 1, name: 1 })
      .lean();

    console.log(`[battle] listLevels fetched: ${Array.isArray(monsters) ? monsters.length : 0}`);
    if (Array.isArray(monsters) && monsters.length > 0) {
      const sample = monsters[0];
      console.log('[battle] sample document keys:', Object.keys(sample || {}));
      console.log('[battle] sample name:', sample?.name, 'has stats:', !!sample?.stats, 'stats keys:', sample?.stats ? Object.keys(sample.stats) : []);
    }

    // If stats not present but top-level fields exist, attach a stats object from those fields (no calculations)
    const unified = (monsters || []).map((m) => {
      if (m && typeof m.stats === 'object' && m.stats !== null) return m;
      const hp = m?.hp ?? m?.HP ?? m?.health;
      const attack = m?.attack ?? m?.atk;
      const defense = m?.defense ?? m?.def;
      const speed = m?.speed ?? m?.spd ?? m?.agi;
      if (hp != null || attack != null || defense != null || speed != null) {
        return { ...m, stats: { hp, attack, defense, speed } };
      }
      return m;
    });

    res.json(unified);
  } catch (e) {
    console.error('[battle] listLevels error:', e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// GET /api/battle/preview/:monsterId
// Estimate win probability based on character vs monster stats using Monte Carlo simulation.
export const previewBattle = async (req, res) => {
  try {
    const userId = req.user?.id; // set by auth middleware
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const monsterId = req.params.monsterId;
    const monster = await Monster.findById(monsterId).lean();
    if (!monster) return res.status(404).json({ message: 'Monster not found' });

    const character = await Character.findOne({ userId }).lean();
    if (!character) return res.status(404).json({ message: 'Character not found' });

    // Normalize stats shapes
    const mStats = monster.stats || {};
    const foe = {
      hp: Number(mStats.hp ?? monster.hp ?? 50),
      attack: Number(mStats.attack ?? monster.attack ?? 5),
      defense: Number(mStats.defense ?? monster.defense ?? 2),
      speed: Number(mStats.speed ?? monster.speed ?? 1),
      critChance: Number(mStats.critChance ?? mStats.crit ?? 0.05),
      critMult: Number(mStats.critMult ?? 1.5),
      evade: Number(mStats.evade ?? mStats.dodge ?? 0.02),
    };

    const cStats = character.stats || {};
    const hero = {
      hp: Number(cStats.hp ?? 100),
      attack: Number(cStats.damage ?? cStats.attack ?? 10),
      defense: Number(cStats.armor ?? cStats.defense ?? 3),
      speed: Number(cStats.speed ?? 2),
      critChance: Number(cStats.critChance ?? 0.1),
      critMult: Number(cStats.critMult ?? 1.5),
      evade: Number(cStats.evade ?? 0.05),
    };

    // Balance constants (tunable via env)
    const CONST = {
      DEFENSE_REDUCTION: Number(process.env.DEFENSE_REDUCTION ?? 0.5), // each defense reduces damage by 0.5
      SPEED_EVADE_COEF: Number(process.env.SPEED_EVADE_COEF ?? 0.01),   // +1% evade per speed difference
      SPEED_EVADE_CAP: Number(process.env.SPEED_EVADE_CAP ?? 0.2),      // max +20% extra evade from speed
      MAX_EVADE: Number(process.env.MAX_EVADE ?? 0.6),                  // hard cap 60% evade
    };

    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const bernoulli = (p) => Math.random() < clamp01(p);

    const evadeProb = (defender, attacker) => {
      const base = defender.evade ?? 0;
      const extra = Math.max(0, Math.min(CONST.SPEED_EVADE_CAP, (defender.speed - attacker.speed) * CONST.SPEED_EVADE_COEF));
      return Math.max(0, Math.min(CONST.MAX_EVADE, base + extra));
    };

    const dealDamage = (attacker, defender, isCrit) => {
      const raw = attacker.attack * (isCrit ? attacker.critMult : 1);
      const reduced = raw - defender.defense * CONST.DEFENSE_REDUCTION;
      return Math.max(1, Math.floor(reduced));
    };

    const simulate = () => {
      let Hhp = hero.hp;
      let Mhp = foe.hp;
      // decide who goes first by speed (tie: 50/50)
      let heroTurn = hero.speed === foe.speed ? Math.random() < 0.5 : hero.speed > foe.speed;
      let guard = 0;
      while (Hhp > 0 && Mhp > 0 && guard++ < 1000) {
        if (heroTurn) {
          // hero attacks monster with speed-based evasion and crit
          const ev = evadeProb(foe, hero);
          if (!bernoulli(ev)) {
            const isCrit = bernoulli(hero.critChance);
            const dmg = dealDamage(hero, foe, isCrit);
            Mhp -= dmg;
          }
        } else {
          // monster attacks hero with speed-based evasion and crit
          const ev = evadeProb(hero, foe);
          if (!bernoulli(ev)) {
            const isCrit = bernoulli(foe.critChance);
            const dmg = dealDamage(foe, hero, isCrit);
            Hhp -= dmg;
          }
        }
        heroTurn = !heroTurn;
      }
      return Hhp > 0 && Mhp <= 0;
    };

    const SAMPLES = Number(process.env.BATTLE_SAMPLES || 300);
    let wins = 0;
    for (let i = 0; i < SAMPLES; i++) {
      if (simulate()) wins++;
    }
    const winRate = wins / SAMPLES;

    const rewards = monster.rewards || {};
    // Robust parse: accept numbers or strings like "EXP +50", and key variants
    const parseNumber = (v) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const m = v.match(/[-+]?\d+/);
        return m ? parseInt(m[0], 10) : 0;
      }
      return 0;
    };
    const lowerKeys = (obj) => {
      const out = {}; Object.keys(obj || {}).forEach((k) => out[k.toLowerCase()] = obj[k]); return out;
    };
    const r = lowerKeys(rewards);
    let exp = parseNumber(r.exp ?? r.xp ?? r.experience ?? r['exp+'] ?? 0);
    let coins = parseNumber(r.coins ?? r.coin ?? r.gold ?? 0);
    // Also scan object string values to catch patterns
    for (const val of Object.values(r)) {
      if (typeof val === 'string') {
        if (/exp/i.test(val)) exp = Math.max(exp, parseNumber(val));
        if (/(coin|gold)/i.test(val)) coins = Math.max(coins, parseNumber(val));
      }
    }

    // Provide formula and sample calculations for UI/explanation
    const calc = {
      defenseReduction: CONST.DEFENSE_REDUCTION,
      speedEvadeCoef: CONST.SPEED_EVADE_COEF,
      speedEvadeCap: CONST.SPEED_EVADE_CAP,
      maxEvade: CONST.MAX_EVADE,
      damageFormula: 'damage = max(1, floor( attack*(crit?critMult:1) - defense*DEFENSE_REDUCTION ))',
      evadeFormula: 'evade = clamp( baseEvade + clamp((defSpeed - atkSpeed) * SPEED_EVADE_COEF, 0, SPEED_EVADE_CAP), 0, MAX_EVADE )',
      sample: {
        heroToMonster: {
          evade: evadeProb(foe, hero),
          nonCritDamage: dealDamage(hero, foe, false),
          critDamage: dealDamage(hero, foe, true),
        },
        monsterToHero: {
          evade: evadeProb(hero, foe),
          nonCritDamage: dealDamage(foe, hero, false),
          critDamage: dealDamage(foe, hero, true),
        },
      },
    };

    res.json({
      winRate,
      samples: SAMPLES,
      expected: {
        exp: winRate * exp,
        coins: winRate * coins,
      },
      hero,
      monster: foe,
      calc,
    });
  } catch (e) {
    console.error('[battle] previewBattle error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

// POST /api/battle/fight/:monsterId
// Simulate one full fight and return detailed log and result (no DB updates yet)
export const fightBattle = async (req, res) => {
  try {
    const userId = req.user?.id; // set by auth middleware
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const monsterId = req.params.monsterId;
    const monster = await Monster.findById(monsterId).lean();
    if (!monster) return res.status(404).json({ message: 'Monster not found' });

    const character = await Character.findOne({ userId }).lean();
    if (!character) return res.status(404).json({ message: 'Character not found' });

    // Normalize stats shapes
    const mStats = monster.stats || {};
    const foe = {
      hp: Number(mStats.hp ?? monster.hp ?? 50),
      attack: Number(mStats.attack ?? monster.attack ?? 5),
      defense: Number(mStats.defense ?? monster.defense ?? 2),
      speed: Number(mStats.speed ?? monster.speed ?? 1),
      critChance: Number(mStats.critChance ?? mStats.crit ?? 0.05),
      critMult: Number(mStats.critMult ?? 1.5),
      evade: Number(mStats.evade ?? mStats.dodge ?? 0.02),
      name: monster.name,
    };

    const cStats = character.stats || {};
    const hero = {
      hp: Number(cStats.hp ?? 100),
      attack: Number(cStats.damage ?? cStats.attack ?? 10),
      defense: Number(cStats.armor ?? cStats.defense ?? 3),
      speed: Number(cStats.speed ?? 2),
      critChance: Number(cStats.critChance ?? 0.1),
      critMult: Number(cStats.critMult ?? 1.5),
      evade: Number(cStats.evade ?? 0.05),
      name: 'You',
    };

    // Balance constants (same as preview)
    const CONST = {
      DEFENSE_REDUCTION: Number(process.env.DEFENSE_REDUCTION ?? 0.5),
      SPEED_EVADE_COEF: Number(process.env.SPEED_EVADE_COEF ?? 0.01),
      SPEED_EVADE_CAP: Number(process.env.SPEED_EVADE_CAP ?? 0.2),
      MAX_EVADE: Number(process.env.MAX_EVADE ?? 0.6),
    };

    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const bernoulli = (p) => Math.random() < clamp01(p);
    const evadeProb = (defender, attacker) => {
      const base = defender.evade ?? 0;
      const extra = Math.max(0, Math.min(CONST.SPEED_EVADE_CAP, (defender.speed - attacker.speed) * CONST.SPEED_EVADE_COEF));
      return Math.max(0, Math.min(CONST.MAX_EVADE, base + extra));
    };
    const dealDamage = (attacker, defender, isCrit) => {
      const raw = attacker.attack * (isCrit ? attacker.critMult : 1);
      const reduced = raw - defender.defense * CONST.DEFENSE_REDUCTION;
      return Math.max(1, Math.floor(reduced));
    };

    // Simulate with detailed log
    let Hhp = hero.hp;
    let Mhp = foe.hp;
    let heroTurn = hero.speed === foe.speed ? Math.random() < 0.5 : hero.speed > foe.speed;
    let guard = 0;
    const log = [];
    while (Hhp > 0 && Mhp > 0 && guard++ < 1000) {
      if (heroTurn) {
        const ev = evadeProb(foe, hero);
        const evaded = bernoulli(ev);
        let crit = false;
        let dmg = 0;
        if (!evaded) {
          crit = bernoulli(hero.critChance);
          dmg = dealDamage(hero, foe, crit);
          Mhp -= dmg;
        }
        log.push({
          turn: guard,
          actor: 'hero',
          target: 'monster',
          evasionChance: ev,
          evaded,
          crit,
          damage: dmg,
          heroHp: Math.max(0, Hhp),
          monsterHp: Math.max(0, Mhp),
        });
      } else {
        const ev = evadeProb(hero, foe);
        const evaded = bernoulli(ev);
        let crit = false;
        let dmg = 0;
        if (!evaded) {
          crit = bernoulli(foe.critChance);
          dmg = dealDamage(foe, hero, crit);
          Hhp -= dmg;
        }
        log.push({
          turn: guard,
          actor: 'monster',
          target: 'hero',
          evasionChance: ev,
          evaded,
          crit,
          damage: dmg,
          heroHp: Math.max(0, Hhp),
          monsterHp: Math.max(0, Mhp),
        });
      }
      heroTurn = !heroTurn;
    }

    const winner = Hhp > 0 && Mhp <= 0 ? 'hero' : 'monster';
    const rewards = monster.rewards || {};
    const parseNumber2 = (v) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') { const m = v.match(/[-+]?\d+/); return m ? parseInt(m[0], 10) : 0; }
      return 0;
    };
    const lowerKeys2 = (obj) => { const out = {}; Object.keys(obj || {}).forEach((k) => out[k.toLowerCase()] = obj[k]); return out; };
    const r2 = lowerKeys2(rewards);
    let exp = parseNumber2(r2.exp ?? r2.xp ?? r2.experience ?? r2['exp+'] ?? 0);
    let coins = parseNumber2(r2.coins ?? r2.coin ?? r2.gold ?? 0);
    for (const val of Object.values(r2)) {
      if (typeof val === 'string') {
        if (/exp/i.test(val)) exp = Math.max(exp, parseNumber2(val));
        if (/(coin|gold)/i.test(val)) coins = Math.max(coins, parseNumber2(val));
      }
    }

    // Apply rewards to database when hero wins (coins to User.gold, exp to Character.exp)
    let applied = { exp: 0, gold: 0 };
    let userAfter = null;
    let charAfter = null;
    if (winner === 'hero') {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.gold = (user.gold || 0) + coins;
          await user.save();
          applied.gold = coins;
        }
        let ch = await Character.findOne({ userId });
        if (ch) {
          ch.exp = (ch.exp || 0) + exp;
          await ch.save();
          applied.exp = exp;
          charAfter = { level: ch.level, exp: ch.exp };
        } else if (user) {
          // Fallback to user.exp if no character found
          user.exp = (user.exp || 0) + exp;
          await user.save();
          applied.exp = exp;
        }
        // load latest user snapshot
        const fresh = await User.findById(userId).select('gold gems exp username email role');
        if (fresh) userAfter = { username: fresh.username, email: fresh.email, role: fresh.role, gold: fresh.gold, gems: fresh.gems, exp: fresh.exp };
      } catch (applyErr) {
        console.error('[battle] apply rewards failed:', applyErr);
      }
    }

    res.json({
      winner,
      hero: { ...hero, hp: hero.hp, hpRemaining: Math.max(0, Hhp) },
      monster: { ...foe, hp: foe.hp, hpRemaining: Math.max(0, Mhp), name: monster.name },
      rewards: winner === 'hero' ? { exp, coins } : { exp: 0, coins: 0 },
  applied, // actual amounts applied to DB
  userAfter, // snapshot for UI sync
  charAfter,
      turns: log.length,
      log,
      formulas: {
        damage: 'max(1, floor( attack*(crit?critMult:1) - defense*DEFENSE_REDUCTION ))',
        evade: 'clamp( baseEvade + clamp((defSpeed - atkSpeed)*SPEED_EVADE_COEF, 0, SPEED_EVADE_CAP), 0, MAX_EVADE )',
      },
    });
  } catch (e) {
    console.error('[battle] fightBattle error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

// GET /api/battle/preview-open/:monsterId (no auth) — uses default hero stats for testing routes
export const previewBattleOpen = async (req, res) => {
  try {
    const monsterId = req.params.monsterId;
    const monster = await Monster.findById(monsterId).lean();
    if (!monster) return res.status(404).json({ message: 'Monster not found' });

    const mStats = monster.stats || {};
    const foe = {
      hp: Number(mStats.hp ?? monster.hp ?? 50),
      attack: Number(mStats.attack ?? monster.attack ?? 5),
      defense: Number(mStats.defense ?? monster.defense ?? 2),
      speed: Number(mStats.speed ?? monster.speed ?? 1),
      critChance: Number(mStats.critChance ?? mStats.crit ?? 0.05),
      critMult: Number(mStats.critMult ?? 1.5),
      evade: Number(mStats.evade ?? mStats.dodge ?? 0.02),
    };

    // default hero stats for open preview
    const hero = {
      hp: 120,
      attack: 12,
      defense: 4,
      speed: 3,
      critChance: 0.1,
      critMult: 1.5,
      evade: 0.05,
    };

    const CONST = {
      DEFENSE_REDUCTION: Number(process.env.DEFENSE_REDUCTION ?? 0.5),
      SPEED_EVADE_COEF: Number(process.env.SPEED_EVADE_COEF ?? 0.01),
      SPEED_EVADE_CAP: Number(process.env.SPEED_EVADE_CAP ?? 0.2),
      MAX_EVADE: Number(process.env.MAX_EVADE ?? 0.6),
    };
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const bernoulli = (p) => Math.random() < clamp01(p);
    const evadeProb = (defender, attacker) => {
      const base = defender.evade ?? 0;
      const extra = Math.max(0, Math.min(CONST.SPEED_EVADE_CAP, (defender.speed - attacker.speed) * CONST.SPEED_EVADE_COEF));
      return Math.max(0, Math.min(CONST.MAX_EVADE, base + extra));
    };
    const dealDamage = (attacker, defender, isCrit) => {
      const raw = attacker.attack * (isCrit ? attacker.critMult : 1);
      const reduced = raw - defender.defense * CONST.DEFENSE_REDUCTION;
      return Math.max(1, Math.floor(reduced));
    };

    const simulate = () => {
      let Hhp = hero.hp;
      let Mhp = foe.hp;
      let heroTurn = hero.speed === foe.speed ? Math.random() < 0.5 : hero.speed > foe.speed;
      let guard = 0;
      while (Hhp > 0 && Mhp > 0 && guard++ < 1000) {
        if (heroTurn) {
          const ev = evadeProb(foe, hero);
          if (!bernoulli(ev)) {
            const isCrit = bernoulli(hero.critChance);
            Mhp -= dealDamage(hero, foe, isCrit);
          }
        } else {
          const ev = evadeProb(hero, foe);
          if (!bernoulli(ev)) {
            const isCrit = bernoulli(foe.critChance);
            Hhp -= dealDamage(foe, hero, isCrit);
          }
        }
        heroTurn = !heroTurn;
      }
      return Hhp > 0 && Mhp <= 0;
    };

    const SAMPLES = Number(process.env.BATTLE_SAMPLES || 300);
    let wins = 0;
    for (let i = 0; i < SAMPLES; i++) if (simulate()) wins++;
    const winRate = wins / SAMPLES;

    const rewards = monster.rewards || {};
    const exp = Number(rewards.exp ?? 0);
    const coins = Number(rewards.coins ?? rewards.gold ?? 0);

    res.json({ winRate, samples: SAMPLES, expected: { exp: winRate * exp, coins: winRate * coins }, hero, monster: foe });
  } catch (e) {
    console.error('[battle] previewBattleOpen error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

// POST /api/battle/fight-open/:monsterId (no auth) — uses default hero stats for testing routes
export const fightBattleOpen = async (req, res) => {
  try {
    const monsterId = req.params.monsterId;
    const monster = await Monster.findById(monsterId).lean();
    if (!monster) return res.status(404).json({ message: 'Monster not found' });

    const mStats = monster.stats || {};
    const foe = {
      hp: Number(mStats.hp ?? monster.hp ?? 50),
      attack: Number(mStats.attack ?? monster.attack ?? 5),
      defense: Number(mStats.defense ?? monster.defense ?? 2),
      speed: Number(mStats.speed ?? monster.speed ?? 1),
      critChance: Number(mStats.critChance ?? mStats.crit ?? 0.05),
      critMult: Number(mStats.critMult ?? 1.5),
      evade: Number(mStats.evade ?? mStats.dodge ?? 0.02),
      name: monster.name,
    };

    const hero = {
      hp: 120,
      attack: 12,
      defense: 4,
      speed: 3,
      critChance: 0.1,
      critMult: 1.5,
      evade: 0.05,
      name: 'You',
    };

    const CONST = {
      DEFENSE_REDUCTION: Number(process.env.DEFENSE_REDUCTION ?? 0.5),
      SPEED_EVADE_COEF: Number(process.env.SPEED_EVADE_COEF ?? 0.01),
      SPEED_EVADE_CAP: Number(process.env.SPEED_EVADE_CAP ?? 0.2),
      MAX_EVADE: Number(process.env.MAX_EVADE ?? 0.6),
    };
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const bernoulli = (p) => Math.random() < clamp01(p);
    const evadeProb = (defender, attacker) => {
      const base = defender.evade ?? 0;
      const extra = Math.max(0, Math.min(CONST.SPEED_EVADE_CAP, (defender.speed - attacker.speed) * CONST.SPEED_EVADE_COEF));
      return Math.max(0, Math.min(CONST.MAX_EVADE, base + extra));
    };
    const dealDamage = (attacker, defender, isCrit) => {
      const raw = attacker.attack * (isCrit ? attacker.critMult : 1);
      const reduced = raw - defender.defense * CONST.DEFENSE_REDUCTION;
      return Math.max(1, Math.floor(reduced));
    };

    let Hhp = hero.hp;
    let Mhp = foe.hp;
    let heroTurn = hero.speed === foe.speed ? Math.random() < 0.5 : hero.speed > foe.speed;
    let guard = 0;
    const log = [];
    while (Hhp > 0 && Mhp > 0 && guard++ < 1000) {
      if (heroTurn) {
        const ev = evadeProb(foe, hero);
        const evaded = bernoulli(ev);
        let crit = false, dmg = 0;
        if (!evaded) { crit = bernoulli(hero.critChance); dmg = dealDamage(hero, foe, crit); Mhp -= dmg; }
        log.push({ turn: guard, actor: 'hero', target: 'monster', evasionChance: ev, evaded, crit, damage: dmg, heroHp: Math.max(0,Hhp), monsterHp: Math.max(0,Mhp) });
      } else {
        const ev = evadeProb(hero, foe);
        const evaded = bernoulli(ev);
        let crit = false, dmg = 0;
        if (!evaded) { crit = bernoulli(foe.critChance); dmg = dealDamage(foe, hero, crit); Hhp -= dmg; }
        log.push({ turn: guard, actor: 'monster', target: 'hero', evasionChance: ev, evaded, crit, damage: dmg, heroHp: Math.max(0,Hhp), monsterHp: Math.max(0,Mhp) });
      }
      heroTurn = !heroTurn;
    }

    const winner = Hhp > 0 && Mhp <= 0 ? 'hero' : 'monster';
    const rewards = monster.rewards || {};
    const exp = Number(rewards.exp ?? 0);
    const coins = Number(rewards.coins ?? rewards.gold ?? 0);

    res.json({ winner, hero: { ...hero, hpRemaining: Math.max(0,Hhp) }, monster: { ...foe, hpRemaining: Math.max(0,Mhp) }, rewards: winner==='hero'?{exp,coins}:{exp:0,coins:0}, turns: log.length, log });
  } catch (e) {
    console.error('[battle] fightBattleOpen error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
