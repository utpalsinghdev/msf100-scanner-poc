import { StampIcon, Users2Icon } from "lucide-react";
import { NewspaperIcon } from "@heroicons/react/24/outline";
import Loader from "@/components/ui/Loader";
import { useEffect, useState } from "react";
import Api from "@/lib/api";

function DashboardHome() {
    const [_dashboard, setDashboard] = useState({
        data: {
            batches: 0,
            students: 0
        },
        loading: true
    })

    async function das() {
        const res = await Api.get("api/auth/admin/dashboard")
        setDashboard(() => ({
            ...res.data
        }))
    }

    useEffect(() => {
        das()
    }, [])


    return _dashboard.loading ? (
        <Loader />
    ) : (
        <div className="w-full h-full flex items-center flex-col md:flex-row gap-8 justify-between transition-transform duration-300">
            <img src={"/3556960.jpg"} className="w-[600px]" />

            <div className="w-full h-full flex flex-col gap-4 mx-4">
                <div className="w-full flex rounded-md shadow-md px-8 py-6 bg-blue-100 border border-blue-700 items-center justify-between">
                    <span className="flex items-start gap-4 justify-between flex-col">
                        <p className="text-start">Total Students</p>
                        <p className="text-start">{_dashboard?.data?.students}</p>
                    </span>
                    <Users2Icon className="w-16 h-16" />
                </div>
                <div className="w-full flex rounded-md shadow-md px-8 py-6 bg-blue-100 border border-blue-700 items-center justify-between">
                    <span className="flex items-start gap-4 justify-between flex-col">
                        <p className="text-start">Total Batches</p>
                        <p className="text-start">{_dashboard?.data?.batches}</p>
                    </span>
                    <NewspaperIcon className="w-16 h-16" />
                </div>

                <div className="w-full flex rounded-md shadow-md px-8 py-6 bg-blue-100 border border-blue-700 items-center justify-between">
                    <span className="flex items-start gap-4 justify-between flex-col">
                        <p className="text-start">Remaining Batches</p>
                        <p className="text-start">{20 - _dashboard?.data?.batches}</p>
                    </span>
                    <StampIcon className="w-16 h-16" />
                </div>
            </div>
        </div>
    );
}

export default DashboardHome;
