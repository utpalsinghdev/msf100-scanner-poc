import { ReactNode } from 'react'

function Wrapper({children}: {children: ReactNode}) {
  return (
    <div className='max-w-screen-2xl sm:px-6 w-full mx-auto px-4'>{children}</div>
  )
}

export default Wrapper