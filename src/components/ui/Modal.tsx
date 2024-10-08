/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";
// const initialModalState = {
//     type: "",
//     state: false,
//     index: null,
//     edit_id: "",
//     data: {
//       name: "",
//       email: "",
//       password: "",
//       type: "",
//       confirm_password: "",
//     },
//   };

export default function Modal({
  title = "Modal",
  open,
  setOpen,
  children,
  className,
  size = "max-w-lg",
}: {
  title?: any;
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
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75 w-" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  className,
                  `relative w-full ${size} px-4 pt-5 pb-4  text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:p-6`
                )}
              >
                <div className="absolute top-0 right-0  pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none  focus:ring-offset-0"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon
                      className="h-6 w-6 text-black"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div>
                  <div className="mt-0 ">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl mb-4 font-medium leading-6 text-gray-900 text-center border-b border-gray-300 pb-4"
                    >
                      {title}
                    </Dialog.Title>
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
