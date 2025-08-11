const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

let mainWindow;
let fileWatcher;

function createWindow() {
  console.log('=== Creating LifeVault Window ===');
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
  console.log('app.getAppPath():', app.getAppPath());
  
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', require('fs').existsSync(preloadPath));
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    },
    icon: path.join(__dirname, 'icons/icon.png'),
    show: false
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  console.log('Development mode:', isDev, 'NODE_ENV:', process.env.NODE_ENV);
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    app.focus();
  });

  // Debug preload script loading
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('Preload script error:', preloadPath, error);
  });

  mainWindow.webContents.once('dom-ready', () => {
    console.log('DOM ready, checking if preload script worked...');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (fileWatcher) {
      fileWatcher.close();
    }
  });
}

// Initialize PARA folder structure
function initializePARAStructure(basePath) {
  const folders = [
    'Projects/Short Term Goals',
    'Projects/Mid Term Goals', 
    'Projects/Long Term Goals',
    'Projects/Brain Dumps',
    'Areas/Finances',
    'Areas/Health',
    'Areas/Relationships',
    'Resources/Hobbies',
    'Resources/Learning Languages',
    'Resources/Skin & Hair Care',
    'Resources/Aromatherapy',
    'Resources/Perfumes',
    'Archive/Accomplishments',
    'Archive/Completed Projects',
    'Files'
  ];

  folders.forEach(folder => {
    const fullPath = path.join(basePath, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Create a welcome note
  const welcomeNote = path.join(basePath, 'Welcome to LifeVault.md');
  if (!fs.existsSync(welcomeNote)) {
    const welcomeContent = `# Welcome to LifeVault! 🎉

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

Happy organizing! ✨
`;
    fs.writeFileSync(welcomeNote, welcomeContent);
  }
}

// Setup file watcher
function setupFileWatcher(folderPath) {
  if (fileWatcher) {
    fileWatcher.close();
  }
  
  fileWatcher = chokidar.watch(folderPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  fileWatcher
    .on('add', path => mainWindow?.webContents.send('file-added', path))
    .on('change', path => mainWindow?.webContents.send('file-changed', path))
    .on('unlink', path => mainWindow?.webContents.send('file-removed', path))
    .on('addDir', path => mainWindow?.webContents.send('folder-added', path))
    .on('unlinkDir', path => mainWindow?.webContents.send('folder-removed', path));
}

// IPC handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedPath = result.filePaths[0];
    setupFileWatcher(selectedPath);
    return selectedPath;
  }
  return null;
});

ipcMain.handle('initialize-para', async (event, basePath) => {
  try {
    initializePARAStructure(basePath);
    setupFileWatcher(basePath);
    return true;
  } catch (error) {
    console.error('Failed to initialize PARA structure:', error);
    return false;
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Failed to read file:', error);
    throw error;
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error('Failed to write file:', error);
    throw error;
  }
});

ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      path: path.join(dirPath, item.name),
      isDirectory: item.isDirectory(),
      isFile: item.isFile()
    }));
  } catch (error) {
    console.error('Failed to list directory:', error);
    return [];
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Set up application menu
const template = [
  {
    label: 'LifeVault',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'File',
    submenu: [
      { role: 'close' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
