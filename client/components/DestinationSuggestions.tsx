import { Button } from '@/components/ui/button';

interface DestinationSuggestionsProps {
  onSelect: (destination: string) => void;
}

export function DestinationSuggestions({ onSelect }: DestinationSuggestionsProps) {
  const popularDestinations = [
    { name: 'Hyderabad', short: 'hyd', emoji: '🏰' },
    { name: 'Mumbai', short: 'mum', emoji: '🌊' },
    { name: 'Delhi', short: 'del', emoji: '🏛️' },
    { name: 'Bengaluru', short: 'blr', emoji: '🌆' },
    { name: 'Jaipur', short: 'jaipur', emoji: '🕌' },
    { name: 'Goa', short: 'goa', emoji: '🏖️' },
    { name: 'Chennai', short: 'chennai', emoji: '🏺' },
    { name: 'Kolkata', short: 'kolkata', emoji: '🎭' },
    { name: 'Agra', short: 'agra', emoji: '🕌' },
    { name: 'Varanasi', short: 'varanasi', emoji: '🛕' },
    { name: 'Udaipur', short: 'udaipur', emoji: '🏰' },
    { name: 'Kochi', short: 'kochi', emoji: '🚢' }
  ];

  return (
    <div className="mt-3">
      <p className="text-sm text-gray-600 mb-2">Popular destinations:</p>
      <div className="flex flex-wrap gap-2">
        {popularDestinations.map((dest) => (
          <Button
            key={dest.short}
            variant="outline"
            size="sm"
            onClick={() => onSelect(dest.name)}
            className="text-xs h-8 px-3"
          >
            {dest.emoji} {dest.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
