import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Logout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogBackIn() {
    logout()
    navigate('/')
  }

  function handleReturnHome() {
    navigate('/home')
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      <main className="flex-grow flex flex-col items-center justify-center px-md py-xl">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-xl max-w-md w-full text-center flex flex-col items-center gap-lg">
          {/* Icon */}
          <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-sm shadow-sm">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          </div>

          {/* Messaging */}
          <div className="flex flex-col gap-sm">
            <h1 className="font-display text-headline-md text-on-surface">You have been successfully logged out.</h1>
            <p className="text-body-md text-on-surface-variant">Your session has securely ended. We hope to see you back on track soon.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full gap-md mt-sm">
            <button
              onClick={handleLogBackIn}
              className="w-full bg-primary text-on-primary text-label-md font-semibold py-3 rounded-full hover:bg-surface-tint transition-colors shadow-sm hover:shadow-md active:scale-95 duration-200"
            >
              Log Back In
            </button>
            <button
              onClick={handleReturnHome}
              className="w-full bg-transparent border-[1.5px] border-primary text-primary text-label-md font-semibold py-3 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-200"
            >
              Return Home
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full rounded-lg mb-xl bg-tertiary-container shadow-sm flex flex-col md:flex-row items-center justify-center gap-md p-lg max-w-container-max mx-auto text-center mt-auto">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-sm md:gap-md">
          <span className="text-body-md text-on-tertiary-container">Help fight hunger around the world</span>
          <a href="#" className="text-label-md underline font-bold text-on-tertiary-container hover:opacity-90 transition-opacity active:scale-[0.98]">Donate Now</a>
        </div>
      </footer>
    </div>
  )
}
