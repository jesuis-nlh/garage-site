import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="label text-steel-300">Erreur 404</p>
      <h1 className="mt-6 max-w-[14ch] display display-l">Cette page n’existe pas ou a été déplacée.</h1>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href="/">Retour à l’accueil</Button>
        <Button href="/#rendez-vous" variant="outline" icon={null}>
          Prendre rendez-vous
        </Button>
      </div>
    </section>
  );
}
