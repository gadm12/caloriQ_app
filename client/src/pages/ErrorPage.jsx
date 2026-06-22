import { useNavigate } from 'react-router-dom'

function PlateIllustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
      {/* Plate shadow */}
      <ellipse cx="100" cy="168" rx="58" ry="10" fill="rgba(11,28,48,0.07)" />
      {/* Plate outer ring */}
      <circle cx="100" cy="110" r="64" fill="#ffffff" stroke="#bacac5" strokeWidth="1.5" />
      {/* Plate inner rim */}
      <circle cx="100" cy="110" r="52" fill="#f8f9ff" stroke="#e5eeff" strokeWidth="1" />
      {/* Empty plate surface */}
      <circle cx="100" cy="110" r="42" fill="#eff4ff" />
      {/* Magnifying glass handle */}
      <line x1="140" y1="148" x2="158" y2="166" stroke="#006b5f" strokeWidth="6" strokeLinecap="round" />
      {/* Magnifying glass circle */}
      <circle cx="128" cy="136" r="20" fill="none" stroke="#006b5f" strokeWidth="5" />
      <circle cx="128" cy="136" r="14" fill="rgba(45,212,191,0.15)" />
      {/* Fork silhouette */}
      <line x1="76" y1="94" x2="76" y2="126" stroke="#bacac5" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="71" y1="94" x2="71" y2="106" stroke="#bacac5" strokeWidth="2" strokeLinecap="round" />
      <line x1="81" y1="94" x2="81" y2="106" stroke="#bacac5" strokeWidth="2" strokeLinecap="round" />
      {/* Knife silhouette */}
      <line x1="124" y1="94" x2="124" y2="126" stroke="#bacac5" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M124 94 Q129 100 124 108" fill="none" stroke="#bacac5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-surface shadow-sm w-full">
        <div className="flex justify-between items-center px-md py-sm w-full max-w-container-max mx-auto">
          <button onClick={() => navigate('/home')} className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
            <span className="font-display font-bold text-headline-md text-primary">CaloriQ</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      {/* Error Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-md py-xl w-full max-w-container-max mx-auto text-center">
        {/* Illustration */}
        <div className="mb-xl w-56 h-56 md:w-72 md:h-72 rounded-full bg-surface-container-low flex items-center justify-center shadow-sm border border-outline-variant/30 overflow-hidden">
          <PlateIllustration />
        </div>

        <h1 className="font-display text-display-lg text-on-surface mb-md max-w-2xl">
          Oops! Something went wrong.
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-xl max-w-xl">
          We have captured this error and will work diligently on fixing it! In the meantime, let's get you back to tracking your nutrition.
        </p>

        <button
          onClick={() => navigate('/home')}
          className="bg-primary text-on-primary text-label-md font-semibold px-lg py-3 rounded-full shadow-sm hover:shadow-md hover:bg-surface-tint transition-all flex items-center gap-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Back to Home
        </button>
      </main>

      {/* Footer */}
      <footer className="w-full rounded-xl bg-tertiary-container shadow-sm flex flex-col md:flex-row items-center justify-center gap-md p-lg max-w-container-max mx-auto text-center mb-xl">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <span className="text-body-md text-on-tertiary-container">Help fight hunger around the world</span>
        </div>
        <a href="#" className="underline font-bold text-on-tertiary-container text-label-md hover:opacity-90 transition-opacity">Donate Now</a>
      </footer>
    </div>
  )
}
