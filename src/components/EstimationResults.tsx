import React, { useState } from 'react';
import { Download, Eye, Edit, Share2, FileText, DollarSign, TrendingUp } from 'lucide-react';
import AIChatBot from './AIChatBot';
import { localizationService } from '../utils/localization';

interface EstimationResultsProps {
  results: {
    totalCost: number;
    items: Array<{
      category: string;
      description: string;
      quantity: number;
      unit: string;
      rate: number;
      amount: number;
    }>;
    accuracy: number;
    processingTime: string;
  };
  projectName?: string;
  projectType?: string;
}

export default function EstimationResults({ results, projectName, projectType }: EstimationResultsProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const formatCurrency = (amount: number) => {
    return localizationService.formatCurrency(amount);
  };

  const formatNumber = (number: number) => {
    return localizationService.formatNumber(number);
  };

  const getLocalizedUnits = () => {
    return localizationService.getConstructionUnits();
  };

  const convertUnitsForDisplay = (item: any) => {
    const localUnits = getLocalizedUnits();
    const measurementSystem = localizationService.getMeasurementSystem();
    
    // Convert units if needed
    let displayQuantity = item.quantity;
    let displayUnit = item.unit;
    let displayRate = item.rate;
    
    // Apply regional cost factors
    const costFactors = localizationService.getRegionalCostFactors();
    const categoryFactor = costFactors[item.category.toLowerCase()] || costFactors.materials || 1;
    displayRate = displayRate * categoryFactor;
    
    // Convert units based on measurement system
    if (measurementSystem === 'metric' && item.unit === 'sq ft') {
      displayQuantity = localizationService.convertUnits(item.quantity, 'sq ft', 'm²');
      displayUnit = localUnits.area;
      displayRate = displayRate / localizationService.convertUnits(1, 'sq ft', 'm²');
    } else if (measurementSystem === 'imperial' && item.unit === 'm²') {
      displayQuantity = localizationService.convertUnits(item.quantity, 'm²', 'sq ft');
      displayUnit = localUnits.area;
      displayRate = displayRate / localizationService.convertUnits(1, 'm²', 'sq ft');
    }
    
    return {
      ...item,
      quantity: displayQuantity,
      unit: displayUnit,
      rate: displayRate,
      amount: displayQuantity * displayRate
    };
  };

  // Convert all items for display
  const localizedItems = results.items.map(convertUnitsForDisplay);
  const localizedTotalCost = localizedItems.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = localizedItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as {[key: string]: number});

  const tabs = [
    { id: 'summary', name: 'Summary', icon: DollarSign },
    { id: 'breakdown', name: 'Detailed Breakdown', icon: FileText },
    { id: 'analysis', name: 'Cost Analysis', icon: TrendingUp },
  ];

  const currentCountry = localizationService.getCurrentCountry();

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Estimation Results</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>AI-generated cost estimate with {results.accuracy}% confidence</span>
                <span>•</span>
                <span>Localized for {currentCountry.name}</span>
                <span>•</span>
                <span>{currentCountry.measurementSystem === 'metric' ? 'Metric' : 'Imperial'} units</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {results.accuracy}% Confidence
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(localizedTotalCost)}</h3>
            <p className="text-sm text-gray-600">Total Project Cost</p>
            {currentCountry.currency !== 'USD' && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {localizationService.formatCurrency(results.totalCost, 'USD')} USD
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(localizedItems.length)}</h3>
            <p className="text-sm text-gray-600">Line Items</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(Object.keys(categoryTotals).length)}</h3>
            <p className="text-sm text-gray-600">Categories</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{results.processingTime}</h3>
            <p className="text-sm text-gray-600">Processing Time</p>
          </div>
        </div>

        {/* Regional Cost Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{currentCountry.code === 'US' ? '🇺🇸' : '🌍'}</div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Regional Cost Adjustment Applied</h3>
              <p className="text-sm text-blue-700">
                Costs have been adjusted for {currentCountry.name} market conditions and converted to {currentCountry.currency}. 
                {currentCountry.measurementSystem === 'metric' ? ' Units converted to metric system.' : ' Imperial units maintained.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Category</h3>
                    <div className="space-y-3">
                      {Object.entries(categoryTotals).map(([category, amount]) => {
                        const percentage = (amount / localizedTotalCost) * 100;
                        return (
                          <div key={category}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">{category}</span>
                              <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Highest Category:</span>
                        <span className="font-medium">
                          {Object.entries(categoryTotals).reduce((a, b) => categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b)[0]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Item Cost:</span>
                        <span className="font-medium">
                          {formatCurrency(localizedTotalCost / localizedItems.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost per Category:</span>
                        <span className="font-medium">
                          {formatCurrency(localizedTotalCost / Object.keys(categoryTotals).length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-medium">{currentCountry.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Units:</span>
                        <span className="font-medium">{currentCountry.measurementSystem}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {localizedItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(item.quantity)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.rate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Cost Analysis</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Local Market Factors</h4>
                        <p className="text-sm text-blue-700">
                          Costs adjusted for {currentCountry.name} market conditions. 
                          {currentCountry.measurementSystem === 'metric' ? ' Metric units applied.' : ' Imperial units maintained.'}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Currency: {currentCountry.currency}</h4>
                        <p className="text-sm text-green-700">
                          All amounts shown in {currentCountry.currency} using current exchange rates.
                          Regional labor and material costs factored in.
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Measurement System</h4>
                        <p className="text-sm text-orange-700">
                          Using {currentCountry.measurementSystem} system with local construction units.
                          Quantities and rates converted accordingly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Local Sourcing</p>
                          <p className="text-sm text-gray-600">Consider local suppliers in {currentCountry.name} for better pricing</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Regional Standards</p>
                          <p className="text-sm text-gray-600">Ensure compliance with {currentCountry.name} building codes</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Currency Risk</p>
                          <p className="text-sm text-gray-600">Monitor exchange rates for international materials</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatBot 
        estimationData={{
          ...results,
          totalCost: localizedTotalCost,
          items: localizedItems
        }}
        projectName={projectName}
        projectType={projectType}
      />
    </>
  );
}