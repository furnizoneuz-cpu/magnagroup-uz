"use client";
import { useEffect } from "react";

// Listens for "magna:fly" events and animates a dot from click point to the cart icon.
export default function CartFx() {
  useEffect(() => {
    function onFly(e) {
      const { x, y } = e.detail || {};
      const target = document.getElementById("cart-btn");
      if (x == null || !target) return;
      const tr = target.getBoundingClientRect();
      const tx = tr.left + tr.width / 2;
      const ty = tr.top + tr.height / 2;

      const dot = document.createElement("div");
      dot.className = "fly-dot";
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      document.body.appendChild(dot);

      const dx = tx - x;
      const dy = ty - y;
      const anim = dot.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(1.1)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.7 },
        ],
        { duration: 700, easing: "cubic-bezier(0.5,0,0.75,0)" }
      );
      anim.onfinish = () => {
        dot.remove();
        target.classList.add("cartbump");
        setTimeout(() => target.classList.remove("cartbump"), 420);
      };
    }
    window.addEventListener("magna:fly", onFly);
    return () => window.removeEventListener("magna:fly", onFly);
  }, []);
  return null;
}
