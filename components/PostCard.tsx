import Link from 'next/link';
import { annoDi, type ArticoloBreve } from '@/lib/supabase';

type Props = { a: ArticoloBreve; estratto?: boolean; titolo?: number };

/** Card dell'elenco articoli. Senza foto mostra un blocco tipografico con l'anno. */
export default function PostCard({ a, estratto = false, titolo = 22 }: Props) {
  const cover = a.images?.[0];
  return (
    <Link href={`/risultati/${a.slug}`} className="post-card">
      {cover ? (
        <div className="post-card__img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" loading="lazy" />
        </div>
      ) : (
        <div className="post-card__archive" aria-hidden="true">
          <span>Dall&apos;archivio</span>
          <span>{annoDi(a)}</span>
        </div>
      )}
      <div className="post-card__meta">
        {a.category}
        <span>{a.date_label}</span>
      </div>
      <h3 style={{ fontSize: titolo }}>{a.title}</h3>
      {estratto && a.excerpt && <p>{a.excerpt}</p>}
    </Link>
  );
}
