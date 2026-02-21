export default function EditSectionModal({ isOpen, onClose, sectionName, originalText, changeDescription, onChangeDescription, onApply, isEditing = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-w-lg w-full rounded-2xl bg-surface border border-border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Edit {sectionName}</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-light mb-2">Selected text</label>
          <div className="max-h-40 overflow-y-auto rounded-figma bg-card-alt border border-input-border p-3 text-xs text-white/90 whitespace-pre-wrap">
            {originalText || 'No text selected'}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-light mb-2">Describe the change</label>
          <textarea
            value={changeDescription}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="e.g., Make this more concise, Add more details, Change tone to formal..."
            className="w-full min-h-[100px] rounded-figma border border-input-border bg-input-fill px-3 py-2 text-sm text-white placeholder-white/54 focus:outline-none focus:ring-2 focus:ring-btn-primary"
            autoFocus
            disabled={isEditing}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isEditing}
            className="py-2 px-4 rounded-figma border border-border text-white hover:bg-card disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={isEditing || !originalText}
            className="py-2 px-4 rounded-figma bg-btn-primary text-white hover:opacity-90 disabled:opacity-50"
          >
            {isEditing ? 'Applying...' : 'Apply Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}
