import React, { useState } from 'react';
import { 
  Palette, 
  Folder, 
  Download, 
  Upload, 
  Monitor, 
  Moon, 
  Sun,
  Type,
  Image,
  Calendar,
  Database,
  Info,
  Save
} from 'lucide-react';
import { WorkspaceConfig } from '../hooks/useWorkspace';

interface SettingsViewProps {
  workspace: WorkspaceConfig;
}

const SettingsView: React.FC<SettingsViewProps> = ({ workspace }) => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [settings, setSettings] = useState({
    theme: 'light',
    font: 'Inter',
    fontSize: 14,
    backgroundImage: '',
    accentColor: '#6366f1',
    workspacePath: workspace.path,
    autoSave: true,
    showPreview: true,
    enableCalendar: false,
    calendarProvider: 'google'
  });

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'workspace', label: 'Workspace', icon: Folder },
    { id: 'integrations', label: 'Integrations', icon: Calendar },
    { id: 'import-export', label: 'Import/Export', icon: Database },
    { id: 'about', label: 'About', icon: Info }
  ];

  const fonts = [
    'Inter',
    'SF Pro',
    'Roboto',
    'Open Sans',
    'Merriweather',
    'Source Code Pro'
  ];

  const accentColors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4'  // Sky
  ];

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          backgroundImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectNewWorkspace = async () => {
    try {
      const folderPath = await window.electronAPI?.selectFolder();
      if (folderPath) {
        setSettings(prev => ({
          ...prev,
          workspacePath: folderPath
        }));
      }
    } catch (error) {
      console.error('Failed to select workspace:', error);
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or electron store
    localStorage.setItem('lifevault-settings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'auto', label: 'Auto', icon: Monitor }
          ].map(theme => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.id}
                onClick={() => setSettings(prev => ({ ...prev, theme: theme.id }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  settings.theme === theme.id
                    ? 'border-vault-primary bg-vault-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="mx-auto mb-2" size={24} />
                <div className="text-sm font-medium">{theme.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Font</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">Font Family</label>
            <select
              value={settings.font}
              onChange={(e) => setSettings(prev => ({ ...prev, font: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-vault-primary"
            >
              {fonts.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">Font Size</label>
            <input
              type="range"
              min="12"
              max="20"
              value={settings.fontSize}
              onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-sm text-vault-text-secondary mt-1">{settings.fontSize}px</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Accent Color</h3>
        <div className="grid grid-cols-8 gap-2">
          {accentColors.map(color => (
            <button
              key={color}
              onClick={() => setSettings(prev => ({ ...prev, accentColor: color }))}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                settings.accentColor === color
                  ? 'border-gray-400 scale-110'
                  : 'border-gray-200 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Background</h3>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="hidden"
            id="background-upload"
          />
          <label
            htmlFor="background-upload"
            className="btn-secondary cursor-pointer inline-flex items-center"
          >
            <Image size={16} className="mr-2" />
            Upload Background Image
          </label>
          {settings.backgroundImage && (
            <div className="flex items-center gap-3">
              <img
                src={settings.backgroundImage}
                alt="Background preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <button
                onClick={() => setSettings(prev => ({ ...prev, backgroundImage: '' }))}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWorkspaceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Workspace Location</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-100 rounded-lg">
            <div className="text-sm font-medium text-vault-text">Current Workspace</div>
            <div className="text-sm text-vault-text-secondary">{settings.workspacePath}</div>
          </div>
          <button
            onClick={handleSelectNewWorkspace}
            className="btn-secondary"
          >
            <Folder size={16} className="mr-2" />
            Change Workspace Location
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Editor Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
              className="rounded"
            />
            <span className="text-vault-text">Auto-save notes</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.showPreview}
              onChange={(e) => setSettings(prev => ({ ...prev, showPreview: e.target.checked }))}
              className="rounded"
            />
            <span className="text-vault-text">Show markdown preview by default</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Calendar Integration</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableCalendar}
              onChange={(e) => setSettings(prev => ({ ...prev, enableCalendar: e.target.checked }))}
              className="rounded"
            />
            <span className="text-vault-text">Enable calendar integration</span>
          </label>
          
          {settings.enableCalendar && (
            <div>
              <label className="block text-sm font-medium text-vault-text mb-2">Calendar Provider</label>
              <select
                value={settings.calendarProvider}
                onChange={(e) => setSettings(prev => ({ ...prev, calendarProvider: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-vault-primary"
              >
                <option value="google">Google Calendar</option>
                <option value="apple">Apple Calendar</option>
                <option value="outlook">Outlook Calendar</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderImportExportSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Import Data</h3>
        <div className="space-y-3">
          <button className="btn-secondary w-full">
            <Upload size={16} className="mr-2" />
            Import from Notion
          </button>
          <button className="btn-secondary w-full">
            <Upload size={16} className="mr-2" />
            Import from Obsidian
          </button>
          <button className="btn-secondary w-full">
            <Upload size={16} className="mr-2" />
            Import Markdown Files
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-vault-text mb-4">Export Data</h3>
        <div className="space-y-3">
          <button className="btn-secondary w-full">
            <Download size={16} className="mr-2" />
            Export as ZIP Archive
          </button>
          <button className="btn-secondary w-full">
            <Download size={16} className="mr-2" />
            Export to Markdown
          </button>
          <button className="btn-secondary w-full">
            <Download size={16} className="mr-2" />
            Export Mind Map as SVG
          </button>
        </div>
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-vault-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">LV</span>
        </div>
        <h3 className="text-2xl font-semibold text-vault-text mb-2">LifeVault</h3>
        <p className="text-vault-text-secondary mb-4">Version 1.0.0</p>
        <p className="text-vault-text-secondary max-w-md mx-auto">
          Your personal productivity workspace combining the best of Notion, Obsidian, and Ember.ly
        </p>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-vault-text mb-3">Features</h4>
        <ul className="space-y-2 text-sm text-vault-text-secondary">
          <li>• PARA Method organization structure</li>
          <li>• Interactive mind mapping</li>
          <li>• Markdown editor with live preview</li>
          <li>• Local-first data storage</li>
          <li>• Real-time file system sync</li>
          <li>• Customizable themes and backgrounds</li>
          <li>• Calendar integration</li>
          <li>• Import/Export capabilities</li>
        </ul>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-vault-text mb-3">Support</h4>
        <div className="space-y-2 text-sm">
          <a href="#" className="text-vault-primary hover:underline block">
            Documentation
          </a>
          <a href="#" className="text-vault-primary hover:underline block">
            Report a Bug
          </a>
          <a href="#" className="text-vault-primary hover:underline block">
            Feature Requests
          </a>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSettings();
      case 'workspace':
        return renderWorkspaceSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      case 'import-export':
        return renderImportExportSettings();
      case 'about':
        return renderAboutSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <div className="h-full bg-vault-bg flex">
      {/* Settings Sidebar */}
      <div className="w-64 bg-vault-surface border-r">
        <div className="p-4">
          <h2 className="font-semibold text-vault-text mb-4">Settings</h2>
          <nav className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`sidebar-item w-full ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                >
                  <Icon size={16} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-vault-text">
                {sections.find(s => s.id === activeSection)?.label}
              </h1>
              
              <button
                onClick={handleSaveSettings}
                className="btn-primary"
              >
                <Save size={16} className="mr-2" />
                Save Settings
              </button>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
