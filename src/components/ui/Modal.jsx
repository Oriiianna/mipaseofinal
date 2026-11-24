import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Ventana modal accesible basada en el elemento nativo <dialog>.
 * @param {{ open: boolean, title: string, onClose: () => void, children: React.ReactNode }} props
 */
export default function Modal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className="w-full max-w-lg rounded-xl p-0 shadow-xl backdrop:bg-black/50"
    >
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h2 id={titleId} className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>
      <div className="px-6 py-4">{open && children}</div>
    </dialog>
  );
}
