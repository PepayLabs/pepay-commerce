import { ProfileData, DonationRequest, DonationResponse, SubscriptionRequest, SubscriptionResponse } from '../types/profile.types';

export async function fetchProfile(displayLink: string): Promise<ProfileData> {
  const response = await fetch(`http://localhost:3000/api/profiles/${displayLink}`);
  
  if (!response.ok) {
    // If profile not found (404), redirect to home
    if (response.status === 404) {
      window.location.href = '/';
      throw new Error('Profile not found - redirecting to home');
    }
    throw new Error(`Error fetching profile: ${response.status}`);
  }
  
  return response.json();
}

export async function createDonation(
  displayLink: string, 
  donationData: DonationRequest
): Promise<DonationResponse> {
  const response = await fetch(`http://localhost:3000/api/profiles/${displayLink}/donate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(donationData),
  });
  
  if (!response.ok) {
    throw new Error(`Error creating donation: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchDonations(displayLink: string, page: number = 1, limit: number = 10) {
  const response = await fetch(`http://localhost:3000/api/profiles/${displayLink}/donations?page=${page}&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching donations: ${response.status}`);
  }
  
  return response.json();
}

export async function createSubscription(
  displayLink: string, 
  subscriptionData: SubscriptionRequest
): Promise<SubscriptionResponse> {
  const response = await fetch(`http://localhost:3000/api/profiles/${displayLink}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscriptionData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Subscription API Error:', errorText);
    throw new Error(`Error creating subscription: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}
