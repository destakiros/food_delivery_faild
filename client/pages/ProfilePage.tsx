import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { currentUser, updateUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    password: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState(currentUser?.preferences || {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false
  });

  if (!currentUser) return null;

  const validatePassword = (pass: string) => {
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const isLongEnough = pass.length >= 8;
    return hasUpper && hasLower && hasNumber && isLongEnough;
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    // Auto-save preference changes
    updateUser(currentUser.id, { preferences: newPrefs });
    // Fix: cast 'key' to String to ensure '.replace()' is available on the union type 'string | number | symbol'
    showToast(`${String(key).replace('Enabled', '').toUpperCase()} alert protocol updated`, "info");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password) {
      if (!validatePassword(formData.password)) {
        showToast("🛑 Security Breach: Password must be 8+ chars with Upper, Lower & Number", "error");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showToast("Security keys do not match", "error");
        return;
      }
    }
    
    const updates: any = { 
      name: formData.name, 
      phone: formData.phone,
      preferences: preferences
    };
    if (formData.password) updates.password = formData.password;
    
    updateUser(currentUser.id, updates);
    showToast("Profile identity updated successfully", "success");
    setFormData({ ...formData, password: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
      <div className="flex items-center gap-8 mb-16">
        <button onClick={onBack} className="w-14 h-14 bg-gray-100 dark:bg-zinc-800 rounded-[22px] flex items-center justify-center hover:bg-ino-red hover:text-white transition duration-500">
          <i className="ph-bold ph-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">IDENTITY <span className="text-ino-red">PROFILE</span></h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic">Authentication Node Alpha-01</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[60px] border dark:border-zinc-800 shadow-2xl p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ino-red/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
          {/* Section 1: Basic Identity */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-black uppercase text-ino-red tracking-[0.3em] italic border-b dark:border-zinc-800 pb-4">Core Identity Manifest</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Operational Name</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-0 px-8 py-5 rounded-[22px] font-black uppercase text-xs focus:ring-2 focus:ring-ino-red text-black dark:text-white caret-ino-red outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Relay Number</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-0 px-8 py-5 rounded-[22px] font-black text-xs focus:ring-2 focus:ring-ino-red text-black dark:text-white caret-ino-red outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3 opacity-50">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic">Security Clearance (Email - Immutable)</label>
              <div className="w-full bg-gray-100 dark:bg-zinc-950 px-8 py-5 rounded-[22px] font-black text-xs text-gray-400 tracking-widest">{currentUser.email}</div>
            </div>
          </div>

          {/* Section 2: Notification Control Center */}
          <div className="space-y-10 border-t dark:border-zinc-800 pt-10">
             <div className="flex justify-between items-center border-b dark:border-zinc-800 pb-4">
                <h3 className="text-[10px] font-black uppercase text-ino-red tracking-[0.3em] italic">Notification Control Center</h3>
                <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full tracking-widest">Active Link</span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { key: 'pushEnabled', label: 'Push Directives', desc: 'Real-time order status relays' },
                  { key: 'emailEnabled', label: 'Intelligence Reports', desc: 'Detailed manifest receipts via email' },
                  { key: 'smsEnabled', label: 'Priority SMS Relay', desc: 'Emergency dispatch notifications' },
                ].map((pref) => (
                  <div key={pref.key} className="bg-gray-50 dark:bg-zinc-800/30 p-8 rounded-[32px] border dark:border-zinc-700/50 flex items-center justify-between group hover:border-ino-red/30 transition-all">
                    <div>
                      <h4 className="text-xs font-black uppercase italic dark:text-white mb-1">{pref.label}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{pref.desc}</p>
                    </div>
                    <label className="ui-switch">
                      <input 
                        type="checkbox" 
                        checked={preferences[pref.key as keyof typeof preferences]} 
                        onChange={() => handlePreferenceToggle(pref.key as keyof typeof preferences)} 
                      />
                      <div className="slider"><div className="circle"></div></div>
                    </label>
                  </div>
                ))}
             </div>
          </div>

          {/* Section 3: Security Protocol Update */}
          <div className="space-y-10 border-t dark:border-zinc-800 pt-10">
            <h3 className="text-[10px] font-black uppercase text-ino-red tracking-[0.3em] italic border-b dark:border-zinc-800 pb-4">Security Protocol Update</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Update Pass-Key</label>
                <input 
                  type="password"
                  placeholder="8+ CHARS, UPPER, LOWER, NUMBER"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-0 px-8 py-5 rounded-[22px] font-black text-xs focus:ring-2 focus:ring-ino-red text-black dark:text-white caret-ino-red outline-none placeholder:text-gray-300"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Confirm Pass-Key</label>
                <input 
                  type="password"
                  placeholder="VERIFY NEW KEY"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-0 px-8 py-5 rounded-[22px] font-black text-xs focus:ring-2 focus:ring-ino-red text-black dark:text-white caret-ino-red outline-none placeholder:text-gray-300"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-10">
            <button type="submit" className="bg-ino-red text-white px-16 py-6 rounded-[32px] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-red-500/20 hover:bg-red-700 transition transform hover:-translate-y-1 active:scale-95">Commit Identity Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};