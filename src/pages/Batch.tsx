import Badge, { enums } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/Loader";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table"
import Api from "@/lib/api";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const initialModalState = {
    state: false,
    edit_id: "",
    data: {
        name: "",
    },
};

const Batch = () => {
    const [modal, setModal] = useState(initialModalState);

    const [news, setNews] = useState({
        loading: true,
        data: [],
    });

    async function fetchData() {
        setNews(prev => ({ ...prev, loading: true }))
        try {
            const res: any = await Api.get("api/batch")
            setNews(prev => ({ ...prev, data: res.data.data }))
        } catch {
            toast.error("Failed to load batches");
        } finally {
            setNews(prev => ({ ...prev, loading: false }))
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    function closeModal() {
        setModal(initialModalState);
    }

    function renderModal() {
        const { state, edit_id, data } = modal;

        return (
            <Modal
                title={edit_id ? "Edit batch" : "Create batch"}
                open={state}
                setOpen={(open) => !open && closeModal()}
            >
                <Formik
                    initialValues={data}
                    enableReinitialize
                    onSubmit={async (values: any, action: any) => {
                        try {
                            if (edit_id) {
                                const res = await Api.patch(`api/batch/${edit_id}`, values);
                                toast.success(res.data.message);
                                fetchData()
                                closeModal();
                            } else {
                                const res = await Api.post(`api/batch`, values);
                                toast.success(res.data.message);
                                setNews((prev: any) => ({
                                    ...prev,
                                    data: [...prev.data, res.data.data],
                                }));
                                closeModal();
                            }
                        } catch (error: any) {
                            toast.error(error.response?.data?.message ?? "Request failed");
                        } finally {
                            action.setSubmitting(false);
                        }
                    }}
                >
                    {(formik: any) => (
                        <form onSubmit={formik.handleSubmit} className="space-y-5">
                            <Input
                                name="name"
                                label="Batch name"
                                placeholder="e.g. Morning batch 2025"
                                type="text"
                                required
                                onChange={formik.handleChange}
                                value={formik.values.name}
                            />
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={formik.isSubmitting}
                                    className="flex-1"
                                    type="submit"
                                >
                                    {edit_id ? "Save changes" : "Create batch"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </Modal>
        );
    }

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
            Header: "Students",
            accessor: "_count.students",
            Cell: (cell: any) => (
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {cell.value ?? 0}
                </span>
            )
        },
        {
            Header: "Actions",
            accessor: "action",
            Cell: (cell: any) => (
                <span className="flex items-center gap-2">
                    <Badge onClick={() => {
                        setModal({
                            state: true,
                            edit_id: cell.row.original.id,
                            data: { name: cell.row.original.name },
                        });
                    }} type={enums.GREEN}>
                        Edit
                    </Badge>
                    <Badge
                        onClick={async () => {
                            if (!window.confirm("Delete this batch and all its students?")) return;
                            try {
                                const res = await Api.delete(`api/batch/${cell.row.original.id}`);
                                toast.success(res.data.message);
                                setNews((prev: any) => ({
                                    ...prev,
                                    data: prev.data?.filter((n: any) => n.id !== cell.row.original.id),
                                }));
                            } catch (error: any) {
                                toast.error(error.response?.data?.message ?? "Delete failed");
                            }
                        }}
                        type={enums.RED}
                    >
                        Delete
                    </Badge>
                </span>
            ),
        },
    ];

    return (
        <>
            {renderModal()}
            {news.loading ? (
                <Loader />
            ) : (
                <Table
                    btnText="Add batch"
                    btnfunc={() =>
                        setModal({
                            state: true,
                            edit_id: "",
                            data: initialModalState.data,
                        })
                    }
                    title="Batches"
                    subtitle="Create and manage your training batches"
                    dataName="batches"
                    data={news.data}
                    columns={columns()}
                />
            )}
        </>
    );
}

export default Batch
