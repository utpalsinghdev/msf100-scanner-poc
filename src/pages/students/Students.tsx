import Badge, { enums } from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/Table"
import Api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const Students = () => {
    const navigate = useNavigate()
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
            const res: any = await Api.get("api/student")
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
            Header: "batch",
            accessor: "batch.name",
        },
        {
            Header: "finger1",
            accessor: "finger1",
            Cell: (cell: any) => (
                <img draggable={false} src={`data:image/png;base64,${cell.row.original.finger1}`} className="w-12" alt='inf' />
            )
        },
        {
            Header: "finger2",
            accessor: "finger2",
            Cell: (cell: any) => (
                <img draggable={false} src={`data:image/png;base64,${cell.row.original.finger2}`} className="w-12" alt='inf' />
            )
        },
        {
            Header: "finger3",
            accessor: "finger3",
            Cell: (cell: any) => (
                <img draggable={false} src={`data:image/png;base64,${cell.row.original.finger3}`} className="w-12" alt='inf' />
            )
        },
        {
            Header: "finger4",
            accessor: "finger4",
            Cell: (cell: any) => (
                <img draggable={false} src={`data:image/png;base64,${cell.row.original.finger4}`} className="w-12" alt='inf' />
            )
        },
        {
            Header: "finger5",
            accessor: "finger5",
            Cell: (cell: any) => (
                <img draggable={false} src={`data:image/png;base64,${cell.row.original.finger5}`} className="w-12" alt='inf' />
            )
        },
        {
            Header: "Action",
            accessor: "action",
            Cell: (cell: any) => (
                <span className="flex items-center justify-start gap-4">
                    <Badge onClick={() => {
                        navigate(`/view-student/${cell.row.original.id}`)
                    }} type={enums.BLUE}>
                        View
                    </Badge>
                    <Badge onClick={() => {
                        navigate(`/student/${cell.row.original.id}`)
                    }} type={enums.GREEN}>
                        Edit
                    </Badge>
                    <Badge
                        onClick={async () => {
                            const confirm = window.confirm("Are you sure you want to delete this?");
                            try {
                                if (confirm) {
                                    const res = await Api.delete(`api/student/${cell.row.original.id}`);
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
        {news.loading ? <Loader /> : <Table
            btnText={"Add Student"}
            btnfunc={() =>
                navigate("/student/add")
            }
            title="Student"
            subtitle={"List of all the students"}
            dataName={"students"}
            data={news.data}
            columns={columns()}
        />}
    </>
}

export default Students