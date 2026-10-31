'use client';

import { useEffect, useRef } from 'react';

/**
 * Video di sfondo dell'hero. Il "muted" va impostato da script: React non lo
 * scrive nell'HTML iniziale e senza di esso i browser bloccano l'autoplay.
 */
export default function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let ridotto = false;
    try {
      ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {}
    v.muted = true;
    v.defaultMuted = true;
    if (ridotto) return;
    const prova = () => v.play().catch(() => {});
    prova();
    v.addEventListener('canplay', prova);
    return () => v.removeEventListener('canplay', prova);
  }, []);

  return (
    <video ref={ref} muted loop playsInline autoPlay preload="metadata" poster={poster} aria-hidden="true">
      <source src={src} type="video/mp4" />
    </video>
  );
}
