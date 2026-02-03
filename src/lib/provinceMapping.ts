export const PROVINCE_CODE_MAP: Record<string, string> = {
  'Ontario': 'ON',
  'British Columbia': 'BC',
  'Alberta': 'AB',
  'Quebec': 'QC',
  'Manitoba': 'MB',
  'Saskatchewan': 'SK',
  'Nova Scotia': 'NS',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Prince Edward Island': 'PE',
  'Northwest Territories': 'NT',
  'Nunavut': 'NU',
  'Yukon': 'YT',
};

export const CODE_TO_PROVINCE_MAP: Record<string, string> = {
  'ON': 'Ontario',
  'BC': 'British Columbia',
  'AB': 'Alberta',
  'QC': 'Quebec',
  'MB': 'Manitoba',
  'SK': 'Saskatchewan',
  'NS': 'Nova Scotia',
  'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador',
  'PE': 'Prince Edward Island',
  'NT': 'Northwest Territories',
  'NU': 'Nunavut',
  'YT': 'Yukon',
};

export function provinceNameToCode(provinceName: string): string {
  return PROVINCE_CODE_MAP[provinceName] || provinceName;
}

export function provinceCodeToName(provinceCode: string): string {
  return CODE_TO_PROVINCE_MAP[provinceCode] || provinceCode;
}
