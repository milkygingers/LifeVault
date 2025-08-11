import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Network, 
  FolderTree, 
  FileText, 
  Files, 
  Settings, 
  Plus,
  Search,
  Moon,
  Sun
} from 'lucide-react';

import { useTheme } from './hooks/useTheme';
import { useWorkspace } from './hooks/useWorkspace';

import TopNavigation from './components/TopNavigation';
import Sidebar from './components/Sidebar';
import MindMapView from './components/MindMapView';
import FoldersView from './components/FoldersView';
import NotesView from './components/NotesView';
import FilesView from './components/FilesView';
import SettingsView from './components/SettingsView';
import WelcomeScreen from './components/WelcomeScreen';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { workspace, initializeWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('folders');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'mindmap', label: 'Mind Map', icon: Network },
    { id: 'folders', label: 'Folders', icon: FolderTree },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: Files },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!workspace) {
    return <WelcomeScreen onWorkspaceSelected={initializeWorkspace} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'mindmap':
        return <MindMapView workspace={workspace} />;
      case 'folders':
        return <FoldersView workspace={workspace} />;
      case 'notes':
        return <NotesView workspace={workspace} searchTerm={searchTerm} />;
      case 'files':
        return <FilesView workspace={workspace} />;
      case 'settings':
        return <SettingsView workspace={workspace} />;
      default:
        return <FoldersView workspace={workspace} />;
    }
  };

  return (
    <div className="flex h-screen bg-vault-bg">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-vault-surface border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Tabs */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-vault-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                LV
              </div>
              <span className="font-semibold text-lg">LifeVault</span>
            </div>
            
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`toolbar-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vault-text-secondary" size={16} />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-vault-primary focus:bg-white transition-colors w-64"
              />
            </div>

            {/* Quick Actions */}
            <button className="btn-ghost p-2" title="Create New">
              <Plus size={20} />
            </button>
            
            <button 
              onClick={toggleTheme}
              className="btn-ghost p-2" 
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-vault-surface border-r">
            <Sidebar 
              workspace={workspace} 
              activeTab={activeTab}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* Main Panel */}
        <div className="flex-1 overflow-hidden">
          {renderActiveView()}
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-[72px] z-40 bg-vault-primary text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 ${
          sidebarOpen ? 'left-[320px]' : 'left-4'
        }`}
        title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
      >
        <FolderTree size={18} />
      </button>
    </div>
  );
};

export default App;
