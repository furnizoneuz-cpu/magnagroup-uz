"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/*
  MAGNA PAVILIONS — the interactive premium showroom (GSDS Volume II).
  4 wings, 9 flagship models. Pressing Next/Prev shifts the ENTIRE atmosphere:
  the scene cross-dissolves, the lighting tint, materials, story and name all change —
  "virtual presence", as if walking a live Magna showroom.
*/

const T = {
  wings: { uz: "Qanotlar", ru: "Крылья", en: "Wings" },
  view: { uz: "Katalogda ko'rish", ru: "Смотреть в каталоге", en: "View in catalog" },
  materials: { uz: "Materiallar", ru: "Материалы", en: "Materials" },
  mode: { uz: "Yorug'lik", ru: "Свет", en: "Lighting" },
  title: { uz: "Magna Pavilions", ru: "Magna Pavilions", en: "Magna Pavilions" },
  sub: { uz: "Premium virtual showroom — modellar orasida suring", ru: "Премиум виртуальный шоурум — переключайте модели", en: "Premium virtual showroom — switch between models" },
};

const WINGS = [
  { id: "executive", label: { uz: "Executive Atelier", ru: "Executive Atelier", en: "Executive Atelier" },
    models: [
      { id: "paris", name: "Paris", art: "MG218", mode: { uz: "Morning Light", ru: "Утренний свет", en: "Morning Light" }, tint: "linear-gradient(180deg, rgba(200,220,255,0.10), rgba(170,195,230,0.04))",
        emotion: { uz: "Muloyim hashamat, intellektual nafosat", ru: "Тихая роскошь, интеллектуальная утончённость", en: "Quiet luxury, intellectual finesse" },
        story: { uz: "Ertalabki Parij tumani — oq eman ustida yumshoq soyalar.", ru: "Утренний туман Парижа — мягкие тени на белом дубе.", en: "Morning Paris mist — soft shadows on white oak." },
        mats: ["White Oak", "Silver Nickel", "Desert Sand Leather"] },
      { id: "riyadh", name: "Riyadh", art: "MG210", mode: { uz: "Golden Hour", ru: "Золотой час", en: "Golden Hour" }, tint: "linear-gradient(180deg, rgba(255,170,80,0.18), rgba(180,90,30,0.10))",
        emotion: { uz: "Mutlaq hukmronlik, monumental barqarorlik", ru: "Абсолютная власть, монументальность", en: "Absolute power, monumental stability" },
        story: { uz: "Cho'l quyoshi qora marmar va bronzada yonadi.", ru: "Пустынное солнце горит в чёрном мраморе и бронзе.", en: "Desert sun ignites black marble and bronze." },
        mats: ["Dark Walnut", "Nero Marquina", "Gold Bronze"] },
      { id: "chicago", name: "Chicago", art: "MG225", mode: { uz: "Midnight Cyber", ru: "Полночь-кибер", en: "Midnight Cyber" }, tint: "linear-gradient(180deg, rgba(40,90,180,0.22), rgba(10,20,40,0.28))",
        emotion: { uz: "Tezlik, texnologik aniqlik", ru: "Скорость, технологическая точность", en: "Speed, technological precision" },
        story: { uz: "Tungi Chicago — po'lat va sovuq ko'k nur.", ru: "Ночной Чикаго — сталь и холодный синий свет.", en: "Chicago at night — steel and cold blue light." },
        mats: ["Structural Steel", "Matte Carbon", "Diamond Glass"] },
      { id: "mercedis", name: "Mercedis", art: "MG245", mode: { uz: "Studio Light", ru: "Студийный свет", en: "Studio Light" }, tint: "linear-gradient(180deg, rgba(230,235,240,0.10), rgba(60,65,72,0.14))",
        emotion: { uz: "Ergonomik hayajon, dinamik premium", ru: "Эргономичный драйв, динамичный премиум", en: "Ergonomic thrill, dynamic premium" },
        story: { uz: "Softbox nuri egilgan chiziqlarda oqadi.", ru: "Свет софтбокса скользит по изогнутым линиям.", en: "Softbox light glides over curved lines." },
        mats: ["Carbon Fiber", "Nappa Leather", "Grey Lacquer"] },
    ] },
  { id: "boardroom", label: { uz: "Boardroom & Convention", ru: "Boardroom & Convention", en: "Boardroom & Convention" },
    models: [
      { id: "newyork", name: "New York", art: "MGP065", mode: { uz: "Dusk / Twilight", ru: "Сумерки", en: "Dusk / Twilight" }, tint: "linear-gradient(180deg, rgba(90,70,160,0.20), rgba(20,20,50,0.26))",
        emotion: { uz: "Kollektiv mas'uliyat, global barqarorlik", ru: "Коллективная ответственность, стабильность", en: "Collective responsibility, global stability" },
        story: { uz: "Manhattan oqshomi — oltin tomirli marmar porlaydi.", ru: "Сумерки Манхэттена — мрамор с золотыми прожилками.", en: "Manhattan dusk — gold-veined marble glows." },
        mats: ["Calacatta Gold", "Gunmetal Steel"] },
      { id: "venice", name: "Venice", art: "MGP015", mode: { uz: "Overcast / Water", ru: "Пасмурно / Вода", en: "Overcast / Water" }, tint: "linear-gradient(180deg, rgba(150,200,210,0.14), rgba(60,90,100,0.14))",
        emotion: { uz: "Oqim hissi, organik tinchlik", ru: "Чувство потока, органичный покой", en: "Sense of flow, organic calm" },
        story: { uz: "Suv aksi shiftда sekin tebranadi.", ru: "Отражения воды медленно колышутся на потолке.", en: "Water reflections ripple slowly on the ceiling." },
        mats: ["Bleached Ash", "Frosted Acrylic"] },
    ] },
  { id: "operational", label: { uz: "Operational & Co-Creative", ru: "Operational & Co-Creative", en: "Operational & Co-Creative" },
    models: [
      { id: "milano", name: "Milano", art: "MGP214", mode: { uz: "Dynamic Midday", ru: "Динамичный полдень", en: "Dynamic Midday" }, tint: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(200,120,80,0.08))",
        emotion: { uz: "Yuqori energiya, jamoaviy ruh", ru: "Высокая энергия, командный дух", en: "High energy, team spirit" },
        story: { uz: "Modul stollar chaqmoqdek birlashadi.", ru: "Модульные столы соединяются молниеносно.", en: "Modular desks connect at lightning speed." },
        mats: ["HPL Laminate", "PET Felt", "Color Aluminum"] },
      { id: "pittsburgh", name: "Pittsburgh", art: "MGP215", mode: { uz: "Industrial Contrast", ru: "Индустриальный контраст", en: "Industrial Contrast" }, tint: "linear-gradient(180deg, rgba(30,40,50,0.24), rgba(255,160,60,0.06))",
        emotion: { uz: "Temir iroda, sanoat kuchi", ru: "Железная воля, промышленная мощь", en: "Iron will, industrial strength" },
        story: { uz: "Cho'yan oyoqlar va qalin eman — mustahkamlik.", ru: "Чугунные ноги и толстый дуб — прочность.", en: "Cast iron legs and thick oak — solidity." },
        mats: ["Distressed Oak", "Black Cast Iron"] },
    ] },
  { id: "walls", label: { uz: "Architectural Walls", ru: "Architectural Walls", en: "Architectural Walls" },
    models: [
      { id: "lambo", name: "Lambo Panel", art: "MGP218", mode: { uz: "Tracer Light", ru: "Трассирующий свет", en: "Tracer Light" }, tint: "linear-gradient(180deg, rgba(34,168,54,0.14), rgba(10,30,15,0.22))",
        emotion: { uz: "Kelajak makoni, me'moriy himoya", ru: "Пространство будущего, архитектурная защита", en: "Space of the future, architectural shelter" },
        story: { uz: "Panellar orasidan yugurik LED chiziqlar o'tadi.", ru: "Между панелями бегут линии LED.", en: "Kinetic LED lines run between the panels." },
        mats: ["American Walnut", "Black Polymer", "Kinetic LED"] },
    ] },
];

