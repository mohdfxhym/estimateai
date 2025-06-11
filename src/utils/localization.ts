// Comprehensive localization utilities for international support
export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  dateFormat: string;
  numberFormat: string;
  timezone: string;
  measurementSystem: 'metric' | 'imperial';
  constructionUnits: {
    area: string;
    volume: string;
    length: string;
    weight: string;
  };
}

export const COUNTRIES: CountryConfig[] = [
  // North America
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,234.56',
    timezone: 'America/New_York',
    measurementSystem: 'imperial',
    constructionUnits: { area: 'sq ft', volume: 'cu ft', length: 'ft', weight: 'lbs' }
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    locale: 'en-CA',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'America/Toronto',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'MX',
    name: 'Mexico',
    currency: 'MXN',
    currencySymbol: '$',
    locale: 'en-MX',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'America/Mexico_City',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },

  // Europe
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'Europe/London',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'en-DE',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: '1.234,56',
    timezone: 'Europe/Berlin',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'en-FR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1 234,56',
    timezone: 'Europe/Paris',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'en-ES',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.234,56',
    timezone: 'Europe/Madrid',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'en-IT',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.234,56',
    timezone: 'Europe/Rome',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'en-NL',
    dateFormat: 'DD-MM-YYYY',
    numberFormat: '1.234,56',
    timezone: 'Europe/Amsterdam',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    currencySymbol: 'CHF',
    locale: 'en-CH',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: '1\'234.56',
    timezone: 'Europe/Zurich',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'SE',
    name: 'Sweden',
    currency: 'SEK',
    currencySymbol: 'kr',
    locale: 'en-SE',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: '1 234,56',
    timezone: 'Europe/Stockholm',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'NO',
    name: 'Norway',
    currency: 'NOK',
    currencySymbol: 'kr',
    locale: 'en-NO',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: '1 234,56',
    timezone: 'Europe/Oslo',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },

  // Asia Pacific
  {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    currencySymbol: '¥',
    locale: 'en-JP',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: '1,234',
    timezone: 'Asia/Tokyo',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'CN',
    name: 'China',
    currency: 'CNY',
    currencySymbol: '¥',
    locale: 'en-CN',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: '1,234.56',
    timezone: 'Asia/Shanghai',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    locale: 'en-IN',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,23,456.78',
    timezone: 'Asia/Kolkata',
    measurementSystem: 'metric',
    constructionUnits: { area: 'sq ft', volume: 'cu ft', length: 'ft', weight: 'kg' }
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    locale: 'en-AU',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'Australia/Sydney',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    currency: 'NZD',
    currencySymbol: 'NZ$',
    locale: 'en-NZ',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'Pacific/Auckland',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    locale: 'en-SG',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'Asia/Singapore',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'KR',
    name: 'South Korea',
    currency: 'KRW',
    currencySymbol: '₩',
    locale: 'en-KR',
    dateFormat: 'YYYY.MM.DD',
    numberFormat: '1,234',
    timezone: 'Asia/Seoul',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },

  // Middle East & Africa
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'د.إ',
    locale: 'en-AE',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'Asia/Dubai',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    locale: 'en-SA',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
    timezone: 'Asia/Riyadh',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    locale: 'en-ZA',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: '1 234,56',
    timezone: 'Africa/Johannesburg',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },

  // South America
  {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    currencySymbol: 'R$',
    locale: 'en-BR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.234,56',
    timezone: 'America/Sao_Paulo',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'AR',
    name: 'Argentina',
    currency: 'ARS',
    currencySymbol: '$',
    locale: 'en-AR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.234,56',
    timezone: 'America/Argentina/Buenos_Aires',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  },
  {
    code: 'CL',
    name: 'Chile',
    currency: 'CLP',
    currencySymbol: '$',
    locale: 'en-CL',
    dateFormat: 'DD-MM-YYYY',
    numberFormat: '1.234',
    timezone: 'America/Santiago',
    measurementSystem: 'metric',
    constructionUnits: { area: 'm²', volume: 'm³', length: 'm', weight: 'kg' }
  }
];

