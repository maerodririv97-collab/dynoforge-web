import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Loader2, X } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-red hover:bg-red-light text-white shadow-[0_0_14px_rgba(229,35,43,0.35)]',
  secondary: 'bg-dark-3 hover:bg-dark-4 text-white border border-dark-4',
  danger: 'bg-transparent hover:bg-red/15 text-red-light border border-red/40',
  ghost: 'bg-transparent hover:bg-dark-3 text-muted-light hover:text-white',
};

export function Button({
  variant = 'primary',
  busy,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; busy?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

const FIELD =
  'w-full rounded-md border border-dark-4 bg-dark-2 px-3 py-2 text-sm text-white placeholder:text-muted outline-none focus:border-red/60 focus:ring-1 focus:ring-red/40';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${FIELD} ${props.className ?? ''}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${FIELD} ${props.className ?? ''}`} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-light">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-red/40 bg-red/10 px-3 py-2 text-sm text-red-light">{children}</div>
  );
}

type Tone = 'green' | 'yellow' | 'red' | 'gray' | 'blue';
const TONES: Record<Tone, string> = {
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30',
  red: 'bg-red/15 text-red-light border-red/30',
  gray: 'bg-dark-3 text-muted-light border-dark-4',
  blue: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
};

export function Badge({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-dark-3 bg-dark/80 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-light">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-[8vh]">
      <div className="w-full max-w-lg rounded-lg border border-dark-4 bg-dark-2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-dark-3 px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-light hover:text-white" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-dark-3 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/** Tabla con scroll horizontal propio (no desborda la página en celular). */
export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string | false }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-dark-3 text-xs uppercase tracking-wide text-muted-light">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-3">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-8 text-center text-sm text-muted">{empty}</p>}
    </Card>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-light" />
    </div>
  );
}
