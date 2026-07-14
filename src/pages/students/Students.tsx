import Badge, { enums } from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/Table"
import Api from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canPerform } from "@/lib/permissions";
import { FingerprintImage } from "@/components/ui/FingerprintImage";
import { Button } from "@/components/ui/button";
import { exportStudentsPdf, type StudentPdfRecord } from "@/lib/exportStudentsPdf";
import { exportStudentsZip } from "@/lib/exportStudentsZip";
import { Archive, FileDown } from "lucide-react";

type ListMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

const PAGE_SIZES = [10, 20, 30, 40, 50] as const;
const FINGER_COUNTS = [1, 2, 3, 4, 5] as const;
const DEFAULT_FINGER_COUNT = 3;

function listParamsFromUrl(sp: URLSearchParams) {
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
    const rawLimit = parseInt(sp.get("limit") ?? "10", 10) || 10;
    const pageSize = (PAGE_SIZES as readonly number[]).includes(rawLimit) ? rawLimit : 10;
    const rawFingers = parseInt(sp.get("fingers") ?? String(DEFAULT_FINGER_COUNT), 10) || DEFAULT_FINGER_COUNT;
    const fingerCount = (FINGER_COUNTS as readonly number[]).includes(rawFingers)
        ? rawFingers
        : DEFAULT_FINGER_COUNT;
    return {
        pageIndex: page - 1,
        pageSize,
        search: sp.get("q") ?? "",
        fingerCount,
    };
}

