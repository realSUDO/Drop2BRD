import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Pencil } from 'lucide-react';

export default function ProjectCard({ id, name, createdAt, status, onDelete, onRename }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const isCompleted = status === 'completed';

  const handleRename = (e) => {
    e.stopPropagation();
    if (editName.trim() && editName !== name) {
      onRename(id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="relative group w-[260px] h-[180px] shrink-0">
      <button
        type="button"
        onClick={() => navigate(`/report/${id}`)}
        className="w-full h-full flex flex-col items-center justify-center rounded-figma-lg bg-card border border-[rgba(123,123,123,0.37)] p-5 hover:bg-[#454545] transition-colors"
      >
        <div className="w-12 h-12 rounded-lg bg-panel flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-muted-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename(e);
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-base font-medium text-white bg-panel border border-border rounded px-2 py-1 text-center"
            autoFocus
          />
        ) : (
          <span className="text-sm font-normal text-[#B0B0B0] text-center">{name}</span>
        )}
      </button>
      
      {/* Action buttons - show on hover */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="w-8 h-8 bg-[#3D3D3D] hover:bg-[#4D4D4D] rounded-lg flex items-center justify-center transition-colors"
        >
          <Pencil className="w-4 h-4 text-[#939393]" />
        </button>
        <button
          onClick={handleDelete}
          className="w-8 h-8 bg-[#3D3D3D] hover:bg-[#4D4D4D] rounded-lg flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-4 h-4 text-[#939393]" />
        </button>
      </div>
    </div>
  );
}
