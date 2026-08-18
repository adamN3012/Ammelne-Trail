/**
 * Toast notification — bas droite, 5 secondes, vert/rouge
 * Usage : const { toast } = useToast();
 *         toast("Message", "success" | "error")
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";
interface ToastItem { id: number; message: string; type: ToastType; }

// ── Composant visuel ──────────────────────────────────────────
function ToastItem({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Entrée
    const t1 = setTimeout(() => setVisible(true), 10);
    // Sortie après 4.5s
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);

  const isSuccess = item.type === "success";

  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-elevated border max-w-sm w-full pointer-events-auto transition-all duration-300 ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    } ${isSuccess
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-800"
    }`}>
      {isSuccess
        ? <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
        : <XCircle     size={18} className="text-red-600 shrink-0 mt-0.5" />}
      <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="shrink-0 opacity-50 hover:opacity-100 transition">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Container global ──────────────────────────────────────────
let _addToast: ((msg: string, type: ToastType) => void) | null = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const add = useCallback((message: string, type: ToastType) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => { _addToast = add; return () => { _addToast = null; }; }, [add]);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useToast() {
  const toast = useCallback((message: string, type: ToastType = "success") => {
    _addToast?.(message, type);
  }, []);
  return { toast };
}
