'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ArticoloView from '@/components/ArticoloView';
import { CATEGORIE, labelFromIso, supabaseBrowser, supabaseConfigurato, type Articolo } from '@/lib/supabase';
import {
  caricaArticolo,
  caricaElenco,
  cambiaStato,
  eliminaArticolo,
  esportaArticoli,
  salvaArticolo,
  type Bozza,
  type VoceElenco,
} from '@/lib/admin';
import Login from './Login';
import ElencoArticoli from './ElencoArticoli';
import Editor from './Editor';
import ImportView from './ImportView';
import GalleryAdmin from './GalleryAdmin';
import MessaggiAdmin from './MessaggiAdmin';
import { Conferma, Icone, Toast, type Avviso } from './ui';

type Vista =
  | { tipo: 'elenco' }
  | { tipo: 'editor'; bozza: Bozza }
  | { tipo: 'anteprima'; articolo: Articolo; ritorno: 'elenco' | 'editor'; bozza?: Bozza }
  | { tipo: 'import' }
  | { tipo: 'gallery' }
  | { tipo: 'messaggi' };

const oggi = () => new Date().toISOString().slice(0, 10);
const bozzaVuota = (): Bozza => ({ title: '', slug: '', date_iso: oggi(), category: CATEGORIE[0], excerpt: '', body: '', images: [], caption: '', caption2: '', published: true });

