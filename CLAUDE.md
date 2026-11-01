# Atletica Iriense Voghera — contesto per Claude Code

Sito della società di atletica leggera Atletica Iriense Voghera (dal 1955, Campo Giovani,
Via Luigi Barbieri 182, Voghera). Sostituisce il vecchio blog iriense.wordpress.com.
Lo sviluppa Fab (fabryss-glitch) per la società, in vibe coding, a costo zero.
Lingua del progetto: italiano (testi, commenti, nomi di funzioni e variabili).

## Stack
- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.9
- Supabase: database, Auth (solo la segreteria), Storage (bucket `articoli-foto`)
- Hosting: Vercel, deploy automatico a ogni push su `main`
- Font ospitati in locale con `@fontsource` (niente Google Fonts, scelta voluta per la privacy)
- Niente Tailwind: un unico foglio `app/globals.css` con classi semantiche

## Origine del design
Il design viene da Claude Design (file `.dc.html`, non presenti nel repo). Le pagine sono una
traduzione fedele di quel design: prima di cambiare l'aspetto, chiedere a Fab.
Palette: inchiostro `#14161A`, carta `#F5F3EF`, blu `#3F7CC4`, blu chiaro `#8FB6E4`.
Font: Onest (testi e titoli, maiuscoli e molto pesanti), Space Mono (tempi, numeri, anni).
Elemento ricorrente: sei corsie verticali sottili (`components/Lanes.tsx`).

## Struttura
- `app/(sito)/` pagine pubbliche: home, societa, corsi, risultati, risultati/[slug], gallery, contatti, regolamento, privacy
- `app/admin/` + `components/admin/` area riservata (porting del pannello "Blog CMS" di Claude Design)
- `app/azioni.ts` server actions: modulo contatti (tabella `messaggi`) e newsletter (tabella `newsletter`)
- `lib/supabase.ts` client, tipi, `slugify`, `normalizzaSlug`, `CATEGORIE`
- `lib/contenuti.ts` letture lato server per le pagine pubbliche
- `lib/admin.ts` operazioni dell'area riservata (solo browser)
- `data/articoli.json` 632 articoli dall'export WordPress (2005–2026); `data/record.json` record sociali
- `supabase/schema.sql` tabelle, policy RLS, bucket
- `scripts/import-articoli.mjs` import massivo da terminale (`--dry-run` funziona senza chiavi)

## Regole da rispettare
- Senza variabili Supabase il sito deve funzionare lo stesso, leggendo `data/articoli.json` in sola lettura.
- `data/articoli.json` non deve mai finire nel codice inviato al browser: si importa solo in `lib/contenuti.ts`.
- Funzioni usate sia dal server sia dal browser vanno in `lib/`, non in file con `'use client'`
  (è già successo con `urlRisultati`, ora in `lib/url.ts`).
- Gli slug esistenti non si accorciano: `normalizzaSlug` per quelli dati, `slugify` (70 caratteri) solo per quelli
  generati dal titolo. Due articoli hanno lo stesso titolo (dicembre 2023 e 2024).
- Le sei categorie sono fisse anche nel database: Assoluti, Amatori, Giovanile, Gare organizzate, Comunicazioni, Altre gare.
- Il corpo degli articoli è HTML scritto solo da utenti autenticati; incollando testo nell'editor si tiene solo il testo semplice.
- La `service_role key` non va mai in variabili `NEXT_PUBLIC_`, nel codice o su GitHub.
- Attenzione: scrivendo `\u0300-\u036f` in un file, alcuni strumenti lo convertono in caratteri reali invisibili. Controllare dopo.

## Variabili d'ambiente
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (Vercel).
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` solo per lo script di import, in locale.

## Comandi
```bash
npm install
npm run dev                # http://localhost:3000
npm run build              # verifica prima di ogni push
node scripts/import-articoli.mjs data/articoli.json --dry-run
```

## Stato al 1 novembre 2026
- Repo su GitHub (account personale di Fab, scelta concordata con la società). Supabase creato, primo deploy Vercel in corso.
- Mai provati con un Supabase reale: login, salvataggio articoli, upload foto, import da `/admin`, modulo contatti.
  Sono il primo collaudo da fare.

## Da fare
- Sostituire le foto dimostrative Unsplash (home, corsi, amatori, società) con foto della società.
- Indirizzo vero della pagina Facebook (ora punta a una ricerca), in footer e contatti.
- Far verificare `/privacy` alla società e aggiungere i dati fiscali del titolare.
- Copiare su Supabase le foto degli articoli importati, ora ancora su iriense.wordpress.com (non cancellare il vecchio blog).
- Newsletter: si raccolgono le email, manca un servizio di invio (es. Brevo o Resend).
- Facoltativo: lettura di messaggi e iscritti dentro `/admin` (oggi solo da Supabase → Table Editor).
