export enum Acountries {
  EGYPT = 'EG',
  SAUDI = 'SA',
  EMIRATES = 'AE',
}
export const countries = {
  EGYPT: 'EG',
  SAUDI: 'SA',
  EMIRATES: 'AE',
};

export const getCountryCode = (input: string): string => {
  input = input.toUpperCase();
  return countries[input];
};
