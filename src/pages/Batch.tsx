import Badge, { enums } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        setNews(prev => ({
            ...prev,
            loading: true
        }))
        try {
            const res: any = await Api.get("api/batch")
            setNews(prev => ({
                ...prev,
                data: res.data.data
            }))
        } catch (error) {

        } finally {
            setNews(prev => ({
                ...prev,
                loading: false
            }))
        }
    }

    useEffect(() => {
        fetchData()
    }, [])


    function renderModal() {
        const { state, edit_id, data } = modal;

        return (
            <Modal
                title="Add Batch"
                open={state}
                setOpen={() => setModal(initialModalState)}
            >
                <Formik
                    initialValues={data}
                    onSubmit={async (values: any, action: any) => {

                        try {
                            if (edit_id) {
                                const res = await Api.patch(`api/batch/${edit_id}`, values);
                                if (res) toast.success(res.data.message);
                                fetchData()
                                setModal(initialModalState);
                            } else {
                                const res = await Api.post(`api/batch`, values);
                                if (res) toast.success(res.data.message);
                                setNews((prev: any) => ({
                                    ...prev,
                                    data: [...prev.data, res.data.data],
                                }));
                                setModal(initialModalState);
                            }
                        } catch (error: any) {
                            toast.error(error.response.data.message);
                        } finally {
                            action.resetForm();
                            action.setSubmitting(false);
                        }
                    }}
                >
                    {(formik: any) => (
                        <form
                            onSubmit={formik.handleSubmit}
                            className="w-full pt-4 rounded-b-md pb-8 flex flex-col gap-4 px-4 bg-white"
                        >
                            <Input name="name" label="Name" placeholder="Batch name" type="text" required onChange={formik.handleChange} value={formik.values.name} />
                            <Button
                                disabled={formik.isSubmitting}
                                size={"lg"}
                                type={"submit"}
                            >
                                {modal.edit_id ? "Update" : "Create"}
                            </Button>
                        </form>
                    )}
                </Formik>
            </Modal>
        );
    }

    const columns = () => [
        {
            Header: "Sr.No",
            accessor: "d",
            Cell: (cell: any) => (
                cell.row.index + 1
            )
        },
        {
            Header: "Name",
            accessor: "name",
        },
        {
            Header: "no of students",
            accessor: "_count.students",
        },
        {
            Header: "Action",
            accessor: "action",
            Cell: (cell: any) => (
                <span className="flex items-center justify-start gap-4">
                    <Badge onClick={() => {
                        setModal((prev) => ({
                            ...prev,
                            state: true,
                            edit_id: cell.row.original.id,
                            data: cell.row.original,
                        }));
                    }} type={enums.GREEN}>
                        Edit
                    </Badge>
                    <Badge
                        onClick={async () => {
                            const confirm = window.confirm("Are you sure you want to delete this?");
                            try {
                                if (confirm) {
                                    const res = await Api.delete(`api/batch/${cell.row.original.id}`);
                                    if (res) toast.success(res.data.message);
                                    setNews((prev: any) => ({
                                        ...prev,
                                        data: prev.data?.filter((n: any) => n.id !== cell.row.original.id),
                                    }));
                                }

                            } catch (error: any) {
                                toast.error(error.response.data.message);
                            }
                        }
                        }
                        type={enums.RED}
                    >
                        Delete
                    </Badge>
                </span>
            ),
        },
    ];

    return <>
        {renderModal()}
        <Table
            btnText={"Add Batch"}
            btnfunc={() =>
                setModal((prev) => ({
                    ...prev,
                    state: true,
                    data: initialModalState.data,
                }))
            }
            title="Batch"
            subtitle={"List of all the batchs"}
            dataName={"Batchs"}
            data={news.data}
            columns={columns()}
        />
    </>
}

export default Batch