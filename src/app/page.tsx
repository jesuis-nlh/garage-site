import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Explore } from '@/components/sections/Explore';
import { Finder } from '@/components/sections/Finder';
import { Process } from '@/components/sections/Process';
import { Garage } from '@/components/sections/Garage';
import { Reviews } from '@/components/sections/Reviews';
import { Booking } from '@/components/sections/Booking';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';
import { FinalCta } from '@/components/sections/FinalCta';
import { faqJsonLd, jsonLdScript } from '@/lib/structured-data';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Explore />
      <Finder />
      <Process />
      <Garage />
      <Reviews />
      <Booking />
      <Faq />
      <Contact />
      <FinalCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd()) }} />
    </>
  );
}
