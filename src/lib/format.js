export function formatPrice(price, lang) {
  if (price === null || price === undefined || price === "") return null;
  const n = Number(price);
  if (Number.isNaN(n)) return null;
  const grouped = n.toLocaleString("ru-RU").replace(/ /g, " ");
  return grouped + " so'm";
}

export const CATEGORY_ACCENT = {
  office: "#B07C3A",
  staff: "#6E8B6E",
  conference: "#8A6D5A",
  storage: "#7A6A55",
  tables: "#A88A4E",
  seating: "#5F6E86",
  medical: "#4E8A8F",
  student: "#B08A3A",
  children: "#C56B4A",
};
