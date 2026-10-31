import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Check, 
  Sparkles, 
  Trash2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { requestBrowserNotificationPermission } from '../utils/notifications';

export const ProfilePage: React.FC = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    cancelledSubscriptions, 
    restoreCancelledSubscription, 
    totalSavedPerYear,
    subscriptions,
    sendSubscriptionReminder,
    emailHistory,
    resetToSampleData 
  } = useSubscriptions();

  // Personal Info Form State
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [preferredCurrency, setPreferredCurrency] = useState(userProfile.preferredCurrency);
  const [infoSaved, setInfoSaved] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Notification Preferences State
  const [emailAlerts, setEmailAlerts] = useState(userProfile.emailNotificationsEnabled);
  const [browserAlerts, setBrowserAlerts] = useState(userProfile.browserNotificationsEnabled);
  const [soundEnabled, setSoundEnabled] = useState(userProfile.soundEffectsEnabled);
  const [defaultLeadDays, setDefaultLeadDays] = useState(userProfile.defaultReminderDaysBefore);

  // Selected email inspection modal
  const [inspectedEmail, setInspectedEmail] = useState<any | null>(null);

  // Testing dispatch state
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Password strength logic
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredCurrency,
    });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    // Success simulated update
    setPasswordStatus({ type: 'success', message: 'Your password has been changed successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 4000);
  };

  const handleSaveNotifications = (updates: any) => {
    updateUserProfile(updates);
  };

  const handleRequestPushPermission = async () => {
    const permission = await requestBrowserNotificationPermission();
    if (permission === 'granted') {
      updateUserProfile({ browserNotificationsEnabled: true });
      setBrowserAlerts(true);
      new Notification('SubShield Alert Enabled', {
        body: `On-screen notifications active! You will be alerted before renewals.`,
      });
    } else {
      updateUserProfile({ browserNotificationsEnabled: false });
      setBrowserAlerts(false);
    }
  };

  const handleSendTestAlert = async () => {
    if (subscriptions.length === 0) return;
    setIsTestingEmail(true);
    try {
      const sampleSub = subscriptions[0];
      await sendSubscriptionReminder(sampleSub);
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Personal Information & Alert Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials, contact information, and renewal notification rules.
        </p>
      </div>

      {/* 1. Personal Information Form */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500">
              Your registered email is where all subscription renewal notifications will be sent.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePersonalInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Alerts Destination) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Renewal collision alerts and trial warnings will be emailed here.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Currency Symbol
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="¥">¥ (JPY - Japanese Yen)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {infoSaved && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Personal information saved successfully!</span>
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
              >
                Save Personal Information
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. Area to Change Password */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Change Account Password
            </h2>
            <p className="text-xs text-slate-500">
              Update your account password regularly to keep your financial subscription data safe.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Password strength visual indicator */}
          {newPassword && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Password Strength:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 4) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Hide characters' : 'Show characters'}</span>
            </button>
          </div>

          {passwordStatus && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {passwordStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* 3. Notification & Email Alerts Configuration */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Email & On-Screen Notification Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Configure how and when SubShield warns you before renewals and trial traps.
              </p>
            </div>
          </div>

          <button
            onClick={handleSendTestAlert}
            disabled={isTestingEmail || subscriptions.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Dispatch a real renewal reminder to your registered email and screen"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isTestingEmail ? 'Sending...' : 'Send Test Alert Now'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Email toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Automated Email Renewal Alerts
              </div>
              <div className="text-[11px] text-slate-500">
                Dispatches an alert with subscription breakdown to <strong className="text-slate-700 dark:text-slate-300">{userProfile.email}</strong>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => {
                  setEmailAlerts(e.target.checked);
                  handleSaveNotifications({ emailNotificationsEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Browser / On-screen notification toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                On-Screen Browser Notifications
              </div>
              <div className="text-[11px] text-slate-500">
                Shows desktop popups and system notifications for imminent collisions and trial expiries.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestPushPermission}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50"
              >
                {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
                  ? 'Permission Active ✓'
                  : 'Enable Browser Alerts'}
              </button>
            </div>
          </div>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Audio Feedback Chimes
                </div>
                <div className="text-[11px] text-slate-500">
                  Plays cheerful victory flourishes when you cancel subscriptions and congratulations when armed.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => {
                  setSoundEnabled(e.target.checked);
                  handleSaveNotifications({ soundEffectsEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Default Lead Time */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Default Alert Lead Time
              </div>
              <div className="text-[11px] text-slate-500">
                How many days before the renewal date you want to be warned.
              </div>
            </div>
            <select
              value={defaultLeadDays}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDefaultLeadDays(val);
                handleSaveNotifications({ defaultReminderDaysBefore: val });
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value={1}>1 Day Before</option>
              <option value={2}>2 Days Before</option>
              <option value={3}>3 Days Before (Standard)</option>
              <option value={5}>5 Days Before</option>
              <option value={7}>7 Days Before</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dispatched Email History & Inspection Log */}
      {emailHistory.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Recent Renewal Alerts Sent to {userProfile.email}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                  {emailHistory.length} sent
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Click any email to inspect the exact message delivered to your inbox.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {emailHistory.slice(0, 5).map((mail) => (
              <div
                key={mail.id}
                onClick={() => setInspectedEmail(mail)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {mail.subject}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Delivered to {mail.to} · {new Date(mail.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {mail.amount}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-medium">Delivered ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Wall of Cancelled Subscriptions (Savings Trophy Room) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Wall of Cancelled Subscriptions (Savings Ledger)
              </h2>
              <p className="text-xs text-slate-500">
                Services you removed from your life. Kept here so you know exactly how much you saved.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Total Preserved Wealth</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              +{userProfile.preferredCurrency}{totalSavedPerYear.toFixed(2)}/yr
            </div>
          </div>
        </div>

        {cancelledSubscriptions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No cancelled subscriptions yet. When you cancel services on the dashboard, they appear here!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cancelledSubscriptions.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="line-through text-slate-400">{item.name}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                      Preserved
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.notes} · Cancelled on {new Date(item.cancelledAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +{userProfile.preferredCurrency}{item.yearlyAmountSaved.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">saved every year</div>
                  </div>

                  <button
                    onClick={() => restoreCancelledSubscription(item.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Reinstate this subscription"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Management Footer */}
      <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
        <span>SubShield Anti-Subscription Engine</span>
        <button
          onClick={resetToSampleData}
          className="hover:text-rose-500 transition-colors underline"
        >
          Reset to Default Sample Subscriptions
        </button>
      </div>

      {/* Email Body Preview Modal */}
      {inspectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Email Dispatch Receipt ({inspectedEmail.id})
              </span>
              <button
                onClick={() => setInspectedEmail(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh]">
              <div dangerouslySetInnerHTML={{ __html: inspectedEmail.htmlBody }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
