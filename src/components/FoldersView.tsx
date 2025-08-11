import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Folder, 
  FileText, 
  Plus, 
  MoreHorizontal,
  Search,
  Grid,
  List
} from 'lucide-react';
import { WorkspaceConfig } from '../hooks/useWorkspace';

interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size?: number;
  modified?: Date;
}

interface FoldersViewProps {
  workspace: WorkspaceConfig;
}

const FoldersView: React.FC<FoldersViewProps> = ({ workspace }) => {
  const [currentPath, setCurrentPath] = useState(workspace.path);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadDirectory(currentPath);
    updateBreadcrumbs(currentPath);
  }, [currentPath, workspace.path]);

  const loadDirectory = async (path: string) => {
    try {
      const directoryItems = await window.electronAPI?.listDirectory(path);
      if (directoryItems) {
        const filteredItems = directoryItems
          .filter(item => !item.name.startsWith('.')) // Hide hidden files
          .sort((a, b) => {
            // Sort directories first, then files
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
          });
        
        setItems(filteredItems);
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
      setItems([]);
    }
  };

  const updateBreadcrumbs = (path: string) => {
    const relativePath = path.replace(workspace.path, '');
    const parts = relativePath.split('/').filter(part => part.length > 0);
    setBreadcrumbs(['Home', ...parts]);
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === 0) {
      setCurrentPath(workspace.path);
    } else {
      const parts = breadcrumbs.slice(1, index);
      const newPath = workspace.path + '/' + parts.join('/');
      setCurrentPath(newPath);
    }
  };

  const handleItemClick = (item: FileSystemItem) => {
    if (item.isDirectory) {
      navigateToPath(item.path);
    } else {
      // Handle file opening - open in appropriate app or view
      console.log('Opening file:', item.path);
      // For markdown files, you might want to open them in notes view
      if (item.name.endsWith('.md')) {
        // Could dispatch to notes view here
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folderPath = `${currentPath}/${newFolderName.trim()}`;
      // In a real implementation, you'd create the folder through the electron API
      console.log('Creating folder:', folderPath);
      
      // Simulate folder creation
      const newFolder: FileSystemItem = {
        name: newFolderName.trim(),
        path: folderPath,
        isDirectory: true,
        isFile: false
      };
      
      setItems(prev => [newFolder, ...prev].sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      }));
      
      setNewFolderName('');
      setShowNewFolderDialog(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm text-vault-text-secondary mb-6">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          <button
            onClick={() => navigateToBreadcrumb(index)}
            className="hover:text-vault-text transition-colors"
          >
            {crumb}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {items.map((item) => (
        <div
          key={item.path}
          className="card card-interactive p-6 group animate-fade-in"
          onClick={() => handleItemClick(item)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
              {item.isDirectory ? (
                <FolderOpen className="text-vault-primary drop-shadow-sm" size={40} />
              ) : (
                <FileText className="text-vault-text-secondary" size={40} />
              )}
            </div>
            <span className="text-sm font-semibold text-vault-text truncate w-full">
              {item.name}
            </span>
            {item.isFile && (
              <span className="text-xs text-vault-text-secondary mt-2 px-2 py-1 bg-gray-100 rounded-full">
                {item.name.split('.').pop()?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.path}
          className="file-item animate-fade-in group"
          onClick={() => handleItemClick(item)}
        >
          <div className="group-hover:scale-110 transition-transform duration-300">
            {item.isDirectory ? (
              <FolderOpen className="text-vault-primary drop-shadow-sm" size={24} />
            ) : (
              <FileText className="text-vault-text-secondary" size={24} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-vault-text truncate">
              {item.name}
            </div>
            {item.isFile && (
              <div className="text-sm text-vault-text-secondary flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                  {item.name.split('.').pop()?.toUpperCase()}
                </span>
                <span>•</span>
                <span>Modified recently</span>
              </div>
            )}
            {item.isDirectory && (
              <div className="text-sm text-vault-text-secondary">
                Folder
              </div>
            )}
          </div>
          
          <button className="opacity-0 group-hover:opacity-100 btn-ghost p-2 transition-opacity">
            <MoreHorizontal size={18} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-vault-bg overflow-y-auto scrollbar-thin">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-3">Folders</h1>
            {renderBreadcrumbs()}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="view-toggle-group">
              <button
                onClick={() => setViewMode('list')}
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowNewFolderDialog(true)}
              className="btn-primary"
            >
              <Plus size={18} />
              New Folder
            </button>
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="empty-state">
            <Folder className="empty-state-icon" size={64} />
            <h3 className="empty-state-title">Empty Folder</h3>
            <p className="empty-state-subtitle">
              This folder is empty. Create some files or folders to get started.
            </p>
            <button 
              onClick={() => setShowNewFolderDialog(true)}
              className="btn-primary mt-6"
            >
              <Plus size={18} />
              Create Your First Folder
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl animate-slide-up">
            <h3 className="text-xl font-semibold text-vault-text mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="input-primary mb-6"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="btn-primary flex-1"
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoldersView;
