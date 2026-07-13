"use client";
import { useState } from "react";
import ProductZoom from "@/components/ProductZoom";

/*
  Static product gallery: big photo on a light gray tile + thumbnail rail.
  No motion, no rotation — the original photo, presented clean, with the
  fullscreen 5x inspector for close-up detail.
*/
export default function ProductGallery({ product, lang }) {
  const images = [product.image, ...(Array.isArray(product.gallery) ? product.gallery : [])].filter(Boolean);
  const [active, setActive] = useState(0);
  const src = images[active] || null;

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      {/* main tile */}
      <div className="tile relative w-full overflow-hidden" style={{ paddingTop: "100%" }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={product.name[lang]} className="absolute inset-0 h-full w-full object-contain p-8 mix-blend-multiply" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-sm font-semibold uppercase tracking-widest text-black/30">
            {product.article}
          </div>
        )}
        {src && (
          <div className="absolute bottom-4 right-4">
            <ProductZoom src={src} alt={product.name[lang]} lang={lang} />
          </div>
        )}
      </div>

      {/* thumbnail rail */}
      {images.length > 1 && (
        <div className="flex gap-2 lg:flex-col">
          {images.map((im, i) => (
            <button key={im + i} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}
              className={"tile relative h-16 w-16 shrink-0 overflow-hidden rounded-md " + (i === active ? "ring-1 ring-[#111]" : "opacity-80 hover:opacity-100")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im} alt="" className="absolute inset-0 h-full w-full object-contain p-1 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
