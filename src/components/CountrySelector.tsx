import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { COUNTRIES, localizationService } from '../utils/localization';

interface CountrySelectorProps {
  onCountryChange?: (countryCode: string) => void;
}

export default function CountrySelector({ onCountryChange }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(localizationService.getCurrentCountry());

  const handleCountrySelect = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      localizationService.setCountry(countryCode);
      setIsOpen(false);
      onCountryChange?.(countryCode);
    }
  };

  const getFlagEmoji = (countryCode: string): string => {
    const flagMap: { [key: string]: string } = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
      'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'CH': '🇨🇭', 'SE': '🇸🇪', 'NO': '🇳🇴',
      'JP': '🇯🇵', 'CN': '🇨🇳', 'IN': '🇮🇳', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'SG': '🇸🇬',
      'KR': '🇰🇷', 'AE': '🇦🇪', 'SA': '🇸🇦', 'ZA': '🇿🇦', 'BR': '🇧🇷', 'AR': '🇦🇷',
      'CL': '🇨🇱'
    };
    return flagMap[countryCode] || '🌍';
  };

  const groupedCountries = COUNTRIES.reduce((groups, country) => {
    let region = 'Other';
    
    if (['US', 'CA', 'MX'].includes(country.code)) region = 'North America';
    else if (['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'CH', 'SE', 'NO'].includes(country.code)) region = 'Europe';
    else if (['JP', 'CN', 'IN', 'AU', 'NZ', 'SG', 'KR'].includes(country.code)) region = 'Asia Pacific';
    else if (['AE', 'SA', 'ZA'].includes(country.code)) region = 'Middle East & Africa';
    else if (['BR', 'AR', 'CL'].includes(country.code)) region = 'South America';
    
    if (!groups[region]) groups[region] = [];
    groups[region].push(country);
    return groups;
  }, {} as { [region: string]: typeof COUNTRIES });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-lg">{getFlagEmoji(selectedCountry.code)}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900">{selectedCountry.name}</div>
          <div className="text-xs text-gray-500">{selectedCountry.currencySymbol} {selectedCountry.currency}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-2">
              Select your country for localized pricing and units
            </div>
            
            {Object.entries(groupedCountries).map(([region, countries]) => (
              <div key={region} className="mb-3">
                <div className="text-xs font-semibold text-gray-700 px-2 py-1 bg-gray-50 rounded">
                  {region}
                </div>
                <div className="mt-1">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country.code)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                        selectedCountry.code === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{getFlagEmoji(country.code)}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{country.name}</div>
                        <div className="text-xs text-gray-500">
                          {country.currencySymbol} {country.currency} • {country.measurementSystem}
                        </div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 p-3 bg-gray-50 text-xs text-gray-600">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Automatic currency conversion</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Regional cost adjustments</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}