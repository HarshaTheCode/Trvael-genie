import React, { useState } from 'react';
import { TripFormData, TripFormProps } from '../types/tripForm';
import { BudgetLevel, TravelStyle, AccessibilityOption, TravelPace } from '../types/enums';
import {
  formatBudgetLevel,
  formatTravelStyle,
  formatAccessibilityOption,
  formatTravelPace,
} from '../lib/formatters';

const TripCustomizationForm: React.FC<TripFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TripFormData>({
    destination: initialData.destination || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    travelers: initialData.travelers || '',
    budget: initialData.budget || BudgetLevel.MEDIUM,
    style: initialData.style || TravelStyle.CULTURE,
    accessibility: initialData.accessibility || AccessibilityOption.NONE,
    pace: initialData.pace || TravelPace.MODERATE,
    customRequirements: initialData.customRequirements || '',
    language: (initialData.language as any) || 'en',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TripFormData, string>>>({});

  const handleInputChange = (field: keyof TripFormData, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TripFormData, string>> = {};

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (!formData.travelers.trim()) {
      newErrors.travelers = 'Number of travelers is required';
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destination */}
        <div className="space-y-2">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
            Destination
          </label>
          <input
            id="destination"
            placeholder="Enter destination"
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.destination ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.destination && (
            <p className="text-sm text-red-500">{errors.destination}</p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate}</p>
          )}
        </div>

        {/* Travelers */}
        <div className="space-y-2">
          <label htmlFor="travelers" className="block text-sm font-medium text-gray-700">
            Travelers
          </label>
          <input
            id="travelers"
            placeholder="e.g., 2 adults, 1 child"
            value={formData.travelers}
            onChange={(e) => handleInputChange('travelers', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.travelers ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.travelers && (
            <p className="text-sm text-red-500">{errors.travelers}</p>
          )}
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Budget</label>
          <select
            value={formData.budget}
            onChange={e => handleInputChange('budget', e.target.value as BudgetLevel)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Select budget</option>
            {Object.values(BudgetLevel).map((budget) => (
              <option key={budget} value={budget}>{formatBudgetLevel(budget)}</option>
            ))}
          </select>
        </div>

        {/* Travel Style */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Travel Style</label>
          <select
            value={formData.style}
            onChange={e => handleInputChange('style', e.target.value as TravelStyle)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Select travel style</option>
            {Object.values(TravelStyle).map((style) => (
              <option key={style} value={style}>{formatTravelStyle(style)}</option>
            ))}
          </select>
        </div>

        {/* Accessibility */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Accessibility</label>
          <select
            value={formData.accessibility}
            onChange={e => handleInputChange('accessibility', e.target.value as AccessibilityOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Select accessibility needs</option>
            {Object.values(AccessibilityOption).map((option) => (
              <option key={option} value={option}>{formatAccessibilityOption(option)}</option>
            ))}
          </select>
        </div>

        {/* Travel Pace */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Travel Pace</label>
          <select
            value={formData.pace}
            onChange={e => handleInputChange('pace', e.target.value as TravelPace)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Select travel pace</option>
            {Object.values(TravelPace).map((pace) => (
              <option key={pace} value={pace}>{formatTravelPace(pace)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Requirements */}
      <div className="space-y-2">
        <label htmlFor="customRequirements" className="block text-sm font-medium text-gray-700">
          Custom Requirements
        </label>
        <textarea
          id="customRequirements"
          placeholder="Any special requests or preferences..."
          value={formData.customRequirements}
          onChange={(e) => handleInputChange('customRequirements', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          rows={4}
        />
      </div>

      {/* Submit Button - Only visible on mobile, on desktop it's in the right sidebar */}
      <div className="md:hidden flex justify-center pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Itinerary'}
        </button>
      </div>
    </form>
  );
};

export default TripCustomizationForm;