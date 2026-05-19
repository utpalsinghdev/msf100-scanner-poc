import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function Modal({
  title = "Modal",
  open,
  setOpen,
  children,
  className,
  size = "max-w-lg",
}: {
  title?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  children: React.ReactNode;
  className?: string;
  size?: string;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-3 sm:p-6">
          <div className="flex min-h-full items-end justify-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:scale-95"
            >
              <Dialog.Panel
                className={cn(
                  "relative flex max-h-[min(92vh,720px)] w-full flex-col transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 transition-all sm:max-h-[85vh]",
                  size,
                  className
                )}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
                  <Dialog.Title className="pr-8 text-base font-semibold text-slate-900 sm:text-lg">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:right-4 sm:top-4"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
