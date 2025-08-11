import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Grid, 
  List, 
  Search, 
  Filter,
  MoreHorizontal,
  File,
  Image,
  FileText,
  Video,
  Archive,
  Download
} from 'lucide-react';
import { WorkspaceConfig } from '../hooks/useWorkspace';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: string;
  modified: Date;
  isImage: boolean;
  isVideo: boolean;
  isDocument: boolean;
}

interface FilesViewProps {
  workspace: WorkspaceConfig;
}

const FilesView: React.FC<FilesViewProps> = ({ workspace }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'videos' | 'other'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFiles();
  }, [workspace]);

  const loadFiles = async () => {
    try {
      const filesDir = `${workspace.path}/Files`;
      const items = await window.electronAPI?.listDirectory(filesDir);
      
      if (items) {
        const fileItems = items
          .filter(item => item.isFile)
          .map(item => {
            const extension = item.name.split('.').pop()?.toLowerCase() || '';
            
            return {
              name: item.name,
              path: item.path,
              size: 0, // Would need file stats from electron
              type: extension,
              modified: new Date(), // Would need file stats
              isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension),
              isVideo: ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension),
              isDocument: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'].includes(extension)
            } as FileItem;
          });
        
        setFiles(fileItems);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      setFiles([]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    // In a real implementation, you'd copy files to the Files directory
    console.log('Uploading files:', Array.from(uploadedFiles).map(f => f.name));
    
    // Reload files after upload
    await loadFiles();
  };

  const handleFileSelect = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const getFileIcon = (file: FileItem) => {
    if (file.isImage) return <Image size={20} className="text-green-500" />;
    if (file.isVideo) return <Video size={20} className="text-blue-500" />;
    if (file.isDocument) return <FileText size={20} className="text-orange-500" />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(file.type)) {
      return <Archive size={20} className="text-purple-500" />;
    }
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
      (filterType === 'images' && file.isImage) ||
      (filterType === 'documents' && file.isDocument) ||
      (filterType === 'videos' && file.isVideo) ||
      (filterType === 'other' && !file.isImage && !file.isDocument && !file.isVideo);
    
    return matchesSearch && matchesFilter;
  });

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredFiles.map((file) => (
        <div
          key={file.path}
          className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedFiles.has(file.path) ? 'ring-2 ring-vault-primary' : ''
          }`}
          onClick={() => handleFileSelect(file.path)}
        >
          <div className="flex flex-col items-center text-center">
            {file.isImage ? (
              <div className="w-16 h-16 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                <img 
                  src={`file://${file.path}`} 
                  alt={file.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                {getFileIcon(file)}
              </div>
            )}
            
            <span className="text-sm font-medium text-vault-text truncate w-full" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-vault-text-secondary mt-1">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-1">
      {filteredFiles.map((file) => (
        <div
          key={file.path}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
            selectedFiles.has(file.path) ? 'bg-vault-primary/10 ring-1 ring-vault-primary' : ''
          }`}
          onClick={() => handleFileSelect(file.path)}
        >
          <div className="flex-shrink-0">
            {getFileIcon(file)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-vault-text truncate">
              {file.name}
            </div>
            <div className="text-sm text-vault-text-secondary">
              {file.type.toUpperCase()} • {formatFileSize(file.size)} • {file.modified.toLocaleDateString()}
            </div>
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
            <h1 className="text-2xl font-bold text-vault-text mb-2">Files</h1>
            <p className="text-vault-text-secondary">
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
              {filterType !== 'all' && ` • ${filterType}`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="btn-primary cursor-pointer"
            >
              <Upload size={16} className="mr-2" />
              Upload Files
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vault-text-secondary" size={16} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-vault-primary focus:bg-white transition-colors w-64"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-vault-primary focus:bg-white transition-colors"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
              <option value="videos">Videos</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-vault-text-secondary">
                  {selectedFiles.size} selected
                </span>
                <button className="btn-secondary text-sm">
                  <Download size={14} className="mr-1" />
                  Download
                </button>
              </div>
            )}
            
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
          </div>
        </div>

        {/* Content */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="mx-auto text-vault-text-secondary mb-4" size={48} />
            <h3 className="text-lg font-medium text-vault-text mb-2">
              {searchTerm || filterType !== 'all' ? 'No files found' : 'No files yet'}
            </h3>
            <p className="text-vault-text-secondary mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload some files to get started organizing your digital assets.'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <label htmlFor="file-upload" className="btn-primary cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Your First Files
              </label>
            )}
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

export default FilesView;
