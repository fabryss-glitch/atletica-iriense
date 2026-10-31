# Atletica Iriense Voghera — sito web

Sito della società (Next.js) con blog/CMS su Supabase, pubblicato su Vercel.
Design originale realizzato in Claude Design.

## Cosa c'è

| Pagina | Indirizzo | Note |
|---|---|---|
| Home | `/` | video hero, ultimi 3 articoli |
| Società | `/societa` | storia, staff, allenamenti, amatori, tabellone record (`data/record.json`) |
| Corsi | `/corsi` | fasce d'età e info iscrizioni |
| Articoli | `/risultati` | ricerca, filtri per categoria, 12 per pagina |
| Articolo | `/risultati/<slug>` | si aggiorna entro 60 secondi dalla pubblicazione |
| Gallery | `/gallery` | foto caricate + prima foto di ogni articolo, visualizzazione a schermo intero |
| Contatti | `/contatti` | il modulo salva i messaggi su Supabase |
| Regolamento, Privacy | `/regolamento`, `/privacy` | |
| Area riservata | `/admin` | articoli, editor, anteprima, import/export JSON, gallery |

**Senza chiavi Supabase il sito funziona lo stesso**: mostra i 632 articoli
dell'archivio WordPress (`data/articoli.json`) in sola lettura e l'area
riservata spiega come attivarla. Si può quindi pubblicare su Vercel subito.

## Messa online

### 1. GitHub
1. Accedi a github.com con l'account della società.
2. **New repository** → nome `atletica-iriense` → **Create repository** (senza README).
3. Carica il contenuto di questa cartella (tutti i file, comprese le cartelle `app`, `components`, `lib`, `data`, `public`, `scripts`, `supabase`).
   Non caricare `node_modules` né `.next` se presenti.

### 2. Vercel
1. vercel.com → **Add New… → Project** → scegli il repository `atletica-iriense` → **Deploy**.
2. Il sito va online su `atletica-iriense.vercel.app` (o simile).

### 3. Supabase (quando ci sono le credenziali della società)
1. supabase.com → **New project** (regione Europa, es. Frankfurt).
2. **SQL Editor** → incolla tutto `supabase/schema.sql` → **Run**.
   Crea le tabelle `articoli`, `gallery_foto`, `gallery_nascoste`, `messaggi`, `newsletter`, i permessi e lo spazio foto `articoli-foto`.
3. **Authentication → Users → Add user**: email e password della segreteria (spunta *Auto confirm*).
4. **Project Settings → API**: copia *Project URL* e *anon public key*.
5. Su Vercel → progetto → **Settings → Environment Variables**, aggiungi:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `NEXT_PUBLIC_SITE_URL` = indirizzo del sito (es. `https://atletica-iriense.vercel.app`)
6. **Deployments → ⋯ → Redeploy**.

### 4. Caricare i 632 articoli
Il modo più semplice: entra in `/admin` → **Import JSON** → scegli `data/articoli.json` → **Importa**.

In alternativa da terminale (serve la *service_role key*, da non mettere mai su Vercel o GitHub):

```bash
npm install
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... npm run import-articoli
```

L'import si può ripetere: gli articoli con lo stesso slug vengono aggiornati, non duplicati.

## Lavorare in locale

```bash
npm install
cp .env.example .env.local   # facoltativo: inserisci le chiavi Supabase
npm run dev                  # http://localhost:3000
```

## Dove si trovano i dati

- **Articoli e foto della gallery**: Supabase (tabelle `articoli`, `gallery_foto`), foto nello spazio `articoli-foto`.
- **Messaggi del modulo contatti e iscritti alla newsletter**: Supabase → Table Editor → `messaggi`, `newsletter`.
- **Tabellone dei record sociali**: `data/record.json` (modifica il file e ripubblica).
- **Testi delle pagine** (storia, corsi, staff): direttamente nei file in `app/(sito)/`.

## Da completare prima del lancio

- Sostituire le foto dimostrative (Unsplash) di home, corsi e amatori con foto della società.
- Inserire l'indirizzo esatto della pagina Facebook (ora rimanda a una ricerca).
- Far verificare alla società il testo di `/privacy` e aggiungere i dati fiscali del titolare.
- Le foto degli articoli importati restano su `iriense.wordpress.com`: non cancellare il vecchio blog finché non vengono copiate su Supabase.
- Per inviare le newsletter agli iscritti va collegato un servizio di invio (es. Brevo o Resend).

## Sicurezza

- La chiave `anon` è pubblica per natura: i permessi li decidono le policy in `supabase/schema.sql`
  (chiunque legge gli articoli pubblicati e può inviare messaggi; solo gli utenti autenticati scrivono).
- Il corpo degli articoli è HTML scritto solo dagli utenti dell'area riservata.
- La `service_role key` serve solo allo script di import e non deve mai finire nel codice o su Vercel.
