import { services } from '@/lib/services';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Blueprint } from './Blueprint';

export function Explore() {
  return (
    <section aria-labelledby="explore-title" className="relative bg-ink-950 py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading
          id="explore-title"
          index="02"
          kicker="Vue en coupe"
          title="Chaque organe a son contrôle."
          lead="Explorez la vue en coupe : survolez le véhicule pour révéler sa mécanique, puis sélectionnez un repère pour découvrir ce que l’atelier vérifie et pourquoi."
        />
        <Blueprint services={services} />
      </div>
    </section>
  );
}
