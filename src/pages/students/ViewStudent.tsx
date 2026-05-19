import { Button } from "@/components/ui/button"
import Api from "@/lib/api"
import PageHeader from "@/components/ui/PageHeader"
import Loader from "@/components/ui/Loader"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"

const fingerStyle = {
    filter: 'invert(55%) sepia(25%) saturate(400%) hue-rotate(200deg)',
};

const ViewStudent = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<Record<string, unknown>>({})
    const [loading, setLoading] = useState(true)

    async function fetchStudent() {
        try {
            const res = await Api.get(`api/student/${id}`)
            setData(res.data.data)
        } catch {
            toast.error("Student not found")
            navigate(-1)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudent()
    }, [id])

    if (loading) return <Loader />

    const batch = data.batch as { name?: string } | undefined

    return (
        <div className="space-y-6">
            <PageHeader
                title={String(data.name ?? "Student")}
                subtitle="Student profile and fingerprint records"
                action={
                    <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-1">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Details
                    </h3>
                    <dl className="space-y-4 text-sm">
                        <div>
                            <dt className="text-slate-500">Batch</dt>
                            <dd className="mt-0.5 font-semibold text-slate-900">{batch?.name}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Phone</dt>
                            <dd className="mt-0.5 font-semibold text-slate-900">{String(data.mobile)}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Address</dt>
                            <dd className="mt-0.5 text-slate-800">{String(data.address)}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Fingerprints
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const key = `finger${index + 1}`
                            const src = data[key] as string | undefined
                            return (
                                <div
                                    key={key}
                                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                                >
                                    <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                                        {src ? (
                                            <img
                                                className="h-full max-h-24 object-contain"
                                                src={`data:image/png;base64,${src}`}
                                                alt={`Finger ${index + 1}`}
                                                style={fingerStyle}
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-400">N/A</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">
                                        Finger {index + 1}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewStudent
