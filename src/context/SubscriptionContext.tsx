import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Subscription, CancelledSubscription, UserProfile, Category } from '../types';
import { INITIAL_SUBSCRIPTIONS, INITIAL_CANCELLED_SUBSCRIPTIONS, INITIAL_USER_PROFILE } from '../data/initialData';
import { triggerHappyCancellationConfetti, triggerCongratulationsConfetti } from '../utils/confetti';
import { sounds } from '../utils/audio';
import { sendRenewalAlert, EmailDispatchResult } from '../utils/notifications';

interface CelebrationState {
  isOpen: boolean;
  type: 'congratulations' | 'cancellation' | 'emailSent';
  title: string;
  subtitle: string;
  amount?: string;
  extraInfo?: string;
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  cancelledSubscriptions: CancelledSubscription[];
  userProfile: UserProfile;
  activeTab: 'home' | 'calendar' | 'profile';
  setActiveTab: (tab: 'home' | 'calendar' | 'profile') => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  celebration: CelebrationState | null;
  closeCelebration: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addSubscription: (subData: Omit<Subscription, 'id' | 'convertedAnnualCost'>) => Subscription;
  cancelSubscription: (id: string, reason?: string) => void;
  deleteSubscriptionPermanently: (id: string) => void;
  restoreCancelledSubscription: (id: string) => void;
  sendSubscriptionReminder: (sub: Subscription) => Promise<EmailDispatchResult>;
  totalYearlySpend: number;
  totalMonthlySpend: number;
  totalSavedPerYear: number;
  collisionDates: Record<string, Subscription[]>;
  categoryBreakdown: Array<{ category: Category; totalYearly: number; count: number; percentage: number }>;
  resetToSampleData: () => void;
  emailHistory: Array<{
    id: string;
    to: string;
    subject: string;
    subscriptionName: string;
    amount: string;
    renewalDate: string;
    timestamp: string;
    status: 'delivered' | 'pending';
    htmlBody: string;
  }>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_SUBS = 'subshield_subscriptions_v1';
const LOCAL_STORAGE_KEY_CANCELLED = 'subshield_cancelled_v1';
const LOCAL_STORAGE_KEY_PROFILE = 'subshield_profile_v1';

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'profile'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  // Load subscriptions
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SUBS);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  // Load cancelled subscriptions
  const [cancelledSubscriptions, setCancelledSubscriptions] = useState<CancelledSubscription[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CANCELLED);
      return saved ? JSON.parse(saved) : INITIAL_CANCELLED_SUBSCRIPTIONS;
    } catch {
      return INITIAL_CANCELLED_SUBSCRIPTIONS;
    }
  });

  // Load user profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // Email history
  const [emailHistory, setEmailHistory] = useState<Array<any>>([]);

  // Fetch backend emails on mount
  useEffect(() => {
    fetch('/api/notifications/emails')
      .then((res) => res.json())
      .then((data) => {
        if (data?.emails) {
          setEmailHistory(data.emails);
        }
      })
      .catch(() => {});
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SUBS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CANCELLED, JSON.stringify(cancelledSubscriptions));
  }, [cancelledSubscriptions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  // Compute collision dates: when 2+ subscriptions renew on the exact same day
  const collisionDates = useMemo(() => {
    const map: Record<string, Subscription[]> = {};
    subscriptions.forEach((sub) => {
      const dateKey = sub.isFreeTrial && sub.trialEndsAt ? sub.trialEndsAt : sub.nextBillingDate;
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(sub);
    });

    // Keep only collision days (where length >= 2)
    const collisionsOnly: Record<string, Subscription[]> = {};
    Object.entries(map).forEach(([date, subs]) => {
      if (subs.length >= 2) {
        collisionsOnly[date] = subs;
      }
    });
    return collisionsOnly;
  }, [subscriptions]);

  // Total yearly spend calculation
  const totalYearlySpend = useMemo(() => {
    return subscriptions.reduce((sum, s) => {
      let annual = 0;
      if (s.isFreeTrial) {
        annual = s.convertedAnnualCost || 0;
      } else if (s.billingCycle === 'monthly') {
        annual = s.cost * 12;
      } else if (s.billingCycle === 'yearly') {
        annual = s.cost;
      } else if (s.billingCycle === 'weekly') {
        annual = s.cost * 52;
      } else if (s.billingCycle === 'quarterly') {
        annual = s.cost * 4;
      }
      return sum + annual;
    }, 0);
  }, [subscriptions]);

  const totalMonthlySpend = useMemo(() => {
    return totalYearlySpend / 12;
  }, [totalYearlySpend]);

  const totalSavedPerYear = useMemo(() => {
    return cancelledSubscriptions.reduce((sum, item) => sum + item.yearlyAmountSaved, 0);
  }, [cancelledSubscriptions]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { totalYearly: number; count: number }> = {};
    subscriptions.forEach((s) => {
      let annual = s.convertedAnnualCost;
      if (!annual) {
        if (s.billingCycle === 'monthly') annual = s.cost * 12;
        else if (s.billingCycle === 'yearly') annual = s.cost;
        else if (s.billingCycle === 'weekly') annual = s.cost * 52;
        else if (s.billingCycle === 'quarterly') annual = s.cost * 4;
        else annual = s.cost;
      }
      if (!map[s.category]) {
        map[s.category] = { totalYearly: 0, count: 0 };
      }
      map[s.category].totalYearly += annual;
      map[s.category].count += 1;
    });

    const list = Object.entries(map).map(([category, data]) => ({
      category: category as Category,
      totalYearly: data.totalYearly,
      count: data.count,
      percentage: totalYearlySpend > 0 ? (data.totalYearly / totalYearlySpend) * 100 : 0,
    }));

    // Sort descending by spend
    return list.sort((a, b) => b.totalYearly - a.totalYearly);
  }, [subscriptions, totalYearlySpend]);

  // Add new subscription
  const addSubscription = useCallback((data: Omit<Subscription, 'id' | 'convertedAnnualCost'>) => {
    let annual = 0;
    if (data.isFreeTrial) {
      annual = (data as any).convertedAnnualCost || data.cost * 12 || 99.99;
    } else if (data.billingCycle === 'monthly') {
      annual = data.cost * 12;
    } else if (data.billingCycle === 'yearly') {
      annual = data.cost;
    } else if (data.billingCycle === 'weekly') {
      annual = data.cost * 52;
    } else if (data.billingCycle === 'quarterly') {
      annual = data.cost * 4;
    }

    const newSub: Subscription = {
      ...data,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      convertedAnnualCost: annual,
    };

    setSubscriptions((prev) => [newSub, ...prev]);

    // Congratulations animation & sound
    if (userProfile.soundEffectsEnabled) {
      sounds.playCongratulations();
    }
    triggerCongratulationsConfetti();

    setCelebration({
      isOpen: true,
      type: 'congratulations',
      title: 'Subscription Shield Armed! 🎉',
      subtitle: `We are now guarding ${newSub.name}. You'll receive email & alert notifications before it renews.`,
      amount: `${newSub.currency}${newSub.cost.toFixed(2)}`,
      extraInfo: `Renews on ${newSub.nextBillingDate}`
    });

    return newSub;
  }, [userProfile.soundEffectsEnabled]);

  // Remove / Cancel subscription (Triggering the small happy animation)
  const cancelSubscription = useCallback((id: string, reason?: string) => {
    const target = subscriptions.find((s) => s.id === id);
    if (!target) return;

    let yearlySaved = target.convertedAnnualCost;
    if (!yearlySaved || yearlySaved === 0) {
      if (target.billingCycle === 'monthly') yearlySaved = target.cost * 12;
      else if (target.billingCycle === 'yearly') yearlySaved = target.cost;
      else yearlySaved = 99.99;
    }

    const cancelledItem: CancelledSubscription = {
      id: `cancelled_${Date.now()}`,
      name: target.name,
      category: target.category,
      yearlyAmountSaved: yearlySaved,
      cancelledAt: new Date().toISOString(),
      notes: reason || target.notes || 'Successfully removed subscription',
    };

    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    setCancelledSubscriptions((prev) => [cancelledItem, ...prev]);

    // Small happy animation & audio chime
    if (userProfile.soundEffectsEnabled) {
      sounds.playCancelSuccess();
    }
    triggerHappyCancellationConfetti();

    setCelebration({
      isOpen: true,
      type: 'cancellation',
      title: 'Subscription Destroyed! 🥳',
      subtitle: `You just liberated your wallet from ${target.name}. That's money kept in your pocket!`,
      amount: `+${target.currency}${yearlySaved.toFixed(2)}/yr`,
      extraInfo: 'Added to your Wall of Cancelled Savings'
    });
  }, [subscriptions, userProfile.soundEffectsEnabled]);

  const deleteSubscriptionPermanently = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const restoreCancelledSubscription = useCallback((id: string) => {
    const target = cancelledSubscriptions.find((c) => c.id === id);
    if (!target) return;

    const restored: Subscription = {
      id: `restored_${Date.now()}`,
      name: target.name,
      category: target.category,
      cost: target.yearlyAmountSaved / 12,
      currency: userProfile.preferredCurrency,
      billingCycle: 'monthly',
      isFreeTrial: false,
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      convertedAnnualCost: target.yearlyAmountSaved,
      reminderDaysBefore: 3,
      reminderChannel: 'both',
      colorScheme: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800' }
    };

    setCancelledSubscriptions((prev) => prev.filter((c) => c.id !== id));
    setSubscriptions((prev) => [restored, ...prev]);
  }, [cancelledSubscriptions, userProfile.preferredCurrency]);

  // Dispatch reminder email & on-screen notification
  const sendSubscriptionReminder = useCallback(async (sub: Subscription) => {
    const collidingSubs = (collisionDates[sub.nextBillingDate] || [])
      .filter((s) => s.id !== sub.id)
      .map((s) => s.name);

    const result = await sendRenewalAlert(sub, userProfile, {
      collidingServices: collidingSubs,
    });

    if (result.emailResult.emailRecord) {
      setEmailHistory((prev) => [result.emailResult.emailRecord, ...prev]);
    }

    setCelebration({
      isOpen: true,
      type: 'emailSent',
      title: 'Alert Dispatched Successfully! 📬',
      subtitle: `Renewal notification delivered to ${userProfile.email} and broadcast to your screen.`,
      amount: `${sub.currency}${sub.cost.toFixed(2)}`,
      extraInfo: `Scheduled for ${sub.nextBillingDate}`
    });

    return result.emailResult;
  }, [userProfile, collisionDates]);

  const closeCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const resetToSampleData = useCallback(() => {
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setCancelledSubscriptions(INITIAL_CANCELLED_SUBSCRIPTIONS);
    setUserProfile(INITIAL_USER_PROFILE);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SUBS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CANCELLED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        cancelledSubscriptions,
        userProfile,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        celebration,
        closeCelebration,
        updateUserProfile,
        addSubscription,
        cancelSubscription,
        deleteSubscriptionPermanently,
        restoreCancelledSubscription,
        sendSubscriptionReminder,
        totalYearlySpend,
        totalMonthlySpend,
        totalSavedPerYear,
        collisionDates,
        categoryBreakdown,
        resetToSampleData,
        emailHistory,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};
