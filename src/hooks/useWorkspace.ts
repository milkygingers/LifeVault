import { useState, useEffect } from 'react';

export interface WorkspaceConfig {
  path: string;
  name: string;
  initialized: boolean;
}

export const useWorkspace = () => {
  const [workspace, setWorkspace] = useState<WorkspaceConfig | null>(() => {
    // Get saved workspace from localStorage
    const saved = localStorage.getItem('lifevault-workspace');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Save workspace to localStorage whenever it changes
    if (workspace) {
      localStorage.setItem('lifevault-workspace', JSON.stringify(workspace));
    }
  }, [workspace]);

  const initializeWorkspace = async (folderPath: string) => {
    try {
      // For web version, create a virtual workspace
      const workspaceConfig: WorkspaceConfig = {
        path: folderPath,
        name: folderPath.split('/').pop() || 'LifeVault',
        initialized: true
      };
      
      setWorkspace(workspaceConfig);
      
      // Initialize demo data for web version
      initializeDemoData();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
      return false;
    }
  };

  const initializeDemoData = () => {
    // Create demo notes in localStorage
    const demoNotes = [
      {
        path: 'Welcome to LifeVault.md',
        content: `# Welcome to LifeVault! 🎉

This is your personal productivity workspace combining the best of:
- **Notion** - Create pages and databases
- **Obsidian** - Powerful folder structure and linking  
- **Ember.ly** - Visual mind mapping

## Your PARA Structure

- **Projects** - Things with deadlines and specific outcomes
- **Areas** - Ongoing responsibilities to maintain
- **Resources** - Topics of ongoing interest
- **Archive** - Inactive items from the other categories

## Getting Started

1. Use the **Folders** tab to navigate your structure
2. Create notes in the **Notes** tab
3. Visualize connections in the **Mind Map** tab
4. Manage files in the **Files** tab
5. Customize everything in **Settings**

Happy organizing! ✨`,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      {
        path: 'Projects/My First Project.md',
        content: `# My First Project

This is an example project note. You can:

- Create tasks and todo lists
- Add deadlines and milestones
- Link to other notes
- Track progress

## Tasks
- [ ] Define project scope
- [ ] Create timeline
- [ ] Assign resources
- [x] Create this note!

## Notes
Add your project thoughts here...`,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    ];

    localStorage.setItem('lifevault-notes', JSON.stringify(demoNotes));
    localStorage.setItem('lifevault-files', JSON.stringify([]));
  };

  const selectWorkspace = async () => {
    try {
      const folderPath = await window.electronAPI?.selectFolder();
      if (folderPath) {
        return await initializeWorkspace(folderPath);
      }
      return false;
    } catch (error) {
      console.error('Failed to select workspace:', error);
      return false;
    }
  };

  const clearWorkspace = () => {
    setWorkspace(null);
    localStorage.removeItem('lifevault-workspace');
  };

  return {
    workspace,
    initializeWorkspace,
    selectWorkspace,
    clearWorkspace
  };
};

// Extend Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      selectFolder: () => Promise<string | null>;
      initializePARA: (basePath: string) => Promise<boolean>;
      readFile: (filePath: string) => Promise<string>;
      writeFile: (filePath: string, content: string) => Promise<boolean>;
      listDirectory: (dirPath: string) => Promise<Array<{
        name: string;
        path: string;
        isDirectory: boolean;
        isFile: boolean;
      }>>;
    };
  }
}
