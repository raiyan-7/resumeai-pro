import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldAlert, Key, ToggleLeft, ToggleRight, Sparkles, Check } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { authService } from '../services/authService';

export const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState(user?.settings?.email_notifications ?? true);
  const [apiKey, setApiKey] = useState(user?.settings?.api_keys?.gemini || '');
  const [saving, setSaving] = useState(false);

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await authService.update({
        settings: {
          email_notifications: notifications,
          api_keys: {
            gemini: apiKey
          }
        }
      });
      updateProfile(updatedUser);
      addToast('Application settings updated.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card title="Settings" subtitle="Configure system configurations & integrations">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Notification toggles */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Email Notifications</h4>
              <p className="text-[10px] text-slate-500 mt-1">Receive weekly summaries of interview practice performance.</p>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {notifications ? (
                <ToggleRight className="w-9 h-9 text-brand-500" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-650" />
              )}
            </button>
          </div>

          {/* Mock API keys */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Key className="w-4 h-4 text-slate-400" />
              <span>Gemini Developer API Key</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Provide your API key to power advanced coach questioning in production mode. Key is saved locally in database storage.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-[10px] text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Leaving the Gemini Key empty will fall back to using static mock question datasets automatically.
            </span>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-900">
            <Button
              type="submit"
              loading={saving}
              icon={Check}
            >
              Apply Configurations
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};
export default Settings;
