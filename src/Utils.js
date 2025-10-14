
import { useRef, useEffect, useState } from 'react';

export function autoChangeRarityColor(rarity) {
  switch (rarity.toLowerCase()) {

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


export const getStatVariant = (value) => {
  if (value < 40) return "danger";
  if (value < 60) return "warning";
  return "success";
};


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

/**
 * @returns {[ref, boolean]} 
 */
export function useIntersectionObserver() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false); 
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Tạo observer mặc định (threshold = 0.1, rootMargin = 0)
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(element); 
      }
    });

    observer.observe(element);

    return () => observer.unobserve(element);
  }, []);

  return [ref, isVisible];
}
