import { garage, sectionIndex } from '@/config';
import { services } from '@/lib/services';
import { Icon } from '@/components/ui/Icon';
import { OpenStatus } from '@/components/ui/OpenStatus';
import { BookingForm } from './BookingForm';

export function Booking() {
  const { contact, booking, brand } = garage;
  return (
    <section id="rendez-vous" aria-labelledby="booking-title" className="relative bg-ink-800 py-24 md:py-32 lg:py-40">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="flex items-center gap-3 label text-steel-300" data-reveal>
            <span aria-hidden="true" className="size-2 bg-accent" />
            <span className="tabular">{sectionIndex(7)}</span>
            <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
            Rendez-vous & devis
          </p>
          <h2 id="booking-title" tabIndex={-1} className="mt-6 max-w-[14ch] display display-l outline-none" data-split>
            Votre demande en deux minutes.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-steel-300" data-reveal>
            Décrivez votre besoin et le créneau qui vous arrange. L’atelier vous recontacte pour confirmer le rendez-vous.
          </p>
          <ul className="mt-10 grid gap-4" data-reveal>
            {['Confirmation du créneau par l’atelier', 'Aucun paiement en ligne', 'Vos données servent uniquement à traiter votre demande'].map((x) => (
              <li key={x} className="flex gap-3 text-steel-200">
                <Icon name="check" className="mt-1 size-4 shrink-0 text-accent" />
                {x}
              </li>
            ))}
          </ul>

          <div className="mt-12 border-t border-bone-100/10 pt-8" data-reveal>
            <p className="label text-steel-400">Vous préférez appeler ?</p>
            <a
              href={`tel:${contact.phoneE164}`}
              className="mt-3 inline-block text-[clamp(1.8rem,3.4vw,2.6rem)] font-[680] tracking-[-0.03em] tabular transition-colors hover:text-accent"
            >
              {contact.phoneDisplay}
            </a>
            <div className="mt-3">
              <OpenStatus className="text-sm text-steel-300" />
            </div>
            {booking.external && (
              <p className="mt-6 text-steel-300">
                Ou réservez directement sur le site du réseau {brand.network?.name} :{' '}
                <a
                  href={booking.external.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-bone-100 underline underline-offset-4 hover:text-accent"
                >
                  {booking.external.label}
                  <Icon name="arrow-up-right" className="size-3.5" />
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <BookingForm
            services={services.map((s) => ({ id: s.id, title: s.title }))}
            slots={booking.slots}
            phoneDisplay={contact.phoneDisplay}
            phoneE164={contact.phoneE164}
            brandName={brand.name}
            external={booking.external}
          />
        </div>
      </div>
    </section>
  );
}
