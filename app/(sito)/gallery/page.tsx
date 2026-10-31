import type { Metadata } from 'next';
import GalleryGrid from '@/components/GalleryGrid';
import { fotoGallery } from '@/lib/contenuti';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Gallery',
  description: "Podi, partenze, gruppi e volti dell'Atletica Iriense: le foto di oltre cinquant'anni al Campo Giovani.",
};

export default async function GalleryPage() {
  const foto = await fotoGallery(240);

  return (
    <main>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">Gallery</div>
          <h1 className="display" style={{ fontSize: 'clamp(48px,9.5vw,150px)' }}>
            Sotto i<br />
            nostri colori
          </h1>
          <p className="lead" style={{ maxWidth: 560 }}>
            Podi, partenze, gruppi e volti di una stagione. Le immagini raccontano oltre cinquant&apos;anni al Campo Giovani.
          </p>
        </div>
      </section>
      <section style={{ padding: '0 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap" style={{ marginTop: -30 }}>
          <GalleryGrid foto={foto} />
        </div>
      </section>
    </main>
  );
}
