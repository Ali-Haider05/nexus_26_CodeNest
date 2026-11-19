import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/auth/AuthScreen';
import DashboardLayout from './components/dashboard/DashboardLayout';

function MainApp() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2E9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#153F35] text-white flex items-center justify-center font-extrabold text-xl animate-bounce shadow-md">
            CC
          </div>
          <p className="text-xs font-bold text-[#153F35] tracking-wide">
            Loading CampusConnect...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return <DashboardLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
