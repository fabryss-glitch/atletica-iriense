import Link from 'next/link';
import HeroVideo from '@/components/HeroVideo';
import PostCard from '@/components/PostCard';
import { articoliRecenti } from '@/lib/contenuti';

export const revalidate = 60;

const FOTO = {
  corsi: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=80',
  appuntamenti: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=2000&q=80',
  galleria: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&w=1400&q=80',
};

export default async function Home() {
  const inEvidenza = await articoliRecenti(3);

  return (
    <main>
      <section className="hero">
        <HeroVideo src="/assets/hero-iriense.mp4" />
        <div className="hero__shade" />
        <div className="wrap hero__content">
          <div className="hero__kicker">Società di atletica leggera · Voghera</div>
          <h1>
            Corri. Salta.
            <br />
            Lancia.
          </h1>
          <div className="hero__row">
            <p>
              Atletica leggera a Voghera dal 1955. Dai primi passi dei più piccoli ai primati dei nostri campioni: una squadra
              bianco-azzurra, tre discipline, una sola passione.
            </p>
            <div className="hero__actions">
              <Link href="/corsi" className="btn btn--light">Iscrivi tuo figlio</Link>
              <Link href="/risultati" className="btn btn--ghost-light">I nostri risultati</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap stats">
          <div><b>1955</b><span>dal</span></div>
          <div><b>150+</b><span>atleti tesserati</span></div>
          <div><b>3–99</b><span>anni, tutte le età</span></div>
          <div><b>5</b><span>gruppi per età</span></div>
        </div>
      </section>

      <section style={{ padding: 'clamp(40px,6vw,70px) 0 clamp(20px,4vw,40px)' }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px,4vw,40px)', alignItems: 'flex-start' }}>
          <div className="eyebrow" style={{ flex: '1 1 150px', paddingTop: 8 }}>Chi siamo</div>
          <div style={{ flex: '3 1 min(100%,760px)' }}>
            <p style={{ margin: 0, fontWeight: 500, letterSpacing: '-.015em', lineHeight: 1.25, fontSize: 'clamp(26px,3.4vw,46px)', textWrap: 'pretty' }}>
              Siamo una società storica dell&apos;Oltrepò Pavese, nata nel 1955 al Campo Giovani. Cresciamo attorno a quattro valori:
              impegno, rispetto, condivisione e divertimento. Corse, salti e lanci — dai corsi di avviamento per bambini fino ai master
              che continuano a gareggiare a livello nazionale.
            </p>
            <Link href="/societa" className="link-line" style={{ marginTop: 26 }}>La società</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(30px,5vw,50px) 0 0' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,3vw,28px)' }}>
          <article className="feature">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FOTO.corsi} alt="" style={{ objectPosition: '50% 40%' }} />
            <div className="feature__shade" style={{ background: 'linear-gradient(100deg,rgba(20,22,26,.9) 0%,rgba(20,22,26,.72) 42%,rgba(20,22,26,.12) 78%)' }} />
            <div className="feature__body">
              <div className="eyebrow eyebrow--light">Corsi</div>
              <h3>Cresciamo correndo</h3>
              <p>
                I corsi per bambini e ragazzi ripartono ogni autunno al Campo Giovani, con gruppi divisi per età e tecnici qualificati.
                Da quest&apos;anno accogliamo anche i più piccoli, dai 3 anni.
              </p>
              <Link href="/corsi" className="btn btn--light">Scopri i corsi</Link>
            </div>
          </article>

          <article className="feature" style={{ justifyContent: 'flex-end' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FOTO.appuntamenti} alt="" style={{ objectPosition: '50% 45%' }} />
            <div className="feature__shade" style={{ background: 'linear-gradient(260deg,rgba(20,22,26,.9) 0%,rgba(20,22,26,.72) 42%,rgba(20,22,26,.1) 78%)' }} />
            <div className="feature__body">
              <div className="eyebrow eyebrow--light">Prossimi appuntamenti</div>
              <h3>Ripartenza corsi</h3>
              <p>
                I gruppi tornano in pista <b>lunedì 22 settembre</b> al Campo Giovani. Le iscrizioni sono aperte per tutte le categorie,
                dai primi passi ai ragazzi delle superiori.
              </p>
              <Link href="/contatti" className="btn btn--light">Contattaci</Link>
            </div>
          </article>
        </div>
      </section>

      <section style={{ padding: 'clamp(64px,9vw,100px) 0 clamp(30px,5vw,50px)' }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', borderBottom: '1px solid var(--line)', paddingBottom: 20 }}>
            <h2 className="title-xl">In evidenza</h2>
            <Link href="/risultati" className="link-line">Tutti i risultati</Link>
          </div>
          <div className="post-grid" style={{ marginTop: 32, gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,270px),1fr))' }}>
            {inEvidenza.map((a) => (
              <PostCard key={a.slug} a={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="banner" style={{ marginTop: 'clamp(30px,5vw,50px)' }}>
        <div className="banner__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOTO.galleria} alt="" />
          <div className="banner__shade" />
          <div className="wrap banner__content">
            <h2>
              Sotto i<br />nostri colori
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <p style={{ maxWidth: 440, margin: 0, fontSize: 17, color: 'rgba(255,255,255,.85)' }}>
                Podi, partenze, gruppi e volti di una stagione. Le immagini raccontano oltre cinquant&apos;anni al Campo Giovani.
              </p>
              <Link href="/gallery" className="btn btn--light">Apri la galleria</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
