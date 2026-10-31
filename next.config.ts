import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Le immagini arrivano da Supabase Storage e dal vecchio blog WordPress:
  // usiamo <img> semplici, quindi nessuna configurazione di next/image.
  poweredByHeader: false,
};

export default nextConfig;
