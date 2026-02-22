import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Edit3, Save, X } from 'lucide-react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { auth } from '../firebase';
import TopBar from '../components/TopBar';
import EditSectionModal from '../components/EditSectionModal';
import MarkdownView from '../components/MarkdownView';
import { api } from '../services/api';

export default function Report() {
  const { projectId } = useParams();
  const [brdContent, setBrdContent] = useState('');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [tableOfContents, setTableOfContents] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [editingSection, setEditingSection] = useState(null);
  const [selectionPopup, setSelectionPopup] = useState({ show: false, x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Extract headings from markdown content
  const extractHeadings = (markdown) => {
    if (!markdown) return [];
    
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      headings.push({ level, title, id });
    }

    console.log('📑 Extracted headings:', headings);
    return headings;
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('📄 Fetching data for project:', projectId);
      try {
        // Fetch project details
        const projects = await api.getProjects();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setProjectName(project.name);
        }

        // Fetch BRD
        const data = await api.getBRD(projectId || '1');
        console.log('✅ BRD data received:', data);
        console.log('📝 BRD content length:', data.brd?.length);
        console.log('📝 BRD preview:', data.brd?.substring(0, 200));
        setBrdContent(data.brd);
        
        // Extract table of contents from markdown
        const headings = extractHeadings(data.brd);
        console.log('📋 TOC entries:', headings.length);
        setTableOfContents(headings);
      } catch (error) {
        console.error('❌ Failed to fetch data:', error);
        setBrdContent('# Error\n\nFailed to load BRD. Please generate it first.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId]);

  const handleTextSelection = () => {
    if (isEditMode) return; // Don't show popup in edit mode
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
      
      // Get selection position
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectionPopup({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setSelectionPopup({ show: false, x: 0, y: 0 });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    setSelectionPopup({ show: false, x: 0, y: 0 });
    alert('Copied to clipboard!');
  };

  const handleEdit = () => {
    setSelectionPopup({ show: false, x: 0, y: 0 });
    setIsModalOpen(true);
  };

  const handleDoubleClick = () => {
    setSelectionPopup({ show: false, x: 0, y: 0 }); // Close popup when entering edit mode
    setEditContent(brdContent);
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      // Update BRD in backend
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/brd`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ content: editContent })
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      setBrdContent(editContent);
      const headings = extractHeadings(editContent);
      setTableOfContents(headings);
      setIsEditMode(false);
      console.log('✅ BRD saved successfully');
    } catch (error) {
      console.error('❌ Failed to save:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditContent('');
  };

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Edit your BRD...',
    status: false,
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'preview'],
  }), []);

  const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }
    return { 'Content-Type': 'application/json' };
  };

  const handleApplyEdit = async () => {
    if (!changeDescription.trim()) {
      alert('Please describe the change you want to make');
      return;
    }

    if (!selectedText) {
      alert('Please select text to edit');
      return;
    }

    // Find the section containing the selected text
    const sections = brdContent.split(/(?=^##\s)/m);
    let sectionIndex = -1;
    
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].includes(selectedText)) {
        sectionIndex = i;
        break;
      }
    }

    if (sectionIndex === -1) {
      alert('Could not locate the selected text');
      return;
    }

    setEditingSection(sectionIndex);
    setIsModalOpen(false);

    try {
      console.log('✏️ Editing selected text:', selectedText.substring(0, 50) + '...');
      
      // Call backend API to edit the BRD
      const result = await api.editBRD(projectId, `Change "${selectedText.substring(0, 100)}..." to: ${changeDescription}`);
      console.log('✅ Edit applied successfully');
      
      setBrdContent(result.brd);
      
      // Update table of contents
      const headings = extractHeadings(result.brd);
      setTableOfContents(headings);
      
      setChangeDescription('');
      setSelectedText('');
    } catch (error) {
      console.error('❌ Failed to apply edit:', error);
      alert('Failed to apply edit: ' + error.message);
    } finally {
      setEditingSection(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-primary items-center justify-center">
        <div className="text-white">Generating BRD...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <TopBar title={projectName} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Table of Contents Sidebar */}
        <aside className="w-[280px] shrink-0 bg-surface border-r border-border p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Table of Contents</h2>
          {tableOfContents.length === 0 ? (
            <p className="text-sm text-[#939393]">No headings found in document</p>
          ) : (
            <nav className="space-y-1">
              {tableOfContents.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(item.id);
                    const element = document.getElementById(item.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`block py-2 px-3 rounded transition-colors ${
                    item.level === 1 ? 'font-semibold' : item.level === 2 ? 'ml-3 text-sm' : 'ml-6 text-xs'
                  } ${
                    activeSection === item.id ? 'bg-nav-active text-white' : 'text-[#B0B0B0] hover:bg-nav-active/50'
                  }`}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto" onDoubleClick={handleDoubleClick}>
          <div className="max-w-5xl mx-auto px-8 py-8">
            {/* BRD Content */}
            <div className="bg-card border border-border rounded-figma p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Business Requirements Document</h2>
                {isEditMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-[#3D3D3D] hover:bg-[#4D4D4D] text-white rounded-figma text-sm flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="px-4 py-2 bg-btn-primary hover:bg-btn-primary-hover text-white rounded-figma text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              
              {isEditMode ? (
                <div className="markdown-editor">
                  <SimpleMDE
                    value={editContent}
                    onChange={setEditContent}
                    options={editorOptions}
                  />
                </div>
              ) : (
                <article 
                  className="prose prose-invert max-w-none selection:bg-[#4D4D4D] selection:text-white"
                  onMouseUp={handleTextSelection}
                >
                  <MarkdownView content={brdContent} editingSection={editingSection} />
                </article>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Selection Popup */}
      {selectionPopup.show && (
        <div 
          className="fixed z-50 flex gap-2 bg-surface border border-border rounded-lg shadow-lg p-2"
          style={{ 
            left: `${selectionPopup.x}px`, 
            top: `${selectionPopup.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-nav-active rounded transition-colors"
            title="Copy"
          >
            <Copy className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-nav-active rounded transition-colors"
            title="Edit with AI"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <EditSectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setChangeDescription('');
          setSelectedText('');
        }}
        sectionName="Selected Text"
        originalText={selectedText}
        changeDescription={changeDescription}
        onChangeDescription={setChangeDescription}
        onApply={handleApplyEdit}
        isEditing={editingSection !== null}
      />
    </div>
  );
}
