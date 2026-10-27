import type { Metadata } from 'next';
import { garage } from '@/config';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Mentions légales',
  alternates: { canonical: '/mentions-legales' },
  robots: { index: true, follow: true },
};

export default function MentionsLegales() {
  const { legal, brand, address, contact } = garage;
  const rows: [string, string | undefined][] = [
    ['Dénomination', legal.publisherName ?? brand.name],
    ['Forme juridique', legal.legalForm],
    ['Siège', `${address.street}, ${address.postalCode} ${address.city}`],
    ['Téléphone', contact.phoneDisplay],
    ['E-mail', contact.email],
    ['SIRET', legal.siret],
    ['RCS', legal.rcs],
    ['TVA intracommunautaire', legal.vatNumber],
    ['Directeur de la publication', legal.publicationDirector],
  ];
  return (
    <LegalPage title="Mentions légales" updated="15 octobre 2026">
      <section>
        <h2>Éditeur du site</h2>
        <dl className="mt-4 grid gap-2">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid gap-1 sm:grid-cols-[16rem_1fr]">
                <dt className="text-ink-700">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        {brand.network && (
          <p>
            {brand.name} est un centre du réseau {brand.network.name}. Les marques et logos du réseau appartiennent à leurs titulaires respectifs.
          </p>
        )}
      </section>
      {legal.host && (
        <section>
          <h2>Hébergement</h2>
          <p>{legal.host}</p>
        </section>
      )}
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          La structure du site, ses textes et ses visuels originaux (rendus 3D et illustrations techniques) sont protégés par le droit d’auteur. Toute
          reproduction sans autorisation préalable est interdite.
        </p>
      </section>
      <section>
        <h2>Informations publiées</h2>
        <p>
          Les horaires, coordonnées et notes d’avis sont publiés à titre indicatif, avec leur source et leur date de relevé. Ils peuvent évoluer : en cas de
          doute, contactez le centre au {contact.phoneDisplay}. Le guide d’orientation par symptôme ne constitue pas un diagnostic.
        </p>
      </section>
      <section>
        <h2>Données personnelles</h2>
        <p>
          Le traitement des données transmises via le formulaire est décrit dans la <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>
    </LegalPage>
  );
}
