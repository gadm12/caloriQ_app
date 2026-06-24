import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// Instantiate outside component to avoid re-creating on re-render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const EDGE_FUNCTION_URL = 'https://inkfsrdjdmhbfxqjyvtm.supabase.co/functions/v1/process-donation'

const PRESET_AMOUNTS = [5, 10, 25, 50]

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'Inter, sans-serif',
      color: '#1c1b1f',
      '::placeholder': { color: '#49454f' },
    },
    invalid: { color: '#b3261e' },
  },
}

// ─── Inner form (must be inside <Elements>) ───────────────────────────────────
function DonateForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()

  const [selectedAmount, setSelectedAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | failure | network_error
  const [errorMessage, setErrorMessage] = useState('')
  const [paidAmount, setPaidAmount] = useState(0)

  // Compute the effective dollar amount (custom overrides preset)
  const effectiveDollars = customAmount !== '' ? parseFloat(customAmount) || 0 : selectedAmount

  function handlePresetClick(amount) {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  function handleCustomChange(e) {
    setCustomAmount(e.target.value)
    setSelectedAmount(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    const amountInCents = Math.round(effectiveDollars * 100)
    if (amountInCents < 50) {
      setStatus('failure')
      setErrorMessage('Please enter a donation amount of at least $0.50.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // 1. Get session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setStatus('failure')
        setErrorMessage('You must be signed in to donate.')
        return
      }

      // 2. Create PaymentIntent via Edge Function
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount: amountInCents, user_id: user.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create payment intent')
      const { client_secret } = data

      // 3. Confirm card payment
      const { error: stripeError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })

      if (stripeError) {
        setStatus('failure')
        // Map Stripe decline codes to user-friendly messages
        const code = stripeError.decline_code || stripeError.code || ''
        if (code === 'card_declined' || stripeError.type === 'card_error') {
          setErrorMessage('Your card was declined. Please try a different card.')
        } else if (code === 'insufficient_funds') {
          setErrorMessage('Your card has insufficient funds. Please try a different card.')
        } else if (code === 'expired_card') {
          setErrorMessage('Your card has expired. Please try a different card.')
        } else if (code === 'incorrect_cvc') {
          setErrorMessage('Your card security code is incorrect. Please check and try again.')
        } else {
          setErrorMessage(stripeError.message || 'Your card was declined. Please try a different card.')
        }
      } else {
        setPaidAmount(effectiveDollars)
        setStatus('success')
      }
    } catch {
      setStatus('network_error')
    }
  }

  function resetForm() {
    setStatus('idle')
    setErrorMessage('')
    setSelectedAmount(10)
    setCustomAmount('')
    setPaidAmount(0)
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-lg text-center py-xl">
        <div className="w-20 h-20 rounded-full bg-tertiary-container flex items-center justify-center shadow-sm">
          <span
            className="material-symbols-outlined text-[40px] text-on-tertiary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </div>
        <div className="space-y-sm">
          <h2 className="font-display text-headline-md text-on-surface">Thank you!</h2>
          <p className="text-body-lg text-on-surface-variant max-w-sm">
            Thank you for your <span className="font-semibold text-primary">${paidAmount.toFixed(2)}</span> donation.
            Your generosity helps fight hunger around the world.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center gap-sm bg-primary text-on-primary text-label-md font-semibold px-lg py-3 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
          Donate again
        </button>
      </div>
    )
  }

  // ── Network error state ──────────────────────────────────────────────────────
  if (status === 'network_error') {
    return (
      <div className="flex flex-col items-center gap-lg text-center py-xl">
        <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center shadow-sm">
          <span
            className="material-symbols-outlined text-[40px] text-on-error-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            wifi_off
          </span>
        </div>
        <div className="space-y-sm">
          <h2 className="font-display text-headline-md text-on-surface">Something went wrong</h2>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            We couldn't process your donation right now. Please check your connection and try again.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center gap-sm bg-primary text-on-primary text-label-md font-semibold px-lg py-3 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Try again
        </button>
      </div>
    )
  }

  // ── Donation form (idle / loading / failure) ─────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      {/* Amount selection */}
      <div className="space-y-sm">
        <p className="text-label-md font-semibold text-on-surface">Choose an amount</p>
        <div className="grid grid-cols-4 gap-sm">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetClick(amount)}
              className={`py-3 rounded-xl text-label-md font-semibold border transition-all active:scale-95 ${
                selectedAmount === amount && customAmount === ''
                  ? 'bg-primary text-on-primary border-transparent shadow-sm'
                  : 'bg-surface-container text-on-surface-variant border-outline hover:border-primary/50 hover:bg-surface-container-high'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative mt-sm">
          <span className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md select-none">
            $
          </span>
          <input
            type="number"
            min="0.50"
            step="0.01"
            placeholder="Custom amount"
            value={customAmount}
            onChange={handleCustomChange}
            className={`w-full pl-8 pr-md py-3 rounded-xl border text-body-md text-on-surface bg-surface-container placeholder:text-on-surface-variant/60 outline-none transition-all ${
              customAmount !== ''
                ? 'border-primary ring-1 ring-primary/30'
                : 'border-outline hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/30'
            }`}
          />
        </div>
      </div>

      {/* Card element */}
      <div className="space-y-sm">
        <p className="text-label-md font-semibold text-on-surface">Card details</p>
        <div className="px-md py-4 rounded-xl border border-outline bg-surface-container hover:border-primary/50 transition-colors">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock
          </span>
          Your payment is secured by Stripe. We never store your card details.
        </p>
      </div>

      {/* Card error message */}
      {status === 'failure' && errorMessage && (
        <div className="flex items-start gap-sm p-md rounded-xl bg-error-container text-on-error-container text-body-sm">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            error
          </span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!stripe || status === 'loading' || effectiveDollars <= 0}
        className="w-full flex items-center justify-center gap-sm bg-primary text-on-primary text-label-md font-semibold py-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {status === 'loading' ? (
          <>
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
            Processing…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            Donate {effectiveDollars > 0 ? `$${effectiveDollars.toFixed(2)}` : ''}
          </>
        )}
      </button>

      <p className="text-center text-xs text-on-surface-variant">
        Powered by{' '}
        <span className="font-semibold">Stripe</span>. This is a test environment — no real money is charged.
      </p>
    </form>
  )
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function Donate() {
  return (
    <div className="py-xl max-w-lg mx-auto px-md space-y-xl">
      {/* Header */}
      <section className="text-center space-y-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-tertiary-container shadow-sm">
          <span
            className="material-symbols-outlined text-[40px] text-on-tertiary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </div>
        <h1 className="font-display text-headline-lg text-on-surface">Help Fight Hunger</h1>
        <p className="text-body-lg text-on-surface-variant">
          Your donation goes directly to organizations working to end food insecurity around the world.
          Every dollar makes a difference.
        </p>
        <div className="flex flex-wrap justify-center gap-md text-body-sm text-on-surface-variant">
          {[
            { icon: 'verified', label: 'Secure payment' },
            { icon: 'public', label: 'Global impact' },
            { icon: 'diversity_3', label: 'Community driven' },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-xs">
              <span
                className="material-symbols-outlined text-[16px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Donation card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-lg md:p-8">
        <Elements stripe={stripePromise}>
          <DonateForm />
        </Elements>
      </div>
    </div>
  )
}
