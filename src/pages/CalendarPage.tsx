import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Mail, 
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { Subscription } from '../types';

export const CalendarPage: React.FC = () => {
  const { subscriptions, collisionDates, cancelSubscription, sendSubscriptionReminder, userProfile } = useSubscriptions();

  // Current year/month state - spanning at least 2 years past (2024, 2025) and 1 year future (2027)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // 0-indexed, 10 = November
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string;
    events: Subscription[];
    isPast: boolean;
  } | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'collisions' | 'trials'>('all');

  // Month navigation
  const prevMonth = () => {
    if (selectedMonth === 0) {
      if (selectedYear > 2024) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(11);
      }
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      if (selectedYear < 2027) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(0);
      }
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  // Calendar calculations for selected month/year
  const { daysInMonth, firstDayOfWeek, monthName } = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
    const name = monthFormatter.format(date);
    const days = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = date.getDay(); // 0 for Sunday
    return { daysInMonth: days, firstDayOfWeek: firstDay, monthName: name };
  }, [selectedYear, selectedMonth]);

  // Project recurring events onto the selected year and month
  // Subscriptions have nextBillingDate, startDate, billingCycle, trialEndsAt
  const eventsByDay = useMemo(() => {
    const map: Record<number, Subscription[]> = {};

    subscriptions.forEach((sub) => {
      const renewalDateObj = new Date(sub.isFreeTrial && sub.trialEndsAt ? sub.trialEndsAt : sub.nextBillingDate);
      const startObj = new Date(sub.startDate);

      // Check if sub was active during selectedYear-selectedMonth
      if (startObj.getFullYear() > selectedYear || (startObj.getFullYear() === selectedYear && startObj.getMonth() > selectedMonth)) {
        return;
      }

      // Day of month where this sub recurs
      const billingDay = renewalDateObj.getDate();
      // Cap at days in current month (e.g. 28, 30, 31)
      const dayKey = Math.min(billingDay, daysInMonth);

      // Check billing cycle recurrence match
      let applies = false;
      if (sub.isFreeTrial) {
        // Free trial happens exactly in its trial month
        if (renewalDateObj.getFullYear() === selectedYear && renewalDateObj.getMonth() === selectedMonth) {
          applies = true;
        }
      } else if (sub.billingCycle === 'monthly') {
        applies = true;
      } else if (sub.billingCycle === 'yearly') {
        if (renewalDateObj.getMonth() === selectedMonth) {
          applies = true;
        }
      } else if (sub.billingCycle === 'quarterly') {
        const monthDiff = Math.abs(selectedMonth - renewalDateObj.getMonth());
        if (monthDiff % 3 === 0) {
          applies = true;
        }
      } else {
        applies = true;
      }

      if (applies) {
        if (!map[dayKey]) map[dayKey] = [];
        map[dayKey].push(sub);
      }
    });

    return map;
  }, [subscriptions, selectedYear, selectedMonth, daysInMonth]);

  // Total projected spend for the selected month
  const monthlyTotal = useMemo(() => {
    let sum = 0;
    Object.values(eventsByDay).forEach((subs) => {
      subs.forEach((s) => {
        sum += s.isFreeTrial ? 0 : s.cost;
      });
    });
    return sum;
  }, [eventsByDay]);

  // Detect collisions in the active month view
  const monthCollisionDays = useMemo(() => {
    const list: number[] = [];
    Object.entries(eventsByDay).forEach(([day, subs]) => {
      if (subs.length >= 2) {
        list.push(parseInt(day, 10));
      }
    });
    return list;
  }, [eventsByDay]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const availableYears = [2024, 2025, 2026, 2027];

  return (
    <div className="space-y-6 pb-16">
      {/* Calendar Header with Year Selector & Month Navigator */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-rose-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Multi-Year Subscription & Collision Calendar
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Spanning 2 years of past history (2024, 2025) and 1 year into the future (2026, 2027).
            </p>
          </div>

          {/* Quick Year Selector (2024, 2025, 2026, 2027) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedYear === year
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {year}
                {year === 2026 && (
                  <span className="ml-1 text-[10px] text-rose-500 font-bold">· Now</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Month Navigation & Projected Spend Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              disabled={selectedYear === 2024 && selectedMonth === 0}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-base font-bold text-slate-900 dark:text-white w-44 text-center">
              {monthName} {selectedYear}
            </span>

            <button
              onClick={nextMonth}
              disabled={selectedYear === 2027 && selectedMonth === 11}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={jumpToToday}
              className="ml-2 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-md"
            >
              Current Month
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-slate-500">
              {monthName} Forecasted Charges:
              <strong className="ml-1.5 text-sm font-bold font-mono text-slate-900 dark:text-white">
                {userProfile.preferredCurrency}{monthlyTotal.toFixed(2)}
              </strong>
            </div>

            {monthCollisionDays.length > 0 && (
              <div className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>{monthCollisionDays.length} Collision Day{monthCollisionDays.length === 1 ? '' : 's'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xs">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty spacer slots for leading days */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[70px] sm:min-h-[96px] rounded-xl bg-slate-50/40 dark:bg-slate-900/40 border border-transparent opacity-40"
            />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
            const dayNum = dayIdx + 1;
            const events = eventsByDay[dayNum] || [];
            const hasCollision = events.length >= 2;
            const hasTrial = events.some((e) => e.isFreeTrial);

            const isToday =
              selectedYear === 2026 &&
              selectedMonth === 10 &&
              dayNum === 31; // today context

            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isPast = new Date(dateStr) < new Date(2026, 9, 31);

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  if (events.length > 0) {
                    setSelectedDayDetail({ dateStr, events, isPast });
                  }
                }}
                className={`min-h-[72px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  events.length > 0 ? 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-600' : ''
                } ${
                  hasCollision
                    ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs'
                    : events.length > 0
                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-2xs'
                    : 'border-slate-100 dark:border-slate-800/70 bg-slate-50/30 dark:bg-slate-900/40 text-slate-400'
                } ${isToday ? 'ring-2 ring-rose-500' : ''}`}
              >
                {/* Day Number and Badges */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${isToday ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {dayNum}
                  </span>

                  {hasCollision && (
                    <span
                      className="px-1 py-0.2 rounded text-[10px] font-bold bg-rose-500 text-white flex items-center gap-0.5"
                      title={`${events.length} subscriptions colliding on this day!`}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span className="hidden sm:inline">Collision</span>
                    </span>
                  )}

                  {!hasCollision && hasTrial && (
                    <span className="px-1 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-white">
                      Trial
                    </span>
                  )}
                </div>

                {/* Subscriptions Pill / Micro-cards */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {events.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[10px] sm:text-xs truncate px-1.5 py-0.5 rounded font-medium flex items-center justify-between ${
                        ev.isFreeTrial
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                          : hasCollision
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{ev.name}</span>
                      <span className="font-mono text-[9px] sm:text-[10px] ml-1 shrink-0">
                        {ev.isFreeTrial ? 'Free' : `${userProfile.preferredCurrency}${ev.cost.toFixed(0)}`}
                      </span>
                    </div>
                  ))}

                  {events.length > 2 && (
                    <div className="text-[10px] font-bold text-slate-400 text-center">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal / Drawer when user clicks on a calendar date */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Scheduled Debits for {selectedDayDetail.dateStr}</span>
                  {selectedDayDetail.events.length >= 2 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-semibold">
                      Collision Alert!
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Total for this date:{' '}
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {userProfile.preferredCurrency}
                    {selectedDayDetail.events.reduce((acc, s) => acc + s.cost, 0).toFixed(2)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedDayDetail.events.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {sub.name}
                      </h4>
                      <div className="text-xs text-slate-500">
                        {sub.category} · {sub.billingCycle}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                        {userProfile.preferredCurrency}{sub.cost.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sub.isFreeTrial ? 'Expiring trial' : `billed ${sub.billingCycle}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <button
                      onClick={() => {
                        sendSubscriptionReminder(sub);
                        setSelectedDayDetail(null);
                      }}
                      className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Alert to {userProfile.email}</span>
                    </button>

                    <button
                      onClick={() => {
                        cancelSubscription(sub.id);
                        setSelectedDayDetail(null);
                      }}
                      className="py-1.5 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>I Cancelled</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Stream of Renewals & Past Charge Ledger */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Renewal Timeline Stream
            </h2>
            <p className="text-xs text-slate-500">
              Chronological log of upcoming debits and past subscription billing milestones.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {subscriptions.map((sub) => {
            const isCollision = (collisionDates[sub.nextBillingDate] || []).length >= 2;
            return (
              <div
                key={sub.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    sub.isFreeTrial
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : isCollision
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {sub.billingCycle === 'yearly' ? 'YR' : 'MO'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{sub.name}</span>
                      {isCollision && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold">
                          Collision
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      Scheduled: <span className="font-mono">{sub.nextBillingDate}</span> · Alert sent to: {userProfile.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {sub.currency}{sub.cost.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {sub.billingCycle}
                    </div>
                  </div>

                  <button
                    onClick={() => sendSubscriptionReminder(sub)}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Send reminder email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
