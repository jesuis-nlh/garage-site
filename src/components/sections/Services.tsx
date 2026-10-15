import { services } from '@/lib/services';
import { categories } from '@/content/services';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ServicesDirectory } from './ServicesDirectory';
import { capitalize, spell } from '@/lib/format';

export function Services() {
  const usedCategories = categories.filter((c) => services.some((s) => s.category === c.id));

  return (
    <section id="services" aria-labelledby="services-title" className="theme-light relative bg-bone-100 py-24 text-ink-900 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading
          tone="light"
          id="services-title"
          index="01"
          kicker="Prestations"
          title={`${capitalize(spell(services.length))} savoir-faire, un seul interlocuteur.`}
          lead="Choisissez une prestation pour voir ce qu’elle comprend et les signes qui doivent vous alerter. Chaque intervention commence par un contrôle du véhicule."
        />
        <ServicesDirectory services={services} categories={usedCategories} />
      </div>
    </section>
  );
}
