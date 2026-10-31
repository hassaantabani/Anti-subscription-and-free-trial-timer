import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Shield, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { SUBSCRIPTION_PRESETS } from '../data/initialData';
import { Category, BillingCycle, ReminderChannel } from '../types';

export const AddSubscriptionModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addSubscription, subscriptions, userProfile } = useSubscriptions();

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Entertainment');
  const [cost, setCost] = useState<string>('14.99');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [autoRenewCost, setAutoRenewCost] = useState('79.99');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextBillingDate, setNextBillingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>('both');
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(3);
  const [cancellationUrl, setCancellationUrl] = useState('');
  const [notes, setNotes] = useState('');

  if (!isAddModalOpen) return null;

  // Collision detection preview: see if another subscription renews on nextBillingDate
  const checkCollisionDate = isFreeTrial && trialEndsAt ? trialEndsAt : nextBillingDate;
  const collidingSubs = subscriptions.filter(
    (s) => (s.isFreeTrial && s.trialEndsAt ? s.trialEndsAt : s.nextBillingDate) === checkCollisionDate
  );

  const applyPreset = (preset: typeof SUBSCRIPTION_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setCost(preset.defaultCost.toString());
    setBillingCycle(preset.cycle);
    setCancellationUrl(preset.cancellationUrl || '');
    if ((preset as any).isFreeTrial) {
      setIsFreeTrial(true);
      const trialDate = new Date();
      trialDate.setDate(trialDate.getDate() + 7);
      setTrialEndsAt(trialDate.toISOString().split('T')[0]);
      setAutoRenewCost(((preset as any).annualAutoRenew || 99.99).toString());
    } else {
      setIsFreeTrial(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedCost = parseFloat(cost) || 0;
    const parsedAnnual = isFreeTrial ? parseFloat(autoRenewCost) || 99.99 : 0;

    addSubscription({
      name: name.trim(),
      category,
      cost: parsedCost,
      currency: userProfile.preferredCurrency,
      billingCycle,
      isFreeTrial,
      trialEndsAt: isFreeTrial ? trialEndsAt || nextBillingDate : undefined,
      nextBillingDate: isFreeTrial && trialEndsAt ? trialEndsAt : nextBillingDate,
      startDate,
      reminderDaysBefore,
      reminderChannel,
      cancellationUrl: cancellationUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      colorScheme: {
        bg: 'bg-slate-500/10',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-800'
      }
    });

    setIsAddModalOpen(false);
    // Reset form
    setName('');
    setCost('14.99');
    setIsFreeTrial(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Subscription or Free Trial
              </h2>
              <p className="text-xs text-slate-500">
                Set renewal reminders and detect billing collisions before you are charged.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick 1-Click Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Popular Presets (1-Click Fill)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              {SUBSCRIPTION_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600 transition-all shadow-2xs"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subscription / App Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Netflix, Audible, Figma..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Productivity">Productivity</option>
                <option value="Cloud & Storage">Cloud & Storage</option>
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="Utilities">Utilities</option>
                <option value="News & Media">News & Media</option>
                <option value="Gaming">Gaming</option>
                <option value="Shopping">Shopping</option>
              </select>
            </div>
          </div>

          {/* Free Trial Toggle */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeTrial}
                onChange={(e) => setIsFreeTrial(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                ⚠️ This is a Free Trial (High Risk of Sudden Auto-Charge)
              </span>
            </label>
            {isFreeTrial && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-500/20">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Trial Ends On (Countdown Date)
                  </label>
                  <input
                    type="date"
                    required={isFreeTrial}
                    value={trialEndsAt}
                    onChange={(e) => setTrialEndsAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Auto-Renews To ({userProfile.preferredCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={autoRenewCost}
                    onChange={(e) => setAutoRenewCost(e.target.value)}
                    placeholder="e.g. 99.99/year"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cost & Cycle */}
          {!isFreeTrial && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cost ({userProfile.preferredCurrency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-slate-400 font-mono">
                    {userProfile.preferredCurrency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly (Annual)</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          )}

          {/* Dates & Collision Check */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Renewal Date *
              </label>
              <input
                type="date"
                required
                value={isFreeTrial && trialEndsAt ? trialEndsAt : nextBillingDate}
                onChange={(e) => {
                  setNextBillingDate(e.target.value);
                  if (isFreeTrial) setTrialEndsAt(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>
          </div>

          {/* Collision Warning Banner if another subscription renews on same day */}
          {collidingSubs.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold">Collision Detected on {checkCollisionDate}: </span>
                {collidingSubs.map((s) => s.name).join(', ')} {collidingSubs.length === 1 ? 'is' : 'are'} already scheduled on this day.
                Adding this will cause multiple charges on the exact same date!
              </div>
            </div>
          )}

          {/* Reminder Alert Configuration */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Notification & Email Alert Preferences</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Alert Channel
                </label>
                <select
                  value={reminderChannel}
                  onChange={(e) => setReminderChannel(e.target.value as ReminderChannel)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="both">Email & On-Screen Notification</option>
                  <option value="email">Email Alert Only ({userProfile.email})</option>
                  <option value="notification">On-Screen Notification Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Remind Me In Advance
                </label>
                <select
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={1}>1 day before renewal</option>
                  <option value={2}>2 days before renewal</option>
                  <option value={3}>3 days before renewal (Recommended)</option>
                  <option value={5}>5 days before renewal</option>
                  <option value={7}>7 days before renewal</option>
                  <option value={14}>14 days before renewal</option>
                </select>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              Alerts will be sent to registered email: <strong className="text-slate-700 dark:text-slate-300">{userProfile.email}</strong>
            </div>
          </div>

          {/* Cancellation URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cancellation / Management Link (Optional)
            </label>
            <input
              type="url"
              value={cancellationUrl}
              onChange={(e) => setCancellationUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Arm Timer & Protect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
