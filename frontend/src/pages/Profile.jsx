import React, { useState } from 'react';
import { User, Mail, Briefcase, Award, Save } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { authService } from '../services/authService';
import { TARGET_ROLES } from '../utils/constants';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [targetRole, setTargetRole] = useState(user?.settings?.target_role || 'Software Engineer');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await authService.update({
        full_name: fullName,
        settings: {
          target_role: targetRole
        }
      });
      updateProfile(updatedUser);
      addToast('Profile changes saved successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card title="My Profile" subtitle="Manage your target job role settings">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-center gap-4 border-b border-slate-900 pb-6">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-accent-400 border border-slate-700/50">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{user?.full_name || 'ResumeAI Pro Member'}</h4>
              <p className="text-[10px] text-slate-500">{user?.email}</p>
            </div>
          </div>

          <Input
            label="Full Name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            icon={User}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="target-role-select" className="text-xs font-medium text-slate-300">
              Target Career Role
            </label>
            <select
              id="target-role-select"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role} className="bg-slate-950">
                  {role}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500">This role shapes initial simulated interview questions.</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-[11px] text-slate-400">
            <Mail className="w-4 h-4 text-slate-650 shrink-0 mt-0.5" />
            <span>
              Your account email address is linked directly to local SQLite auth session credentials.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={saving}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};
export default Profile;
