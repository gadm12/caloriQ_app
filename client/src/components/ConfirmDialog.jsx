export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 p-lg flex flex-col gap-lg">
        <div className="flex flex-col gap-sm">
          <h2 className="font-display font-semibold text-headline-md text-on-surface">Confirm Delete</h2>
          <p className="text-body-md text-on-surface-variant">{message}</p>
        </div>

        <div className="flex gap-md justify-end">
          <button
            onClick={onCancel}
            className="px-lg py-2 rounded-lg border border-outline-variant text-on-surface-variant text-label-md font-semibold hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-lg py-2 rounded-lg bg-error text-on-error text-label-md font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
