'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIE, type Foto } from '@/lib/supabase';
import { caricaGallery, pubblicaFoto, togliFoto, type FotoInAttesa, type VoceElenco } from '@/lib/admin';
import { PagerBottoni } from '@/components/Pager';
import { Conferma, Icone, Selettore } from './ui';

const PER_PAGINA = 24;

export default function GalleryAdmin({ articoli, avvisa }: { articoli: VoceElenco[]; avvisa: (t: string, errore?: boolean) => void }) {
  const [foto, setFoto] = useState<Foto[] | null>(null);
  const [filtro, setFiltro] = useState<'Tutte' | 'Caricate' | 'Dagli articoli'>('Tutte');
  const [pagina, setPagina] = useState(1);
  const [attesa, setAttesa] = useState<FotoInAttesa[]>([]);
  const [pubblicando, setPubblicando] = useState<number | null>(null);
  const [errore, setErrore] = useState('');
  const [daTogliere, setDaTogliere] = useState<Foto | null>(null);
  const [sopra, setSopra] = useState(false);

  const ricarica = useCallback(() => {
    caricaGallery(articoli)
      .then(setFoto)
      .catch((e) => setErrore(e instanceof Error ? e.message : 'Non riesco a caricare la gallery.'));
  }, [articoli]);

  useEffect(ricarica, [ricarica]);

  // libera le anteprime locali quando si esce dalla pagina
  const anteprime = useRef<string[]>([]);
  useEffect(() => () => anteprime.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function aggiungi(files: FileList | File[] | null) {
    const lista = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'));
    if (!lista.length) {
      setErrore('Nessuna immagine valida: usa JPG o PNG.');
      return;
    }
    setErrore('');
    const anno = String(new Date().getFullYear());
    setAttesa((a) => [
      ...a,
      ...lista.map((file) => {
        const anteprima = URL.createObjectURL(file);
        anteprime.current.push(anteprima);
        return {
        key: crypto.randomUUID(),
        file,
        anteprima,
        title: file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim(),
        cat: 'Altre gare',
        year: anno,
        };
      }),
    ]);
  }

  const modifica = (key: string, patch: Partial<FotoInAttesa>) => setAttesa((a) => a.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  async function conferma() {
    setErrore('');
    setPubblicando(0);
    let fatte = 0;
    try {
      const n = await pubblicaFoto(attesa, (k) => {
        fatte = k;
        setPubblicando(k);
      });
      setAttesa([]);
      setFiltro('Tutte');
      setPagina(1);
      avvisa(n === 1 ? '1 foto pubblicata nella gallery.' : `${n} foto pubblicate nella gallery.`);
      ricarica();
    } catch (e) {
      // le foto già pubblicate escono dall'anteprima, così riprovando non si duplicano
      if (fatte) {
        setAttesa((a) => a.slice(fatte));
        ricarica();
      }
      setErrore(e instanceof Error ? e.message : 'Pubblicazione non riuscita, riprova.');
    } finally {
      setPubblicando(null);
    }
  }

  async function togli() {
    const f = daTogliere;
    setDaTogliere(null);
    if (!f) return;
    try {
      await togliFoto(f);
      avvisa('Foto tolta dalla gallery.');
      ricarica();
    } catch (e) {
      avvisa(e instanceof Error ? e.message : 'Operazione non riuscita.', true);
    }
  }

  const tutte = foto ?? [];
  const nCaricate = tutte.filter((f) => f.manual).length;
  const mostrate = tutte.filter((f) => filtro === 'Tutte' || (filtro === 'Caricate' ? f.manual : !f.manual));
  const pagine = Math.max(1, Math.ceil(mostrate.length / PER_PAGINA));
  const p = Math.min(pagina, pagine);

  return (
    <section className="adm-section">
      <div className="wrap">
        <div className="adm-kicker">Collection · Gallery</div>
        <h1 className="adm-title">Gestione gallery</h1>
        <p className="adm-sub">{foto ? `${tutte.length} foto in gallery · ${nCaricate} caricate da qui` : 'Caricamento…'}</p>

        <div className="panel" style={{ marginTop: 26, padding: 'clamp(20px,3vw,28px)' }}>
          <div className="label" style={{ letterSpacing: '.16em', color: 'rgba(20,22,26,.5)' }}>Carica nuove foto</div>

          {attesa.length === 0 ? (
            <label
              className="dropzone"
              style={{ marginTop: 16, padding: '34px 18px' }}
              data-over={sopra}
              onDragOver={(e) => { e.preventDefault(); setSopra(true); }}
              onDragLeave={() => setSopra(false)}
              onDrop={(e) => { e.preventDefault(); setSopra(false); aggiungi(e.dataTransfer.files); }}
            >
              {Icone.carica}
              <strong>Scegli o trascina le foto</strong>
              <small>JPG o PNG, anche più file insieme · prima di pubblicarle potrai controllare didascalia, categoria e anno</small>
              <input type="file" accept="image/*" multiple hidden onChange={(e) => { aggiungi(e.target.files); e.target.value = ''; }} />
            </label>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 16, paddingBottom: 16, borderBottom: '1px solid var(--line-soft)' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-.02em', textTransform: 'uppercase' }}>Anteprima</div>
                  <div style={{ fontSize: 14, color: 'rgba(20,22,26,.6)', marginTop: 3 }}>
                    {attesa.length === 1 ? '1 foto da pubblicare' : `${attesa.length} foto da pubblicare`} · controlla i dati prima di confermare
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
                    {Icone.piu} Aggiungi altre
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => { aggiungi(e.target.files); e.target.value = ''; }} />
                  </label>
                  <button className="btn btn--outline btn--sm" onClick={() => setAttesa([])} disabled={pubblicando !== null}>Annulla</button>
                  <button className="btn btn--dark btn--sm" onClick={conferma} disabled={pubblicando !== null}>
                    {Icone.spunta}
                    {pubblicando !== null ? `Pubblico ${pubblicando}/${attesa.length}…` : 'Conferma e pubblica'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,250px),1fr))', gap: 18, marginTop: 18 }}>
                {attesa.map((x) => (
                  <div className="card" key={x.key} style={{ transform: 'none' }}>
                    <div className="card__media card__media--43">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={x.anteprima} alt="" style={{ objectPosition: '50% 30%' }} />
                      <button
                        onClick={() => setAttesa((a) => a.filter((y) => y.key !== x.key))}
                        aria-label="Togli dall'anteprima"
                        style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 100, background: 'rgba(20,22,26,.72)', color: '#fff' }}
                      >
                        {Icone.chiudi}
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14 }}>
                      <label className="field">
                        <span style={{ fontSize: 10 }}>Didascalia</span>
                        <input className="input" value={x.title} onChange={(e) => modifica(x.key, { title: e.target.value })} placeholder="Scrivi una didascalia" style={{ fontSize: 14, padding: '11px 12px' }} />
                      </label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div className="field" style={{ flex: '1 1 auto', minWidth: 0 }}>
                          <span style={{ fontSize: 10 }}>Categoria</span>
                          <Selettore etichetta="Categoria" value={x.cat} onChange={(v) => modifica(x.key, { cat: v })} opzioni={CATEGORIE} />
                        </div>
                        <label className="field" style={{ flex: '0 0 78px' }}>
                          <span style={{ fontSize: 10 }}>Anno</span>
                          <input
                            className="input mono"
                            inputMode="numeric"
                            maxLength={4}
                            value={x.year}
                            onChange={(e) => modifica(x.key, { year: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            style={{ fontSize: 14, padding: '11px 10px' }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {errore && <div role="alert" style={{ marginTop: 12, fontSize: 14, color: 'var(--red)' }}>{errore}</div>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
          {([['Tutte', tutte.length], ['Caricate', nCaricate], ['Dagli articoli', tutte.length - nCaricate]] as const).map(([l, n]) => (
            <button key={l} className={`chip${filtro === l ? ' chip--on' : ''}`} onClick={() => { setFiltro(l); setPagina(1); }}>
              {l}
              <span className="mono">{n}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,230px),1fr))', gap: 18, marginTop: 20 }}>
          {mostrate.slice((p - 1) * PER_PAGINA, p * PER_PAGINA).map((f) => (
            <article className="card" key={f.src}>
              <div className="card__media card__media--43">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt="" loading="lazy" style={{ objectPosition: '50% 30%' }} />
                <span className={`card__badge${f.manual ? '' : ' card__badge--draft'}`} style={{ top: 10, left: 10, padding: '5px 8px' }}>
                  {f.manual ? 'Caricata' : 'Da articolo'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 14px 16px' }}>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title || 'Senza didascalia'}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(20,22,26,.5)', marginTop: 5 }}>
                    {[f.cat, f.year].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <button className="icon-btn icon-btn--danger" onClick={() => setDaTogliere(f)} title="Togli dalla gallery" aria-label="Togli dalla gallery">
                  {Icone.cestino}
                </button>
              </div>
            </article>
          ))}
        </div>

        {foto && mostrate.length === 0 && (
          <div className="empty" style={{ marginTop: 16, padding: '44px 20px', color: 'rgba(20,22,26,.6)', fontSize: 15 }}>Nessuna foto in questo filtro.</div>
        )}

        <div style={{ marginTop: 30 }}>
          <PagerBottoni
            pagina={p}
            pagine={pagine}
            onGo={(n) => { setPagina(n); window.scrollTo({ top: 0 }); }}
            etichetta={`Foto ${(p - 1) * PER_PAGINA + 1}–${Math.min(p * PER_PAGINA, mostrate.length)} di ${mostrate.length} · pagina ${p} di ${pagine}`}
          />
        </div>
      </div>

      {daTogliere && (
        <Conferma titolo="Togliere la foto?" etichetta="Togli" onAnnulla={() => setDaTogliere(null)} onConferma={togli}>
          {daTogliere.manual
            ? 'La foto caricata verrà eliminata e sparirà dalla gallery del sito.'
            : 'La foto resta nel suo articolo, ma non comparirà più nella gallery del sito.'}
        </Conferma>
      )}
    </section>
  );
}
