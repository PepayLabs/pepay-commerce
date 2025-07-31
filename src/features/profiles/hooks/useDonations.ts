import { useState, useEffect } from 'react';
import { fetchDonations } from '../api/profileService';

interface DonationData {
  donation_id: string;
  amount_usd: string;
  message: string | null;
  response_message: string | null;
  donation_name: string;
  social_platform: 'instagram' | 'twitter' | 'tiktok' | 'telegram' | null;
  paid_at: string;
}

interface DonationsResponse {
  donations: DonationData[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

export function useDonations(displayLink: string) {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<DonationsResponse['pagination'] | null>(null);

  useEffect(() => {
    async function loadDonations() {
      try {
        setLoading(true);
        setError(null);
        const response: DonationsResponse = await fetchDonations(displayLink, 1, 10);
        setDonations(response.donations);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load donations');
      } finally {
        setLoading(false);
      }
    }

    if (displayLink) {
      loadDonations();
    }
  }, [displayLink]);

  const loadMoreDonations = async () => {
    if (!pagination?.has_next_page || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = pagination.current_page + 1;
      const response: DonationsResponse = await fetchDonations(displayLink, nextPage, 10);
      
      // Append new donations to existing ones
      setDonations(prev => [...prev, ...response.donations]);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more donations');
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    donations,
    loading,
    loadingMore,
    error,
    pagination,
    loadMoreDonations
  };
}