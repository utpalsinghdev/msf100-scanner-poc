import { Button } from "@/components/ui/button"
import Api from "@/lib/api"
import PageHeader from "@/components/ui/PageHeader"
import Loader from "@/components/ui/Loader"
import FingerprintEditorModal, {
    type FingerKey,
} from "@/components/students/FingerprintEditorModal"
import { ArrowLeft, Pencil } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { canPerform } from "@/lib/permissions"
import { FingerprintImage } from "@/components/ui/FingerprintImage"
import { enhancedFingerKey, enhancedImageSrc } from "@/lib/enhanceFingerprint"

const FINGER_KEYS: FingerKey[] = [
    "finger1",
    "finger2",
    "finger3",
    "finger4",
    "finger5",
]

const ViewStudent = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [data, setData] = useState<Record<string, unknown>>({})
    const [loading, setLoading] = useState(true)
    const [editor, setEditor] = useState<{
        key: FingerKey
        label: string
        image: string
        enhanced?: string
    } | null>(null)

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

    useEffect(() => {
        function onEnhanced(e: Event) {
            const { studentId } = (e as CustomEvent<{ studentId: string }>).detail
            if (studentId === id) fetchStudent()
        }
        window.addEventListener("fingerprints-enhanced", onEnhanced)
        return () => window.removeEventListener("fingerprints-enhanced", onEnhanced)
    }, [id])

    function handleFingerSaved(_fingerKey: FingerKey, imageBase64: string, saveKey: string) {
        setData((prev) => ({ ...prev, [saveKey]: imageBase64 }))
    }

    if (loading) return <Loader />

    const batch = data.batch as { name?: string } | undefined
    const canEdit = canPerform(user, "edit")

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
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:col-span-1">
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

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Fingerprints
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {FINGER_KEYS.map((key, index) => {
                            const src = data[key] as string | undefined
                            const enhancedKey = enhancedFingerKey(key)
                            const enhancedSrc = data[enhancedKey] as string | undefined
                            const label = `Finger ${index + 1}`
                            const alreadyEnhanced = Boolean(enhancedSrc)

                            const displaySrc = alreadyEnhanced
                                ? enhancedImageSrc(enhancedSrc)
                                : src

                            return (
                                <div
                                    key={key}
                                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                                >
                                    <div className="relative">
                                        {alreadyEnhanced ? (
                                            <div
                                                className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-indigo-300"
                                                style={{ width: 138, height: 155 }}
                                            >
                                                <img
                                                    src={displaySrc}
                                                    alt={label}
                                                    width={138}
                                                    height={155}
                                                    className="h-full w-full object-contain"
                                                    draggable={false}
                                                />
                                            </div>
                                        ) : (
                                            <FingerprintImage src={src} alt={label} />
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">
                                        {label}
                                    </span>
                                    {canEdit && src && (
                                        <div className="flex w-full flex-col gap-1.5">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-1.5"
                                                onClick={() =>
                                                    setEditor({ key, label, image: src, enhanced: enhancedSrc })
                                                }
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit image
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {editor && id && (
                <FingerprintEditorModal
                    open={Boolean(editor)}
                    onClose={() => setEditor(null)}
                    studentId={id}
                    fingerKey={editor.key}
                    fingerLabel={editor.label}
                    imageBase64={editor.image}
                    enhancedBase64={editor.enhanced}
                    onSaved={handleFingerSaved}
                />
            )}
        </div>
    )
}

export default ViewStudent