// Exchange rates (in production, this would come from an API)
export const EXCHANGE_RATES: { [key: string]: number } = {
  USD: 1.00,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.5,
  BRL: 5.2,
  MXN: 20.1,
  KRW: 1180.0,
  SGD: 1.35,
  NZD: 1.42,
  SEK: 8.6,
  NOK: 8.8,
  AED: 3.67,
  SAR: 3.75,
  ZAR: 14.8,
  ARS: 98.5,
  CLP: 800.0
};

class LocalizationService {
  private currentCountry: CountryConfig;
  private baseCurrency: string = 'USD';

  constructor() {
    this.currentCountry = this.detectUserCountry();
  }

  private detectUserCountry(): CountryConfig {
    // Try to detect user's country from various sources
    const userLocale = navigator.language || 'en-US';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // First try to match by locale
    let country = COUNTRIES.find(c => c.locale === userLocale);
    
    // If not found, try to match by timezone
    if (!country) {
      country = COUNTRIES.find(c => c.timezone === timeZone);
    }
    
    // If still not found, try to match by language code
    if (!country) {
      const langCode = userLocale.split('-')[0];
      country = COUNTRIES.find(c => c.locale.startsWith(langCode));
    }
    
    // Default to US if nothing matches
    return country || COUNTRIES.find(c => c.code === 'US')!;
  }

