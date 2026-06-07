"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: LucideIcon;
  busy?: boolean;
};

export function Button({
  className,
  variant = "primary",
  icon: Icon,
  busy,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "bg-primary text-white shadow-sm hover:bg-teal-700",
        variant === "secondary" && "border border-slate-200 bg-white text-ink hover:bg-slate-50",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        className,
      )}
      disabled={disabled || busy}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {busy ? "Đang xử lý..." : children}
    </button>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "focus-ring min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "rose" | "blue";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "slate" && "bg-slate-100 text-slate-700",
        tone === "green" && "bg-emerald-100 text-emerald-700",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "rose" && "bg-rose-100 text-rose-700",
        tone === "blue" && "bg-sky-100 text-sky-700",
      )}
    >
      {children}
    </span>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="table-scroll overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  className,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4 no-print">
      <div className={clsx("max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-soft", className)}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button
            aria-label="Đóng"
            className="focus-ring rounded-md p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[68vh] overflow-y-auto p-5">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export type ToastMessage = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

export function ToastStack({
  toasts,
  onClose,
}: {
  toasts: ToastMessage[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 grid w-[min(360px,calc(100vw-2rem))] gap-2 no-print">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "flex items-start justify-between gap-3 rounded-md border bg-white px-4 py-3 text-sm shadow-soft",
            toast.type === "success" && "border-emerald-200 text-emerald-800",
            toast.type === "error" && "border-rose-200 text-rose-800",
            toast.type === "info" && "border-sky-200 text-sky-800",
          )}
        >
          <span>{toast.message}</span>
          <button className="rounded p-1 hover:bg-slate-100" onClick={() => onClose(toast.id)} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Đồng ý",
  cancelLabel = "Hủy",
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 no-print">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
