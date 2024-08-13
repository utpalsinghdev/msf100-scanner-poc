import Badge, { enums } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table"
import Api from "@/lib/api";
import { Formik } from "formik";
import { useState } from "react";
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
                                const res = await Api.patch(`api/investment/${edit_id}`, values);
                                if (res) toast.success(res.data.message);
                                setNews((prev: any) => ({
                                    ...prev,
                                    data: prev.data?.map((n: any) =>
                                        n.id === +edit_id ? res.data.data : n
                                    ),
                                }));
                                setModal(initialModalState);
                            } else {
                                const res = await Api.post(`api/investment`, values);
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
                cell.row.index
            )
        },
        {
            Header: "Name",
            accessor: "name",
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
                                    const res = await Api.delete(`api/investment/${cell.row.original.id}`);
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