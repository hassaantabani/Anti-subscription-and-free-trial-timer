/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SubscriptionProvider, useSubscriptions } from './context/SubscriptionContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CalendarPage } from './pages/CalendarPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { CelebrationModal } from './components/CelebrationModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useSubscriptions();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SubShield Anti-Subscription & Trial Collision Timer · Guarding against surprise debits
          </div>
          <div>
            Proactive alerts delivered via Email & Browser On-Screen Notifications
          </div>
        </div>
      </footer>

      <AddSubscriptionModal />
      <CelebrationModal />
    </div>
  );
};

export default function App() {
  return (
    <SubscriptionProvider>
      <MainLayout />
    </SubscriptionProvider>
  );
}
