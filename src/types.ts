export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';

export type Category = 
  | 'Entertainment' 
  | 'Productivity' 
  | 'Cloud & Storage' 
  | 'Health & Fitness' 
  | 'Utilities' 
  | 'News & Media' 
  | 'Gaming' 
  | 'Shopping';

export type ReminderChannel = 'email' | 'notification' | 'both';

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  isFreeTrial: boolean;
  trialEndsAt?: string; // ISO date string YYYY-MM-DD
  nextBillingDate: string; // ISO date string YYYY-MM-DD
  startDate: string; // ISO date string YYYY-MM-DD
  convertedAnnualCost: number; // Cost after trial or yearly equivalent
  reminderDaysBefore: number; // e.g. 1, 3, 7 days
  reminderChannel: ReminderChannel;
  websiteUrl?: string;
  cancellationUrl?: string;
  notes?: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface CancelledSubscription {
  id: string;
  name: string;
  category: Category;
  yearlyAmountSaved: number;
  cancelledAt: string; // ISO string
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  preferredCurrency: string;
  emailNotificationsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  soundEffectsEnabled: boolean;
  defaultReminderDaysBefore: number;
}
