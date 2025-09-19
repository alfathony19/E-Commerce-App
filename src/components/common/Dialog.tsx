// src/components/common/Dialog.tsx
import { Dialog as HeadlessDialog } from "@headlessui/react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  message: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onConfirm?: () => void;
  buttonText?: string;
}

export default function Dialog({
  open,
  onClose,
  title,
  message,
  actionLabel,
  onAction,
}: Props) {
  return (
    <HeadlessDialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 !bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="!bg-white rounded-lg p-6 max-w-sm mx-auto shadow-lg">
          <HeadlessDialog.Title className="text-lg font-semibold !text-teal-600">
            {title}
          </HeadlessDialog.Title>
          <p className="mt-2 !text-gray-600">{message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded !bg-gray-200 hover:!bg-gray-300"
            >
              Tutup
            </button>
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="px-3 py-1 rounded !bg-teal-600 !text-white hover:!bg-teal-700"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
}
