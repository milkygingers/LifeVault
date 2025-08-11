import React from 'react';
import { Search, Plus, Moon, Sun } from 'lucide-react';

interface TopNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  theme,
  onThemeToggle
}) => {
  return (
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
                  onClick={() => onTabChange(tab.id)}
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-vault-primary focus:bg-white transition-colors w-64"
            />
          </div>

          {/* Quick Actions */}
          <button className="btn-ghost p-2" title="Create New">
            <Plus size={20} />
          </button>
          
          <button 
            onClick={onThemeToggle}
            className="btn-ghost p-2" 
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
