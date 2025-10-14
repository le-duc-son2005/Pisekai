export const weapons = [

{ 
  "id": "201",
  "name": "Arcane Wand",
  "type": "Wand",
  "origin": "Mystic Grove",
  "rarity": "Rare",
  "description": "Channels focused arcane energy to cast precise spells and buff allies.",
  "requirements": [
    "High affinity with arcane magic",
    "Knowledge of elemental runes",
    "Skilled in long-range spellcasting"
  ],
  "stats": {
    "atk": 70,
    "def": 30,
    "magic": 95,
    "speed": 40
  },
  "image": "/image/weapon1.png"
},

{ 
  "id": "202",
  "name": "Inferno Mace",
  "type": "Mace",
  "origin": "Volcanic Forge",
  "rarity": "Epic",
  "description": "Delivers crushing blows that explode into flames, dealing area burn damage.",
  "requirements": [
    "Mastery of fire enchantments",
    "Strength to wield heavy weapons",
    "Resistance to heat and flames"
  ],
  "stats": {
    "atk": 95,
    "def": 80,
    "magic": 40,
    "speed": 20
  },
  "image": "/image/weapon7.png"
},

{ 
  "id": "203",
  "name": "Frostblade Sword",
  "type": "Sword",
  "origin": "Glacial Keep",
  "rarity": "Epic",
  "description": "A blade of pure ice — each strike chills enemies and slows their movement.",
  "requirements": [
    "Proficiency with sword combat",
    "Control over frost energy",
    "Training in dueling techniques"
  ],
  "stats": {
    "atk": 85,
    "def": 60,
    "magic": 50,
    "speed": 65
  },
  "image": "/image/weapon6.png"
},

{ 
  "id": "204",
  "name": "Trident of Insight",
  "type": "Trident",
  "origin": "Oceanic Temple",
  "rarity": "Rare",
  "description": "Pierces defenses and reveals hidden weaknesses in foes, increasing critical damage.",
  "requirements": [
    "Blessing from sea spirits",
    "Skill with polearm weapons",
    "Keen perception in battle"
  ],
  "stats": {
    "atk": 75,
    "def": 70,
    "magic": 60,
    "speed": 55
  },
  "image": "/image/weapon4.png"
},

{ 
  "id": "205",
  "name": "Azure Scythe",
  "type": "Scythe",
  "origin": "Cloudspire",
  "rarity": "Uncommon",
  "description": "Swift sweeping attacks that disrupt enemy formations and grant mobility.",
  "requirements": [
    "Agility and swift movements",
    "Proficiency in scythe techniques",
    "Training in aerial combat"
  ],
  "stats": {
    "atk": 80,
    "def": 40,
    "magic": 55,
    "speed": 90
  },
  "image": "/image/weapon5.png"
}

];

 export const features = [
    { title: "Battle Pass", img: require("../asserts/Battlepass-Iconic.png"), path: "/Battle-Pass" },
    { title: "World-Boss", img: require("../asserts/Boss-Iconic.png"), path: "/Boss" },
    { title: "Enchantment", img: require("../asserts/Enchantment-Iconic.png"), path: "/Enchantment" },
    { title: "Friend", img: require("../asserts/Friend-Iconic.png"), path: "/Friends" }, 
  ];
export const marketData = [
    { player: "Người chơi A", img: require("../asserts/Battlepass-Iconic.png"), weapon: "Sword of Shadows", price: 16000 },
    { player: "Người chơi B", img: require("../asserts/Boss-Iconic.png"), weapon: "Staff of Truth", price: 15000},
    { player: "Người chơi C", img: require("../asserts/Boss-Iconic.png"), weapon: "Sword of Fury", price: 20000 },
    { player: "Người chơi D", img: require("../asserts/Boss-Iconic.png"), weapon: "Axe of Eternity", price: 17500 },
    { player: "Người chơi E", img: require("../asserts/Boss-Iconic.png"), weapon: "Bow of Light", price: 18000 },
  ];

export const topPlayers = [
  { id: 1, name: 'MAX ALEXIS', score: 9980, image: 'https://i.pinimg.com/736x/1d/71/6c/1d716c0fad778ecc12598f384e7dd000.jpg' },
  { id: 2, name: 'WILIUM LILI', score: 9850, image:'https://i.pinimg.com/736x/13/d5/99/13d599b1d20fb60c5d5d92239785140c.jpg' },
  { id: 3, name: 'MAC MARSH', score: 9999, image: 'https://i.pinimg.com/736x/72/f7/2b/72f72bc8c1d9c29866197410adf86985.jpg' },
  { id: 4, name: 'EVA RAINA', score: 9710, image: 'https://i.pinimg.com/736x/32/17/5c/32175cff8a5524145ed04a4a30c924fd.jpg' },
  { id: 5, name: 'ROBIN CLOTH', score: 9600, image:' https://i.pinimg.com/736x/13/d5/99/13d599b1d20fb60c5d5d92239785140c.jpg' },
];
export const characters = [
  {
    id: 1,
    name: "Mage",
    img: require("../asserts/Mage.gif"),
    stats: { HP: 55, SPEED: 75, DAMAGE: 85, ARMOR: 35 },
    buff: "+20% magic penetration",
  },
  {
    id: 2,
    name: "Tanker",
    img: require("../asserts/Tanker.gif"),
    stats: { HP: 90, SPEED: 30, DAMAGE: 50, ARMOR: 80 },
    buff: "+10% damage reduction",
  },
  {
    id: 3,
    name: "Fighter",
    img: require("../asserts/Fighter.gif"),
    stats: { HP: 70, SPEED: 50, DAMAGE: 65, ARMOR: 65 },
    buff: "+15% crit chance on first hit ",
  },
  {
    id: 4,
    name: "Assassin",
    img: require("../asserts/Assasin.gif"),
    stats: { HP: 55, SPEED: 90, DAMAGE: 80, ARMOR: 25 },
    buff: "+15% lifesteal",
  },
  {
    id: 5,
    name: "Archer",
    img: require("../asserts/Archer.gif"),
    stats: { HP: 75, SPEED: 70, DAMAGE: 60, ARMOR: 45 },
    buff: "+25% crit damage",
  },
];