  setCountry(countryCode: string): void {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      this.currentCountry = country;
      // Store in localStorage for persistence
      localStorage.setItem('selectedCountry', countryCode);
    }
  }

  getCurrentCountry(): CountryConfig {
    // Check if user has previously selected a country
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      const country = COUNTRIES.find(c => c.code === savedCountry);
      if (country) {
        this.currentCountry = country;
      }
    }
    return this.currentCountry;
  }

  formatCurrency(amount: number, targetCurrency?: string): string {
    const currency = targetCurrency || this.currentCountry.currency;
    const convertedAmount = this.convertCurrency(amount, this.baseCurrency, currency);
    
    try {
      return new Intl.NumberFormat(this.currentCountry.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'JPY' || currency === 'KRW' || currency === 'CLP' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' || currency === 'KRW' || currency === 'CLP' ? 0 : 2,
      }).format(convertedAmount);
    } catch (error) {
      // Fallback formatting
      const symbol = this.getCurrencySymbol(currency);
      return `${symbol}${convertedAmount.toLocaleString(this.currentCountry.locale)}`;
    }
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.currentCountry.locale).format(number);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.currentCountry.locale).format(dateObj);
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  getCurrencySymbol(currency?: string): string {
    const targetCurrency = currency || this.currentCountry.currency;
    const country = COUNTRIES.find(c => c.currency === targetCurrency);
    return country?.currencySymbol || targetCurrency;
  }

  getConstructionUnits(): CountryConfig['constructionUnits'] {
    return this.currentCountry.constructionUnits;
  }

  getMeasurementSystem(): 'metric' | 'imperial' {
    return this.currentCountry.measurementSystem;
  }

  convertUnits(value: number, fromUnit: string, toUnit: string): number {
    // Basic unit conversions for construction
    const conversions: { [key: string]: { [key: string]: number } } = {
      // Area conversions
      'm²': { 'sq ft': 10.764, 'sq m': 1 },
      'sq ft': { 'm²': 0.0929, 'sq ft': 1 },
      
      // Volume conversions
      'm³': { 'cu ft': 35.314, 'cu m': 1 },
      'cu ft': { 'm³': 0.0283, 'cu ft': 1 },
      
      // Length conversions
      'm': { 'ft': 3.281, 'm': 1 },
      'ft': { 'm': 0.305, 'ft': 1 },
      
      // Weight conversions
      'kg': { 'lbs': 2.205, 'kg': 1 },
      'lbs': { 'kg': 0.454, 'lbs': 1 }
    };

    if (fromUnit === toUnit) return value;
    
    const conversion = conversions[fromUnit]?.[toUnit];
    return conversion ? value * conversion : value;
  }

  getLocalizedProjectTypes(): string[] {
    // Keep all project types in English regardless of country
    return [
      'Commercial Building',
      'Residential',
      'Infrastructure', 
      'Industrial',
      'Renovation',
      'Mixed Use',
      'Healthcare',
      'Educational',
      'Hospitality',
      'Retail'
    ];
  }

  getRegionalCostFactors(): { [category: string]: number } {
    // Regional cost adjustment factors based on country
    const factors: { [countryCode: string]: { [category: string]: number } } = {
      'US': { labor: 1.0, materials: 1.0, equipment: 1.0, structural: 1.0, civil: 1.0, electrical: 1.0, plumbing: 1.0, finishing: 1.0, hvac: 1.0 },
      'GB': { labor: 1.2, materials: 1.1, equipment: 1.15, structural: 1.1, civil: 1.1, electrical: 1.15, plumbing: 1.2, finishing: 1.1, hvac: 1.15 },
      'DE': { labor: 1.3, materials: 1.2, equipment: 1.25, structural: 1.2, civil: 1.2, electrical: 1.25, plumbing: 1.3, finishing: 1.2, hvac: 1.25 },
      'FR': { labor: 1.25, materials: 1.15, equipment: 1.2, structural: 1.15, civil: 1.15, electrical: 1.2, plumbing: 1.25, finishing: 1.15, hvac: 1.2 },
      'JP': { labor: 1.5, materials: 1.4, equipment: 1.3, structural: 1.4, civil: 1.4, electrical: 1.3, plumbing: 1.5, finishing: 1.4, hvac: 1.3 },
      'IN': { labor: 0.3, materials: 0.7, equipment: 0.8, structural: 0.7, civil: 0.6, electrical: 0.8, plumbing: 0.7, finishing: 0.5, hvac: 0.8 },
      'CN': { labor: 0.4, materials: 0.8, equipment: 0.9, structural: 0.8, civil: 0.7, electrical: 0.9, plumbing: 0.8, finishing: 0.6, hvac: 0.9 },
      'BR': { labor: 0.5, materials: 0.9, equipment: 0.85, structural: 0.9, civil: 0.8, electrical: 0.85, plumbing: 0.9, finishing: 0.7, hvac: 0.85 },
      'MX': { labor: 0.4, materials: 0.8, equipment: 0.75, structural: 0.8, civil: 0.7, electrical: 0.75, plumbing: 0.8, finishing: 0.6, hvac: 0.75 },
      'AE': { labor: 0.6, materials: 1.1, equipment: 1.0, structural: 1.1, civil: 1.0, electrical: 1.0, plumbing: 1.1, finishing: 0.9, hvac: 1.0 },
      'AU': { labor: 1.4, materials: 1.3, equipment: 1.2, structural: 1.3, civil: 1.3, electrical: 1.2, plumbing: 1.4, finishing: 1.3, hvac: 1.2 },
      'CA': { labor: 1.1, materials: 1.05, equipment: 1.1, structural: 1.05, civil: 1.05, electrical: 1.1, plumbing: 1.1, finishing: 1.05, hvac: 1.1 },
      'CH': { labor: 1.8, materials: 1.5, equipment: 1.4, structural: 1.5, civil: 1.5, electrical: 1.4, plumbing: 1.8, finishing: 1.5, hvac: 1.4 },
      'NO': { labor: 1.6, materials: 1.3, equipment: 1.3, structural: 1.3, civil: 1.3, electrical: 1.3, plumbing: 1.6, finishing: 1.3, hvac: 1.3 },
      'SE': { labor: 1.4, materials: 1.2, equipment: 1.2, structural: 1.2, civil: 1.2, electrical: 1.2, plumbing: 1.4, finishing: 1.2, hvac: 1.2 }
    };

    return factors[this.currentCountry.code] || factors['US'];
  }
}

export const localizationService = new LocalizationService();