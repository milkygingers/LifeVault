# LifeVault 🏦

A powerful productivity app combining the best of Notion, Obsidian, and Ember.ly features.

## Features ✨

- **Mind Map View** - Interactive graph visualization of your workspace
- **PARA Method** - Built-in Projects, Areas, Resources, Archive organization
- **Rich Notes** - Markdown editor with live preview and WYSIWYG editing
- **File Management** - Organized file storage with drag & drop support
- **Local-First** - Your data stays on your device with real-time sync
- **Customizable** - Themes, backgrounds, and appearance settings

## Quick Start 🚀

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

This will start both the React development server and the Electron app. The app should open automatically with a welcome screen where you can select your workspace folder.

## Available Scripts 📜

- `npm run dev` - Start development mode (React + Electron)
- `npm run build` - Build the React app for production
- `npm run electron-pack` - Package the app for distribution
- `npm run react-dev` - Start only the React development server
- `npm run electron-dev` - Start only the Electron app (requires React server)

## Development Mode 🛠️

When you run `npm run dev`, the app will:

1. Start the React development server on `http://localhost:5173`
2. Launch the Electron app that loads the React app
3. Enable hot reloading for fast development
4. Open developer tools automatically

## First Launch 🎯

1. **Select Workspace**: Choose a folder where LifeVault will create your PARA structure
2. **PARA Setup**: The app automatically creates:
   - Projects/ (Short Term Goals, Mid Term Goals, Long Term Goals, Brain Dumps)
   - Areas/ (Finances, Health, Relationships)
   - Resources/ (Hobbies, Learning Languages, Skin & Hair Care, Aromatherapy, Perfumes)
   - Archive/ (Accomplishments, Completed Projects)
   - Files/ (For managing documents and media)

3. **Welcome Note**: A welcome note is created to help you get started

## Using LifeVault 📝

### Navigation Tabs

- **Mind Map** - Visualize connections between notes and folders
- **Folders** - Browse your PARA structure and files
- **Notes** - Create and edit Markdown notes with live preview
- **Files** - Manage images, documents, and other files
- **Settings** - Customize themes, backgrounds, and preferences

### Key Features

- **Search Everything** - Global search across notes, files, and folders
- **Real-time Sync** - Changes are immediately reflected in the file system
- **Theme Support** - Light/dark modes with custom colors and backgrounds
- **File Watching** - Automatically detects changes made outside the app

## Folder Structure 📁

```
LifeVault1/
├── public/
│   ├── electron.js          # Main Electron process
│   ├── preload.js          # Electron preload script
│   └── icons/              # App icons
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── App.tsx            # Main app component
│   └── main.tsx           # React entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Troubleshooting 🔧

### Common Issues

1. **App won't start**: Make sure all dependencies are installed with `npm install`
2. **Blank screen**: Check that the React dev server is running on port 5173
3. **Can't select workspace**: Ensure you have write permissions to the selected folder
4. **Files not syncing**: Check that the folder watcher has permissions to monitor the directory

### Development Tips

- Use the browser dev tools (Cmd+Option+I on Mac) for debugging React components
- Check the Electron main process logs in your terminal
- The app stores settings in localStorage and your workspace in the selected folder

## Building for Production 🏗️

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Package the Electron app:**
   ```bash
   npm run electron-pack
   ```

The packaged app will be in the `dist/` folder.

## Tech Stack 🔧

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Desktop**: Electron 27
- **Bundler**: Vite
- **Icons**: Lucide React
- **Markdown**: ReactMarkdown

## Contributing 🤝

This is a personal productivity app, but feel free to fork and customize it for your own needs!

## License 📄

MIT License - feel free to use and modify as needed.

---

**Happy organizing with LifeVault! 🎉**
