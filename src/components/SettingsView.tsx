import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Shield, History, Save, Lock, Download, ChevronRight, Palette, X, Loader2, Globe } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../lib/i18n';
import { useToast } from './Toast';

interface SettingsViewProps {
  currentUser: { email: string; role: string; name: string };
  onUserUpdate: (updatedUser: { email: string; role: string; name: string }) => void;
}

export function SettingsView({ currentUser, onUserUpdate }: SettingsViewProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [nameVal, setNameVal] = useState(currentUser?.name || '');
  const [emailVal, setEmailVal] = useState(currentUser?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      setNameVal(currentUser.name);
      setEmailVal(currentUser.email);
    }
  }, [currentUser]);

  const [notifications, setNotifications] = useState({
    approvals: true,
    reviews: true,
    comments: true,
    email: false
  });

  type NotificationKey = keyof typeof notifications;

  const [auditLogs, setAuditLogs] = useState([
    { action: 'Sistem-ka la soo galay', user: currentUser?.name || 'Mohamed Abduqaadir', email: currentUser?.email || 'engmohamedyare7@gmail.com', details: 'User loaded settings panel', time: 'Jan 20, 2026 11:15 AM' },
    { action: 'Notification Setting Changed', user: currentUser?.name || 'Mohamed Abduqaadir', email: currentUser?.email || 'engmohamedyare7@gmail.com', details: 'email notifications new value: false', time: 'Jan 20, 2026 11:12 AM' },
    { action: 'Notification Setting Changed', user: currentUser?.name || 'Mohamed Abduqaadir', email: currentUser?.email || 'engmohamedyare7@gmail.com', details: 'documentApprovals new value: true', time: 'Jan 20, 2026 11:12 AM' },
  ]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Password fields
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const userEmail = currentUser?.email?.toLowerCase() || '';
    let currentPasswordInDb = 'admin'; // fallback default for preset accounts

    try {
      const localUsersRaw = localStorage.getItem('geomds_registered_users');
      const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
      const foundUser = localUsers.find((u: any) => u.email?.toLowerCase() === userEmail);
      if (foundUser) {
        currentPasswordInDb = foundUser.password;
      }
    } catch (err) {
      console.error('Error fetching password from db:', err);
    }

    if (oldPass !== currentPasswordInDb) {
      setPasswordError(t('language') === 'so' ? 'Password-kaagii hore waa khaldan yahay!' : 'Your old password is incorrect!');
      return;
    }

    if (newPass.length < 4) {
      setPasswordError(t('language') === 'so' ? 'Password-ka cusub waa inuu ka korreeyaa 4 xaraf' : 'New password must be at least 4 characters');
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordError(t('language') === 'so' ? 'Password-ka cusub iyo kan xaqiijinta isma waafaqsana!' : 'New passwords do not match!');
      return;
    }

    // Update password in localStorage db
    try {
      const localUsersRaw = localStorage.getItem('geomds_registered_users');
      let localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
      const existingIdx = localUsers.findIndex((u: any) => u.email?.toLowerCase() === userEmail);

      if (existingIdx !== -1) {
        localUsers[existingIdx].password = newPass;
      } else {
        // Preset user updating password
        localUsers.push({
          name: currentUser.name,
          email: currentUser.email.toLowerCase(),
          password: newPass,
          role: currentUser.role,
          active: true,
          status: 'Firfircoon',
          date: new Date().toLocaleDateString('en-GB')
        });
      }
      localStorage.setItem('geomds_registered_users', JSON.stringify(localUsers));
    } catch (err) {
      console.error('Error saving new password to localStorage db:', err);
    }

    showToast(
      t('language') === 'so' 
        ? 'Password-ka si guul leh ayaa loo beddelay!' 
        : 'Password updated successfully!', 
      'success'
    );
    
    setAuditLogs(prev => [
      {
        action: 'Password Changed',
        user: nameVal,
        email: emailVal,
        details: 'Password was updated successfully',
        time: 'Hadda, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setIsPasswordModalOpen(false);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameVal.trim();
    const trimmedEmail = emailVal.trim();

    if (!trimmedName || !trimmedEmail) {
      showToast(
        t('language') === 'so' ? 'Fadlan buuxi dhammaan meelaha banaan' : 'Please fill in all fields',
        'danger'
      );
      return;
    }

    setIsSaving(true);

    // Persist the updated user profile in the registered accounts so future logins with new email work perfectly
    try {
      const localUsersRaw = localStorage.getItem('geomds_registered_users');
      let localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
      
      const oldEmail = currentUser.email.toLowerCase();
      const existingIdx = localUsers.findIndex((u: any) => u.email.toLowerCase() === oldEmail);
      
      if (existingIdx !== -1) {
        // Update existing local record
        localUsers[existingIdx].name = trimmedName;
        localUsers[existingIdx].email = trimmedEmail.toLowerCase();
        if (localUsers[existingIdx].active === undefined) {
          localUsers[existingIdx].active = true;
          localUsers[existingIdx].status = 'Firfircoon';
        }
      } else {
        // Override or register the preset account with the new email
        localUsers.push({
          name: trimmedName,
          email: trimmedEmail.toLowerCase(),
          password: 'admin', // standard password for presets
          role: currentUser.role,
          active: true,
          status: 'Firfircoon',
          date: new Date().toLocaleDateString('en-GB')
        });
      }
      localStorage.setItem('geomds_registered_users', JSON.stringify(localUsers));
    } catch (err) {
      console.error('Error updating registered users list:', err);
    }

    // Instantly update the parent state
    onUserUpdate({
      ...currentUser,
      name: trimmedName,
      email: trimmedEmail,
    });

    setIsSaving(false);
    
    showToast(
      t('language') === 'so' 
        ? 'Si guul leh ayaa loo beddelay Gmail-ka iyo macluumaadka pro-faaylka!' 
        : 'Gmail and profiles saved successfully!',
      'success'
    );

    setAuditLogs(prev => [
      {
        action: 'Profile Updated',
        user: trimmedName,
        email: trimmedEmail,
        details: `Updated name to "${trimmedName}" and email to "${trimmedEmail}"`,
        time: 'Hadda, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);
  };

  const handleNotificationToggle = (key: NotificationKey) => {
    const newVal = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newVal }));

    showToast(
      t('language') === 'so'
        ? `Tusmada ogeysiisku waa isbedeshay: ${String(key)}`
        : `Notification preference updated for ${String(key)}`,
      'info'
    );

    setAuditLogs(prev => [
      {
        action: 'Preferences Changed',
        user: nameVal,
        email: emailVal,
        details: `${String(key)} notifications set to ${newVal}`,
        time: 'Hadda, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      const data = {
        user: nameVal,
        email: emailVal,
        role: currentUser?.role || 'Engineer',
        preferences: notifications,
        auditLogs: auditLogs,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `geomds_preferences_${new Date().getTime()}.json`;
      link.click();
      setIsExporting(false);
      showToast(
        t('language') === 'so' ? 'Macluumaadka si guul leh ayaa loo dhoofiyay!' : 'Data exported successfully!',
        'success'
      );

      setAuditLogs(prev => [
        {
          action: 'Data Exported',
          user: nameVal,
          email: emailVal,
          details: 'User downloaded system and security preferences JSON file',
          time: 'Hadda, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-[101]"
            >
              <form onSubmit={handlePasswordSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Badal Password-ka</h3>
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
                </div>
                
                {passwordError && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Password-kii Hore</label>
                    <input 
                      type="password" 
                      required 
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="admin"
                      className="w-full bg-sidebar/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Password-ka Cusub</label>
                    <input 
                      type="password" 
                      required 
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-sidebar/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Xaqiiji Password-ka</label>
                    <input 
                      type="password" 
                      required 
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-sidebar/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-all" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Badal Password-ka
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('settings')}</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and app preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <form onSubmit={handleSaveChanges} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border bg-sidebar-accent/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-white capitalize">{currentUser.name}</h3>
                <p className="text-xs text-primary font-bold uppercase tracking-wider">
                  {currentUser.role === 'Maamulaha' 
                    ? 'ADMIN' 
                    : (t('language') === 'so' ? 'INJINEER / AAN FIRFIRCOONEYN (KALIYA UPLOAD)' : 'ENGINEER / READ-ONLY (UPLOAD ONLY)')}
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    className="w-full bg-sidebar/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                    className="w-full bg-sidebar/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {isSaving ? (t('language') === 'so' ? 'Waa la kaydinayaa...' : 'Saving...') : (t('language') === 'so' ? 'Kaydi Isbeddellada' : 'Save Changes')}
                </button>
              </div>
            </div>
          </form>

          {/* Security Section */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-primary mb-6">
              <Shield className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Security</h3>
            </div>
            <div className="space-y-3">
              <button 
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-sidebar/30 border border-border hover:border-primary/30 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Badal Password-ka</p>
                    <p className="text-[10px] text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button 
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-sidebar/30 border border-border hover:border-primary/30 transition-all group text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center">
                    {isExporting ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Download className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Export Data</p>
                    <p className="text-[10px] text-muted-foreground">Download all your activity and data</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences */}
        <div className="space-y-6">
          {/* Appearance & Language Section */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-primary mb-6">
              <Palette className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">{t('darkMode')}</h3>
            </div>
            <div className="space-y-6">
              <div>
                 <p className="text-sm font-bold text-white mb-3">{t('darkMode')}</p>
                 <ThemeToggle />
              </div>
              <div className="pt-4 border-t border-border">
                 <div className="flex items-center gap-2 text-primary mb-4">
                    <Globe className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t('language')}</h3>
                 </div>
                 <p className="text-sm font-bold text-white mb-3">{t('language')}</p>
                 <LanguageToggle />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Habee nidaamkaaga si uu ugu habboonado dhadhankaaga iyo luqadda aad doorbideyso.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-primary mb-6">
              <Bell className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Notification Preferences</h3>
            </div>
            <div className="space-y-6">
              {[
                { id: 'approvals', label: 'Document approvals', desc: 'Get notified when documents are approved or rejected' },
                { id: 'reviews', label: 'Review requests', desc: 'Get notified when documents need your review' },
                { id: 'comments', label: 'Comments', desc: 'Get notified when someone comments on your documents' },
                { id: 'email', label: 'Email notifications', desc: 'Receive notifications via email' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleNotificationToggle(item.id as NotificationKey)}
                    className={`w-10 h-5 rounded-full transition-all relative ${notifications[item.id as NotificationKey] ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${notifications[item.id as NotificationKey] ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log (Full Width Bottom) */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center gap-2 text-primary">
              <History className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Audit Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-sidebar-accent/30">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {auditLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-sidebar-accent/10 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-white bg-sidebar-accent/50 px-2.5 py-1 rounded-md">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{log.user}</span>
                          <span className="text-[10px] text-muted-foreground">{log.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{log.details}</td>
                      <td className="px-6 py-4 text-[10px] text-muted-foreground font-medium uppercase">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
