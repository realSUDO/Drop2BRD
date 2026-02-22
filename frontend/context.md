# BRD Generation Assistant - Context

## Current State
A fully functional BRD generation system with Firebase authentication, user-specific data storage, rich editing, and professional PDF export.

## Architecture

### Frontend (React + Vite + Tailwind)
- **Login**: Google OAuth authentication with Firebase
- **Dashboard**: Project list with rename/delete, workspace management, collapsible sidebar
- **Upload Page**: Multi-file upload (CSV/PDF) with drag-drop, validation, project naming
- **Report Page**: Markdown-rendered BRDs with TOC, rich editing, text selection tools, PDF export

### Backend (Node.js + Express + Firebase)
- **Authentication**: Firebase Admin SDK for token verification
- **File Processing**: In-memory chunk processing (no Firestore size limits)
- **LLM Integration**: Google Gemini 2.5 Flash for BRD generation
- **Storage**: Firestore for user-specific BRDs and project metadata only

## Key Features

### Authentication
- Google Sign-In with Firebase Auth
- Protected routes with auth middleware
- User-specific data isolation
- Logout in sidebar settings dropdown

### File Upload
- Multi-file support (CSV/PDF)
- File validation: type, size (20MB), duplicates
- Dynamic icons: FileChartColumn (CSV), FileText (PDF)
- Icon sizing: 1-2 files (large), 3-4 (medium), 5+ (small)
- Drag-and-drop interface
- Project naming input

### Project Management
- Auto-naming: "Project 1", "Project 2", etc.
- Rename: Click edit icon (hover to reveal)
- Delete: Click trash icon with confirmation
- Status tracking: "uploaded" → "completed"
- User-specific storage in Firestore

### BRD Generation
- **Model**: Google Gemini 2.5 Flash
- **Temperature**: 0.1 (consistency)
- **Input**: 10 chunks with even distribution
- **Output**: 20,000 max tokens
- **Sections**: 10 professional sections
- **Finish Reason Logging**: Tracks MAX_TOKENS, STOP, SAFETY
- **Storage**: Only final BRD stored in Firestore (chunks in memory)

### Rich Editing
- **Double-click** anywhere to enter edit mode
- Markdown editor (SimpleMDE) with dark theme
- Toolbar: bold, italic, headings, lists, links, preview
- Save/Cancel buttons
- Updates BRD in Firestore
- Auto-updates table of contents

### Text Selection Tools
- **Selection popup**: Copy and Edit icons appear on text selection
- **Copy**: Copies selected text to clipboard
- **Edit with AI**: Opens prompt modal for AI-powered editing
- Grey selection highlighting (#4D4D4D)
- Popup hidden in edit mode

### PDF Export
- **Export button** with Upload icon (top right)
- Uses md-to-pdf.fly.dev API
- Professional formatting (like ChatGPT PDFs)
- Auto-adds "Business Requirements Document" title
- Downloads as {ProjectName}.pdf
- Loading state during export

### Table of Contents
- **Dynamic generation** from markdown headings (h1, h2, h3)
- Left sidebar with hierarchical display
- Smooth scroll navigation
- Active section highlighting
- Auto-updates after edits

### Data Processing
1. **Extract**: Schema-agnostic CSV, PDF text extraction
2. **Normalize**: Clean whitespace, lowercase
3. **Chunk**: Semantic chunking (2-3 sentences)
4. **Filter**: Keyword-based relevance filtering
5. **Sample**: 10 evenly distributed chunks for LLM
6. **Store**: Only BRD and metadata in Firestore (chunks in memory)

## Technical Details

### File Structure
```
backend/
├── server.js (API, auth middleware, in-memory cache)
├── firebase.js (Admin SDK, Firestore helpers, token verification)
├── extractors/
│   ├── csvExtractor.js
│   ├── pdfExtractor.js
│   ├── processor.js
│   └── index.js
├── llm/
│   └── generateBRD.js (10 chunks, 20k tokens)
├── preprocess/
│   ├── chunkText.js
│   └── filterRelevant.js
└── serviceAccountKey.json (Firebase Admin credentials)

frontend/src/
├── firebase.js (Auth config, Google provider)
├── context/
│   └── AuthContext.jsx (User state management)
├── pages/
│   ├── Login.jsx (Google Sign-In)
│   ├── Dashboard.jsx (Projects, sidebar, workspaces)
│   ├── Upload.jsx (Multi-file, loading screen)
│   └── Report.jsx (View, edit, export, TOC)
├── components/
│   ├── ProjectCard.jsx (Hover actions: edit, delete)
│   ├── MarkdownView.jsx (Render with IDs, loading overlay)
│   ├── EditSectionModal.jsx (AI edit prompt)
│   └── TopBar.jsx
└── services/
    └── api.js (Auth headers, all API calls)
```

### API Endpoints
- `POST /api/projects/:id/upload` - Upload file, process chunks (memory)
- `POST /api/projects/:id/generate-brd` - Generate BRD, save to Firestore
- `GET /api/projects` - List user's projects
- `GET /api/projects/:id/brd` - Get BRD
- `PUT /api/projects/:id/brd` - Update BRD (manual edit)
- `POST /api/projects/:id/edit-brd` - AI-powered BRD edit
- `PATCH /api/projects/:id/rename` - Rename project
- `DELETE /api/projects/:id` - Delete project and BRD

### Firebase Structure
```
users/
  {userId}/
    projects/
      {projectId}/
        - id, name, uploadedAt, updatedAt, status
    brds/
      {projectId}/
        - projectId, content (markdown), updatedAt
```

### Key Patterns
- **Auth**: Bearer token in Authorization header
- **Project ID**: `Date.now().toString()`
- **Chunks**: Stored in memory, cleared after BRD generation
- **BRDs**: Only final markdown stored in Firestore
- **PDF Export**: md-to-pdf.fly.dev API with form-urlencoded
- **Edit Mode**: Double-click anywhere on page
- **Selection**: Grey highlight with copy/edit popup

## Configuration
- **File Size Limit**: 20MB per file
- **LLM Rate Limit**: 2 RPM (free tier)
- **Chunk Sample**: 10 chunks (even distribution)
- **Max Output Tokens**: 20,000
- **Temperature**: 0.1
- **Firebase**: Admin SDK with service account key

## Known Issues & Solutions
- ✅ **BRD Truncation**: Fixed with 10 chunks + 20K output tokens
- ✅ **Firestore Size Limit**: Chunks in memory, only BRD stored
- ✅ **Multi-file Upload**: Implemented with validation and icons
- ✅ **Project Management**: Rename/delete with user confirmation
- ✅ **Authentication**: Firebase Auth with Google Sign-In
- ✅ **PDF Export**: Professional formatting via external API

## TODO
- [ ] Add more OAuth providers (GitHub, Microsoft)
- [ ] Add project sharing between users
- [ ] Add version history for BRDs
- [ ] Add collaborative editing
- [ ] Add custom PDF styling/themes
- [ ] Add export to DOCX format
- [ ] Add BRD templates
- [ ] Add analytics dashboard

## Development
```bash
# Backend
cd backend
npm install
npm start  # Port 3001

# Frontend
cd frontend
npm install
npm run dev  # Port 5173
```

## Dependencies
**Backend**: express, cors, multer, pdf-parse, @google/generative-ai, firebase, firebase-admin, dotenv
**Frontend**: react, react-router-dom, lucide-react, tailwindcss, react-markdown, firebase, react-simplemde-editor, easymde
