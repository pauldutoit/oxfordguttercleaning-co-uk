# astro-lead-site-template

Starter réutilisable pour des sites de lead-gen locaux (pattern `{intent}-{ville}/`), en
Astro statique + Cloudflare Pages. Pensé comme alternative au pipeline PHP `/gen-lead-site`,
en corrigeant dès le départ le point faible identifié dessus : le contenu "spinné" par ville.

## Ce que le template embarque

- **Funnel de qualification 4 étapes** (`/quote`) : service, propriété, localisation
  (adresse + postcode UK + timeframe), coordonnées + brief obligatoire + consent + Turnstile
- **Gates de qualification durs** : bloque renters/non-owners + timeframe >6 mois côté front
  ET côté backend (hard 400), plus validation UK phone/postcode/email
- **Hubs services** `/services/{intent}/` indexables listant les villes par région
- **Page ville × intent** `/{intent}-{city}/` avec :
  - Trust bar locale sous H1, breadcrumb JSON-LD (Home → service hub → ville)
  - Table de prix par service (prix modulés par le `pf` de la ville)
  - Contenu MD unique par ville (généré à la demande) OU fallback structuré si absent
  - Bloc "Local context" (postcodes, house types, notable areas, era, conservation note)
  - Section FAQ + FAQPage JSON-LD extraite à build-time du markdown
  - Sidebar sticky avec CTA vers le funnel
  - Pills "other services in {city}" + "nearby areas"
- **Homepage** avec hero contenant le funnel step 1 (service picker), price guide table,
  final CTA, trust bar, testimonials, FAQ
- **Header nav** (services + Areas + burger mobile) + **footer** multi-colonnes
- **/areas** hub avec recherche client-side + strip Services + regroupement régional
- **SEO stack complète** dans le BaseLayout : og:*, twitter:card, LocalBusiness schema,
  WebSite/SearchAction, hooks Matomo + Microsoft Clarity conditionnels
- **Sécurité Function** (`functions/api/lead.js`) : POST-only + Turnstile + honeypot +
  whitelist enum + UK postcode/phone regex + rate limit KV (best effort)
- **Cloudflare `public/_headers`** : X-Frame-Options, nosniff, Referrer-Policy, HSTS
- **199 villes UK** dans `cities.json` avec nearby cohérents (5 chacun) + `pf` régional
- **cityEnrichment.json** rempli pour les 199 villes (postcodes, house types, notable
  areas, era, conservation notes - réutilisables tel quel sur n'importe quel thème UK)
- **intentEnrichment.json** en placeholder à remplir par thème

## Démarrer un nouveau site à partir de ce starter

Le plus simple : le lancer via `leadgen-launcher`, qui fait GitHub repo + Cloudflare zone
+ Turnstile + Pages + env vars + Matomo + custom domain + CNAME + Google + IndexNow, tout
en API. Voir `~/perso/leadgen-launcher/README.md`.

Sinon manuellement :

```bash
gh repo create --template pauldutoit/astro-lead-site-template mon-nouveau-site
cd mon-nouveau-site
npm install
```

1. **Configurer le site** : `src/data/site.config.json` (nom, domaine, téléphone, email,
   couleur, matomoUrl/matomoSiteId, clarityId...).
2. **Définir les services** : `src/data/intents.json` (slug, label, priceFrom, basePriceRange,
   icon, searchIntent). 3-6 services conseillés.
3. **Enrichir les services** : `src/data/intentEnrichment.json` (hubIntro, hubBody[],
   hubTips[], commonSpecs par service). Chaque hub doit lire différemment — pas de
   template spun.
4. **Villes** : `src/data/cities.json` est pré-rempli avec 199 villes UK. Chaque ville
   a un champ `indexable` : commencer à `false`, ne passer à `true` qu'une fois la page
   éprouvée. Une ville non indexable reste crawlable (`noindex,follow`) mais absente
   du `sitemap.xml`.
5. **Enrichment ville** : `src/data/cityEnrichment.json` est pré-rempli sur les mêmes
   199 villes (données factuelles, housing UK, réutilisables tel quel).
6. **Générer le contenu MD unique par ville** (optionnel, progressif) :
   ```bash
   ANTHROPIC_API_KEY=sk-ant-... npm run generate:content
   ```
   Idempotent : ne régénère pas les fichiers déjà présents dans `src/content/cityContent/`
   sauf `--force`. Chaque page ville×intent sans MD reste fonctionnelle (fallback
   structuré + noindex) — le contenu LLM est un enrichissement progressif.
7. **Vérifier en local** : `npm run dev`, `npm run build` puis `npm run preview`.

## Déploiement Cloudflare Pages

Le launcher configure tout automatiquement. Manuellement :

- Repo GitHub connecté à Cloudflare Pages, build `npm run build`, output `dist`
- Env vars Functions (Production) : `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`,
  `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`
- Env var Build : `PUBLIC_TURNSTILE_SITE_KEY`
- Optionnel : binding KV `LEAD_RATE_KV` pour le rate limit
- Custom domain sur le domaine + CNAME apex/www → `<project>.pages.dev` (le dashboard
  Pages ne les crée PAS automatiquement)

## Turnstile (gratuit)

Dashboard Cloudflare > Turnstile > Add widget → domain, mode Managed.
Site key → `PUBLIC_TURNSTILE_SITE_KEY` (build). Secret → `TURNSTILE_SECRET_KEY` (Functions).

## Resend (gratuit, 3000 emails/mois)

- Voie rapide : `LEAD_FROM_EMAIL=onboarding@resend.dev`, marche uniquement vers l'email du
  compte Resend (mode test).
- Voie propre : vérifier le domaine chez Resend (SPF + DKIM en DNS), utiliser
  `leads@<domain>` comme expéditeur. Meilleure délivrabilité Gmail.

## Structure

```
src/data/site.config.json         config du site (branding, contact, analytics)
src/data/intents.json             services offerts
src/data/intentEnrichment.json    corps unique par service (pour les hubs)
src/data/cities.json              199 villes UK + nearby + pf régional + gate indexable
src/data/cityEnrichment.json      contexte local factuel par ville
src/content/cityContent/          contenu MD unique par ville×intent (généré)
src/components/QuoteFunnel.astro  funnel 4 étapes réutilisable
src/pages/index.astro             homepage
src/pages/quote.astro             page funnel
src/pages/thank-you.astro         confirmation post-submit
src/pages/areas.astro             hub avec recherche
src/pages/[intentSlug]-[citySlug].astro  page ville × service (199 × N intents)
src/pages/services/[intentSlug].astro     hub par service
src/pages/sitemap.xml.ts          sitemap filtré indexable + hubs services + /areas
src/pages/robots.txt.ts           robots.txt dynamique
functions/api/lead.js             Cloudflare Pages Function : Turnstile + Resend
public/_headers                   sécurité (X-Frame-Options, HSTS...)
scripts/generate-city-content.mjs  génération LLM idempotente du contenu ville×intent
```

## Portfolio / réseau de sites

Si ce starter sert à plusieurs domaines, éviter de répliquer l'empreinte technique
partagée qui trahit un réseau : email de contact identique, même compte analytics
Matomo mais avec siteId distinct, testimonials distincts.
