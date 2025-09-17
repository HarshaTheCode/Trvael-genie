import React from 'react';
import TripCustomizationForm from './components/TripCustomizationForm';
import { TripFormData } from './types/tripForm';
import { mockRootProps } from './data/tripCustomizationMockData';
import './global.css';

const App = () => {
  const handleFormSubmit = (data: TripFormData) => {
    console.log('Trip customization form submitted:', data);
    alert('Form submitted! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TripCustomizationForm
        initialData={{
          destination: mockRootProps.initialDestination,
          startDate: mockRootProps.initialStartDate,
          endDate: mockRootProps.initialEndDate,
          travelers: mockRootProps.initialTravelers,
          budget: mockRootProps.initialBudget,
          style: mockRootProps.initialStyle,
          accessibility: mockRootProps.initialAccessibility,
          pace: mockRootProps.initialPace,
          customRequirements: mockRootProps.initialCustomRequirements,
        }}
        onSubmit={handleFormSubmit}
        isLoading={false}
      />
    </div>
  );
};

export default App;