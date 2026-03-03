
import { useRef, useEffect, useState } from 'react';

export function autoChangeRarityColor(rarity) {
  const key = (rarity || '').toLowerCase();
  // Mapping per request:
  // uncommon → white, common → green, rare → blue, epic → purple, legendary → orange-gold
  switch (key) {
    case 'uncommon':
      return '#ffffff';
    case 'common':
      return '#22c55e'; // green
    case 'rare':
      return '#0ea5e9'; // blue
    case 'epic':
      return '#a855f7'; // purple
    case 'legendary':
      return '#f59e0b'; // orange-gold
    default:
      return '#e5e7eb'; // neutral light
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
