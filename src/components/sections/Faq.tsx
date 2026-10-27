import { garage, sectionIndex } from '@/config';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FaqList } from './FaqList';

export function Faq() {
  if (!garage.faq.length) return null;
  return (
    <section id="faq" aria-labelledby="faq-title" className="theme-light bg-bone-100 py-24 text-ink-900 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading tone="light" id="faq-title" index={sectionIndex(8)} kicker="Questions fréquentes" title="Les réponses avant de passer la porte." />
        <div className="mt-14 lg:mt-20 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-9 lg:col-start-4">
            <FaqList items={garage.faq} />
          </div>
        </div>
      </div>
    </section>
  );
}
