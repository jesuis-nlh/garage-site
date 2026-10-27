import type { Metadata } from 'next';
import { garage } from '@/config';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  alternates: { canonical: '/confidentialite' },
};

export default function Confidentialite() {
  const { brand, address, contact } = garage;
  return (
    <LegalPage title="Politique de confidentialité" updated="15 octobre 2026">
      <section>
        <h2>Responsable du traitement</h2>
        <p>
          {garage.legal.publisherName ?? brand.name}, {address.street}, {address.postalCode} {address.city} — tél. {contact.phoneDisplay}
          {contact.email ? ` — ${contact.email}` : ''}.
        </p>
      </section>
      <section>
        <h2>Données collectées et finalité</h2>
        <p>Lorsque vous utilisez le formulaire de demande de rendez-vous ou de devis, nous recueillons :</p>
        <ul>
          <li>vos nom, téléphone et, si vous le souhaitez, votre adresse e-mail ;</li>
          <li>les informations sur votre véhicule (marque, modèle, et facultativement immatriculation et kilométrage) ;</li>
          <li>la prestation souhaitée, vos disponibilités et votre message.</li>
        </ul>
        <p>
          Ces données servent uniquement à traiter votre demande, à vous recontacter et à préparer votre venue. Elles ne sont ni revendues ni utilisées à des
          fins publicitaires.
        </p>
      </section>
      <section>
        <h2>Base légale</h2>
        <p>
          Le traitement repose sur votre consentement, recueilli dans le formulaire, et sur les mesures précontractuelles prises à votre demande (article 6.1 a
          et b du RGPD).
        </p>
      </section>
      <section>
        <h2>Destinataires</h2>
        <p>
          Les données sont destinées au personnel du centre chargé des rendez-vous. Elles transitent par le prestataire technique d’envoi de messages configuré
          pour ce site, qui agit comme sous-traitant.
        </p>
      </section>
      <section>
        <h2>Durée de conservation</h2>
        <p>Les données sont conservées le temps nécessaire au traitement de votre demande, puis au maximum trois ans à compter du dernier contact.</p>
      </section>
      <section>
        <h2>Vos droits</h2>
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données, ainsi que du droit de
          retirer votre consentement à tout moment. Pour les exercer, contactez le centre aux coordonnées ci-dessus. Vous pouvez également adresser une
          réclamation à la CNIL (cnil.fr).
        </p>
      </section>
      <section>
        <h2>Cookies et services tiers</h2>
        <p>
          Ce site n’utilise aucun cookie publicitaire ni outil de mesure d’audience. Les polices sont hébergées sur le site. La carte interactive
          (OpenStreetMap) n’est chargée que si vous cliquez sur « Afficher la carte interactive » : votre adresse IP est alors transmise à ce service. Les liens
          d’itinéraire ouvrent les services de cartographie choisis.
        </p>
      </section>
    </LegalPage>
  );
}
