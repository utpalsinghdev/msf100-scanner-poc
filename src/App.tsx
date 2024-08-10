/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
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

export default App
