import Badge, { enums } from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/Table"
import Api from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canPerform } from "@/lib/permissions";
import { FingerprintImage } from "@/components/ui/FingerprintImage";
import { Button } from "@/components/ui/button";
import { exportStudentsPdf, type StudentPdfRecord } from "@/lib/exportStudentsPdf";
import { exportStudentsZip } from "@/lib/exportStudentsZip";
import { Archive, FileDown } from "lucide-react";

const Students = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [news, setNews] = useState({
        loading: true,
        data: [] as StudentPdfRecord[],
    });
    const [exporting, setExporting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const selectedStudents = useMemo(
        () => news.data.filter((student) => selectedIds.has(student.id)),
        [news.data, selectedIds],
    );

    const allSelected =
        news.data.length > 0 && news.data.every((student) => selectedIds.has(student.id));
    const someSelected = selectedIds.size > 0 && !allSelected;

    function toggleStudent(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        if (allSelected) {
            setSelectedIds(new Set());
            return;
        }
        setSelectedIds(new Set(news.data.map((student) => student.id)));
    }

    async function fetchData() {
        setNews(prev => ({ ...prev, loading: true }))
        try {
            const res: any = await Api.get("api/student")
            setNews(prev => ({ ...prev, data: res.data.data }))
            setSelectedIds(new Set())
        } catch {
            toast.error("Failed to load students");
        } finally {
            setNews(prev => ({ ...prev, loading: false }))
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    async function handleExportPdf() {
        if (news.data.length === 0) {
            toast.error("No students to export");
            return;
        }
        setExporting(true);
        try {
            await exportStudentsPdf(news.data);
            toast.success("PDF downloaded");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Export failed";
            toast.error(message);
        } finally {
            setExporting(false);
        }
    }

    async function handleDownloadZip() {
        if (selectedStudents.length === 0) {
            toast.error("Select at least one student");
            return;
        }
        setDownloading(true);
        try {
            await exportStudentsZip(selectedStudents);
            toast.success("ZIP downloaded");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Download failed";
            toast.error(message);
        } finally {
            setDownloading(false);
        }
    }

    const columns = () => [
        {
            Header: () => (
                <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    aria-label="Select all students"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
            ),
            accessor: "select",
            disableSortBy: true,
            Cell: (cell: any) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(cell.row.original.id)}
                    onChange={() => toggleStudent(cell.row.original.id)}
                    aria-label={`Select ${cell.row.original.name}`}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
            ),
        },
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
                                setSelectedIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(cell.row.original.id);
                                    return next;
                                });
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
            headerActions={
                canPerform(user, 'view') ? (
                    <>
                        {selectedIds.size > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2 sm:w-auto"
                                disabled={downloading}
                                onClick={handleDownloadZip}
                            >
                                <Archive className="h-4 w-4" />
                                {downloading
                                    ? "Preparing ZIP…"
                                    : `Download (${selectedIds.size})`}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 sm:w-auto"
                            disabled={exporting || news.data.length === 0}
                            onClick={handleExportPdf}
                        >
                            <FileDown className="h-4 w-4" />
                            {exporting ? "Exporting…" : "Export PDF"}
                        </Button>
                    </>
                ) : undefined
            }
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
