import { Subscription, CancelledSubscription, UserProfile } from '../types';

export const SUBSCRIPTION_PRESETS = [
  {
    name: 'Netflix Standard',
    category: 'Entertainment' as const,
    defaultCost: 15.49,
    cycle: 'monthly' as const,
    cancellationUrl: 'https://www.netflix.com/youraccount',
    colorScheme: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' }
  },
  {
    name: 'Spotify Premium',
    category: 'Entertainment' as const,
    defaultCost: 11.99,
    cycle: 'monthly' as const,
    cancellationUrl: 'https://www.spotify.com/account/subscription',
    colorScheme: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' }
  },
  {
    name: 'ChatGPT Plus',
    category: 'Productivity' as const,
    defaultCost: 20.00,
    cycle: 'monthly' as const,
    cancellationUrl: 'https://chat.openai.com/#settings/subscription',
    colorScheme: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' }
  },
  {
    name: 'Amazon Prime',
    category: 'Shopping' as const,
    defaultCost: 139.00,
    cycle: 'yearly' as const,
    cancellationUrl: 'https://www.amazon.com/mc/manage',
    colorScheme: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' }
  },
  {
    name: 'Adobe Creative Cloud',
    category: 'Productivity' as const,
    defaultCost: 59.99,
    cycle: 'monthly' as const,
    cancellationUrl: 'https://account.adobe.com/plans',
    colorScheme: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' }
  },
  {
    name: 'Apple One Premier',
    category: 'Cloud & Storage' as const,
    defaultCost: 37.95,
    cycle: 'monthly' as const,
    cancellationUrl: 'https://support.apple.com/billing',
    colorScheme: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' }
  },
  {
    name: 'Blinkist 7-Day Free Trial',
    category: 'Productivity' as const,
    defaultCost: 0,
    cycle: 'yearly' as const,
    isFreeTrial: true,
    annualAutoRenew: 99.99,
    cancellationUrl: 'https://www.blinkist.com/en/settings',
    colorScheme: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' }
  },
  {
    name: 'Gym / Fitness Club',
    category: 'Health & Fitness' as const,
    defaultCost: 49.00,
    cycle: 'monthly' as const,
    cancellationUrl: '',
    colorScheme: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' }
  },
  {
    name: 'YouTube Premium',
    category: 'Entertainment' as const,
    defaultCost: 13.99,
    cycle: 'monthly' as const,
    cancellationUrl: 'https://www.youtube.com/paid_memberships',
    colorScheme: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' }
  },
  {
    name: '1Password Families',
    category: 'Utilities' as const,
    defaultCost: 59.88,
    cycle: 'yearly' as const,
    cancellationUrl: 'https://my.1password.com',
    colorScheme: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' }
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  phone: '+1 (555) 389-2041',
  countryCode: '+1',
  preferredCurrency: '$',
  emailNotificationsEnabled: true,
  browserNotificationsEnabled: true,
  soundEffectsEnabled: true,
  defaultReminderDaysBefore: 3,
};

// Seed with current year (2026) realistic dates + collision demonstrations
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_netflix',
    name: 'Netflix Premium (4K)',
    category: 'Entertainment',
    cost: 22.99,
    currency: '$',
    billingCycle: 'monthly',
    isFreeTrial: false,
    startDate: '2024-04-12',
    nextBillingDate: '2026-11-12',
    convertedAnnualCost: 275.88,
    reminderDaysBefore: 3,
    reminderChannel: 'both',
    websiteUrl: 'https://netflix.com',
    cancellationUrl: 'https://netflix.com/youraccount',
    notes: 'Family profile sharing plan',
    colorScheme: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' }
  },
  {
    id: 'sub_blinkist_trial',
    name: 'Blinkist Premium Trial',
    category: 'Productivity',
    cost: 0.00,
    currency: '$',
    billingCycle: 'yearly',
    isFreeTrial: true,
    trialEndsAt: '2026-11-06',
    startDate: '2026-10-30',
    nextBillingDate: '2026-11-06',
    convertedAnnualCost: 99.99, // Dangerous annual renewal!
    reminderDaysBefore: 2,
    reminderChannel: 'both',
    websiteUrl: 'https://blinkist.com',
    cancellationUrl: 'https://blinkist.com/en/settings',
    notes: '⚠️ 7-day free trial will charge $99.99 if not cancelled before Friday!',
    colorScheme: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' }
  },
  {
    id: 'sub_chatgpt',
    name: 'ChatGPT Plus',
    category: 'Productivity',
    cost: 20.00,
    currency: '$',
    billingCycle: 'monthly',
    isFreeTrial: false,
    startDate: '2025-01-18',
    nextBillingDate: '2026-11-18',
    convertedAnnualCost: 240.00,
    reminderDaysBefore: 3,
    reminderChannel: 'email',
    websiteUrl: 'https://chatgpt.com',
    cancellationUrl: 'https://chat.openai.com/#settings/subscription',
    notes: 'For coding and writing assistance',
    colorScheme: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' }
  },
  {
    id: 'sub_adobe_cc',
    name: 'Adobe Creative Cloud',
    category: 'Productivity',
    cost: 59.99,
    currency: '$',
    billingCycle: 'monthly',
    isFreeTrial: false,
    startDate: '2024-08-18',
    nextBillingDate: '2026-11-18', // Intentionally collides on 2026-11-18 with ChatGPT Plus!
    convertedAnnualCost: 719.88,
    reminderDaysBefore: 7,
    reminderChannel: 'both',
    websiteUrl: 'https://adobe.com',
    cancellationUrl: 'https://account.adobe.com/plans',
    notes: '💥 Collides on the 18th with ChatGPT ($79.99 total hit in 24 hours)',
    colorScheme: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' }
  },
  {
    id: 'sub_spotify',
    name: 'Spotify Duo',
    category: 'Entertainment',
    cost: 14.99,
    currency: '$',
    billingCycle: 'monthly',
    isFreeTrial: false,
    startDate: '2024-02-04',
    nextBillingDate: '2026-11-04',
    convertedAnnualCost: 179.88,
    reminderDaysBefore: 2,
    reminderChannel: 'notification',
    websiteUrl: 'https://spotify.com',
    cancellationUrl: 'https://www.spotify.com/account/subscription',
    notes: 'Music & podcast streaming',
    colorScheme: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' }
  },
  {
    id: 'sub_prime',
    name: 'Amazon Prime Annual',
    category: 'Shopping',
    cost: 139.00,
    currency: '$',
    billingCycle: 'yearly',
    isFreeTrial: false,
    startDate: '2023-12-15',
    nextBillingDate: '2026-12-15',
    convertedAnnualCost: 139.00,
    reminderDaysBefore: 14,
    reminderChannel: 'both',
    websiteUrl: 'https://amazon.com',
    cancellationUrl: 'https://www.amazon.com/mc/manage',
    notes: 'Yearly shipping and prime video',
    colorScheme: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' }
  },
  {
    id: 'sub_equinox_gym',
    name: 'Metro City Gym & Spa',
    category: 'Health & Fitness',
    cost: 65.00,
    currency: '$',
    billingCycle: 'monthly',
    isFreeTrial: false,
    startDate: '2025-06-01',
    nextBillingDate: '2026-11-01',
    convertedAnnualCost: 780.00,
    reminderDaysBefore: 5,
    reminderChannel: 'email',
    websiteUrl: 'https://gym.example.com',
    cancellationUrl: '',
    notes: 'Haven’t gone in 3 weeks! High candidate for cancellation.',
    colorScheme: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' }
  },
  {
    id: 'sub_icloud',
    name: 'iCloud+ 2TB Storage',
    category: 'Cloud & Storage',
    cost: 9.99,
    currency: '$',
    billingCycle: 'monthly',
    isFreeTrial: false,
    startDate: '2024-01-22',
    nextBillingDate: '2026-11-22',
    convertedAnnualCost: 119.88,
    reminderDaysBefore: 3,
    reminderChannel: 'notification',
    websiteUrl: 'https://apple.com/icloud',
    cancellationUrl: 'https://support.apple.com/billing',
    notes: 'Shared device backup',
    colorScheme: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' }
  }
];

export const INITIAL_CANCELLED_SUBSCRIPTIONS: CancelledSubscription[] = [
  {
    id: 'cancel_disney',
    name: 'Disney+ Bundle',
    category: 'Entertainment',
    yearlyAmountSaved: 167.88,
    cancelledAt: '2026-10-14T10:30:00Z',
    notes: 'Cancelled right after finishing season finale!'
  },
  {
    id: 'cancel_hulu_trial',
    name: 'Hulu Live TV Free Trial',
    category: 'Entertainment',
    yearlyAmountSaved: 911.88,
    cancelledAt: '2026-09-28T14:15:00Z',
    notes: 'Dodged $75.99/mo charge with 6 hours remaining on timer!'
  }
];
