import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Search
} from 'lucide-react';
import { WorkspaceConfig } from '../hooks/useWorkspace';

interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  children?: FileSystemItem[];
}

interface SidebarProps {
  workspace: WorkspaceConfig;
  activeTab: string;
  searchTerm: string;
}

const Sidebar: React.FC<SidebarProps> = ({ workspace, activeTab, searchTerm }) => {
  const [folderStructure, setFolderStructure] = useState<FileSystemItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  useEffect(() => {
    loadFolderStructure();
  }, [workspace]);

  const loadFolderStructure = async () => {
    try {
      const items = await window.electronAPI?.listDirectory(workspace.path);
      if (items) {
        const processItems = async (items: any[], basePath: string): Promise<FileSystemItem[]> => {
          const result: FileSystemItem[] = [];
          
          for (const item of items) {
            if (item.name.startsWith('.')) continue; // Skip hidden files
            
            const fileItem: FileSystemItem = {
              name: item.name,
              path: item.path,
              isDirectory: item.isDirectory,
              isFile: item.isFile
            };

            if (item.isDirectory) {
              // Load children for directories
              try {
                const children = await window.electronAPI?.listDirectory(item.path);
                if (children) {
                  fileItem.children = await processItems(children, item.path);
                }
              } catch (error) {
                console.warn(`Failed to load children for ${item.path}:`, error);
                fileItem.children = [];
              }
            }

            result.push(fileItem);
          }
          
          return result.sort((a, b) => {
            // Sort directories first, then files
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
          });
        };

        const structure = await processItems(items, workspace.path);
        setFolderStructure(structure);
      }
    } catch (error) {
      console.error('Failed to load folder structure:', error);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileSystemItem = (item: FileSystemItem, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const paddingLeft = level * 16 + 8;

    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      // If searching and this item doesn't match, check if any children match
      if (item.isDirectory && item.children) {
        const hasMatchingChildren = item.children.some(child => 
          child.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!hasMatchingChildren) return null;
      } else {
        return null;
      }
    }

    return (
      <div key={item.path}>
        <div
          className={`sidebar-item ${level === 0 ? 'font-medium' : ''}`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => item.isDirectory ? toggleFolder(item.path) : handleFileClick(item.path)}
        >
          {item.isDirectory ? (
            <>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
              <span>{item.name}</span>
            </>
          ) : (
            <>
              <div className="w-4" /> {/* Spacer for alignment */}
              <FileText size={16} />
              <span className="truncate">{item.name}</span>
            </>
          )}
        </div>
        
        {item.isDirectory && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderFileSystemItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleFileClick = (filePath: string) => {
    // Handle file opening logic here
    console.log('Opening file:', filePath);
    
    // Add to recent files
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f !== filePath);
      return [filePath, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'folders':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-vault-text">Folders</h3>
              <button className="btn-ghost p-1" title="New Folder">
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-1">
              {folderStructure.map(item => renderFileSystemItem(item))}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-vault-text">Recent Notes</h3>
              <button className="btn-ghost p-1" title="New Note">
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              {recentFiles.filter(f => f.endsWith('.md')).map(file => (
                <div
                  key={file}
                  className="sidebar-item"
                  onClick={() => handleFileClick(file)}
                >
                  <FileText size={16} />
                  <span className="truncate">{file.split('/').pop()?.replace('.md', '')}</span>
                </div>
              ))}
              
              {recentFiles.filter(f => f.endsWith('.md')).length === 0 && (
                <p className="text-vault-text-secondary text-sm">No recent notes</p>
              )}
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-vault-text">Recent Files</h3>
            </div>
            
            <div className="space-y-2">
              {recentFiles.filter(f => !f.endsWith('.md')).map(file => (
                <div
                  key={file}
                  className="sidebar-item"
                  onClick={() => handleFileClick(file)}
                >
                  <FileText size={16} />
                  <span className="truncate">{file.split('/').pop()}</span>
                </div>
              ))}
              
              {recentFiles.filter(f => !f.endsWith('.md')).length === 0 && (
                <p className="text-vault-text-secondary text-sm">No recent files</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-vault-text mb-2">Quick Links</h3>
                <div className="space-y-1">
                  <div className="sidebar-item">
                    <FolderOpen size={16} />
                    <span>Projects</span>
                  </div>
                  <div className="sidebar-item">
                    <FolderOpen size={16} />
                    <span>Areas</span>
                  </div>
                  <div className="sidebar-item">
                    <FolderOpen size={16} />
                    <span>Resources</span>
                  </div>
                  <div className="sidebar-item">
                    <FolderOpen size={16} />
                    <span>Archive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-vault-surface border-r overflow-y-auto scrollbar-thin">
      {renderSidebarContent()}
    </div>
  );
};

export default Sidebar;
