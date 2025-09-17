import { useEffect, useState } from 'react';
import { useAuthenticatedFetch } from '../contexts/AuthContext';
import { GenerateItineraryResponse, ItineraryResponse } from '../../shared/api';
import { toast } from 'sonner';
import { LoadingSpinner } from './LoadingSpinner';

interface HistoryItem {
  id: string;
  itinerary_data: ItineraryResponse;
  created_at: string;
}

interface HistorySidebarProps {
  onHistoryItemClick: (itinerary: GenerateItineraryResponse) => void;
}

export function HistorySidebar({ onHistoryItemClick }: HistorySidebarProps) {
  const authenticatedFetch = useAuthenticatedFetch();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await authenticatedFetch('/api/history');
        const data = await response.json();

        console.log('History data:', data);

        if (data.success) {
          setHistory(data.history);
        } else {
          toast.error('Failed to load history');
        }
      } catch (error) {
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [authenticatedFetch]);

  const handleItemClick = (item: HistoryItem) => {
    // Prefer fetching the latest DB-backed item to ensure we use original stored data.
    (async () => {
      try {
        const response = await authenticatedFetch(`/api/history/${item.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.item) {
            const itineraryResponse: GenerateItineraryResponse = {
              success: true,
              itinerary: data.item.itinerary_data,
              itineraryId: data.item.id,
            };
            onHistoryItemClick(itineraryResponse);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch history item:', err);
      }

      // Fallback to provided item if DB fetch fails
      const fallback: GenerateItineraryResponse = {
        success: true,
        itinerary: item.itinerary_data,
        itineraryId: item.id,
      };
      onHistoryItemClick(fallback);
    })();
  };

  return (
    <div className="w-80 bg-gray-50 p-4 border-l border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Search History</h2>
      {isLoading ? (
        <div className="flex justify-center items-center pt-10">
          <LoadingSpinner />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="font-semibold">No History Found</p>
          <p className="text-sm mt-1">Your generated travel plans will appear here.</p>
        </div>
      ) : (
        <ul>
          {history.map((item) => (
            <li key={item.id} onClick={() => handleItemClick(item)} className="mb-2 p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
              <div>{item.itinerary_data.meta.destination}</div>
              <div className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}