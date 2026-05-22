import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Fingerprint } from "lucide-react"
import { toast } from "react-hot-toast"
import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import Api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import { CaptureFinger } from '@/utiles/scanner'
import PageHeader from '@/components/ui/PageHeader';
import FingerprintSlot from '@/components/ui/FingerprintSlot';
import Loader from '@/components/ui/Loader';

const initialState = {
    name: "",
    mobile: "",
    batchId: "",
    address: "",
    finger1: "",
    finger2: "",
    finger3: "",
    finger4: "",
    finger5: "",
};

const fingerKeys = ['finger1', 'finger2', 'finger3', 'finger4', 'finger5'] as const;

const AddStudent = () => {
    const { event } = useParams()
    const navigate = useNavigate()
    const isAdd = event === "add"
    const [formState, setFormState] = useState(initialState)
    const [batches, setBatches] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchBatches() {
        try {
            const res = await Api.get("api/batch")
            setBatches(res.data.data)
        } catch {
            toast.error("Failed to load batches")
        }
    }

    async function getFingerPrint() {
        try {
            const fprint = await CaptureFinger(60, 5000)
            if (!fprint.httpStatus || !fprint.data?.BitmapData) {
                toast.error("Fingerprint capture failed")
                return
            }
            return fprint.data.BitmapData
        } catch {
            toast.error("Scanner drivers not installed correctly")
        }
    }

    async function fetchStudent() {
        try {
            const res = await Api.get(`api/student/${event}`)
            setFormState({ ...res.data.data })
        } catch {
            toast.error("Student not found")
            navigate(-1)
        }
    }

    useEffect(() => {
        Promise.all([
            fetchBatches(),
            !isAdd ? fetchStudent() : Promise.resolve(),
        ]).finally(() => setLoading(false))
    }, [event])

    if (loading) return <Loader />

    return (
        <div className="space-y-6">
            <PageHeader
                title={isAdd ? "Add student" : "Edit student"}
                subtitle="Enter details and capture all five fingerprints"
                action={
                    <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                }
            />

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
                <Formik
                    initialValues={formState}
                    enableReinitialize
                    onSubmit={async (values, action) => {
                        try {
                            if (!isAdd) {
                                const res = await Api.put(`api/student/${event}`, values);
                                toast.success(res.data.message);
                            } else {
                                const res = await Api.post(`api/student`, values);
                                toast.success(res.data.message);
                            }
                            navigate("/student")
                        } catch (error: unknown) {
                            const err = error as { response?: { data?: { message?: string } } };
                            toast.error(err.response?.data?.message ?? "Save failed");
                        } finally {
                            action.setSubmitting(false);
                        }
                    }}
                >
                    {(formik) => (
                        <form onSubmit={formik.handleSubmit} className="space-y-8">
                            <section>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                                    Personal information
                                </h3>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        name="name"
                                        label="Full name"
                                        placeholder="Student name"
                                        required
                                        onChange={formik.handleChange}
                                        value={formik.values.name}
                                    />
                                    <Input
                                        name="mobile"
                                        label="Phone number"
                                        placeholder="10-digit mobile"
                                        required
                                        onChange={formik.handleChange}
                                        value={formik.values.mobile}
                                    />
                                    <Select
                                        name="batchId"
                                        label="Batch"
                                        onChange={formik.handleChange}
                                        value={formik.values.batchId}
                                        required
                                    >
                                        <option value="">Select a batch</option>
                                        {batches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </Select>
                                    <div className="sm:col-span-2">
                                        <Textarea
                                            name="address"
                                            label="Address"
                                            placeholder="Full address"
                                            rows={3}
                                            required
                                            onChange={formik.handleChange}
                                            value={formik.values.address}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2">
                                    <Fingerprint className="h-5 w-5 text-indigo-600" />
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                        Fingerprint capture
                                    </h3>
                                </div>
                                <p className="mb-5 text-sm text-slate-500">
                                    Ensure MFS100 drivers are installed. Capture each finger in order.
                                </p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                                    {fingerKeys.map((key, i) => (
                                        <FingerprintSlot
                                            key={key}
                                            label={`Finger ${i + 1}`}
                                            value={formik.values[key]}
                                            onCapture={async () => {
                                                const print = await getFingerPrint()
                                                if (print) {
                                                    formik.setFieldValue(key, print)
                                                    toast.success(`Finger ${i + 1} captured`)
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </section>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={formik.isSubmitting}
                                    type="submit"
                                    className="min-w-[140px]"
                                >
                                    {formik.isSubmitting
                                        ? "Saving…"
                                        : isAdd
                                          ? "Create student"
                                          : "Save changes"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default AddStudent
