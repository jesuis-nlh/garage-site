import { garage, sectionIndex } from '@/config';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { HoursTable } from './HoursTable';
import { MapConsent } from './MapConsent';

export function Contact() {
  const { address, contact, access, areaServed, hoursSource } = garage;
  const { lat, lng } = address.geo;
  const directions = [
    { label: 'Google Maps', href: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` },
    { label: 'Plans (Apple)', href: `https://maps.apple.com/?daddr=${lat},${lng}` },
    { label: 'Waze', href: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative bg-ink-950 py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading id="contact-title" index={sectionIndex(9)} kicker="Contact & accès" title={`${address.street}, ${address.city}.`} />

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <address className="not-italic" data-reveal>
              <p className="text-[1.35rem] leading-snug">
                {garage.brand.name}
                <br />
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </p>
              <a
                href={`tel:${contact.phoneE164}`}
                className="mt-8 inline-flex items-center gap-4 text-[clamp(1.8rem,3.4vw,2.6rem)] font-[680] tracking-[-0.03em] tabular transition-colors hover:text-accent"
              >
                <Icon name="phone" className="size-7" />
                {contact.phoneDisplay}
              </a>
              {contact.email && (
                <p className="mt-3">
                  <a href={`mailto:${contact.email}`} className="link-underline text-steel-200">
                    {contact.email}
                  </a>
                </p>
              )}
            </address>

            <div className="mt-10" data-reveal>
              <p className="label text-steel-400">Itinéraire</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {directions.map((d) => (
                  <li key={d.label}>
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-bone-100/20 px-4 text-[0.92rem] transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon name="route" className="size-4" />
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {(access.transit || access.parking) && (
              <dl className="mt-10 grid gap-4" data-reveal>
                {access.transit && (
                  <div>
                    <dt className="label text-steel-400">Transports</dt>
                    <dd className="mt-1 text-steel-200">{access.transit}</dd>
                  </div>
                )}
                {access.parking && (
                  <div>
                    <dt className="label text-steel-400">Stationnement</dt>
                    <dd className="mt-1 text-steel-200">{access.parking}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="mt-10" data-reveal>
              <p className="label text-steel-400">Secteurs desservis</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {areaServed.map((z) => (
                  <li key={z} className="rounded-full bg-bone-100/[0.06] px-3.5 py-1.5 text-[0.88rem] text-steel-200">
                    {z}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-10 lg:col-span-7">
            <div data-reveal>
              <HoursTable />
              <p className="mt-3 text-sm text-steel-400">
                Horaires habituels, hors jours fériés et fermetures exceptionnelles · source :{' '}
                <a href={hoursSource.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {hoursSource.label}
                </a>
              </p>
            </div>
            <div data-reveal>
              <MapConsent />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
