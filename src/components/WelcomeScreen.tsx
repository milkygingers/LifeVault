import React from 'react';
import { FolderOpen, Star, Zap, Network, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  onWorkspaceSelected: (path: string) => Promise<boolean>;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onWorkspaceSelected }) => {
  const handleSelectFolder = async () => {
    try {
      // Web version - create a virtual workspace
      const workspaceName = prompt('Enter a name for your workspace:', 'My LifeVault') || 'My LifeVault';
      const demoPath = `LifeVault/${workspaceName}`;
      
      console.log('Creating web workspace:', demoPath);
      const success = await onWorkspaceSelected(demoPath);
      
      if (!success) {
        alert('Failed to create workspace. Please try again.');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Error creating workspace. Please try again.');
    }
  };

  const features = [
    {
      icon: Network,
      title: 'Mind Map View',
      description: 'Visualize connections between your notes and ideas in an interactive graph'
    },
    {
      icon: BookOpen,
      title: 'PARA Method',
      description: 'Organize with Projects, Areas, Resources, and Archive structure'
    },
    {
      icon: Star,
      title: 'Rich Editor',
      description: 'Markdown support with live preview and WYSIWYG editing'
    },
    {
      icon: Zap,
      title: 'Local-First',
      description: 'Your data stays on your device with real-time file system sync'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-pastel flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-vault-primary">LV</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-vault-text mb-6">
            Welcome to <span className="text-vault-primary">LifeVault</span>
          </h1>
          
          <p className="text-xl text-vault-text-secondary mb-8 max-w-2xl mx-auto">
            Your personal productivity workspace combining the best of Notion, Obsidian, and Ember.ly
          </p>

          <button
            onClick={handleSelectFolder}
            className="btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <FolderOpen className="inline mr-3" size={24} />
            Create Your Workspace
          </button>
          
          <p className="text-sm text-vault-text-secondary mt-4">
            Create a new workspace to organize your projects, areas, resources, and archive
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/90 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-vault-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="text-vault-primary" size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-vault-text mb-2">{feature.title}</h3>
                <p className="text-sm text-vault-text-secondary">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-vault-text-secondary">
            Built with ❤️ for productive minds
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
