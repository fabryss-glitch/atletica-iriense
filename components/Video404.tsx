'use client';

import { useEffect, useRef } from 'react';

/** L'atleta ai blocchi: parte una volta e si ferma sull'ultimo fotogramma. Un clic lo fa ripartire. */
export default function Video404() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    let ridotto = false;
    try {
      ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {}
    if (ridotto) {
      const allaFine = () => {
        v.pause();
        v.currentTime = Math.max(0, v.duration - 0.05);
      };
      if (v.readyState >= 1) allaFine();
      else v.addEventListener('loadedmetadata', allaFine, { once: true });
      return;
    }
    v.play().catch(() => {});
  }, []);

  const riparti = () => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  return (
    <video
      ref={ref}
      src="/assets/404-atleta.mp4"
      muted
      playsInline
      autoPlay
      preload="auto"
      onClick={riparti}
      aria-label="Un velocista ai blocchi alza lo sguardo"
    />
  );
}