const Students = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth()
    const { pageIndex, pageSize, search, fingerCount } = useMemo(
        () => listParamsFromUrl(searchParams),
        [searchParams],
    );

    const [news, setNews] = useState({
        loading: true,
        data: [] as StudentPdfRecord[],
    });
    const [meta, setMeta] = useState<ListMeta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [exporting, setExporting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    /** Keep page / limit / search / finger columns in the URL so Back restores this list. */
    function setListParams(patch: {
        pageIndex?: number;
        pageSize?: number;
        search?: string;
        fingerCount?: number;
    }) {
        setSearchParams(
            (prev) => {
                const next = listParamsFromUrl(prev);
                const pageIndex = patch.pageIndex ?? next.pageIndex;
                const pageSize = patch.pageSize ?? next.pageSize;
                const search = patch.search ?? next.search;
                const fingerCount = patch.fingerCount ?? next.fingerCount;
                const sp = new URLSearchParams();
                if (pageIndex > 0) sp.set("page", String(pageIndex + 1));
                if (pageSize !== 10) sp.set("limit", String(pageSize));
                if (search.trim()) sp.set("q", search);
                if (fingerCount !== DEFAULT_FINGER_COUNT) {
                    sp.set("fingers", String(fingerCount));
                }
                return sp;
            },
            { replace: true },
        );
    }

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

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setNews((prev) => ({ ...prev, loading: true }));
        try {
            const res = await Api.get("api/student", {
                params: {
                    page: pageIndex + 1,
                    limit: pageSize,
                    search: search.trim() || undefined,
                },
            });
            setNews({
                loading: false,
                data: res.data.data ?? [],
            });
            if (res.data.meta) {
                setMeta(res.data.meta);
            }
            if (!silent) setSelectedIds(new Set());
        } catch {
            toast.error("Failed to load students");
            setNews((prev) => ({ ...prev, loading: false }));
        }
    }, [pageIndex, pageSize, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Silent refetch on focus so edits from view-student show up without stale blobs.
    useEffect(() => {
        const onFocus = () => fetchData(true);
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [fetchData]);

    async function handleExportPdf() {
        setExporting(true);
        try {
            // Full list for this user (ignores current page/search).
            const res = await Api.get("api/student", {
                params: { all: true },
                timeout: 180_000,
            });
            const allStudents = (res.data.data ?? []) as StudentPdfRecord[];
            if (allStudents.length === 0) {
                toast.error("No students to export");
                return;
            }
            await exportStudentsPdf(allStudents);
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

    const columns = useMemo(
        () => [
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
                    <span className="font-medium text-slate-400">
                        {pageIndex * pageSize + cell.row.index + 1}
                    </span>
                ),
            },
            {
                Header: "Name",
                accessor: "name",
                Cell: (cell: any) => (
                    <span className="font-semibold text-slate-900">{cell.value}</span>
                ),
            },
            {
                Header: "Batch",
                accessor: "batch.name",
                Cell: (cell: any) => (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {cell.row.original.batch?.name}
                    </span>
                ),
            },
            ...Array.from({ length: fingerCount }, (_, i) => i + 1).map((n) => ({
                Header: `F${n}`,
                accessor: `finger${n}`,
                Cell: (cell: any) => {
                    const enhanced = cell.row.original[`finger${n}Enhanced`] as
                        | string
                        | undefined;
                    const src = (enhanced?.trim() ? enhanced : cell.value) as
                        | string
                        | undefined;
                    return src ? (
                        <FingerprintImage src={src} className="rounded-lg" />
                    ) : (
                        <span className="text-slate-300">—</span>
                    );
                },
            })),
            {
                Header: "Actions",
                accessor: "action",
                Cell: (cell: any) => (
                    <span className="flex items-center gap-2">
                        {canPerform(user, "view") && (
                            <Badge
                                onClick={() =>
                                    navigate(`/view-student/${cell.row.original.id}`)
                                }
                                type={enums.BLUE}
                            >
                                View
                            </Badge>
                        )}
                        {canPerform(user, "edit") && (
                            <Badge
                                onClick={() => navigate(`/student/${cell.row.original.id}`)}
                                type={enums.GREEN}
                            >
                                Edit
                            </Badge>
                        )}
                        {canPerform(user, "delete") && (
                            <Badge
                                onClick={async () => {
                                    if (!window.confirm("Delete this student?")) return;
                                    try {
                                        const res = await Api.delete(
                                            `api/student/${cell.row.original.id}`,
                                        );
                                        toast.success(res.data.message);
                                        setSelectedIds((prev) => {
                                            const next = new Set(prev);
                                            next.delete(cell.row.original.id);
                                            return next;
                                        });
                                        await fetchData(true);
                                    } catch (error: any) {
                                        toast.error(
                                            error.response?.data?.message ?? "Delete failed",
                                        );
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
        ],
        [
            allSelected,
            someSelected,
            selectedIds,
            pageIndex,
            pageSize,
            fingerCount,
            user,
            navigate,
            fetchData,
        ],
    );

    return news.loading && news.data.length === 0 ? (
        <Loader />
    ) : (
        <>
        <Table
            serverSide
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={meta.totalPages}
            totalCount={meta.total}
            searchValue={search}
            onSearchChange={(value: string) => {
                setListParams({ search: value, pageIndex: 0 });
            }}
            onPageChange={(index: number) => setListParams({ pageIndex: index })}
            onPageSizeChange={(size: number) => {
                setListParams({ pageSize: size, pageIndex: 0 });
            }}
            headerActions={
                <>
                    <label className="flex w-full items-center gap-2 text-sm text-slate-600 sm:w-auto">
                        <span className="whitespace-nowrap">Show fingers</span>
                        <select
                            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={fingerCount}
                            onChange={(e) =>
                                setListParams({ fingerCount: Number(e.target.value) })
                            }
                            aria-label="Number of fingerprint columns to show"
                        >
                            {FINGER_COUNTS.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </label>
                    {canPerform(user, "view") && (
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
                                disabled={exporting || meta.total === 0}
                                onClick={handleExportPdf}
                            >
                                <FileDown className="h-4 w-4" />
                                {exporting ? "Exporting…" : "Export PDF"}
                            </Button>
                        </>
                    )}
                </>
            }
            btnText={canPerform(user, 'add') ? "Add student" : undefined}
            btnfunc={canPerform(user, 'add') ? () => navigate("/student/add") : undefined}
            title="Students"
            subtitle="Registered students with captured fingerprints"
            dataName="students"
            data={news.data}
            columns={columns}
        />
        </>
    );
}

export default Students
