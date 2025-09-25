export function autoChangeRarityColor(rarity){
    switch (rarity.toLowerCase()){
        
        case 'uncommon':
            return 'gray';
        case 'rare':
            return 'blue';
        case 'epic':
            return 'purple';
        default:
            return 'black';
    }
}

let rainInterval; // lưu id của setInterval

export function createRaindrop(container) {
  const raindrop = document.createElement("img");
  raindrop.src = "/image/volcanicAsh.png"; 
  raindrop.classList.add("raindrop");

  // Vị trí & tốc độ ngẫu nhiên
  raindrop.style.left = Math.random() * window.innerWidth + "px";
  raindrop.style.animationDuration = (Math.random() * 2 + 1) + "s";

  container.appendChild(raindrop);

  setTimeout(() => {
    raindrop.remove();
  }, 3000);
}

export function startRain(container) {
  stopRain(); // tránh tạo nhiều interval trùng
  rainInterval = setInterval(() => {
    createRaindrop(container);
  }, 200);
}

export function stopRain() {
  if (rainInterval) {
    clearInterval(rainInterval);
    rainInterval = null;
  }
}

