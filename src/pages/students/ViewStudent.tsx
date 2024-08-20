import { Button } from "@/components/ui/button"
import Api from "@/lib/api"
import { CornerUpLeft } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"

const ViewStudent = () => {

    const { id } = useParams()

    const [data, setData] = useState<any>({
        data: {},
        loading: true
    })

    async function fetchStudent() {
        try {
            const res = await Api.get(`api/student/${id}`)
            setData(() => ({
                loading: false,
                data: res.data.data
            }))
        } catch (error) {
            toast.error("Student Not Found")
        }
    }

    useEffect(() => {
        fetchStudent()
    }, [id])
    const navigate = useNavigate()

    return (
        <div>
            <Button
                variant={"secondary"}
                type='button'
                onClick={() => {
                    navigate(-1)
                }}
                className="flex flex-row gap-1"
            >
                <CornerUpLeft /> Back
            </Button>
            <div
                className="text-xl mt-4 font-semibold bg-gray-200 p-4 rounded-md border border-black flex flex-col gap-2"
            >
                <h1>
                    Name : {data.data?.name}
                </h1>
                <h1>
                    batch :  {data.data?.batch?.name}
                </h1>
                <h1>
                    phone {data.data?.mobile}
                </h1>
                <h1>
                    Address {data.data?.address}
                </h1>
            </div>
            <h1 className="mt-4 text-2xl font-bold">
                Finger List
            </h1>

            <div className='grid mt-4 mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
                {/* Fingers */}

                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                    <img
                        src={`data:image/png;base64,${data.data.finger1}`}
                        alt='inf'
                        style={{ filter: 'invert(100%) brightness(200%)' }}
                    />
                    <span className="font-bold">Finger 1</span>
                </div>
                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                    <img
                        src={`data:image/png;base64,${data.data.finger2}`}
                        alt='inf'
                        style={{ filter: 'invert(100%) brightness(200%)' }}
                    />
                    <span className="font-bold">Finger 2</span>
                </div>
                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                    <img
                        src={`data:image/png;base64,${data.data.finger3}`}
                        alt='inf'
                        style={{ filter: 'invert(100%) brightness(200%)' }}
                    />
                    <span className="font-bold">Finger 3</span>
                </div>
                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                    <img
                        src={`data:image/png;base64,${data.data.finger4}`}
                        alt='inf'
                        style={{ filter: 'invert(100%) brightness(200%)' }}
                    />
                    <span className="font-bold">Finger 4</span>
                </div>
                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                    <img
                        src={`data:image/png;base64,${data.data.finger5}`}
                        alt='inf'
                        style={{ filter: 'invert(100%) brightness(200%)' }}
                    />
                    <span className="font-bold">Finger 5</span>
                </div>

            </div>
        </div>
    )
}

export default ViewStudent