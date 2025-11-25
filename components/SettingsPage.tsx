
import React, { useState, useEffect } from 'react';
import { Bell, Shield, User, ChevronRight } from 'lucide-react';
import { callGetUserProfile, callUpdateUserSettings, callUpdateUserProfile } from '../services/dataService';
import { signOutUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children?: React.ReactNode }) => (
  <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm mb-6 md:mb-8">
    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pb-3 md:pb-4 border-b border-slate-100">
      <div className="p-2 md:p-3 bg-primary-50 rounded-2xl text-primary-600">
          <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="space-y-1 md:space-y-2">
      {children}
    </div>
  </div>
);

const Row = ({ label, value, action }: { label: string, value?: string, action?: string }) => (
  <div className="flex items-center justify-between py-3 group cursor-pointer hover:bg-slate-50 px-3 md:px-4 -mx-3 md:-mx-4 rounded-xl transition-colors">
      <span className="text-slate-700 font-medium text-sm md:text-base">{label}</span>
      <div className="flex items-center gap-2 md:gap-3">
          {value && <span className="text-slate-400 text-xs md:text-sm font-medium">{value}</span>}
          <button className="text-primary-600 text-xs md:text-sm font-bold hover:text-primary-700 flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {action || 'Edit'} <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
          </button>
      </div>
  </div>
);

const Toggle = ({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked?: boolean; 
  onChange?: () => void;
}) => (
  <div 
    className="flex items-center justify-between py-3 px-3 md:px-4 -mx-3 md:-mx-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
    onClick={onChange}
  >
      <span className="text-slate-700 font-medium text-sm md:text-base">{label}</span>
      <div className={`w-10 h-6 md:w-12 md:h-7 rounded-full relative cursor-pointer transition-colors shadow-inner ${checked ? 'bg-primary-500' : 'bg-slate-200'}`}>
          <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-5 md:left-6' : 'left-1'}`} />
      </div>
  </div>
);

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    growthAlerts: true,
    marketingEmails: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await callGetUserProfile();
        setProfile(result.profile);
        if (result.profile.settings?.notifications) {
          setNotifications(result.profile.settings.notifications);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(newNotifications);

    try {
      await callUpdateUserSettings({
        notifications: newNotifications,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert on error
      setNotifications(notifications);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 h-full overflow-y-auto bg-white ml-16 md:ml-0 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-white ml-16 md:ml-0">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-10">Settings</h1>

        <Section title="Account" icon={User}>
            <Row label="Email" value={profile?.email || ''} />
            <Row label="Subscription" value={profile?.subscription === 'pro' ? 'Pro Plan' : profile?.subscription === 'premium' ? 'Premium Plan' : 'Free Plan'} action="Manage" />
        </Section>

        <Section title="Notifications" icon={Bell}>
            <Toggle 
              label="Weekly Analysis Report" 
              checked={notifications.weeklyReport}
              onChange={() => handleNotificationToggle('weeklyReport')}
            />
            <Toggle 
              label="Growth Goal Alerts" 
              checked={notifications.growthAlerts}
              onChange={() => handleNotificationToggle('growthAlerts')}
            />
            <Toggle 
              label="Marketing Emails" 
              checked={notifications.marketingEmails}
              onChange={() => handleNotificationToggle('marketingEmails')}
            />
        </Section>

        <Section title="Security" icon={Shield}>
            <Row label="Password" value="Last changed 3 months ago" action="Change" />
            <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-slate-100 px-3 md:px-4 -mx-3 md:-mx-4">
                <button 
                  onClick={handleLogout}
                  className="text-red-500 text-xs md:text-sm font-bold hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
            </div>
        </Section>
      </div>
    </div>
  );
};

export default SettingsPage;
