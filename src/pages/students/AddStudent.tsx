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
import MediaPickerModal from '@/components/media/MediaPickerModal';
import EnhancingOverlay from '@/components/students/EnhancingOverlay';

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

/** Gateway often kills long enhance (nginx ~60s). Retry same payload a few times. */
const CREATE_MAX_ATTEMPTS = 3;
const CREATE_RETRY_DELAY_MS = 2_000;

function isGatewayTimeout(error: unknown): boolean {
    const err = error as {
        response?: { status?: number };
        code?: string;
        message?: string;
    };
    if (err.response?.status === 504) return true;
    // Proxy may drop the connection with no status
    if (err.code === 'ECONNABORTED') return true;
    const msg = String(err.message ?? '').toLowerCase();
    return msg.includes('timeout') || msg.includes('504');
}

async function createStudentWithRetry(values: typeof initialState) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= CREATE_MAX_ATTEMPTS; attempt++) {
        try {
            return await Api.post(`api/student`, values, {
                timeout: 180_000, // enhance all 5 fingers server-side
            });
        } catch (error) {
            lastError = error;
            if (!isGatewayTimeout(error) || attempt === CREATE_MAX_ATTEMPTS) {
                throw error;
            }
            toast(`Gateway timeout — retrying (${attempt}/${CREATE_MAX_ATTEMPTS - 1})…`);
            await new Promise((r) => setTimeout(r, CREATE_RETRY_DELAY_MS));
        }
    }
    throw lastError;
}

const AddStudent = () => {
    const { event } = useParams()
    const navigate = useNavigate()
    const isAdd = event === "add"
    const [formState, setFormState] = useState(initialState)
    const [batches, setBatches] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [browseFinger, setBrowseFinger] = useState<(typeof fingerKeys)[number] | null>(null)

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
                toast.error(fprint.err || "Fingerprint capture failed")
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
            <Formik
                initialValues={formState}
                enableReinitialize
                onSubmit={async (values, action) => {
                    try {
                        if (!isAdd) {
                            const res = await Api.put(`api/student/${event}`, values);
                            toast.success(res.data.message);
                        } else {
                            const res = await createStudentWithRetry(values);
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
                {(formik) => {
                    const busy = formik.isSubmitting;
                    const showEnhanceOverlay = isAdd && busy;

                    return (
                        <>
                        <EnhancingOverlay open={showEnhanceOverlay} />

                        <fieldset disabled={busy} className="min-w-0 space-y-6 border-0 p-0">
                            <PageHeader
                                title={isAdd ? "Add student" : "Edit student"}
                                subtitle="Enter details and capture all five fingerprints"
                                action={
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                        className="gap-2"
                                        disabled={busy}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back
                                    </Button>
                                }
                            />

                            <div className="surface-card p-4 sm:p-6 lg:p-8">
                                <form onSubmit={formik.handleSubmit} className="space-y-8">
                                    <section>
                                        <h3 className="section-label mb-4">
                                            Personal information
                                        </h3>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <Input
                                                name="name"
                                                label="Full name"
                                                placeholder="Student name"
                                                required
                                                disabled={busy}
                                                onChange={formik.handleChange}
                                                value={formik.values.name}
                                            />
                                            <Input
                                                name="mobile"
                                                label="Registration ID"
                                                placeholder="Registration ID"
                                                required
                                                disabled={busy}
                                                onChange={formik.handleChange}
                                                value={formik.values.mobile}
                                            />
                                            <Select
                                                name="batchId"
                                                label="Batch"
                                                onChange={formik.handleChange}
                                                value={formik.values.batchId}
                                                required
                                                disabled={busy}
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
                                                    placeholder="Full address (optional)"
                                                    rows={3}
                                                    disabled={busy}
                                                    onChange={formik.handleChange}
                                                    value={formik.values.address}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="mb-4 flex items-center gap-2">
                                            <Fingerprint className="h-5 w-5 text-indigo-600" />
                                            <h3 className="section-label">
                                                Fingerprint capture
                                            </h3>
                                        </div>
                                        <p className="mb-5 text-sm text-slate-500">
                                            Capture from the scanner or browse images uploaded in Media.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                                            {fingerKeys.map((key, i) => (
                                                <FingerprintSlot
                                                    key={key}
                                                    label={`Finger ${i + 1}`}
                                                    value={formik.values[key]}
                                                    disabled={busy}
                                                    onCapture={async () => {
                                                        if (busy) return
                                                        const print = await getFingerPrint()
                                                        if (print) {
                                                            formik.setFieldValue(key, print)
                                                            toast.success(`Finger ${i + 1} captured`)
                                                        }
                                                    }}
                                                    onBrowse={() => {
                                                        if (busy) return
                                                        setBrowseFinger(key)
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </section>

                                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={busy}
                                            onClick={() => navigate(-1)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={busy}
                                            type="submit"
                                            className="min-w-[140px]"
                                        >
                                            {busy
                                                ? isAdd
                                                  ? "Processing…"
                                                  : "Saving…"
                                                : isAdd
                                                  ? "Create student"
                                                  : "Save changes"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </fieldset>

                        <MediaPickerModal
                            open={Boolean(browseFinger) && !busy}
                            onClose={() => setBrowseFinger(null)}
                            title={
                                browseFinger
                                    ? `Browse media for Finger ${browseFinger.replace('finger', '')}`
                                    : 'Select from media'
                            }
                            onSelect={(image) => {
                                if (!browseFinger || busy) return
                                formik.setFieldValue(browseFinger, image)
                                toast.success(`Finger ${browseFinger.replace('finger', '')} selected from media`)
                            }}
                        />
                        </>
                    );
                }}
            </Formik>
        </div>
    )
}

export default AddStudent
