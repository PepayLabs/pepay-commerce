import { useState, useEffect } from 'react';
import { ProfileData, DonationRequest, DonationResponse, SubscriptionRequest, SubscriptionResponse } from '../types/profile.types';
import { fetchProfile, createDonation, createSubscription } from '../api/profileService';

export function useProfile(displayLink: string) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile(displayLink);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [displayLink]);

  return { profile, loading, error };
}

export function useDonation() {
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState<Error | null>(null);

  const submitDonation = async (
    displayLink: string,
    donationData: DonationRequest
  ): Promise<DonationResponse | null> => {
    setDonationLoading(true);
    setDonationError(null);
    
    try {
      const response = await createDonation(displayLink, donationData);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Donation failed');
      setDonationError(error);
      return null;
    } finally {
      setDonationLoading(false);
    }
  };

  return { submitDonation, donationLoading, donationError };
}

export function useSubscription() {
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<Error | null>(null);

  const submitSubscription = async (
    displayLink: string,
    subscriptionData: SubscriptionRequest
  ): Promise<SubscriptionResponse | null> => {
    setSubscriptionLoading(true);
    setSubscriptionError(null);
    
    try {
      console.log('🔄 Submitting subscription:', subscriptionData);
      const response = await createSubscription(displayLink, subscriptionData);
      console.log('✅ Subscription created:', response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Subscription failed');
      console.error('❌ Subscription error:', error);
      setSubscriptionError(error);
      return null;
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return { submitSubscription, subscriptionLoading, subscriptionError };
}
