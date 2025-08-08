export const getCountriesEndpoint = (fields: string[]) => `https://restcountries.com/v3.1/all?fields=${fields.join(',')}`;
