import type { Metadata } from 'next';
import RecordTabs, { type CategoriaPrimati, type Titolo } from '@/components/RecordTabs';
import primatiJson from '@/data/record.json';
import { fotoStoriche } from '@/lib/contenuti';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'La società',
  description: "Settant'anni di corsa, salti e lanci: storia, staff, allenamenti, amatori e record dell'Atletica Iriense Voghera.",
};

const ANCORE = [
  { id: 'storia', label: 'Storia' },
  { id: 'squadre', label: 'Squadre e staff' },
  { id: 'allenamenti', label: 'Allenamenti' },
  { id: 'amatori', label: 'Amatori e master' },
  { id: 'record', label: 'Record' },
];

const GRUPPI = [
  { gruppo: 'Velocità e ostacoli', nota: 'settore assoluto' },
  { gruppo: 'Mezzofondo, cross e strada', nota: 'assoluti e master' },
  { gruppo: 'Salti e lanci', nota: 'settore assoluto' },
  { gruppo: "Gruppi giovanili per fascia d'età", nota: 'corsi di avviamento' },
];

const TITOLI: Titolo[] = [
  { name: 'Rosanna Rossi', event: '200 m indoor', cat: 'SF70', mark: '38″50', badge: 'Campionessa Italiana Master' },
  { name: 'Edoardo Belino', event: '400 m ostacoli', cat: 'U20', mark: '50″85', badge: 'Record sociale' },
  { name: 'Delia La Barbera', event: '100 m ostacoli', cat: 'U20', mark: '14″33', badge: 'Record provinciale' },
  { name: 'Alberto Casareale', event: '60 m indoor', cat: 'SM', mark: '7″04', badge: 'Primato personale' },
  { name: 'Stefano Ferraris', event: 'Salto in lungo', cat: 'Master', mark: '3,20 m', badge: 'Campione Italiano UISP' },
  { name: 'Rildo Guimaraes', event: 'Maratona di Cape Town', cat: 'Master', mark: '3h33′56″', badge: 'Finisher' },
  { name: 'Andrea Pasquino', event: 'Decathlon', cat: 'SM65', mark: '2788 p', badge: 'Bronzo Italiani Master' },
];