export default function AdminApp() {
  const [sessione, setSessione] = useState<'attesa' | 'fuori' | 'dentro'>('attesa');
  const [email, setEmail] = useState('');
  const [articoli, setArticoli] = useState<VoceElenco[] | null>(null);
  const [vista, setVista] = useState<Vista>({ tipo: 'elenco' });
  const [avviso, setAvviso] = useState<Avviso>(null);
  const [daEliminare, setDaEliminare] = useState<VoceElenco | null>(null);
  const [esportando, setEsportando] = useState(false);

  const avvisa = useCallback((testo: string, errore = false) => setAvviso({ testo, errore, id: Date.now() }), []);
  const chiudiAvviso = useCallback(() => setAvviso(null), []);

  // ---------- sessione ----------
  useEffect(() => {
    if (!supabaseConfigurato) return;
    const db = supabaseBrowser();
    db.auth.getSession().then(({ data }) => {
      setSessione(data.session ? 'dentro' : 'fuori');
      setEmail(data.session?.user.email ?? '');
    });
    const { data } = db.auth.onAuthStateChange((_e, s) => {
      setSessione(s ? 'dentro' : 'fuori');
      setEmail(s?.user.email ?? '');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const ricarica = useCallback(async () => {
    try {
      setArticoli(await caricaElenco());
    } catch (e) {
      setArticoli([]);
      avvisa(e instanceof Error ? `Non riesco a caricare gli articoli: ${e.message}` : 'Errore di caricamento.', true);
    }
  }, [avvisa]);

  useEffect(() => {
    if (sessione === 'dentro') ricarica();
  }, [sessione, ricarica]);

  const vai = (v: Vista) => {
    setVista(v);
    window.scrollTo({ top: 0 });
  };

  // ---------- azioni ----------
  async function apriEditor(a: VoceElenco) {
    try {
      const completo = await caricaArticolo(a.id);
      vai({ tipo: 'editor', bozza: { ...completo, slugToccato: true } });
    } catch (e) {
      avvisa(e instanceof Error ? e.message : 'Articolo non disponibile.', true);
    }
  }

  async function apriAnteprima(a: VoceElenco) {
    try {
      vai({ tipo: 'anteprima', articolo: await caricaArticolo(a.id), ritorno: 'elenco' });
    } catch (e) {
      avvisa(e instanceof Error ? e.message : 'Articolo non disponibile.', true);
    }
  }

  async function salva(b: Bozza, body: string, pubblica: boolean) {
    const nuovo = !b.id;
    const salvato = await salvaArticolo(b, body, pubblica); // gli errori li mostra l'editor
    avvisa(`${nuovo ? 'Articolo creato' : 'Articolo aggiornato'} · ${pubblica ? 'pubblicato' : 'salvato come bozza'}: ${salvato.title}`);
    vai({ tipo: 'elenco' });
    ricarica();
  }

  async function alterna(a: VoceElenco) {
    try {
      await cambiaStato(a.id, !a.published);
      avvisa(`${a.published ? 'Spostato in bozza' : 'Pubblicato'}: ${a.title}`);
      ricarica();
    } catch (e) {
      avvisa(e instanceof Error ? e.message : 'Operazione non riuscita.', true);
    }
  }

  async function elimina() {
    const a = daEliminare;
    setDaEliminare(null);
    if (!a) return;
    try {
      await eliminaArticolo(a.id);
      avvisa(`Articolo eliminato: ${a.title}`);
      ricarica();
    } catch (e) {
      avvisa(e instanceof Error ? e.message : 'Eliminazione non riuscita.', true);
    }
  }

  async function esporta() {
    setEsportando(true);
    try {
      const n = await esportaArticoli();
      avvisa(`File con ${n} articoli scaricato.`);
    } catch (e) {
      avvisa(e instanceof Error ? e.message : 'Export non riuscito.', true);
    } finally {
      setEsportando(false);
    }
  }

  // ---------- intestazione e piè di pagina ----------
  const dentro = sessione === 'dentro';
  const header = (
    <header className="adm-header">
      <div className="wrap adm-header__bar">
        <button className="brand" onClick={() => dentro && vai({ tipo: 'elenco' })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-iriense.png" alt="" style={{ width: 40, height: 40 }} />
          <span className="brand__name">
            <b style={{ fontSize: 16 }}>Atletica Iriense</b>
            <small>Risultati &amp; gestione contenuti</small>
          </span>
        </button>
        <nav className="adm-tabs" aria-label="Sezioni dell'area riservata">
          {dentro && (
            <>
              <button className="adm-tab" aria-current={vista.tipo !== 'gallery' && vista.tipo !== 'messaggi' ? 'page' : undefined} onClick={() => vai({ tipo: 'elenco' })}>Articoli</button>
              <button className="adm-tab" aria-current={vista.tipo === 'gallery' ? 'page' : undefined} onClick={() => vai({ tipo: 'gallery' })}>Gallery</button>
              <button className="adm-tab" aria-current={vista.tipo === 'messaggi' ? 'page' : undefined} onClick={() => vai({ tipo: 'messaggi' })}>Messaggi</button>
            </>
          )}
          <Link href="/" className="adm-home">{Icone.casa} Torna al sito</Link>
        </nav>
      </div>
    </header>
  );

  const footer = (
    <footer className="adm-footer">
      <div className="wrap">
        <span>Atletica Iriense Voghera · Area riservata</span>
        <span>{supabaseConfigurato ? (articoli ? `Collegato a Supabase · ${articoli.length} articoli` : 'Collegato a Supabase') : 'Supabase non collegato'}</span>
      </div>
    </footer>
  );

  // ---------- contenuto ----------
  let contenuto: React.ReactNode;

  if (!supabaseConfigurato) {
    contenuto = (
      <section className="adm-section">
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 var(--gutter)' }}>
          <div className="panel" style={{ borderRadius: 8, padding: 'clamp(26px,5vw,38px)' }}>
            <div className="adm-kicker">Area riservata</div>
            <h1 className="adm-title" style={{ fontSize: 32, lineHeight: 1, marginTop: 14 }}>Non ancora attiva</h1>
            <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.65, color: 'var(--muted)' }}>
              L&apos;area riservata si attiva collegando il database Supabase della società. Finché non è collegato, il sito mostra
              l&apos;archivio degli articoli in sola lettura.
            </p>
            <ol style={{ margin: '18px 0 0', paddingLeft: 20, fontSize: 15, lineHeight: 1.8, color: 'var(--muted)' }}>
              <li>Crea il progetto su Supabase ed esegui <code>supabase/schema.sql</code>.</li>
              <li>Su Vercel aggiungi <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
              <li>Ripubblica il sito e crea l&apos;utente della segreteria in Supabase → Authentication.</li>
            </ol>
            <p style={{ margin: '16px 0 0', fontSize: 14, color: 'rgba(20,22,26,.55)' }}>I passaggi completi sono nel file README del progetto.</p>
          </div>
        </div>
      </section>
    );
  } else if (sessione === 'attesa') {
    contenuto = <p style={{ padding: 60, textAlign: 'center', color: 'rgba(20,22,26,.6)' }}>Caricamento…</p>;
  } else if (sessione === 'fuori') {
    contenuto = <Login />;
  } else if (vista.tipo === 'editor') {
    contenuto = (
      <Editor
        key={vista.bozza.id ?? 'nuovo'}
        bozza={vista.bozza}
        onIndietro={() => vai({ tipo: 'elenco' })}
        onSalva={salva}
        onAnteprima={(b, body) =>
          vai({
            tipo: 'anteprima',
            ritorno: 'editor',
            bozza: { ...b, body },
            articolo: {
              slug: b.slug || 'anteprima',
              title: b.title || 'Senza titolo',
              date_iso: b.date_iso ?? null,
              date_label: labelFromIso(b.date_iso) || null,
              category: b.category ?? CATEGORIE[0],
              excerpt: b.excerpt ?? null,
              body,
              images: b.images ?? [],
              caption: b.caption ?? null,
              caption2: b.caption2 ?? null,
              published: !!b.published,
            },
          })
        }
      />
    );
  } else if (vista.tipo === 'anteprima') {
    const torna = () => (vista.ritorno === 'editor' && vista.bozza ? vai({ tipo: 'editor', bozza: vista.bozza }) : vai({ tipo: 'elenco' }));
    contenuto = (
      <>
        <div style={{ background: 'var(--blue)', color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          Anteprima · {vista.articolo.published ? 'articolo pubblicato' : 'bozza, non visibile sul sito'}
          {vista.articolo.published && vista.ritorno === 'elenco' && (
            <>
              {' · '}
              <a href={`/risultati/${vista.articolo.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>
                apri sul sito
              </a>
            </>
          )}
        </div>
        <ArticoloView
          a={vista.articolo}
          indietro={
            <button className="art-hero__back" onClick={torna}>
              {vista.ritorno === 'editor' ? "← Torna all'editor" : "← Torna all'area riservata"}
            </button>
          }
        />
      </>
    );
  } else if (vista.tipo === 'import') {
    contenuto = <ImportView onIndietro={() => vai({ tipo: 'elenco' })} onFatto={() => ricarica()} />;
  } else if (vista.tipo === 'messaggi') {
    contenuto = <MessaggiAdmin avvisa={avvisa} />;
  } else if (vista.tipo === 'gallery') {
    contenuto = articoli ? <GalleryAdmin articoli={articoli} avvisa={avvisa} /> : <p style={{ padding: 60, textAlign: 'center' }}>Caricamento…</p>;
  } else {
    contenuto = articoli ? (
      <ElencoArticoli
        articoli={articoli}
        email={email}
        esportando={esportando}
        onNuovo={() => vai({ tipo: 'editor', bozza: bozzaVuota() })}
        onModifica={apriEditor}
        onAnteprima={apriAnteprima}
        onElimina={setDaEliminare}
        onCambiaStato={alterna}
        onImport={() => vai({ tipo: 'import' })}
        onExport={esporta}
        onEsci={() => supabaseBrowser().auth.signOut()}
      />
    ) : (
      <p style={{ padding: 60, textAlign: 'center', color: 'rgba(20,22,26,.6)' }}>Carico gli articoli…</p>
    );
  }

  return (
    <div className="page">
      {header}
      <main style={{ flex: '1 0 auto' }}>{contenuto}</main>
      {footer}
      <Toast avviso={avviso} onChiudi={chiudiAvviso} />
      {daEliminare && (
        <Conferma titolo="Eliminare l'articolo?" etichetta="Elimina" onAnnulla={() => setDaEliminare(null)} onConferma={elimina}>
          “{daEliminare.title}” verrà rimosso dalla collection e sparirà dal blog pubblico. L&apos;operazione non si può annullare.
        </Conferma>
      )}
    </div>
  );
}
