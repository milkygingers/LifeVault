import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Eye, 
  Save,
  MoreHorizontal,
  Calendar,
  Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { WorkspaceConfig } from '../hooks/useWorkspace';

interface Note {
  path: string;
  name: string;
  content: string;
  created: Date;
  modified: Date;
  tags: string[];
}

interface NotesViewProps {
  workspace: WorkspaceConfig;
  searchTerm: string;
}

const NotesView: React.FC<NotesViewProps> = ({ workspace, searchTerm }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');

  useEffect(() => {
    loadNotes();
  }, [workspace]);

  const loadNotes = async () => {
    try {
      // Load notes from localStorage for web version
      const savedNotes = localStorage.getItem('lifevault-notes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        const notesWithDates = parsedNotes.map((note: any) => ({
          ...note,
          created: new Date(note.created),
          modified: new Date(note.modified),
          tags: extractTags(note.content)
        }));
        setNotes(notesWithDates);
        
        // Auto-select first note if available
        if (notesWithDates.length > 0 && !selectedNote) {
          handleSelectNote(notesWithDates[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const findMarkdownFiles = async (dirPath: string): Promise<Note[]> => {
    const notes: Note[] = [];
    
    try {
      const items = await window.electronAPI?.listDirectory(dirPath);
      if (!items) return notes;

      for (const item of items) {
        if (item.isDirectory && !item.name.startsWith('.')) {
          // Recursively search subdirectories
          const subNotes = await findMarkdownFiles(item.path);
          notes.push(...subNotes);
        } else if (item.isFile && item.name.endsWith('.md')) {
          // Load markdown file
          try {
            const content = await window.electronAPI?.readFile(item.path);
            if (content !== undefined) {
              const note: Note = {
                path: item.path,
                name: item.name.replace('.md', ''),
                content,
                created: new Date(), // Would need file stats from electron
                modified: new Date(),
                tags: extractTags(content)
              };
              notes.push(note);
            }
          } catch (error) {
            console.warn(`Failed to read note ${item.path}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to scan directory ${dirPath}:`, error);
    }

    return notes;
  };

  const extractTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const handleSelectNote = async (note: Note) => {
    setSelectedNote(note);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      const updatedNote = {
        ...selectedNote,
        content: editContent,
        modified: new Date(),
        tags: extractTags(editContent)
      };
      
      const updatedNotes = notes.map(n => n.path === selectedNote.path ? updatedNote : n);
      setNotes(updatedNotes);
      setSelectedNote(updatedNote);
      setIsEditing(false);
      
      // Save to localStorage
      const notesToSave = updatedNotes.map(note => ({
        ...note,
        created: note.created.toISOString(),
        modified: note.modified.toISOString()
      }));
      localStorage.setItem('lifevault-notes', JSON.stringify(notesToSave));
      
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleCreateNote = async () => {
    const noteName = prompt('Enter note name:');
    if (!noteName) return;

    const fileName = noteName.endsWith('.md') ? noteName : `${noteName}.md`;
    const filePath = `${workspace.path}/${fileName}`;
    const initialContent = `# ${noteName}\n\n`;

    try {
      const newNote: Note = {
        path: filePath,
        name: noteName,
        content: initialContent,
        created: new Date(),
        modified: new Date(),
        tags: []
      };
      
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      handleSelectNote(newNote);
      setIsEditing(true);
      
      // Save to localStorage
      const notesToSave = updatedNotes.map(note => ({
        ...note,
        created: note.created.toISOString(),
        modified: note.modified.toISOString()
      }));
      localStorage.setItem('lifevault-notes', JSON.stringify(notesToSave));
      
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create note. Please try again.');
    }
  };

  const filteredNotes = notes.filter(note => 
    !searchTerm || 
    note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderNotesList = () => (
    <div className="w-80 bg-vault-surface border-r h-full overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-vault-text">Notes</h2>
          <button 
            onClick={handleCreateNote}
            className="btn-ghost p-2"
            title="Create New Note"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="text-sm text-vault-text-secondary">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="p-2">
        {filteredNotes.map((note) => (
          <div
            key={note.path}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedNote?.path === note.path 
                ? 'bg-vault-primary/10 border border-vault-primary/20' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelectNote(note)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-vault-text truncate mb-1">
                  {note.name}
                </div>
                <div className="text-sm text-vault-text-secondary line-clamp-2">
                  {note.content.split('\n')[0].replace(/^#+\s*/, '') || 'No content'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-vault-text-secondary">
                    <Calendar size={12} />
                    {note.modified.toLocaleDateString()}
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag size={12} className="text-vault-text-secondary" />
                      <span className="text-xs text-vault-primary">
                        {note.tags.slice(0, 2).join(', ')}
                        {note.tags.length > 2 && '...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <button className="opacity-0 group-hover:opacity-100 btn-ghost p-1">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {filteredNotes.length === 0 && (
          <div className="text-center py-8">
            <FileText className="mx-auto text-vault-text-secondary mb-3" size={32} />
            <p className="text-vault-text-secondary">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleCreateNote}
                className="btn-primary mt-3"
              >
                Create your first note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex-1 flex flex-col">
      {selectedNote && (
        <>
          {/* Editor Header */}
          <div className="p-4 border-b bg-vault-surface">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-vault-text">
                  {selectedNote.name}
                </h1>
                <div className="text-sm text-vault-text-secondary">
                  Last modified: {selectedNote.modified.toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'edit' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    title="Edit Mode"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'split' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    title="Split Mode"
                  >
                    <div className="w-4 h-4 border border-gray-400 border-r-2"></div>
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'preview' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    title="Preview Mode"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                
                {isEditing && (
                  <button 
                    onClick={handleSaveNote}
                    className="btn-primary"
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
                <textarea
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    setIsEditing(true);
                  }}
                  className="flex-1 p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                  placeholder="Start writing your note..."
                />
              </div>
            )}
            
            {viewMode === 'split' && (
              <div className="w-px bg-gray-200"></div>
            )}
            
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
                <div className="p-4 markdown-preview">
                  <ReactMarkdown>{editContent || selectedNote.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {!selectedNote && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto text-vault-text-secondary mb-4" size={48} />
            <h3 className="text-lg font-medium text-vault-text mb-2">
              Select a note to view
            </h3>
            <p className="text-vault-text-secondary">
              Choose a note from the sidebar or create a new one to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex">
      {renderNotesList()}
      {renderEditor()}
    </div>
  );
};

export default NotesView;
