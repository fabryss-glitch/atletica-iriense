import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Corsi per bambini e ragazzi',
  description: 'Corsi di atletica leggera al Campo Giovani di Voghera dai 3 anni alle scuole superiori. Iscrizioni aperte tutto l’anno.',
};

const FASCE = [
  {
    name: 'Primi passi',
    age: '3-5 anni',
    nuovo: true,
    img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1600&q=80',
    desc: 'Gioco e attività motorie semplici per un primo approccio al movimento, in un ambiente sicuro e stimolante.',
  },
  {
    name: 'Baby atletica',
    age: '6-11 anni',
    nuovo: false,
    img: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&w=1600&q=80',
    desc: 'Corsa, salti e lanci sotto forma di gioco. Le prime gare di categoria, i cross e il Club del Miglio.',
  },
  {
    name: 'Ragazzi e cadetti',
    age: '12 anni in su',
    nuovo: false,
    img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
    desc: 'Allenamenti mirati per chi vuole crescere davvero: velocità, ostacoli, mezzofondo, salti e lanci verso i campionati.',
  },
];

const INFO = [
  { k: 'Dove', v: 'Campo Giovani — Via Barbieri 182, Voghera' },
  { k: 'Ripartenza corsi', v: '22 settembre' },
  { k: 'Età', v: "Dai 3 anni alle scuole superiori, gruppi per fascia d'età" },
  { k: 'Info e iscrizioni', v: 'atleticairiense@gmail.com' },
];

export default function CorsiPage() {
  return (
    <main>
      <section className="page-head" style={{ paddingBottom: 'clamp(24px,4vw,40px)' }}>
        <div className="wrap">
          <div className="eyebrow">Corsi · Campo Giovani</div>
          <h1 className="display" style={{ fontSize: 'clamp(52px,10vw,150px)' }}>
            Cresciamo
            <br />
            correndo
          </h1>
          <p className="lead" style={{ maxWidth: 640, fontSize: 19 }}>
            Ogni autunno riaccendiamo la passione per l&apos;atletica tra i più giovani. I corsi per bambini e ragazzi accompagnano i nostri
            piccoli atleti alla scoperta dello sport, del movimento e dei valori che ci guidano: impegno, rispetto, condivisione e
            divertimento. Le iscrizioni sono aperte tutto l&apos;anno.
          </p>
        </div>
      </section>

      <section style={{ padding: 'clamp(16px,3vw,30px) 0' }}>
        <div className="wrap">
          <div className="photo" style={{ height: 'clamp(210px,40vw,420px)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?auto=format&fit=crop&w=1800&q=80" alt="" />
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(24px,4vw,44px) 0' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,2.4vw,22px)' }}>
          {FASCE.map((f, i) => (
            <article key={f.name} className={`fascia${i % 2 === 1 ? ' fascia--dark' : ''}`}>
              <div className="fascia__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt="" loading="lazy" />
              </div>
              <div className="fascia__body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="fascia__age">{f.age}</span>
                  {f.nuovo && <span className="fascia__new">Novità</span>}
                </div>
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dark" style={{ padding: 'clamp(40px,6vw,64px) 0', margin: 'clamp(20px,3vw,32px) 0' }}>
        <div className="wrap">
          <div className="eyebrow eyebrow--light">In breve</div>
          <div className="info-grid">
            {INFO.map((i) => (
              <div key={i.k}>
                <div className="k">{i.k}</div>
                <div className="v">{i.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(20px,4vw,40px) 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap">
          <div className="cta-band">
            <div style={{ flex: '1 1 340px' }}>
              <div style={{ fontWeight: 800, letterSpacing: '-.025em', textTransform: 'uppercase', fontSize: 'clamp(26px,3.6vw,42px)', lineHeight: 1 }}>
                Iscriviti ora
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', marginTop: 12 }}>
                Campo Giovani · Via Luigi Barbieri 182, Voghera · atleticairiense@gmail.com
              </div>
            </div>
            <Link href="/contatti#scrivici" className="btn btn--light">Vai al modulo</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
