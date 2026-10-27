import { garage } from '@/config';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProcessTrack } from './ProcessTrack';
import { capitalize, spell } from '@/lib/format';

export function Process() {
  if (!garage.process.length) return null;
  return (
    <section aria-labelledby="process-title" className="relative overflow-hidden bg-ink-900 py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading
          id="process-title"
          index="04"
          kicker="Déroulé"
          title={`${capitalize(spell(garage.process.length))} étapes, de la demande à la restitution.`}
        />
        <ProcessTrack steps={garage.process} />
      </div>
    </section>
  );
}