function Sezione({ id, numero, titolo, children }: { id: string; numero: string; titolo: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: 'clamp(30px,5vw,60px) 0' }}>
      <div className="wrap">
        <div className="split rule-top">
          <div className="split__side">
            <div className="label">{numero} / {titolo}</div>
          </div>
          <div className="split__main">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default async function SocietaPage() {
  const storiche = await fotoStoriche(5);

  return (
    <main>
      <section className="page-head" style={{ paddingBottom: 'clamp(24px,4vw,40px)' }}>
        <div className="wrap">
          <div className="eyebrow">La società</div>
          <h1 className="display" style={{ fontSize: 'clamp(44px,8.5vw,132px)', maxWidth: '14ch' }}>
            Settant&apos;anni di corsa, salti e lanci
          </h1>
          <nav className="anchors" aria-label="Sezioni della pagina">
            {ANCORE.map((a) => (
              <a key={a.id} href={`#${a.id}`}>{a.label}</a>
            ))}
          </nav>
        </div>
      </section>

      <section id="storia" style={{ padding: 'clamp(20px,4vw,40px) 0' }}>
        <div className="wrap split">
          <div className="split__side sticky-side">
            <div className="label">01 / Storia</div>
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line)', maxWidth: 200 }}>
              <div className="label">I nostri valori</div>
              <div className="values">
                <span>Impegno</span>
                <span>Rispetto</span>
                <span>Condivisione</span>
                <span>Divertimento</span>
              </div>
            </div>
          </div>
          <div className="split__main">
            <p style={{ margin: 0, fontSize: 'clamp(20px,2.4vw,27px)', fontWeight: 500, lineHeight: 1.4, letterSpacing: '-.01em', textWrap: 'pretty' }}>
              L&apos;atletica leggera a Voghera affonda le radici all&apos;inizio del secolo scorso, come sezione della Società Ginnastica
              Iriense fondata nel 1895. L&apos;avvio ufficiale dell&apos;attività federale arriva però nel 1955: da lì nasce l&apos;Atletica
              Iriense come la conosciamo oggi.
            </p>
            <div className="prose" style={{ marginTop: 28 }}>
              <p>
                Tra gli anni Trenta e Quaranta emergono i primi talenti — Arnaldi e Dallera negli ostacoli, Discalzo nel giavellotto,
                Crosignani nel mezzofondo, Silvani nella velocità — fino ai campioni di rilievo nazionale Alessandro Bettaglio, campione
                italiano di salto triplo e azzurro, e Armando Prassoli, campione italiano nel lancio del martello.
              </p>
              <p>
                Con gli anni Settanta arriva la nuova pista del Campo Giovani e una lunga stagione di successi: l&apos;ostacolista Luigi
                Scevola, il velocista Italo Chiesa, il discobolo Carlo Prassoli, la staffetta 4×100 ai vertici nazionali. Nel 1972 nasce la
                sezione femminile e anche in campo femminile arrivano gli allori. Negli anni successivi la società continua a formare
                ostacolisti, velocisti, saltatrici e lanciatori di valore.
              </p>
            </div>
            <figure className="art-figure">
              <div className="photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://iriense.wordpress.com/wp-content/uploads/2024/05/ultima-lezione-campo-giovani.jpg" alt="Atleti al Campo Giovani" loading="lazy" style={{ objectPosition: '50% 30%' }} />
              </div>
              <figcaption>L&apos;ultima lezione della stagione al Campo Giovani, sede della società dagli anni Settanta.</figcaption>
            </figure>

            {storiche.length > 0 && (
              <div style={{ marginTop: 34 }}>
                <div className="label">Dall&apos;archivio della società</div>
                <div className="archive-strip">
                  {storiche.map((f) => (
                    <figure key={f.src}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.src} alt={f.title} loading="lazy" />
                      <figcaption>{f.year}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            <div className="prose" style={{ marginTop: 30 }}>
              <p>
                Dagli anni Novanta al nuovo millennio arriva la pista sintetica e prende vita il <b>Progetto Giovani</b>, per portare
                l&apos;atletica nelle scuole. Un&apos;operazione di grande successo: oggi il settore giovanile conta oltre cento partecipanti
                ai corsi di avviamento e ha lanciato atleti fino ai palcoscenici nazionali.
              </p>
              <p>
                L&apos;Iriense è da sempre attivissima anche nell&apos;organizzazione: al Campo Giovani si sono disputati i Campionati
                Italiani giovanili e amatori e lo storico Trofeo Prassoli dei lanci; per le vie della città sono passati il Criterium
                Mondiale di Marcia con campioni olimpici, il Vivicittà e, dal 2012, la Run for Parkinson. Una storia lunga settant&apos;anni,
                che ogni cinque anni celebriamo con la staffetta <b>100×1000</b>: cento chilometri passati di mano in mano, tra le giovani
                leve e le vecchie glorie.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Sezione id="squadre" numero="02" titolo="Squadre e staff">
        <h2 className="title-lg">Il gruppo bianco-azzurro</h2>
        <p style={{ margin: '20px 0 0', fontSize: 'clamp(18px,2vw,22px)', lineHeight: 1.55, color: 'rgba(20,22,26,.8)', textWrap: 'pretty' }}>
          Un&apos;unica grande squadra divisa in tre anime: il <b>settore giovanile</b> dei corsi di avviamento, il <b>settore assoluto</b>{' '}
          che gareggia in pista, su strada e nei cross, e il folto gruppo <b>amatori e master</b> che continua a portare in alto i nostri
          colori. Insieme, oltre 150 atleti di ogni età.
        </p>
        <div style={{ marginTop: 32, borderTop: '1px solid var(--line)' }}>
          <div className="staff-row"><span>Presidente</span><span>Lorenzo Somenzini</span></div>
          <div className="staff-row"><span>Direzione tecnica</span><span>Barbara Volpini · Federica Strada</span></div>
          <div className="staff-row">
            <span>Tecnici e istruttori</span>
            <span style={{ fontWeight: 400, fontSize: 17, color: 'rgba(20,22,26,.75)', letterSpacing: 0 }}>Lo staff che segue i gruppi giovanili e agonistici</span>
          </div>
        </div>
      </Sezione>

      <Sezione id="allenamenti" numero="03" titolo="Allenamenti">
        <h2 className="title-lg">Dove e quando ci alleniamo</h2>
        <p style={{ margin: '20px 0 0', fontSize: 'clamp(18px,2vw,22px)', lineHeight: 1.55, color: 'rgba(20,22,26,.8)', textWrap: 'pretty' }}>
          Gli allenamenti si svolgono al <b>Campo Giovani</b> di Voghera, sede storica della società. I gruppi sono organizzati per età e
          specialità — velocità, ostacoli, mezzofondo, salti e lanci — sotto la guida dei nostri tecnici.
        </p>
        <div className="table-card" style={{ marginTop: 28 }}>
          {GRUPPI.map((g) => (
            <div className="table-card__row" key={g.gruppo}>
              <span style={{ fontWeight: 700, fontSize: 17, flex: '1 1 200px', minWidth: 0 }}>{g.gruppo}</span>
              <span className="mono" style={{ fontSize: 13, color: 'rgba(20,22,26,.6)', marginLeft: 'auto' }}>{g.nota}</span>
            </div>
          ))}
          <div className="table-card__foot">Giorni e orari di ogni gruppo vengono pubblicati a inizio stagione.</div>
        </div>
      </Sezione>

      <Sezione id="amatori" numero="04" titolo="Amatori e master">
        <h2 className="title-lg">Non si appendono le scarpe al chiodo</h2>
        <p style={{ margin: '20px 0 0', fontSize: 'clamp(18px,2vw,22px)', lineHeight: 1.55, color: 'rgba(20,22,26,.8)', textWrap: 'pretty' }}>
          Il settore amatori è una delle anime più vive della società: un gruppo numeroso e affiatato di runner e master che gareggia tutto
          l&apos;anno su strada, nei cross, nei trail e in pista. Dai campionati regionali e italiani master alle corse del territorio, i
          nostri senior continuano a salire sul podio a ogni età — la prova migliore che per correre non è mai troppo tardi.
        </p>
        <div className="photo" style={{ height: 'clamp(220px,36vw,400px)', marginTop: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1400&q=80" alt="" loading="lazy" />
        </div>
      </Sezione>

      <section id="record" style={{ padding: 'clamp(30px,5vw,60px) 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap">
          <div className="rule-top">
            <div className="label">05 / Record</div>
            <h2 className="title-xl" style={{ marginTop: 16 }}>Primati e titoli</h2>
            <p style={{ margin: '16px 0 0', fontSize: 18, color: 'var(--muted)', maxWidth: 620 }}>
              I risultati che raccontano il valore dei bianco-azzurri, dai record sociali ai titoli nazionali.
            </p>
            <RecordTabs titoli={TITOLI} primati={primatiJson as CategoriaPrimati[]} />
          </div>
        </div>
      </section>
    </main>
  );
}
