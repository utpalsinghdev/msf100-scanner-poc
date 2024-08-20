import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import { CornerUpLeft, Fingerprint } from "lucide-react"
import { toast } from "react-hot-toast"
import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import Api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CaptureFinger } from '@/utiles/scanner'
import Select from '@/components/ui/select';

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

const AddStudent = () => {
    const { event } = useParams()
    const navigate = useNavigate()
    const [formState, setFormState] = useState(initialState)

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

    async function getFingerPrint() {
        try {
            //@ts-ignore
            const fprint = await new CaptureFinger(1, 5000)
            return fprint.data.BitmapData
        } catch (error) {
            toast.error("Drivers not installed Correctly")
        }
    }

    async function fetchStudent() {
        try {
            const res = await Api.get(`api/student/${event}`)
            setFormState(() => ({
                ...res.data.data
            }))

        } catch (error) {
            toast.error("Student Not found")
            navigate(-1)
        }
    }

    useEffect(() => {
        if (event !== "add") {
            fetchStudent()
        }
    }, [event])


    return (
        <div>
            <h2
                className='text-xl font-bold flex flex-row gap-2 items-center'
            >
                <Button
                    variant={"secondary"}
                    type='button'
                    onClick={() => {
                        navigate(-1)
                    }}
                >
                    <CornerUpLeft />
                </Button>    {event === "add" ? "Add" : "Edit"} Student
            </h2>

            <div className='w-full flex flex-col gap-3'>
                <Formik
                    initialValues={formState}
                    enableReinitialize
                    onSubmit={async (values: any, action: any) => {
                        console.log(values.batchId)
                        try {
                            if (event !== "add") {
                                const res = await Api.put(`api/student/${event}`, values);
                                if (res) toast.success(res.data.message);
                                navigate(-1)
                            } else {
                                const res = await Api.post(`api/student`, values);
                                if (res) toast.success(res.data.message);
                                navigate(-1)
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
                            <Input name="name" label="Name" placeholder="Student name" type="text" required onChange={formik.handleChange} value={formik.values.name} />
                            <Input name="mobile" label="Phone Number" placeholder="+91 " type="text" required onChange={formik.handleChange} value={formik.values.mobile} />
                            <Select
                                name="batchId"
                                label="Batch"
                                onChange={formik.handleChange}
                                value={formik.values.batchId}
                                required
                            >
                                <option
                                >
                                    Select Batch
                                </option>
                                {news.data.map((b: any) => (
                                    <option
                                        key={b.id}
                                        value={b.id}
                                    >
                                        {b.name}
                                    </option>
                                ))}
                            </Select>
                            <Textarea name="address" label="Address" placeholder="address " rows={4} required onChange={formik.handleChange} value={formik.values.address} />
                            <Label className='text-md font-bold'>Fingers</Label>

                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
                                {/* Fingers */}

                                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                                    {formik.values.finger1 ? <img style={{ filter: 'invert(100%) brightness(200%)' }} src={`data:image/png;base64,${formik.values.finger1}`} alt='inf' /> : <Fingerprint width={104} height={104} />}
                                    <Button
                                        variant={"secondary"}
                                        type='button'
                                        onClick={async () => {
                                            try {
                                                const print = await getFingerPrint()
                                                if (print == undefined) {
                                                    toast.error("Device Not Found or Drivers are not installed")
                                                } else {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        finger1: print
                                                    })
                                                }
                                            } catch (error) {
                                                toast.error("Drivers not installed")

                                            }
                                        }}
                                        className='w-full border border-black hover:bg-gray-300' >
                                        Finger 1
                                    </Button>
                                </div>
                                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                                    {formik.values.finger2 ? <img style={{ filter: 'invert(100%) brightness(200%)' }} src={`data:image/png;base64,${formik.values.finger2}`} alt='inf' /> : <Fingerprint width={104} height={104} />}

                                    <Button
                                        variant={"secondary"}
                                        type='button'
                                        onClick={async () => {
                                            try {
                                                const print = await getFingerPrint()
                                                if (print == undefined) {
                                                    toast.error("Device Not Found or Drivers are not installed")
                                                } else {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        finger2: print
                                                    })
                                                }
                                            } catch (error) {
                                                toast.error("Drivers not installed")

                                            }
                                        }}
                                        className='w-full border border-black hover:bg-gray-300' >
                                        Finger 2
                                    </Button>
                                </div>
                                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                                    {formik.values.finger3 ? <img style={{ filter: 'invert(100%) brightness(200%)' }} src={`data:image/png;base64,${formik.values.finger3}`} alt='inf' /> : <Fingerprint width={104} height={104} />}
                                    <Button
                                        variant={"secondary"}
                                        type='button'
                                        onClick={async () => {
                                            try {
                                                const print = await getFingerPrint()
                                                if (print == undefined) {
                                                    toast.error("Device Not Found or Drivers are not installed")
                                                } else {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        finger3: print
                                                    })
                                                }
                                            } catch (error) {
                                                toast.error("Drivers not installed")

                                            }
                                        }}
                                        className='w-full border border-black hover:bg-gray-300' >
                                        Finger 3
                                    </Button>
                                </div>
                                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                                    {formik.values.finger4 ? <img style={{ filter: 'invert(100%) brightness(200%)' }} src={`data:image/png;base64,${formik.values.finger4}`} alt='inf' /> : <Fingerprint width={104} height={104} />}
                                    <Button
                                        variant={"secondary"}
                                        type='button'
                                        onClick={async () => {
                                            try {
                                                const print = await getFingerPrint()
                                                if (print == undefined) {
                                                    toast.error("Device Not Found or Drivers are not installed")
                                                } else {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        finger4: print
                                                    })
                                                }
                                            } catch (error) {
                                                toast.error("Drivers not installed")

                                            }
                                        }}
                                        className='w-full border border-black hover:bg-gray-300' >
                                        Finger 4
                                    </Button>
                                </div>
                                <div className='border border-black w-44 flex items-center flex-col gap-3 p-2 rounded-md'>
                                    {formik.values.finger5 ? <img style={{ filter: 'invert(100%) brightness(200%)' }} src={`data:image/png;base64,${formik.values.finger5}`} alt='inf' /> : <Fingerprint width={104} height={104} />}
                                    <Button
                                        variant={"secondary"}
                                        type='button'
                                        onClick={async () => {
                                            try {
                                                const print = await getFingerPrint()
                                                if (print == undefined) {
                                                    toast.error("Device Not Found or Drivers are not installed")
                                                } else {
                                                    formik.setValues({
                                                        ...formik.values,
                                                        finger5: print
                                                    })
                                                }
                                            } catch (error) {
                                                toast.error("Drivers not installed")

                                            }
                                        }}
                                        className='w-full border border-black hover:bg-gray-300' >
                                        Finger 5
                                    </Button>
                                </div>

                            </div>
                            <div
                                className='w-full flex items-center justify-end pt-4 border-t border-gray-300'
                            >
                                <Button
                                    className='w-max'

                                    disabled={formik.isSubmitting}
                                    size={"lg"}
                                    type={"submit"}
                                >
                                    {event === "add" ? "Create" : "Save"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div >)
}

export default AddStudent