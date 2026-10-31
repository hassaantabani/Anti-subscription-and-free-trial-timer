import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Trash2, 
  Mail, 
  ExternalLink, 
  CheckCircle, 
  Search, 
  TrendingDown, 
  Layers, 
  Plus, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { Category, Subscription } from '../types';

export const HomePage: React.FC = () => {
  const { 
    subscriptions, 
    totalYearlySpend, 
    totalMonthlySpend, 
    categoryBreakdown, 
    collisionDates,
    cancelSubscription, 
    sendSubscriptionReminder, 
    setIsAddModalOpen,
    setActiveTab,
    userProfile 
  } = useSubscriptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTrialsOnly, setShowTrialsOnly] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory;
    const matchesTrial = !showTrialsOnly || sub.isFreeTrial;
    return matchesSearch && matchesCategory && matchesTrial;
  });

  // Calculate days remaining helper
  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Active trials
  const activeTrials = subscriptions.filter((s) => s.isFreeTrial);

  // Collisions list
  const collisionEntries = Object.entries(collisionDates).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

  const handleSendReminder = async (sub: Subscription) => {
    setSendingReminderId(sub.id);
    try {
      await sendSubscriptionReminder(sub);
    } finally {
      setSendingReminderId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header with Total Yearly & Monthly Spend */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <span>Anti-Subscription Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
              Total Yearly Subscription Spend
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every month, automatic renewals silently siphon your bank balance. Track upcoming renewals, dodge free-trial traps, and defuse charge collisions before they hit.
            </p>
          </div>

          {/* Spend Highlight Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 shrink-0">
            <div>
              <div className="text-xs text-slate-400 mb-1">Yearly Commitment</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-400">
                {userProfile.preferredCurrency}{totalYearlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                across {subscriptions.length} active service{subscriptions.length === 1 ? '' : 's'}
              </div>
            </div>

            <div className="border-l border-slate-700/60 pl-4 sm:pl-6">
              <div className="text-xs text-slate-400 mb-1">Monthly Average</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
                {userProfile.preferredCurrency}{totalMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                ~{userProfile.preferredCurrency}{(totalYearlySpend / 365).toFixed(2)}/day
              </div>
            </div>
          </div>
        </div>

        {/* Ambient subtle light backdrop */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Free Trial Expiration Countdown Alert (If any trials active) */}
      {activeTrials.length > 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Expiring Free-Trial Countdown Collision Shield
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  These services are currently free but will convert into expensive recurring charges!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrials.map((trial) => {
              const daysLeft = getDaysRemaining(trial.trialEndsAt || trial.nextBillingDate);
              const isUrgent = daysLeft <= 3;

              return (
                <div
                  key={trial.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {trial.name}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                          Trial Trap
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Auto-renews to: <strong className="text-rose-600 dark:text-rose-400 font-mono">{userProfile.preferredCurrency}{trial.convertedAnnualCost.toFixed(2)}/yr</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-base font-extrabold font-mono ${isUrgent ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'}`}>
                        {daysLeft > 0 ? `${daysLeft} Day${daysLeft === 1 ? '' : 's'} Left` : 'Expires Today!'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Date: {trial.trialEndsAt || trial.nextBillingDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => cancelSubscription(trial.id, 'Cancelled free trial before auto-charge')}
                      className="flex-1 py-1.5 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>I Cancelled This (Save {userProfile.preferredCurrency}{trial.convertedAnnualCost.toFixed(0)})</span>
                    </button>

                    <button
                      onClick={() => handleSendReminder(trial)}
                      disabled={sendingReminderId === trial.id}
                      className="py-1.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                      title="Send instant reminder email to registered address"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{sendingReminderId === trial.id ? 'Sending...' : 'Alert Email'}</span>
                    </button>

                    {trial.cancellationUrl && (
                      <a
                        href={trial.cancellationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Open Cancellation Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collision Alert Banner: Highlights dates where multiple subscriptions charge on the same day */}
      {collisionEntries.length > 0 && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                  Billing Collision Warning ({collisionEntries.length} Date{collisionEntries.length === 1 ? '' : 's'} with Multi-Charges)
                </h3>
                <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
                  Multiple services are debiting on the same day. This causes sudden lump-sum hits to your account.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1"
            >
              <span>View in Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {collisionEntries.map(([date, subs]) => {
              const combinedCost = subs.reduce((sum, s) => sum + s.cost, 0);
              return (
                <div
                  key={date}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{date}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-medium">
                        {subs.length} collisions
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {subs.map((s) => s.name).join(' + ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold font-mono text-rose-600 dark:text-rose-400">
                      {userProfile.preferredCurrency}{combinedCost.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">due simultaneously</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown Section (Where these are going) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Subscription Breakdown by Category
            </h2>
            <p className="text-xs text-slate-500">
              See where your recurring subscription money is leaking every year.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {categoryBreakdown.length} Active Categories
          </div>
        </div>

        {/* Multi-Segment Stacked Visual Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {categoryBreakdown.map((item, idx) => {
              const colors = [
                'bg-rose-500',
                'bg-indigo-500',
                'bg-emerald-500',
                'bg-amber-500',
                'bg-cyan-500',
                'bg-purple-500',
                'bg-teal-500',
                'bg-slate-500',
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={item.category}
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  title={`${item.category}: ${item.percentage.toFixed(1)}% (${userProfile.preferredCurrency}${item.totalYearly.toFixed(2)}/yr)`}
                  className={`${color} h-full transition-all hover:opacity-85`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>0%</span>
            <span>Annual Share</span>
            <span>100%</span>
          </div>
        </div>

        {/* Breakdown Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoryBreakdown.map((item, idx) => {
            const dotColors = [
              'bg-rose-500',
              'bg-indigo-500',
              'bg-emerald-500',
              'bg-amber-500',
              'bg-cyan-500',
              'bg-purple-500',
              'bg-teal-500',
              'bg-slate-500',
            ];
            const dotColor = dotColors[idx % dotColors.length];

            return (
              <button
                key={item.category}
                onClick={() => setSelectedCategory(selectedCategory === item.category ? 'all' : item.category)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedCategory === item.category
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.category}
                  </span>
                </div>
                <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {userProfile.preferredCurrency}{item.totalYearly.toFixed(0)}
                  <span className="text-[11px] font-normal text-slate-500">/yr</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                  <span>{item.count} service{item.count === 1 ? '' : 's'}</span>
                  <span className="font-mono">{item.percentage.toFixed(0)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscription List & Control Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              All Active Subscriptions & Reminders ({filteredSubscriptions.length})
            </h2>
            <p className="text-xs text-slate-500">
              Click &quot;Alert Email&quot; to test notifications, or &quot;I Cancelled This&quot; to remove and log your savings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscription by name or category..."
              className="w-full text-xs bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTrialsOnly(!showTrialsOnly)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showTrialsOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              Trials Only
            </button>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2"
              >
                Clear category filter ({selectedCategory})
              </button>
            )}
          </div>
        </div>

        {/* Subscription Cards Grid */}
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No subscriptions match your filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new subscription or clear your search query.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setShowTrialsOnly(false); }}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.map((sub) => {
              const daysLeft = getDaysRemaining(sub.isFreeTrial && sub.trialEndsAt ? sub.trialEndsAt : sub.nextBillingDate);
              const isColliding = (collisionDates[sub.nextBillingDate] || []).length >= 2;

              return (
                <div
                  key={sub.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                    isColliding 
                      ? 'border-rose-300 dark:border-rose-900/60' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Name, Category, Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {sub.name}
                          </h3>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{sub.category}</span>
                          <span>·</span>
                          <span className="capitalize">{sub.billingCycle}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                          {sub.currency}{sub.cost.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {sub.isFreeTrial ? 'during trial' : `per ${sub.billingCycle}`}
                        </div>
                      </div>
                    </div>

                    {/* Collision or Trial Warning Tag */}
                    {isColliding && (
                      <div className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Collision Risk: Renewing alongside another service</span>
                      </div>
                    )}

                    {sub.notes && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                        &quot;{sub.notes}&quot;
                      </div>
                    )}

                    {/* Renewal Date & Countdown */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Renewal Date</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                            {sub.isFreeTrial && sub.trialEndsAt ? sub.trialEndsAt : sub.nextBillingDate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase">Countdown</div>
                        <div className={`font-bold font-mono ${daysLeft <= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {daysLeft > 0 ? `${daysLeft} days` : 'Due today'}
                        </div>
                      </div>
                    </div>

                    {/* Reminder Status */}
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Alert: {sub.reminderDaysBefore} days before</span>
                      <span className="capitalize">{sub.reminderChannel === 'both' ? 'Email & Screen' : sub.reminderChannel}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSendReminder(sub)}
                      disabled={sendingReminderId === sub.id}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Send email alert to user's registered address"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{sendingReminderId === sub.id ? 'Sending...' : 'Alert Email'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {sub.cancellationUrl && (
                        <a
                          href={sub.cancellationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Open Cancellation Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => cancelSubscription(sub.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                        title="Remove subscription and save money (Triggers celebration!)"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>I Cancelled This</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
