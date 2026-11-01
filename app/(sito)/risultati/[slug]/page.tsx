import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import ArticoloView from '@/components/ArticoloView';
import PostCard from '@/components/PostCard';
import { articoloDaSlug, articoliRecenti } from '@/lib/contenuti';
import { normalizzaSlug } from '@/lib/supabase';

// Le pagine si generano alla prima visita e si aggiornano ogni minuto:
// un articolo appena pubblicato dall'area riservata compare entro 60 secondi.
export const revalidate = 60;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await articoloDaSlug(slug);
  if (!a) return { title: 'Articolo non trovato' };
  return {
    title: a.title,
    description: a.excerpt ?? undefined,
    openGraph: { title: a.title, description: a.excerpt ?? undefined, images: a.images?.[0] ? [a.images[0]] : undefined, type: 'article' },
  };
}

export default async function ArticoloPage({ params }: Props) {
  const { slug } = await params;
  const a = await articoloDaSlug(slug);
  if (!a) {
    // vecchi indirizzi con il trattino finale (22 articoli dell'archivio WordPress)
    const pulito = normalizzaSlug(slug);
    if (pulito && pulito !== slug) permanentRedirect(`/risultati/${pulito}`);
    notFound();
  }

  const altri = await articoliRecenti(3, a.slug);
  const sito = process.env.NEXT_PUBLIC_SITE_URL || 'https://atletica-iriense.vercel.app';

  return (
    <main>
      <ArticoloView
        a={a}
        urlCondivisione={`${sito}/risultati/${a.slug}`}
        indietro={
          <Link href="/risultati" className="art-hero__back">
            ← Tutti i risultati
          </Link>
        }
      />

      <section style={{ padding: 'clamp(30px,5vw,60px) 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap">
          <div className="label" style={{ borderTop: '1px solid var(--line)', paddingTop: 30, fontSize: 12 }}>Continua a leggere</div>
          <div className="post-grid" style={{ marginTop: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,270px),1fr))' }}>
            {altri.map((p) => (
              <PostCard key={p.slug} a={p} titolo={21} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
