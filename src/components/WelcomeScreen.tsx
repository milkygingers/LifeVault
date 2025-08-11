import React from 'react';
import { FolderOpen, Star, Zap, Network, BookOpen } from 'lucide-react';
import Logo from './Logo';

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
      title: '🧠 Mind Map View',
      description: 'Visualize connections between your notes and ideas in an interactive graph'
    },
    {
      icon: BookOpen,
      title: '📊 PARA Method',
      description: 'Professional organization with Projects, Areas, Resources, and Archive'
    },
    {
      icon: Star,
      title: '✨ Rich Editor',
      description: 'Beautiful markdown editor with live preview and instant sync'
    },
    {
      icon: Zap,
      title: '🔒 Privacy First',
      description: 'Your data stays private in your browser - no servers, no tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8 animate-fade-in">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10 animate-bounce-gentle">
            <Logo size={120} showText={false} animated={true} />
          </div>
          
          <h1 className="text-6xl font-bold text-vault-text mb-8 leading-tight">
            Welcome to <span className="gradient-text">LifeVault</span> ✨
          </h1>
          
          <p className="text-2xl text-vault-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            Your beautiful, personal productivity workspace that combines the best of 
            <span className="font-semibold text-vault-primary"> Notion</span>, 
            <span className="font-semibold text-vault-secondary"> Obsidian</span>, and 
            <span className="font-semibold text-vault-accent"> Ember.ly</span> 🚀
          </p>

          <button
            onClick={handleSelectFolder}
            className="btn-primary text-xl px-12 py-6 text-white font-bold shadow-2xl hover:shadow-vault-primary/25 animate-bounce-gentle"
          >
            <FolderOpen className="inline mr-4" size={28} />
            🚀 Start Your Journey
          </button>
          
          <p className="text-lg text-vault-text-secondary mt-6 font-medium">
            Create your personal productivity workspace in seconds ⚡
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card p-8 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-vault-primary/10 to-vault-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-vault-primary group-hover:text-vault-secondary transition-colors duration-300" size={32} />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-vault-text mb-4">{feature.title}</h3>
                <p className="text-vault-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-xl text-vault-text-secondary mb-3 font-medium">
              Built with ❤️ for productive minds
            </p>
            <p className="text-vault-text-secondary">
              Created by <span className="font-semibold text-vault-primary">Alyssa</span> • 
              <span className="font-semibold text-vault-secondary"> Open Source</span> • 
              Made with <span className="font-semibold text-vault-accent">React & TypeScript</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
