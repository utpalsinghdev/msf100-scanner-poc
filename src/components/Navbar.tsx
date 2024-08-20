import { cn } from '@/lib/utils';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const isActive = (url: string) => {
        return location.pathname.split("/")[1] === url.split("/")[1];
    };
    const navs = [
        {
            title: "Home",
            hrf: "/"
        },
        {
            title: "Batch",
            hrf: "/batch"
        },
        {
            title: "Students",
            hrf: "/student"
        }
    ]
    return (
        <Disclosure as="nav" className="bg-white shadow">
            <div className="mx-auto max-w-[1350px] px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        {/* Mobile menu button */}
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
                        </DisclosureButton>
                    </div>
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex flex-shrink-0 items-center">
                            <img
                                alt="Your Company"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                className="h-8 w-auto"
                            />
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navs.map((n: { title: string, hrf: string }, index: number) => (
                                <Link
                                    key={index}
                                    to={n.hrf}
                                    className={cn("inline-flex items-center border-b-2  px-1 pt-1 text-sm font-medium ", isActive(n.hrf) ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700")}
                                >
                                    {n.title}
                                </Link>
                            ))}
                            <a
                                href={"/MFS100Driver_9.1.1.0andClientService9.0.3.8.zip"}
                                download={true}
                                className={cn("inline-flex items-center   px-1 pt-1 text-sm font-medium ")}
                            >
                                Download Drivers
                            </a>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <button
                            type="button"
                            className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">View notifications</span>
                            <BellIcon aria-hidden="true" className="h-6 w-6" />
                        </button>

                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                            <div>
                                <MenuButton className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        alt=""
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        className="h-8 w-8 rounded-full"
                                    />
                                </MenuButton>
                            </div>
                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                            >

                                <MenuItem>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("scanner_user")
                                            window.location.reload()
                                        }}
                                        type='button' className="block px-4 w-full font-medium py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                                        Sign out
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>
            </div>

            <DisclosurePanel className="sm:hidden">
                <div className="space-y-1 pb-4 pt-2">
                    {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "" */}
                    {navs.map(n => (
                        <DisclosureButton
                            onClick={() => {
                                navigate(n.hrf)
                            }}
                            as="button"
                            className={cn("block border-l-4   py-2 pl-3 pr-4 text-base font-medium w-full", isActive(n.hrf) ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700")}
                        >
                            {n.title}
                        </DisclosureButton>
                    ))}
                    <DisclosureButton
                        as="a"
                        href={"/MFS100Driver_9.1.1.0andClientService9.0.3.8.zip"}
                        download={true}
                        className={cn("block border-l-4 text-center  py-2 pl-3 pr-4 text-base font-medium w-full")}
                    >
                        Download Drivers
                    </DisclosureButton>


                </div>
            </DisclosurePanel>
        </Disclosure>
    )
}
