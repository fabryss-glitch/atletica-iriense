import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy e cookie',
  robots: { index: false },
};

// Testo di base da far verificare alla società prima della messa online:
// vanno completati i dati del titolare (codice fiscale / P.IVA dell'associazione).

export default function PrivacyPage() {
  return (
    <main>
      <section style={{ padding: 'clamp(56px,8vw,90px) 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap split">
          <div className="split__side" style={{ flexBasis: 200 }}>
            <div className="eyebrow">Servizio</div>
          </div>
          <div className="split__main prose">
            <h1 style={{ margin: '0 0 28px', fontWeight: 800, letterSpacing: '-.035em', lineHeight: 0.9, textTransform: 'uppercase', fontSize: 'clamp(36px,6vw,84px)', color: 'var(--ink)' }}>
              Privacy e cookie
            </h1>
            <p>
              <b>Titolare del trattamento:</b> Atletica Iriense Voghera, Via Luigi Barbieri 182, 27058 Voghera (PV) ·{' '}
              <a href="mailto:atleticairiense@gmail.com">atleticairiense@gmail.com</a>.
            </p>
            <p>
              <b>Modulo contatti.</b> Nome, email e messaggio servono solo a rispondere alla tua richiesta e vengono conservati per il tempo
              necessario a gestirla.
            </p>
            <p>
              <b>Newsletter.</b> L&apos;indirizzo email viene usato solo per inviarti risultati e novità della società. Puoi chiedere la
              cancellazione in qualsiasi momento scrivendo all&apos;indirizzo sopra.
            </p>
            <p>
              <b>Dove sono conservati i dati.</b> Il sito è ospitato su Vercel e i dati dei moduli su Supabase, fornitori che agiscono come
              responsabili del trattamento.
            </p>
            <p>
              <b>Cookie.</b> Il sito non usa cookie di profilazione né strumenti di statistica di terze parti. L&apos;area riservata usa
              solo la memoria tecnica del browser per mantenere l&apos;accesso della segreteria.
            </p>
            <p>
              <b>I tuoi diritti.</b> Puoi chiedere accesso, rettifica o cancellazione dei tuoi dati scrivendo a{' '}
              <a href="mailto:atleticairiense@gmail.com">atleticairiense@gmail.com</a>, e proporre reclamo al Garante per la protezione dei
              dati personali.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
