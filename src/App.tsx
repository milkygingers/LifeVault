import React, { useState, useEffect } from 'react';
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
  const [showCreateMenu, setShowCreateMenu] = useState(false);

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

  // Handle create new item
  const handleCreateNew = (type: string) => {
    setShowCreateMenu(false);
    
    switch (type) {
      case 'note':
        setActiveTab('notes');
        // Trigger note creation in NotesView
        break;
      case 'folder':
        setActiveTab('folders');
        // Trigger folder creation in FoldersView
        break;
      case 'file':
        setActiveTab('files');
        // Trigger file upload in FilesView
        break;
      default:
        break;
    }
  };

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
    <div className="flex h-screen bg-vault-bg animate-fade-in">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-effect border-b backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Tabs */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-vault-primary to-vault-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                LV
              </div>
              <span className="font-bold text-xl gradient-text">LifeVault</span>
            </div>
            
            <nav className="flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`toolbar-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-vault-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search w-80"
              />
            </div>

            {/* Quick Actions */}
            <div className="relative">
              <button 
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="btn-icon" 
                title="Create New"
              >
                <Plus size={20} />
              </button>
              
              {/* Create Menu Dropdown */}
              {showCreateMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-up">
                  <button
                    onClick={() => handleCreateNew('note')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <FileText size={16} />
                    New Note
                  </button>
                  <button
                    onClick={() => handleCreateNew('folder')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <FolderTree size={16} />
                    New Folder
                  </button>
                  <button
                    onClick={() => handleCreateNew('file')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Files size={16} />
                    Upload File
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={toggleTheme}
              className="btn-icon" 
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-r border-gray-200 shadow-sm animate-slide-up">
            <Sidebar 
              workspace={workspace} 
              activeTab={activeTab}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* Main Panel */}
        <div className="flex-1 overflow-hidden bg-gray-50/50">
          <div className="h-full">
            {renderActiveView()}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-24 z-40 bg-gradient-to-r from-vault-primary to-vault-secondary text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce-gentle ${
          sidebarOpen ? 'left-[320px]' : 'left-6'
        }`}
        title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
      >
        <FolderTree size={20} />
      </button>

      {/* Click outside to close create menu */}
      {showCreateMenu && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowCreateMenu(false)}
        />
      )}
    </div>
  );
};

export default App;
