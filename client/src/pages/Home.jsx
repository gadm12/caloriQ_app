import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const FEATURES = [
  {
    icon: 'menu_book',
    title: 'Daily Log',
    description: 'Record every meal — Breakfast, Lunch, Dinner, and Snacks — with precise nutrition data. Edit or remove entries at any time.',
    to: '/log',
  },
  {
    icon: 'dashboard',
    title: 'Dashboard',
    description: 'See your day at a glance. A live calorie progress bar and macro breakdown tell you exactly where you stand.',
    to: '/dashboard',
  },
  {
    icon: 'insights',
    title: 'Weekly Progress',
    description: 'Seven-day calorie trends, consistency scores, and average macro breakdowns keep you moving in the right direction.',
    to: '/progress',
  },
  {
    icon: 'track_changes',
    title: 'Goal Settings',
    description: 'Set a daily calorie target and optional macro goals for protein, carbs, and fat. Changes take effect everywhere instantly.',
    to: '/goals',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="py-xl space-y-xl">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto px-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-container mb-lg shadow-sm">
          <span
            className="material-symbols-outlined text-[40px] text-on-primary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            nutrition
          </span>
        </div>
        <h1 className="font-display text-headline-lg text-on-surface mb-md">
          Welcome{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          CaloriQ is your personal nutrition companion — designed to make calorie and macro tracking clear, fast, and sustainable.
        </p>
      </section>

      {/* About */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-lg md:p-8 space-y-md max-w-2xl mx-auto">
        <h2 className="font-display font-semibold text-headline-md text-on-surface">What CaloriQ does</h2>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Most nutrition trackers try to do everything — meal plans, recipes, social feeds, premium tiers. CaloriQ does one thing well: it helps you understand what you eat. Log your meals, watch your numbers, and build an honest picture of your daily nutrition without friction or noise.
        </p>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Every food entry captures the details that matter — name, meal category, serving size, calories, and the three macros. A live counter updates throughout your day so you always know where you stand. When the week is done, the Progress page shows you seven days of data in a single view.
        </p>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Your data lives entirely in your browser session — no account servers, no sync, no data collection. Refresh the page and start fresh. CaloriQ is a tool, not a platform.
        </p>
      </section>

      {/* Feature cards */}
      <section>
        <h2 className="font-display font-semibold text-headline-md text-on-surface mb-lg px-0">Where to start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {FEATURES.map(({ icon, title, description, to }) => (
            <Link
              key={to}
              to={to}
              className="group bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-lg hover:shadow-md hover:border-primary/30 transition-all duration-200 flex gap-md items-start"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container transition-colors duration-200">
                <span
                  className="material-symbols-outlined text-[22px] text-on-surface-variant group-hover:text-on-primary-container transition-colors duration-200"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {icon}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-label-md text-on-surface mb-xs">{title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick CTA */}
      <section className="text-center">
        <Link
          to="/log"
          className="inline-flex items-center gap-sm bg-primary text-on-primary text-label-md font-semibold px-lg py-3 rounded-full shadow-sm hover:shadow-md hover:bg-surface-tint transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          Log today's first meal
        </Link>
      </section>
    </div>
  )
}
