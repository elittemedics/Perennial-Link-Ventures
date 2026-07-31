export interface CountryData {
  name: string;
  code: string;
  phoneCode: string;
  flagEmoji: string;
}

export const COUNTRIES: CountryData[] = [
  { name: 'Ghana', code: 'GH', phoneCode: '+233', flagEmoji: '🇬🇭' },
  { name: 'Nigeria', code: 'NG', phoneCode: '+234', flagEmoji: '🇳🇬' },
  { name: 'United States', code: 'US', phoneCode: '+1', flagEmoji: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44', flagEmoji: '🇬🇧' },
  { name: 'Canada', code: 'CA', phoneCode: '+1', flagEmoji: '🇨🇦' },
  { name: 'South Africa', code: 'ZA', phoneCode: '+27', flagEmoji: '🇿🇦' },
  { name: 'Kenya', code: 'KE', phoneCode: '+254', flagEmoji: '🇰🇪' },
  { name: 'Ivory Coast', code: 'CI', phoneCode: '+225', flagEmoji: '🇨🇮' },
  { name: 'Togo', code: 'TG', phoneCode: '+228', flagEmoji: '🇹🇬' },
  { name: 'Benin', code: 'BJ', phoneCode: '+229', flagEmoji: '🇧🇯' },
  { name: 'Burkina Faso', code: 'BF', phoneCode: '+226', flagEmoji: '🇧🇫' },
  { name: 'Senegal', code: 'SN', phoneCode: '+221', flagEmoji: '🇸🇳' },
  { name: 'Cameroon', code: 'CM', phoneCode: '+237', flagEmoji: '🇨🇲' },
  { name: 'Ethiopia', code: 'ET', phoneCode: '+251', flagEmoji: '🇪🇹' },
  { name: 'Uganda', code: 'UG', phoneCode: '+256', flagEmoji: '🇺🇬' },
  { name: 'Tanzania', code: 'TZ', phoneCode: '+255', flagEmoji: '🇹🇿' },
  { name: 'Rwanda', code: 'RW', phoneCode: '+250', flagEmoji: '🇷🇼' },
  { name: 'Germany', code: 'DE', phoneCode: '+49', flagEmoji: '🇩🇪' },
  { name: 'France', code: 'FR', phoneCode: '+33', flagEmoji: '🇫🇷' },
  { name: 'China', code: 'CN', phoneCode: '+86', flagEmoji: '🇨🇳' },
  { name: 'Japan', code: 'JP', phoneCode: '+81', flagEmoji: '🇯🇵' },
  { name: 'India', code: 'IN', phoneCode: '+91', flagEmoji: '🇮🇳' },
  { name: 'United Arab Emirates', code: 'AE', phoneCode: '+971', flagEmoji: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', flagEmoji: '🇸🇦' },
  { name: 'Australia', code: 'AU', phoneCode: '+61', flagEmoji: '🇦🇺' },
  { name: 'Brazil', code: 'BR', phoneCode: '+55', flagEmoji: '🇧🇷' },
  { name: 'Italy', code: 'IT', phoneCode: '+39', flagEmoji: '🇮🇹' },
  { name: 'Spain', code: 'ES', phoneCode: '+34', flagEmoji: '🇪🇸' },
  { name: 'Netherlands', code: 'NL', phoneCode: '+31', flagEmoji: '🇳🇱' },
  { name: 'Switzerland', code: 'CH', phoneCode: '+41', flagEmoji: '🇨🇭' },
  { name: 'Sweden', code: 'SE', phoneCode: '+46', flagEmoji: '🇸🇪' },
  { name: 'Norway', code: 'NO', phoneCode: '+47', flagEmoji: '🇳🇴' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Ghana (+233)
