import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

export interface CountryData {
  name: string;
  code: string;
  phoneCode: string;
  flagEmoji: string;
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

function flagEmoji(code: CountryCode): string {
  return String.fromCodePoint(...code.split('').map((character) => 127397 + character.charCodeAt(0)));
}

export const COUNTRIES: CountryData[] = getCountries()
  .map((code) => ({
    name: countryNames.of(code) || code,
    code,
    phoneCode: `+${getCountryCallingCode(code)}`,
    flagEmoji: flagEmoji(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY = COUNTRIES.find((country) => country.code === 'GH') || COUNTRIES[0];
