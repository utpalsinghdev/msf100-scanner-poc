/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-extra-boolean-cast */
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar"
import { lazy } from "react";

const isAuth = localStorage.getItem("scanner_user");

const key = JSON.parse(localStorage.getItem("scanner_user") ?? "{}");

const ProtectedRoutes = () => {
  return !!isAuth ? <Outlet /> : <Navigate to={"/login"} />;
};

//Pages 
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));

const Layout = () => {
  return (
    <>
      <Navbar />
      <div
        className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8"
      >
        <Outlet />
      </div>
    </>
  )
}

function App() {

  const routes = createBrowserRouter([
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/",
      element: <Layout />,
      children: [{
        path: "/",
        element: <Home />
      }]
    }
  ])
  return <RouterProvider router={routes} />;
}

export default App


/**
 * ? Legacy Code - Demo Purpose
 * 
 * import { useState } from 'react'
import DashboardLayout from './components/DashboardLayout'
import { CaptureFinger } from './utiles/scanner'

function App() {

  const [fingImg, setFingimg] = useState("")
  async function getFingerPrint() {
    //@ts-ignore
    const fprint = await new CaptureFinger(1, 5000)
    setFingimg(fprint.data.BitmapData)
    console.log(fprint)
  }

  return (
    <DashboardLayout>
      <div className='flex flex-col space-y-4'>
        <label className="font-semibold">Finger</label>
        <button type='button' onClick={getFingerPrint} className="font-semibold bg-blue-500 py-2 w-max px-6 rounded-md text-white">Finger 1</button>
        {
          fingImg && (
            <img src={`data:image/png;base64,${fingImg}`} alt='inf' />
          )
        }
      </div>
    </DashboardLayout>
  )
}
 */