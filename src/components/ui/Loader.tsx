function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
        <div className="absolute inset-1.5 animate-spin rounded-full border-2 border-transparent border-b-indigo-400 [animation-direction:reverse] [animation-duration:1.1s]" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

export default Loader
