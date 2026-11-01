'use client';

import { useEffect, useRef, useState } from 'react';
import { CATEGORIE, labelFromIso, slugInScrittura, slugify } from '@/lib/supabase';
import { caricaImmagine, type Bozza } from '@/lib/admin';
import { Icone, Selettore } from './ui';

type Props = {
  bozza: Bozza;
  onIndietro: () => void;
  onSalva: (b: Bozza, body: string, pubblica: boolean) => Promise<void>;
  onAnteprima: (b: Bozza, body: string) => void;
};

/** Testo incollato da Word o dal web: tieni solo le parole, un paragrafo per riga. */
function testoInParagrafi(testo: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return testo
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => `<p>${esc(r)}</p>`)
    .join('');
}

export default function Editor({ bozza, onIndietro, onSalva, onAnteprima }: Props) {
  const [d, setD] = useState<Bozza>(bozza);
  const [menu, setMenu] = useState(false);
  const [errore, setErrore] = useState('');
  const [erroreFoto, setErroreFoto] = useState('');
  const [caricando, setCaricando] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [modificato, setModificato] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);
  const selezione = useRef<Range | null>(null);

  // Il corpo è un contenteditable non controllato: lo riempiamo una volta sola.
  useEffect(() => {
    if (corpo.current) corpo.current.innerHTML = bozza.body ?? '';
  }, [bozza]);

  // Avvisa prima di chiudere la scheda con modifiche non salvate.
  useEffect(() => {
    if (!modificato) return;
    const avvisa = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', avvisa);
    return () => window.removeEventListener('beforeunload', avvisa);
  }, [modificato]);

  const aggiorna = (patch: Partial<Bozza>) => {
    setD((x) => ({ ...x, ...patch }));
    setModificato(true);
  };

  const ricordaCursore = () => {
    const s = window.getSelection();
    if (s && s.rangeCount && corpo.current?.contains(s.anchorNode)) selezione.current = s.getRangeAt(0).cloneRange();
  };
  const ripristinaCursore = () => {
    corpo.current?.focus();
    const s = window.getSelection();
    if (selezione.current && s) {
      s.removeAllRanges();
      s.addRange(selezione.current);
    }
  };

  const comando = (cmd: string, arg?: string) => {
    ripristinaCursore();
    document.execCommand(cmd, false, arg);
    setMenu(false);
    setModificato(true);
  };

  async function immagineNelTesto(file?: File) {
    if (!file) return;
    setMenu(false);
    setErroreFoto('');
    setCaricando((n) => n + 1);
    try {
      const url = await caricaImmagine(file, 'articoli');
      ripristinaCursore();
      document.execCommand('insertHTML', false, `<p><img src="${url}" alt="" /></p><p><br></p>`);
      setModificato(true);
    } catch (e) {
      setErroreFoto(e instanceof Error ? e.message : 'Caricamento non riuscito.');
    } finally {
      setCaricando((n) => n - 1);
    }
  }

  async function aggiungiFoto(files: FileList | null) {
    const lista = Array.from(files ?? []);
    if (!lista.length) return;
    setErroreFoto('');
    setCaricando((n) => n + lista.length);
    const ok: string[] = [];
    const falliti: string[] = [];
    await Promise.all(
      lista.map(async (f) => {
        try {
          ok.push(await caricaImmagine(f, 'articoli'));
        } catch (e) {
          falliti.push(e instanceof Error ? e.message : f.name);
        } finally {
          setCaricando((n) => n - 1);
        }
      }),
    );
    if (ok.length) {
      // aggiornamento funzionale: durante il caricamento l'elenco può essere cambiato
      setD((x) => ({ ...x, images: [...(x.images ?? []), ...ok] }));
      setModificato(true);
    }
    if (falliti.length) setErroreFoto(falliti.join(' · '));
  }

  const spostaInCopertina = (i: number) => {
    const imgs = [...(d.images ?? [])];
    const [x] = imgs.splice(i, 1);
    aggiorna({ images: [x, ...imgs] });
  };

  async function salva(pubblica: boolean) {
    setErrore('');
    if (caricando > 0) {
      setErrore('Aspetta che finisca il caricamento delle foto.');
      return;
    }
    setSalvando(true);
    try {
      await onSalva(d, corpo.current?.innerHTML ?? '', pubblica);
      setModificato(false);
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'Salvataggio non riuscito, riprova.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  }

  const indietro = () => {
    if (modificato && !confirm('Ci sono modifiche non salvate. Uscire comunque?')) return;
    onIndietro();
  };

  const immagini = d.images ?? [];

  return (
    <section className="adm-section" style={{ paddingTop: 'clamp(30px,5vw,50px)' }}>
      <div className="wrap">
        <button onClick={indietro} className="label" style={{ letterSpacing: '.14em', fontSize: 12, color: 'rgba(20,22,26,.6)' }}>
          ← Torna all&apos;elenco
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 18 }}>
          <h1 className="adm-title" style={{ fontSize: 'clamp(28px,4.4vw,50px)', margin: 0, lineHeight: 1 }}>
            {d.id ? 'Modifica articolo' : 'Nuovo articolo'}
          </h1>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn--outline btn--sm" onClick={() => onAnteprima(d, corpo.current?.innerHTML ?? '')}>Anteprima</button>
            <button className="btn btn--outline btn--sm" onClick={() => salva(false)} disabled={salvando}>Salva come bozza</button>
            <button className="btn btn--dark btn--sm" onClick={() => salva(true)} disabled={salvando}>{salvando ? 'Salvataggio…' : 'Salva e pubblica'}</button>
          </div>
        </div>

        {errore && <div className="notice notice--error" role="alert" style={{ marginTop: 20 }}>{errore}</div>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 26, alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 min(100%,620px)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="panel panel--pad">
              <label className="field">
                <span>Titolo *</span>
                <input
                  className="input"
                  value={d.title ?? ''}
                  onChange={(e) => aggiorna({ title: e.target.value, ...(d.slugToccato ? {} : { slug: slugify(e.target.value) }) })}
                  placeholder="Es. Cinque medaglie ai regionali indoor"
                  style={{ fontSize: 18, fontWeight: 600 }}
                />
              </label>
              <label className="field">
                <span>Slug (indirizzo)</span>
                <input
                  className="input mono"
                  value={d.slug ?? ''}
                  onChange={(e) => aggiorna({ slug: slugInScrittura(e.target.value), slugToccato: true })}
                  placeholder="si-genera-dal-titolo"
                  style={{ fontSize: 15 }}
                />
                <small style={{ fontSize: 12, color: 'rgba(20,22,26,.5)', letterSpacing: 0, textTransform: 'none', fontWeight: 400 }}>
                  Indirizzo pubblico: /risultati/{d.slug || '…'}
                </small>
              </label>
              <label className="field">
                <span>Estratto</span>
                <textarea
                  className="input"
                  rows={3}
                  value={d.excerpt ?? ''}
                  onChange={(e) => aggiorna({ excerpt: e.target.value })}
                  placeholder="Due righe di sintesi, mostrate nella griglia"
                  style={{ fontSize: 15 }}
                />
              </label>
            </div>

            <div className="panel" style={{ overflow: 'visible' }}>
              <div className="rt-toolbar">
                <span className="label" style={{ letterSpacing: '.16em', color: 'rgba(20,22,26,.5)', marginRight: 'auto' }}>Corpo dell&apos;articolo</span>
                {!menu && <span style={{ fontSize: 12, color: 'rgba(20,22,26,.45)' }}>Aggiungi</span>}
                <button
                  className="plus-btn"
                  aria-expanded={menu}
                  aria-label="Aggiungi formattazione o immagine"
                  onMouseDown={ricordaCursore}
                  onClick={() => setMenu((v) => !v)}
                >
                  {Icone.piu}
                </button>
                {menu && (
                  <div className="plus-menu" role="menu">
                    <button role="menuitem" onClick={() => comando('bold')}><b style={{ width: 20, textAlign: 'center', fontSize: 16 }}>B</b>Grassetto</button>
                    <button role="menuitem" onClick={() => comando('italic')}><i style={{ width: 20, textAlign: 'center', fontSize: 16, fontFamily: 'Georgia,serif' }}>I</i>Corsivo</button>
                    <button role="menuitem" onClick={() => comando('formatBlock', 'blockquote')}><span style={{ width: 20, textAlign: 'center', fontSize: 19, fontFamily: 'Georgia,serif', lineHeight: 1 }}>”</span>Citazione</button>
                    <button role="menuitem" onClick={() => comando('insertUnorderedList')}><span style={{ width: 20, textAlign: 'center' }}>•</span>Elenco puntato</button>
                    <button role="menuitem" onClick={() => comando('formatBlock', 'p')}><span style={{ width: 20, textAlign: 'center' }}>¶</span>Testo normale</button>
                    <hr />
                    <label role="menuitem">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }} aria-hidden="true">
                        <rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M3.9 16.5 9 11.6l3.4 3.2 2.7-2.4 4.6 4" /><circle cx="15.4" cy="9.2" r="1.2" />
                      </svg>
                      Inserisci immagine
                      <input type="file" accept="image/*" hidden onChange={(e) => { immagineNelTesto(e.target.files?.[0]); e.target.value = ''; }} />
                    </label>
                  </div>
                )}
              </div>
              <div
                ref={corpo}
                className="rt"
                contentEditable
                suppressContentEditableWarning
                data-ph="Scrivi qui il racconto della gara…"
                role="textbox"
                aria-multiline="true"
                aria-label="Corpo dell'articolo"
                onInput={() => setModificato(true)}
                onKeyUp={ricordaCursore}
                onMouseUp={ricordaCursore}
                onPaste={(e) => {
                  e.preventDefault();
                  document.execCommand('insertHTML', false, testoInParagrafi(e.clipboardData.getData('text/plain')));
                  setModificato(true);
                }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 min(100%,320px)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="panel panel--pad" style={{ padding: 22 }}>
              <label className="field">
                <span>Data</span>
                <input className="input" type="date" value={d.date_iso ?? ''} onChange={(e) => aggiorna({ date_iso: e.target.value })} style={{ fontSize: 15, padding: '12px 14px' }} />
                <small style={{ fontSize: 12, color: 'rgba(20,22,26,.5)', letterSpacing: 0, textTransform: 'none', fontWeight: 400 }}>
                  Etichetta: {labelFromIso(d.date_iso) || '—'}
                </small>
              </label>
              <div className="field">
                <span>Categoria</span>
                <Selettore etichetta="Categoria" value={d.category ?? CATEGORIE[0]} onChange={(v) => aggiorna({ category: v })} opzioni={CATEGORIE} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: '1px solid var(--line-soft)', paddingTop: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{d.published ? 'Pubblicato' : 'Bozza'}</span>
                <button
                  className="switch"
                  role="switch"
                  aria-checked={!!d.published}
                  aria-label="Pubblicato"
                  onClick={() => aggiorna({ published: !d.published })}
                >
                  <span />
                </button>
              </div>
              <button className="btn btn--dark btn--sm" onClick={() => salva(!!d.published)} disabled={salvando}>
                {salvando ? 'Salvataggio…' : 'Salva'}
              </button>
            </div>

            <div className="panel panel--pad" style={{ padding: 22, gap: 14 }}>
              <span className="label" style={{ letterSpacing: '.16em', color: 'rgba(20,22,26,.5)' }}>Immagini</span>
              <label className="dropzone" style={{ padding: '24px 16px' }}>
                <strong style={{ fontSize: 15 }}>{caricando > 0 ? `Carico ${caricando} foto…` : 'Carica una o più foto'}</strong>
                <small>JPG o PNG · la prima è la copertina · le foto grandi vengono ridotte</small>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => { aggiungiFoto(e.target.files); e.target.value = ''; }} />
              </label>
              {erroreFoto && <div role="alert" style={{ fontSize: 13, color: 'var(--red)' }}>{erroreFoto}</div>}
              {immagini.map((src, i) => (
                <div className="thumb-row" key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                  <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: 12, color: 'rgba(20,22,26,.6)' }}>
                    {i === 0 ? <b style={{ color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 11 }}>Copertina</b> : `Foto ${i + 1}`}
                    {i > 0 && (
                      <button onClick={() => spostaInCopertina(i)} style={{ display: 'block', marginTop: 4, fontSize: 12, color: 'var(--blue)', textDecoration: 'underline' }}>
                        Metti in copertina
                      </button>
                    )}
                  </span>
                  <button className="mini mini--danger" style={{ padding: '7px 10px' }} onClick={() => aggiorna({ images: immagini.filter((_, j) => j !== i) })}>
                    Togli
                  </button>
                </div>
              ))}
              <label className="field">
                <span>Didascalia copertina</span>
                <input className="input" value={d.caption ?? ''} onChange={(e) => aggiorna({ caption: e.target.value })} placeholder="Opzionale" style={{ fontSize: 14, padding: '11px 13px' }} />
              </label>
              <label className="field">
                <span>Didascalia foto 2</span>
                <input className="input" value={d.caption2 ?? ''} onChange={(e) => aggiorna({ caption2: e.target.value })} placeholder="Opzionale" style={{ fontSize: 14, padding: '11px 13px' }} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
