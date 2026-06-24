import { Link } from 'react-router-dom'

export default function DonateFooter() {
  return (
    <footer className="w-full rounded-xl bg-tertiary-container shadow-sm flex flex-col md:flex-row items-center justify-center gap-md p-lg max-w-container-max mx-auto text-center mb-xl">
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        <span className="text-body-md text-on-tertiary-container">Help fight hunger around the world</span>
      </div>
      <Link to="/donate" className="underline font-bold text-on-tertiary-container text-label-md hover:opacity-90 transition-opacity active:scale-[0.98]">
        Donate Now
      </Link>
    </footer>
  )
}
