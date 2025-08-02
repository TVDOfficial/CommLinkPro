import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  Radio, 
  Search, 
  Plus, 
  Activity, 
  BarChart3, 
  Settings,
  Bell,
  User,
  Shield
} from 'lucide-react';
import RadioRegistry from './components/RadioRegistry';
import SearchPage from './components/SearchPage';
import StatsPage from './components/StatsPage';
import LogsPage from './components/LogsPage';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('registry');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('registry');
    else if (path === '/search') setActiveTab('search');
    else if (path === '/stats') setActiveTab('stats');
    else if (path === '/logs') setActiveTab('logs');
  }, [location]);

  const navItems = [
    { 
      id: 'registry', 
      path: '/', 
      icon: Plus, 
      label: 'Register Equipment',
      description: 'Add new radio equipment',
      color: 'from-blue-600 to-blue-700' 
    },
    { 
      id: 'search', 
      path: '/search', 
      icon: Search, 
      label: 'Equipment Search',
      description: 'Find and manage radios',
      color: 'from-emerald-600 to-emerald-700' 
    },
    { 
      id: 'stats', 
      path: '/stats', 
      icon: BarChart3, 
      label: 'Analytics',
      description: 'Reports and insights',
      color: 'from-violet-600 to-violet-700' 
    },
    { 
      id: 'logs', 
      path: '/logs', 
      icon: Activity, 
      label: 'Activity Log',
      description: 'System audit trail',
      color: 'from-amber-600 to-amber-700' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#1e293b',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      
      {/* Enhanced Professional Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-4 border-blue-600 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          {/* Main Header Section */}
          <div className="flex items-center justify-between px-8 py-8">
            {/* Brand Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <Radio className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-4 border-slate-900 shadow-lg animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  CommLink<span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">Pro</span>
                </h1>
                <p className="text-slate-300 text-lg font-medium">
                  Enterprise Communication Management System
                </p>
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                  <span className="text-slate-500">•</span>
                  <span>Secure Connection</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3 rounded-xl border border-slate-600 shadow-lg">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-white text-sm font-semibold">Secure</div>
                    <div className="text-slate-400 text-xs">SSL Protected</div>
                  </div>
                </div>
                <button className="relative p-4 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-slate-900 shadow-lg"></span>
                </button>
                <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3 rounded-xl border border-slate-600 shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white text-sm font-semibold">Administrator</div>
                    <div className="text-slate-400 text-xs">Full Access</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Bar */}
          <div className="px-8 pb-6">
            <nav className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700 shadow-xl">
              <div className="flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl transform scale-105' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-102'
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="hidden md:block">
                        <div className="text-sm">{item.label}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* Animated Border */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<RadioRegistry />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;