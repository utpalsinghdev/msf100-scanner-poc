import Badge, { enums } from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/Table"
import Api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canPerform } from "@/lib/permissions";
import { FingerprintImage } from "@/components/ui/FingerprintImage";

const Students = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [news, setNews] = useState({
        loading: true,
        data: [] as any[],
    });

    async function fetchData() {
        setNews(prev => ({ ...prev, loading: true }))
        try {
            const res: any = await Api.get("api/student")
            setNews(prev => ({ ...prev, data: res.data.data }))
        } catch {
            toast.error("Failed to load students");
        } finally {
            setNews(prev => ({ ...prev, loading: false }))
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const columns = () => [
        {
            Header: "#",
            accessor: "d",
            Cell: (cell: any) => (
                <span className="font-medium text-slate-400">{cell.row.index + 1}</span>
            )
        },
        {
            Header: "Name",
            accessor: "name",
            Cell: (cell: any) => (
                <span className="font-semibold text-slate-900">{cell.value}</span>
            )
        },
        {
            Header: "Batch",
            accessor: "batch.name",
            Cell: (cell: any) => (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {cell.row.original.batch?.name}
                </span>
            )
        },
        ...[1, 2, 3, 4, 5].map((n) => ({
            Header: `F${n}`,
            accessor: `finger${n}`,
            Cell: (cell: any) => (
                cell.value ? (
                    <FingerprintImage src={cell.value} className="rounded-lg" />
                ) : (
                    <span className="text-slate-300">—</span>
                )
            )
        })),
        {
            Header: "Actions",
            accessor: "action",
            Cell: (cell: any) => (
                <span className="flex items-center gap-2">
                    {canPerform(user, 'view') && (
                    <Badge onClick={() => navigate(`/view-student/${cell.row.original.id}`)} type={enums.BLUE}>
                        View
                    </Badge>
                    )}
                    {canPerform(user, 'edit') && (
                    <Badge onClick={() => navigate(`/student/${cell.row.original.id}`)} type={enums.GREEN}>
                        Edit
                    </Badge>
                    )}
                    {canPerform(user, 'delete') && (
                    <Badge
                        onClick={async () => {
                            if (!window.confirm("Delete this student?")) return;
                            try {
                                const res = await Api.delete(`api/student/${cell.row.original.id}`);
                                toast.success(res.data.message);
                                setNews((prev) => ({
                                    ...prev,
                                    data: prev.data?.filter((n) => n.id !== cell.row.original.id),
                                }));
                            } catch (error: any) {
                                toast.error(error.response?.data?.message ?? "Delete failed");
                            }
                        }}
                        type={enums.RED}
                    >
                        Delete
                    </Badge>
                    )}
                </span>
            ),
        },
    ];

    return news.loading ? (
        <Loader />
    ) : (
        <>
        <Table
            btnText={canPerform(user, 'add') ? "Add student" : undefined}
            btnfunc={canPerform(user, 'add') ? () => navigate("/student/add") : undefined}
            title="Students"
            subtitle="Registered students with captured fingerprints"
            dataName="students"
            data={news.data}
            columns={columns()}
        />
        </>
    );
}

export default Students
