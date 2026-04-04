const ynabMilliunitFactorValue = 1000;

export const toYnabMilliunits = (amount: number): number => {
  return Number((amount * ynabMilliunitFactorValue).toFixed(0));
};

export const fromYnabMilliunits = (amount: number): number => {
  return amount / ynabMilliunitFactorValue;
};
