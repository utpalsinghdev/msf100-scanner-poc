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

            <div className='grid mt-4 w-max mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10'>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div className='border border-black w-max flex items-center flex-col gap-3 p-2 rounded-md'>
                        <img
                            className="w-[100px] h-[110px]"
                            src={`data:image/png;base64,${data.data[`finger${index + 1}`]}`}
                            alt='inf'
                            style={{
                                filter: 'invert(100%) brightness(80%)',
                                mixBlendMode: 'hard-light'

                            }}
                        />
                        <span className="font-bold">Finger {index + 1}</span>
                    </div>
                ))}


            </div>
        </div>
    )
}

export default ViewStudent