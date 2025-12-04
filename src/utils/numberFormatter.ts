export const numberFormatter = (number: number | string) => {
  const num = Number(number);
  if (Number.isNaN(num)) {
    return number;
  }
  return num.toLocaleString(undefined, { maximumFractionDigits: 8 });
};
