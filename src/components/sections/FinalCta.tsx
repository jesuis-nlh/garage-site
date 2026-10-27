import { garage } from '@/config';
import { Button } from '@/components/ui/Button';
import { FinalVisual } from './FinalVisual';

export function FinalCta() {
  const { copy, contact, media } = garage;
  return (
    <section aria-labelledby="final-title" className="relative isolate overflow-hidden bg-ink-900 py-28 md:py-40">
      <FinalVisual still={media.heroStill} />
      <div className="relative container-x">
        <p className="flex items-center gap-3 label text-steel-300" data-reveal>
          <span aria-hidden="true" className="size-2 bg-accent" />
          Prêt quand vous l’êtes
        </p>
        <h2 id="final-title" className="mt-8 max-w-[13em] display display-xl" data-split>
          {copy.finalTitle}
        </h2>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-steel-200" data-reveal>
          {copy.finalLead}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4" data-reveal>
          <Button href="/#rendez-vous" size="lg" magnetic>
            Demander un rendez-vous
          </Button>
          <Button href={`tel:${contact.phoneE164}`} variant="outline" size="lg" icon={null} leadingIcon="phone" cursor="link">
            Appeler le garage
          </Button>
        </div>
      </div>
    </section>
  );
}
