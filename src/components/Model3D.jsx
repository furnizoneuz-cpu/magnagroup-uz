"use client";
import { useEffect } from "react";

/*
  Real 3D (GLB/GLTF) viewer — Google model-viewer web component, bundled locally
  (no CDN). Renders when a product has a `model3d` file: auto-rotates, drag to
  orbit, pinch/scroll to zoom, AR-ready on supporting devices.
  Usage: <Model3D src="/models/GA91.glb" poster={product.image} alt="..." />
*/
export default function Model3D({ src, poster, alt = "", className = "" }) {
  useEffect(() => {
    import("@google/model-viewer").catch(() => {});
  }, []);

  if (!src) return null;
  return (
    <model-viewer
      src={src}
      poster={poster || undefined}
      alt={alt}
      camera-controls
      auto-rotate
      auto-rotate-delay="800"
      rotation-per-second="24deg"
      shadow-intensity="0.8"
      exposure="1.05"
      interaction-prompt="auto"
      ar
      ar-modes="webxr scene-viewer quick-look"
      style={{ width: "100%", height: "100%", background: "transparent" }}
      class={className}
    />
  );
}
