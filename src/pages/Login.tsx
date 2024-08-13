/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-extra-boolean-cast */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
export default function Login() {
    const navigator = useNavigate();
    let user = {};
    useEffect(() => {
        if (!!localStorage.getItem("scanner_user")) {
            user = JSON?.parse(localStorage.getItem("scanner_user") ?? "") || {};
        }
    }, [localStorage.getItem("scanner_user")]);
    useEffect(() => {
        if (!!localStorage.getItem("scanner_user")) {
            const user = JSON?.parse(localStorage.getItem("scanner_user") ?? "") || {};

            navigator("/");
        }
    }, [user]);
    return (
        <div className="h-screen">
            <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        alt="Your Company"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                        <Formik
                            initialValues={{
                                email: "",
                                password: "",
                            }}
                            onSubmit={async (values, action) => {
                                try {
                                    const res = await axios.post(
                                        `${import.meta.env.VITE_BASE_URL}/api/auth/admin`,
                                        values
                                    );
                                    if (res) {
                                        localStorage.setItem("scanner_user", JSON.stringify(res.data.data));
                                        toast.success(res.data.message);
                                        window.location.reload();
                                    }
                                } catch (error: any) {
                                    toast.error(error.response.data.message);
                                } finally {
                                    action.setSubmitting(false);
                                }
                            }}
                        >
                            {(formik) => (
                                <form onSubmit={formik.handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                            Email address
                                        </label>
                                        <Input
                                            name="email"
                                            type="text"
                                            placeholder="email"
                                            value={formik.values.email}
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}

                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                            Password
                                        </label>
                                        <Input
                                            name="password"
                                            label=""
                                            type="password"
                                            placeholder="Password"
                                            value={formik.values.password}
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                        />
                                    </div>



                                    <div>
                                        <Button
                                            disabled={formik.isSubmitting}
                                            size={"lg"}
                                            className="w-full"
                                            type="submit"
                                        >
                                            Sign in
                                        </Button>
                                    </div>
                                </form>
                            )}</Formik>

                    </div>


                </div>
            </div>
        </div>
    )
}
