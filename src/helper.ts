export function formatUAH(amount: number): string {
  return amount.toLocaleString('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const getZeroTimeDate = () => {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};
