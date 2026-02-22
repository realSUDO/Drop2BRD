import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, House, LogOut } from 'lucide-react';
import { logout } from '../firebase';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import ProjectCard from '../components/ProjectCard';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState(['My Workspace']);
  const [currentWorkspace, setCurrentWorkspace] = useState('My Workspace');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      console.log('📊 Loaded projects:', data);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (projectId, newName) => {
    try {
      await api.renameProject(projectId, newName);
      loadProjects();
    } catch (error) {
      console.error('Failed to rename project:', error);
      alert('Failed to rename project');
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await api.deleteProject(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p => 
    p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewWorkspace = () => {
    const name = prompt('Enter workspace name:');
    if (name?.trim()) {
      setWorkspaces([...workspaces, name.trim()]);
      setCurrentWorkspace(name.trim());
      setDropdownOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar - 309px */}
      <aside className={`${sidebarOpen ? 'w-[309px]' : 'w-0'} shrink-0 bg-surface border-r border-border transition-all duration-300 overflow-hidden`}>
        <div className={`${sidebarOpen ? 'flex' : 'hidden'} flex-col gap-4 py-[18px] px-6 h-full`}>
        <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <button 
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-[18px] hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-base font-normal text-white">{currentWorkspace}</span>
                <svg className={`w-6 h-6 text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-figma shadow-lg z-10">
                {workspaces.map((ws) => (
                  <button
                    key={ws}
                    type="button"
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-white hover:bg-nav-active transition-colors ${ws === currentWorkspace ? 'bg-nav-active' : ''}`}
                  >
                    {ws}
                  </button>
                ))}
                <div className="border-t border-border" />
                <button
                  type="button"
                  onClick={handleNewWorkspace}
                  className="w-full px-4 py-3 text-left text-white hover:bg-nav-active transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Workspace
                </button>
              </div>
            )}
          </div>
          <button 
            type="button" 
            className="w-6 h-6 text-white p-0 hover:text-btn-primary transition-colors" 
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 py-3 px-[18px] rounded-figma bg-card border border-[#3D3D3D]">
          <svg className="w-5 h-5 text-muted-lighter shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-muted-lighter"
          />
        </div>
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-figma bg-nav-active hover:bg-nav-active/80 transition-colors"
          >
            <House className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Home</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-figma hover:bg-card transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-[#939393]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-normal text-[#939393]">New Project</span>
          </button>
        </nav>
        </div>
        
        {/* User Settings - Bottom */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center gap-2.5 py-2.5 px-3.5 rounded-figma hover:bg-card transition-colors mt-auto"
          >
            <User className="w-[18px] h-[18px] text-[#939393]" />
            <span className="text-sm font-normal text-[#939393]">Settings</span>
          </button>
          
          {settingsOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-figma shadow-lg">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs text-[#939393]">Signed in as</p>
                <p className="text-sm text-white font-medium">{userName}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-white hover:bg-nav-active transition-colors flex items-center gap-2 rounded-figma"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-6 h-[50px] px-9 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-6 h-6 text-white hover:text-btn-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <svg className="w-[18px] h-[18.75px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-2.5 py-2 px-4 rounded-figma bg-[#343434] text-[#A2A2A2] text-base">
              Most Recent
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2.5 py-2 px-4 rounded-figma bg-btn-primary text-white text-base font-medium"
            >
              New Project
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto px-9 py-6">
          {/* For you - Generated BRDs */}
          <section className="mb-10">
            <h2 className="text-2xl text-muted mb-4">For you</h2>
            {loading ? (
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-[260px] h-[180px] rounded-figma-lg bg-card shrink-0 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto">
                {/* Create new button - always first */}
                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="w-[260px] h-[180px] flex flex-col items-center justify-center gap-2 rounded-figma-lg border border-dashed border-[rgba(158,158,158,0.58)] bg-transparent hover:bg-card/50 transition-colors shrink-0"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-base font-medium text-[#BABABA]">Create new</span>
                </button>
                
                {/* Generated projects */}
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    createdAt={project.createdAt}
                    status={project.status}
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
