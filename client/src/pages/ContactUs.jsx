const CONTACTS = [
  {
    icon: 'mail',
    label: 'Email',
    value: 'gadm5336@gmail.com',
    href: 'mailto:gadm5336@gmail.com',
    description: 'Send us an email for support or feedback.',
    cta: 'Send Email',
  },
  {
    icon: 'code',
    label: 'GitHub',
    value: 'github.com/gadm5',
    href: 'https://github.com/gadm5',
    description: 'Report bugs or contribute to the project.',
    cta: 'View GitHub',
  },
  {
    icon: 'work',
    label: 'LinkedIn',
    value: 'linkedin.com/in/gadm5',
    href: 'https://linkedin.com/in/gadm5',
    description: 'Connect with the developer on LinkedIn.',
    cta: 'Connect',
  },
]

export default function ContactUs() {
  return (
    <div className="py-xl space-y-xl">

      {/* Header */}
      <section>
        <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Contact Us
        </h1>
        <p className="text-body-md text-on-surface-variant mt-sm">
          We'd love to hear from you — reach out through any of the channels below.
        </p>
      </section>

      {/* Contact cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {CONTACTS.map(({ icon, label, value, href, description, cta }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('mailto') ? undefined : '_blank'}
            rel="noreferrer"
            className="group bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg flex flex-col gap-md hover:shadow-md hover:border-primary/30 transition-all"
            style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
          >
            {/* Icon ring */}
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-on-primary-container text-[26px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
            </div>

            <div className="flex-1">
              <h2 className="font-display font-semibold text-headline-md text-on-surface">{label}</h2>
              <p className="text-body-md text-on-surface-variant mt-xs">{description}</p>
              <p className="text-label-md text-primary mt-sm truncate">{value}</p>
            </div>

            <div className="flex items-center gap-xs text-primary text-label-md font-semibold group-hover:gap-sm transition-all">
              <span>{cta}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </a>
        ))}
      </section>

      {/* Donate nudge */}
      <section
        className="rounded-xl border border-outline-variant/30 p-lg flex flex-col sm:flex-row items-center justify-between gap-md"
        style={{ background: 'rgba(255,173,58,0.08)', borderColor: 'rgba(255,173,58,0.3)' }}
      >
        <div className="flex items-center gap-md">
          <span
            className="material-symbols-outlined text-tertiary-container text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <div>
            <h3 className="font-display font-semibold text-headline-md text-on-surface">Support the mission</h3>
            <p className="text-body-md text-on-surface-variant mt-xs">Help us keep CaloriQ free for everyone.</p>
          </div>
        </div>
        <a
          href="#"
          className="px-lg py-sm bg-tertiary-container text-on-tertiary-container text-label-md font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm flex-shrink-0"
        >
          Donate Now
        </a>
      </section>

    </div>
  )
}
