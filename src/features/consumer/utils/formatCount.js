export const fmt = (number) =>
  new Intl.NumberFormat("vi", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
