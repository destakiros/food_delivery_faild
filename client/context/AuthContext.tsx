
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStatus, Notification as AppNotification, UserPreferences } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, phone: string, pass: string) => void;
  addUser: (user: Omit<User, 'id' | 'status' | 'notifications' | 'preferences'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  logout: () => void;
  suspendUser: (id: string, until: string, reason: string) => void;
  liftSuspension: (id: string) => void;
  addNotification: (userId: string, message: string) => void;
  markNotificationsRead: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('innout_users');
    const admin: User = { 
      id: 'admin', 
      name: 'System Admin', 
      email: 'admin@gmail.com', 
      phone: '000-000-0000', 
      role: 'admin', 
      password: 'admin123',
      status: 'Active',
      notifications: [],
      preferences: { ...defaultPreferences }
    };
    return saved ? JSON.parse(saved) : [admin];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('innout_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('innout_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('innout_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, phone: string, pass: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name, email, phone, password: pass, role: 'customer',
      status: 'Active',
      notifications: [],
      preferences: { ...defaultPreferences }
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const addUser = (user: Omit<User, 'id' | 'status' | 'notifications' | 'preferences'>) => {
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Active',
      notifications: [],
      preferences: { ...defaultPreferences }
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const suspendUser = (id: string, until: string, reason: string) => {
    const message = `Action Taken: Account suspended until ${until}. Reason: ${reason}`;
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const notif: AppNotification = { id: Date.now().toString(), message, timestamp: new Date().toLocaleString(), read: false };
        return { ...u, status: 'Suspended', suspensionEnd: until, notifications: [notif, ...u.notifications] };
      }
      return u;
    }));
  };

  const liftSuspension = (id: string) => {
    const message = `Good news! Your suspension has been lifted. Welcome back.`;
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const notif: AppNotification = { id: Date.now().toString(), message, timestamp: new Date().toLocaleString(), read: false };
        return { ...u, status: 'Active', suspensionEnd: undefined, notifications: [notif, ...u.notifications] };
      }
      return u;
    }));
  };

  const addNotification = (userId: string, message: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const notif: AppNotification = { id: Date.now().toString(), message, timestamp: new Date().toLocaleString(), read: false };
        return { ...u, notifications: [notif, ...u.notifications] };
      }
      return u;
    }));
    if (currentUser?.id === userId) {
       const notif: AppNotification = { id: Date.now().toString(), message, timestamp: new Date().toLocaleString(), read: false };
       setCurrentUser(prev => prev ? { ...prev, notifications: [notif, ...prev.notifications] } : null);
    }
  };

  const markNotificationsRead = () => {
    if (!currentUser) return;
    const updatedNotifs = currentUser.notifications.map(n => ({ ...n, read: true }));
    setCurrentUser({ ...currentUser, notifications: updatedNotifs });
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, notifications: updatedNotifs } : u));
  };

  const deleteUser = (id: string) => {
    if (id === 'admin') return; 
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      logout();
    }
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ 
      currentUser, users, login, register, addUser, updateUser, 
      deleteUser, logout, suspendUser, liftSuspension, addNotification, markNotificationsRead 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
