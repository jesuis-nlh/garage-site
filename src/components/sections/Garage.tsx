import Image from 'next/image';
import { garage } from '@/config';
import { groupedHours } from '@/lib/hours';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Garage() {
  const { copy, address, access, brand, media, areaServed } = garage;
  const photos = media.workshopPhotos;

  const facts: { label: string; value: React.ReactNode }[] = [
    { label: 'Adresse', value: `${address.street}, ${address.postalCode} ${address.city}` },
    {
      label: 'Horaires',
      value: groupedHours(garage.hours).map((g) => (
        <span key={g.days} className="block">
          {g.days} : {g.value}
        </span>
      )),
    },
    ...(access.transit ? [{ label: 'Accès', value: access.transit }] : []),
    ...(access.parking ? [{ label: 'Stationnement', value: access.parking }] : []),
    ...(brand.network
      ? [
          {
            label: 'Réseau',
            value: (
              <a href={brand.network.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                {brand.network.name}
              </a>
            ),
          },
        ]
      : []),
  ];

  return (
    <section id="garage" aria-labelledby="garage-title" className="theme-light relative overflow-hidden bg-bone-100 py-24 text-ink-900 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading tone="light" id="garage-title" index="05" kicker="Notre garage" title={copy.garageTitle} />

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:col-start-1">
            <p className="text-[1.3rem] leading-snug font-[520] tracking-[-0.01em] [font-stretch:104%]" data-reveal>
              {copy.garageIntro}
            </p>
            {copy.garageBody.map((p) => (
              <p key={p} className="mt-6 leading-relaxed text-ink-700" data-reveal>
                {p}
              </p>
            ))}
            <dl className="mt-12 grid gap-0 border-t border-ink-900/15">
              {facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-ink-900/15 py-4" data-reveal>
                  <dt className="pt-1 label text-ink-700">{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-7">
            {photos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {photos.map((p, k) => (
                  <Image
                    key={p.src}
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                    className={`h-full w-full rounded-[4px] object-cover ${k === 0 ? 'sm:col-span-2' : ''}`}
                  />
                ))}
              </div>
            ) : (
              <figure className="relative">
                <div className="relative overflow-hidden rounded-[4px] bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,var(--color-bone-200)_70%)]">
                  {/* Repères d'angle façon planche technique */}
                  <svg
                    aria-hidden="true"
                    className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] text-ink-900/40"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <path d="M0 6V0h6M94 0h6v6M100 94v6h-6M6 100H0v-6" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div data-parallax="8" className="relative px-[6%] py-[8%]">
                    <Image
                      src={media.secondary.src}
                      alt={media.secondary.alt}
                      width={media.secondary.width}
                      height={media.secondary.height}
                      sizes="(min-width: 1024px) 52vw, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                  <p className="absolute top-6 left-7 label text-ink-700">Fig. 01</p>
                  <p className="absolute right-7 bottom-6 label text-ink-700">Roue · disque · étrier</p>
                </div>
                {media.illustrativeNotice && <figcaption className="mt-3 text-sm text-ink-700">{media.illustrativeNotice}</figcaption>}
              </figure>
            )}
          </div>
        </div>
      </div>

      {/* Bandeau des quartiers desservis */}
      <div aria-hidden="true" className="mt-24 overflow-hidden border-y border-ink-900/15 py-6 md:mt-32">
        <div className="flex w-max [animation:marquee_60s_linear_infinite] gap-10 whitespace-nowrap">
          {[...areaServed, ...areaServed].map((z, k) => (
            <span
              key={k}
              className="flex items-center gap-10 text-[clamp(1.8rem,4vw,3.6rem)] font-[700] tracking-[-0.03em] text-ink-900/85 [font-stretch:115%]"
            >
              {z}
              <span className="size-3 bg-accent" />
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">Zone desservie : {areaServed.join(', ')}.</p>
    </section>
  );
}
