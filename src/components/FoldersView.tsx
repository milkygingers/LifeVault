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
      // Handle file opening
      console.log('Opening file:', item.path);
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <div
          key={item.path}
          className="card p-4 hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => handleItemClick(item)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 group-hover:scale-110 transition-transform">
              {item.isDirectory ? (
                <FolderOpen className="text-vault-primary" size={32} />
              ) : (
                <FileText className="text-vault-text-secondary" size={32} />
              )}
            </div>
            <span className="text-sm font-medium text-vault-text truncate w-full">
              {item.name}
            </span>
            {item.isFile && (
              <span className="text-xs text-vault-text-secondary mt-1">
                {item.name.split('.').pop()?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.path}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
          onClick={() => handleItemClick(item)}
        >
          <div className="group-hover:scale-110 transition-transform">
            {item.isDirectory ? (
              <FolderOpen className="text-vault-primary" size={20} />
            ) : (
              <FileText className="text-vault-text-secondary" size={20} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-vault-text truncate">
              {item.name}
            </div>
            {item.isFile && (
              <div className="text-sm text-vault-text-secondary">
                {item.name.split('.').pop()?.toUpperCase()} file
              </div>
            )}
          </div>
          
          <button className="opacity-0 group-hover:opacity-100 btn-ghost p-1 transition-opacity">
            <MoreHorizontal size={16} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-vault-bg overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-vault-text mb-2">Folders</h1>
            {renderBreadcrumbs()}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid size={16} />
              </button>
            </div>
            
            <button className="btn-primary">
              <Plus size={16} className="mr-2" />
              New Folder
            </button>
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="mx-auto text-vault-text-secondary mb-4" size={48} />
            <h3 className="text-lg font-medium text-vault-text mb-2">Empty Folder</h3>
            <p className="text-vault-text-secondary">
              This folder is empty. Create some files or folders to get started.
            </p>
          </div>
        ) : (
          <div>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoldersView;
