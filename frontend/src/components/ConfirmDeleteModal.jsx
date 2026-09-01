// Confirmation modal for destructive actions — styled after the GameDay Figma
// "Confirm_Delete-tournament" frame (dark overlay, warning copy, Cancel + red
// destructive-action button). Generic enough to reuse for other deletes later.
const ConfirmDeleteModal = ({
  title = 'Delete Tournament?',
  message = 'This action cannot be undone. All participants, matches and results will be removed.',
  confirmLabel = 'Delete Tournament',
  error = '',
  deleting = false,
  onCancel,
  onConfirm,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-[#94a3b8] mb-4">{message}</p>

        {error && (
          <div className="mb-4 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="bg-[#0f141b] border border-[#2a3547] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="bg-[#0f141b] border border-[#ef4444] text-[#ef4444] px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
