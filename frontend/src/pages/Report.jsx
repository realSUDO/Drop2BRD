import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
      setIsModalOpen(true);
    }
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
    let sectionContent = '';
    
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].includes(selectedText)) {
        sectionIndex = i;
        sectionContent = sections[i];
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
      
      const prompt = `You are editing a section of a Business Requirements Document.

Original section:
${sectionContent}

Selected text to modify:
"${selectedText}"

Requested change:
${changeDescription}

Instructions:
- Apply the change ONLY to the selected text
- Return the COMPLETE updated section with the change applied
- Maintain the same markdown formatting and structure
- Keep the section heading unchanged
- Do NOT add explanations, just return the updated section`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4000,
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "API error");
      }

      const updatedSection = data.candidates[0].content.parts[0].text
        .replace(/```markdown\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Replace the section in the full BRD
      sections[sectionIndex] = updatedSection;
      const updatedBRD = sections.join('');
      
      setBrdContent(updatedBRD);
      
      // Update on backend
      await api.editBRD(projectId, `Updated section with: ${changeDescription}`);
      
      // Update table of contents
      const headings = extractHeadings(updatedBRD);
      setTableOfContents(headings);
      
      setChangeDescription('');
      setSelectedText('');
      console.log('✅ Edit applied successfully');
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
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {/* BRD Content */}
            <div className="bg-card border border-border rounded-figma p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Business Requirements Document</h2>
                <div className="text-sm text-[#939393]">
                  {selectedText ? 'Text selected - Click Edit to modify' : 'Select text to edit'}
                </div>
              </div>
              <article 
                className="prose prose-invert max-w-none"
                onMouseUp={handleTextSelection}
              >
                <MarkdownView content={brdContent} editingSection={editingSection} />
              </article>
            </div>
          </div>
        </main>
      </div>

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