export default function Pavilions({ lang = "uz" }) {
  const [w, setW] = useState(0);
  const [m, setM] = useState(0);
  const model = WINGS[w].models[m];
  const scene = `/pavilions/${model.id}.jpg`;

  // two-layer cross-dissolve
  const [layerA, setLayerA] = useState(scene);
  const [layerB, setLayerB] = useState(null);
  const [showA, setShowA] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (showA) { setLayerB(scene); setShowA(false); }
    else { setLayerA(scene); setShowA(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  function go(dir) {
    const models = WINGS[w].models;
    let nm = m + dir;
    let nw = w;
    if (nm >= models.length) { nw = (w + 1) % WINGS.length; nm = 0; }
    if (nm < 0) { nw = (w - 1 + WINGS.length) % WINGS.length; nm = WINGS[nw].models.length - 1; }
    setW(nw); setM(nm);
  }

  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-black text-white">
      {/* cross-dissolving scene layers */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={layerA} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" style={{ opacity: showA ? 1 : 0 }} />
      {layerB && /* eslint-disable-next-line @next/next/no-img-element */ (
        <img src={layerB} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" style={{ opacity: showA ? 0 : 1 }} />
      )}
      {/* lighting tint (atmosphere) */}
      <div className="absolute inset-0 transition-all duration-700" style={{ background: model.tint }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10" />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 240px 70px rgba(0,0,0,0.6)" }} />

      {/* wing tabs */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center gap-2 p-5 md:p-8">
        <span className="mr-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{T.title[lang]}</span>
        {WINGS.map((wg, i) => (
          <button key={wg.id} onClick={() => { setW(i); setM(0); }}
            className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (i === w ? "bg-brand text-white" : "bg-white/10 text-white/70 hover:bg-white/20")}>
            {wg.label[lang]}
          </button>
        ))}
      </div>

      {/* model info */}
      <div className="container-x relative z-10 flex h-full items-center">
        <div className="max-w-xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-light">{WINGS[w].label[lang]}</div>
          <div className="font-head text-5xl font-extrabold drop-shadow-lg md:text-7xl">{model.name}</div>
          <div className="mt-3 text-lg text-white/80">{model.emotion[lang]}</div>
          <div className="mt-4 text-sm italic text-white/60">“{model.story[lang]}”</div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{T.mode[lang]}: {model.mode[lang]}</span>
            {model.mats.map((mt) => <span key={mt} className="rounded-md border border-white/20 px-3 py-1 text-xs text-white/75">{mt}</span>)}
          </div>
          <Link href={`/${lang}/product/${model.art}`} className="mt-7 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-brand-dark">
            {T.view[lang]} →
          </Link>
        </div>
      </div>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 p-5 md:p-8">
        <div className="flex gap-1.5">
          {WINGS[w].models.map((mm, i) => (
            <button key={mm.id} onClick={() => setM(i)} aria-label={mm.name}
              className={"h-1.5 rounded-full transition-all " + (i === m ? "w-8 bg-brand" : "w-4 bg-white/40 hover:bg-white/70")} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">{model.name}</span>
          <button onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/15" aria-label="prev">‹</button>
          <button onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark" aria-label="next">›</button>
        </div>
      </div>
    </section>
  );
}
