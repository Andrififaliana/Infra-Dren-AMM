# Tutoriel — Développement des fonctionnalités (Carte, Photos, Assistant IA)

## Architecture générale

La carte interactive permet de visualiser les établissements scolaires sur une carte Leaflet, avec les aléas et les trajets. Voici le flux complet, de la navigation jusqu'à l'affichage.

---

## Stack technologique — Choix et justifications

### Backend

| Technologie | Version | Rôle | Pourquoi ce choix |
|-------------|---------|------|-------------------|
| **NestJS** | ^11.0.1 | Framework backend Node.js | Architecture modulaire (controllers/services/modules), décorateurs pour les routes/validations, injection de dépendances native, écosystème mature et structuré. Alternative à Express brut qui devient désorganisé sur un projet de cette taille. |
| **TypeScript** | ^5.7.3 | Langage | Typage strict qui prévient les erreurs à la compilation, auto-complétion IDE, contrats clairs via les interfaces. Indispensable pour un projet d'équipe. |
| **Prisma** | ^7.8.0 | ORM PostgreSQL | Génération automatique du client TypeScript à partir du schéma, migrations versionnées, requêtes type-safe, bien meilleure DX que TypeORM ou Sequelize. Le `groupBy` et les `include` imbriqués simplifient énormément les stats. |
| **PostgreSQL** | 16-alpine | Base de données | Relationnelle, fiable, open-source, support des JSONB, agrégations, groupBy. Standard de facto pour une application de gestion. |
| **Supabase** | ^2.110.5 | Authentification | JWT prêt à l'emploi, service d'auth sans self-host, intégration PostgreSQL native. Évite de coder un système d'auth complet (inscription, confirmation email, MFA, etc.). |
| **Cloudflare R2** | SDK AWS S3 ^3.1087.0 | Stockage de fichiers (photos) | Compatible S3 sans frais de sortie (egress), bucket privé + URLs présignées pour la sécurité, pas de limite de bande passante. Beaucoup moins cher que AWS S3 pour ce cas d'usage. |
| **class-validator** | ^0.15.1 | Validation des DTOs | Décorateurs `@IsNotEmpty`, `@Min(0)` directement sur les DTOs. S'intègre nativement avec le `ValidationPipe` de NestJS. Alternative à Joi ou Zod côté serveur. |
| **Jest** | ^30.0.0 | Tests unitaires | Standard de l'écosystème NestJS/Node, configuration simple avec `ts-jest`, exécution rapide. |
| **Multer** | ^2.2.0 | Upload de fichiers | Middleware Express standard pour le multipart, s'intègre avec `FileInterceptor` de NestJS. Simple et fiable. |
| **Swagger** | @nestjs/swagger ^11.4.5 | Documentation API | Génération automatique de la doc OpenAPI à partir des décorateurs NestJS. Interface UI pour tester les endpoints. |
| **OpenAI / Groq** | openai ^6.48.0 | Assistant IA | Client compatible OpenAI utilisé avec l'API Groq (Llama 3.3 70B). Choix de Groq pour la rapidité d'inférence et le modèle open-source performant. L'abstraction OpenAI permet de changer de fournisseur sans changer de code. |
| **ESLint + Prettier** | ^9.18.0 / ^3.4.2 | Qualité de code | ESLint pour les règles de code, Prettier pour le formatage automatique. `singleQuote: true`, `trailingComma: "all"`. |

### Frontend

| Technologie | Version | Rôle | Pourquoi ce choix |
|-------------|---------|------|-------------------|
| **Next.js** | ^16.2.10 | Framework React full-stack | App Router, server components, `'use client'` pour les composants interactifs, routage par système de fichiers. SSR/SSG pour les pages publiques (SEO). Version 16 pour bénéficier des dernières optimisations. |
| **React** | ^19.2.7 | Bibliothèque UI | Standard du web moderne, écosystème immense, composants réutilisables. v19 apporte des améliorations de performances (nouveau compilateur). |
| **TypeScript** | ^5 | Langage | Même justification que le backend — typage strict, contrats partagés via les types (les types `statistiques.ts` sont le contrat entre le frontend et l'API). |
| **Tailwind CSS** | ^4 | CSS utilitaire | Pas de fichiers CSS séparés, tout dans le JSX. `v4` avec `@tailwindcss/postcss` pour la nouvelle engine CSS (plus rapide). `tailwind-merge` pour éviter les conflits de classes. |
| **TanStack React Query** | ^5.101.2 | Fetching / cache | Gestion automatique du cache, re-fetch, loading/error states. Évite le boilerplate Redux. Stale time de 5 min pour les stats. Invalidation après mutation CRUD. |
| **Zustand** | ^5.0.14 | État global (auth) | Plus léger que Redux, API plus simple que Context. Utilisé uniquement pour l'état d'authentification (token, user, login/logout). |
| **Axios** | ^1.18.1 | HTTP client | Intercepteurs pour injecter le token JWT et gérer les 401. Plus puissant que fetch natif. |
| **Leaflet + react-leaflet** | 1.9.4 / 5.0.0 | Cartographie OpenStreetMap | Léger, open-source, sans clé API. `react-leaflet` v5 compatible React 19. Alternative gratuite à Google Maps / Mapbox. |
| **Recharts** | ^3.9.2 | Graphiques (barres, lignes, camembert) | Spécifiquement conçu pour React, API déclarative simple. Utilisé pour les bar charts par DREN et les pie charts d'état des salles. |
| **react-hook-form + zod** | ^7.81.0 / ^4.4.3 | Formulaires + validation | `react-hook-form` évite les re-renders inutiles. Zod valide les données côté client avant envoi, en miroir des DTOs backend. |
| **react-pdf** | ^4.5.1 | Génération PDF | Génération de PDF côté client (ou serveur). Utilisé pour l'export des fiches établissement. Évite d'avoir un service backend de génération PDF. |
| **motion** | ^12.42.2 | Animations | Successeur de Framer Motion. Animations fluides pour les barres de progression, les transitions de pages. |
| **lucide-react** | ^1.24.0 | Icônes SVG | Bibliothèque d'icônes légère, tree-shakeable, belle par défaut. Alternative à FontAwesome. |
| **sonner** | ^2.0.7 | Notifications | Toasts simples et élégants pour les retours de mutation (succès/erreur). |

### Infrastructure

| Technologie | Version | Rôle | Pourquoi ce choix |
|-------------|---------|------|-------------------|
| **Docker Compose** | 3.8 | Orchestration locale | 3 services (PostgreSQL, backend, frontend). Environnement reproductible, plus de "ça marche pas chez moi". |
| **Node.js** | 20-alpine | Runtime (back + front) | Alpine pour des images Docker légères. Node 20 LTS pour la stabilité. Multi-stage build pour réduire la taille des images. |

### Pourquoi ces versions spécifiques ?

- **NestJS 11** : Dernière version majeure au moment du développement, bénéficie des dernières fonctionnalités (meilleure gestion des modules, performance).
- **Next.js 16** : Très récent, apporte le nouveau compilateur React, les server actions améliorées, et le bundler Turbopack en production.
- **Prisma 7** : Dernière version avec le nouveau moteur de requêtes (`client`), bien plus rapide que Prisma 5.
- **Tailwind v4** : Moteur CSS réécrit (Rust), plus de fichier `tailwind.config.js`, détection de classes automatique.
- **Zod v4** : Version majeure récente avec meilleure inférence TypeScript et API simplifiée.
- **React Query v5** : API simplifiée par rapport à v4, meilleur support du SSR avec Next.js.
- **PostgreSQL 16** : Dernière version stable, améliorations de performance pour les agrégations et les requêtes complexes.

---

## Flux des données (pas à pas)

### 1. Navigation de l'utilisateur

- **`frontend\components\layout\sidebar.tsx`** : Affiche le lien "Carte" qui pointe vers `/responsable/carte`.
- **`frontend\app\(dashboard)\layout.tsx`** : Vérifie que l'utilisateur est authentifié via Zustand (état global d'auth). Si non connecté, redirige vers `/login`.
- **`frontend\components\layout\dashboard-layout.tsx`** : Coquille commune du dashboard (sidebar + navbar + contenu).

### 2. Chargement de la page Carte

- **`frontend\app\(dashboard)\responsable\carte\page.tsx`** (`CartePage`) :
  - Composant `'use client'` qui initialise l'état local des filtres (`search`, `ciscoFilter`, `couvertureFilter`, `etatFilter`, `showAleas`, `showTrajets`).
  - Appelle **3 hooks React Query** pour récupérer les données simultanément :

### 3. Appels API (Frontend → Backend)

Chaque hook utilise le client Axios centralisé :

- **`frontend\lib\api-client.ts`** : Instance Axios configurée avec l'URL de base (`NEXT_PUBLIC_API_URL`). Un intercepteur ajoute le token JWT (Bearer) depuis le localStorage, et un autre gère les erreurs 401 (redirection vers `/login`).

Les 3 hooks :

| Fichier | Hook | Endpoint appelé |
|---------|------|----------------|
| `frontend\hooks\use-etablissements.ts` | `useEtablissements({ page: 1, limit: 999 })` | `GET /api/etablissements?page=1&limit=999` |
| `frontend\hooks\use-aleas.ts` | `useAleas()` | `GET /api/aleas` |
| `frontend\hooks\use-trajets.ts` | `useTrajets()` | `GET /api/trajets` |

Les types TypeScript correspondants :

- **`frontend\types\etablissement.ts`** : Interface `EtablissementListe` (latitude, longitude, couvTelephonique, couvInternet, _count, etc.).
- **`frontend\types\alea.ts`** : Interface `Alea` (idAleat, typeAleat, nomAleat, effets → trajetId).
- **`frontend\types\trajet.ts`** : Interface `Trajet` (idTrajet, nomTrajet, moyens, periode).
- **`frontend\types\api.ts`** : Enveloppes génériques `ApiResponse<T>` et `PaginatedResponse<T>`.

### 4. Traitement Backend (NestJS)

Le backend reçoit les requêtes et les traite ainsi :

#### Endpoint `GET /api/etablissements`

- **`backend\src\main.ts`** : Définit le préfixe global `/api`, active CORS, Swagger, et la validation globale.
- **`backend\src\common\interceptors\transform.interceptor.ts`** : Enveloppe **toutes** les réponses dans `{ success, data, meta?, timestamp }`.
- **`backend\src\modules\etablissements\etablissements.controller.ts`** : Contrôleur REST. `findAll()` est marqué `@Public()` (pas de JWT requis). Parse et valide les query params avec le DTO.
- **`backend\src\modules\etablissements\dto\etablissement-query.dto.ts`** : DTO de validation des paramètres (`page`, `limit`, `search`, `dren`, `cisco`, `zap`, `commune`).
- **`backend\src\modules\etablissements\etablissements.service.ts`** : Logique métier. `findAll()` construit une requête Prisma qui sélectionne les coordonnées GPS, les flags de couverture, le compteur d'enseignants, et la première photo. Signe les URLs des photos via Cloudflare R2 (validité 1h).
- **`backend\src\prisma\prisma.service.ts`** : Service PrismaClient connecté à PostgreSQL.
- **`backend\prisma\schema.prisma`** : Schéma de la base — modèle `Etablissement` avec `latitude Float?`, `longitude Float?`, `couvTelephonique Boolean`, `couvInternet Boolean`.

#### Endpoint `GET /api/aleas`

- **`backend\src\modules\aleas\aleas.controller.ts`** : Contrôleur REST, `findAll()` public.
- **`backend\src\modules\aleas\aleas.service.ts`** : Récupère tous les aléas avec leurs `effets → trajet → moyens` associés.

#### Endpoint `GET /api/trajets`

- **`backend\src\modules\trajets\trajets.controller.ts`** : Contrôleur REST, `findAll()` public.
- **`backend\src\modules\trajets\trajets.service.ts`** : Récupère tous les trajets avec `moyens`, `periode`, `effets → alea`.

Les modules sont enregistrés dans :

- **`backend\src\app.module.ts`** : Module racine NestJS qui importe `EtablissementsModule`, `AleasModule`, `TrajetsModule`.

### 5. Retour des données et filtrage côté client

Les hooks React Query reçoivent les réponses et les mettent en cache (5 min de stale time, configuré dans le provider).

- **`frontend\providers\query-provider.tsx`** : Wrapper React Query placé dans le layout racine.

Dans `CartePage` :

- Un `useMemo` nommé `filtered` applique les filtres sur les établissements :
  - **Recherche** : match sur `nomEtab` ou `commune` (insensible à la casse).
  - **CISCO** : filtre par la valeur sélectionnée.
  - **Couverture** : `telephonique`, `internet`, `aucune`.
  - **État** : actuellement un placeholder basé sur la présence de coordonnées.

### 6. Affichage de la carte (Leaflet)

- **`frontend\components\map\etablissements-map.tsx`** : Cœur de l'affichage cartographique.

Ce composant est chargé dynamiquement (via `next/dynamic` avec `ssr: false`) car Leaflet nécessite l'objet `window`.

Son fonctionnement interne :

1. **Filtre les coordonnées** : Ne garde que les établissements ayant `latitude` et `longitude` valides (type `EtablissementWithCoords`).
2. **Fallback** : Si aucun établissement n'a de coordonnées, affiche un message "Aucun établissement avec coordonnées".
3. **MapContainer** : Rendu Leaflet avec la tuile OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
4. **FitBounds** : Sous-composant utilisant `useMap()` pour ajuster le zoom automatiquement avec un padding de 40px.
5. **Markers** : Pour chaque établissement avec coordonnées, un `Marker` avec `divIcon` personnalisé :
   - Icône verte par défaut (établissement normal).
   - Icône violette (`aleaIcon`) si `showAleas` est activé et que des aléas existent.
   - **Popup** contenant : nom, CISCO/ZAP, commune/fokontany, couverture téléphone/internet, nombre d'enseignants, nombre de bâtiments, et un lien "Voir le détail" vers `/responsable/etablissements/${id}`.
6. **Trajets** (si `showTrajets` activé) : Le `nomTrajet` (format `"CommuneA → CommuneB → ..."`) est parsé, chaque étape est matchée contre les noms/communes des écoles pour trouver les coordonnées GPS, et une `Polyline` bleue en tiretés est dessinée. Chaque polyline a un popup avec le nom du trajet, le moyen de transport, la distance, et la période difficile.

### 7. Composants UI auxiliaires sur la page carte

- **`frontend\components\shared\search-bar.tsx`** : Barre de recherche textuelle.
- **`frontend\components\ui\select.tsx`** : Menu déroulant pour les filtres CISCO, couverture, état.
- **`frontend\components\shared\breadcrumb.tsx`** : Fil d'Ariane affichant "Carte interactive".
- **`frontend\app\layout.tsx`** : Layout racine qui wrappe l'application dans `QueryProvider` et `AuthProvider`.

### 8. Réutilisation du composant carte

Le même composant `EtablissementsMap` est réutilisé dans :

- **`frontend\app\(public)\page.tsx`** : Page d'accueil publique (sans aléas ni trajets).
- **`frontend\app\(public)\etablissements\page.tsx`** : Liste publique des établissements avec un bouton bascule pour passer en vue carte.











---

## Stockage et récupération des images (photos)

### Architecture générale

Les photos sont stockées sur **Cloudflare R2** (compatible S3) et servies via des **URLs présignées** valables 1 heure. Le bucket R2 est privé — les URLs présignées permettent un accès temporaire sécurisé sans rendre le bucket public.

3 tables distinctes en base (pas de polymorphisme) :
- `photo` → liée à `Etablissement`
- `batiment_photo` → liée à `Batiment`
- `salle_photo` → liée à `Salle`

Chaque table contient : `key` (clé R2), `url` (remplacée par l'URL présignée au moment de la réponse API), `mimeType`, `fileSize`, `estPrincipale`.

---

### Flux d'upload d'une photo

#### 1. Sélection du fichier (Frontend)

- **`frontend\components\shared\generic-photo-upload.tsx`** : Composant générique d'upload avec drag & drop. Valide côté client : max 10 fichiers, max 10 Mo chacun, types acceptés `image/jpeg`, `image/png`, `image/webp`, `image/gif`. Construit un `FormData` avec le(s) fichier(s).

Ce composant est utilisé depuis :
- **`frontend\app\(dashboard)\responsable\etablissements\[id]\page.tsx`** — page d'édition d'un établissement
- **`frontend\app\(dashboard)\responsable\batiments\[id]\page.tsx`** — page d'édition d'un bâtiment
- **`frontend\app\(dashboard)\responsable\salles\[id]\page.tsx`** — page d'édition d'une salle

#### 2. Requête HTTP (Frontend → Backend)

Pour un établissement :
- Upload simple : `POST /api/etablissements/{id}/photos` (champ `file`)
- Upload multiple : `POST /api/etablissements/{id}/photos/multiple` (champ `files`)

Pour un bâtiment : `POST /api/batiments/{id}/photos`
Pour une salle : `POST /api/salles/{id}/photos`

#### 3. Traitement Backend (NestJS)

- **`backend\src\modules\etablissements\etablissements.controller.ts`** : Utilise `FileInterceptor` (ou `FilesInterceptor` de `@nestjs/platform-express` avec Multer) pour parser le multipart. Limite : 10 fichiers, 10 Mo max.
- **`backend\src\modules\etablissements\etablissements.service.ts`** — méthode `uploadPhoto()` :
  1. **Valide** l'existence de l'entité parente (`NotFoundException` si absente)
  2. **Valide** le MIME type et la taille du fichier
  3. **Génère une clé R2 unique** via `R2Service.generatePhotoKey(id, nomFichier)` :
     ```
     etablissements/{etablissementId}/{timestamp}-{nomAssaini}
     ```
     Exemple : `etablissements/42/1712345678-photo_de_l_ecole.jpg`
  4. **Upload sur Cloudflare R2** via `R2Service.uploadFile(key, buffer, mimeType)`
  5. **Si photo principale** : réinitialise le flag `estPrincipale` des autres photos de l'entité
  6. **Crée l'enregistrement en base** (via Prisma) : stocke la `key` et l'URL directe R2
  7. **Log d'audit** : "Photo ajoutée"

#### 4. Service R2

- **`backend\src\r2\r2.service.ts`** : Wrapper autour du `S3Client` AWS SDK v3 configuré avec l'endpoint Cloudflare R2. Méthodes :
  - `uploadFile(key, body, contentType)` → `PutObjectCommand`
  - `getPresignedUrl(key, expiresIn = 3600)` → `GetObjectCommand` + `getSignedUrl()`
  - `deleteFile(key)` → `DeleteObjectCommand`
  - `generatePhotoKey(id, name)` → clé au format `etablissements/{id}/{timestamp}-{nom}`

- **`backend\src\r2\r2.module.ts`** : Module NestJS qui déclare et exporte `R2Service`.
- **`backend\src\r2\r2.controller.ts`** : Endpoints proxy (`GET /r2/proxy-image`, `GET /r2/proxy-by-key`) pour servir des images via le backend (utilisé pour la génération PDF publique).

- **`backend\src\config\index.ts`** : Configuration R2 chargée depuis les variables d'environnement :
  ```
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME (défaut: infradrenphotos),
  R2_ENDPOINT, R2_PUBLIC_URL
  ```

#### 5. Structure des clés R2

Générées par les méthodes statiques de `R2Service` :

| Entité | Méthode | Pattern de clé |
|--------|---------|----------------|
| Établissement | `generatePhotoKey(id, name)` | `etablissements/{id}/{timestamp}-{nomAssaini}` |
| Bâtiment | `generateBatimentPhotoKey(id, name)` | `batiments/{id}/{timestamp}-{nomAssaini}` |
| Salle | `generateSallePhotoKey(id, name)` | `salles/{id}/{timestamp}-{nomAssaini}` |

Le nom de fichier est assaini : les caractères non alphanumériques (sauf `.`, `_`, `-`) sont remplacés par `_`.

---

### Flux de récupération / affichage d'une photo

#### 1. Requête API incluant des photos

Quand un endpoint retourne des photos (ex: `GET /api/etablissements`, `GET /api/etablissements/:id`), le service appelle `signPhotoUrls()` **avant** de renvoyer la réponse.

- **`backend\src\modules\etablissements\etablissements.service.ts`** — méthode privée `signPhotoUrls()` :
  ```typescript
  private async signPhotoUrls(photos) {
    await Promise.all(
      photos.map(async (photo) => {
        if (!photo.key) return; // garde l'URL directe en fallback
        try {
          photo.url = await this.r2Service.getPresignedUrl(photo.key);
        } catch (error) {
          // garde l'URL directe en fallback
        }
      }),
    );
  }
  ```
  Mutation en place de `photo.url` → remplace l'URL directe par une **URL présignée** valable 1h.

#### 2. Génération de l'URL présignée

- **`backend\src\r2\r2.service.ts`** — `getPresignedUrl(key, expiresIn = 3600)` :
  - Crée une commande `GetObjectCommand` avec le `Bucket` et la `Key`
  - Utilise `getSignedUrl()` de `@aws-sdk/s3-request-presigner`
  - Retourne une URL du type :
    ```
    https://{accountId}.r2.cloudflarestorage.com/infradrenphotos/
    etablissements/42/...?X-Amz-Algorithm=AWS4-HMAC-SHA256
    &X-Amz-Credential=...&X-Amz-Signature=...
    ```

#### 3. Réception côté frontend

Le frontend reçoit `photo.url` déjà transformée en URL présignée. Elle est directement utilisable dans une balise `<img>`.

**Affichage dans différents contextes :**

| Contexte | Composant | Détail |
|----------|-----------|--------|
| Page publique liste | `frontend\app\(public)\etablissements\page.tsx` | `<img>` direct ou `EtablissementPhoto` avec fallback gradient |
| Page publique détail | `frontend\components\etablissements\EtablissementPhoto.tsx` | `PhotoGallery` avec carrousel + lightbox |
| Dashboard édition | `frontend\components\shared\generic-photo-upload.tsx` | Grille de photos + contrôles (définir principale, supprimer) + lightbox |

**Fallback** : Si l'image ne charge pas (`onError`), le composant `EtablissementPhoto` affiche un dégradé avec une icône d'école.

---

### Flux de suppression d'une photo

#### Endpoint : `DELETE /api/etablissements/:id/photos/:photoId`

1. **Recherche** de la photo en base (vérifie l'appartenance à l'entité parente)
2. **Suppression du fichier sur R2** : `R2Service.deleteFile(key)` → `DeleteObjectCommand`
3. **Suppression de l'enregistrement en base** : `prisma.photo.delete()`
4. **Log d'audit** : "Photo supprimée"

Si la suppression R2 échoue, l'enregistrement est tout de même supprimé (l'échec est loggé mais non bloquant).

Quand un **établissement entier est supprimé**, toutes ses photos (et celles de ses bâtiments/salles) sont supprimées de R2 avant le cascade Prisma.

---

### Endpoints proxy d'images

- **`GET /r2/proxy-image?url=...`** : Proxy une image depuis R2 via le backend (utilisé pour le PDF public). Sécurité : URLs HTTPS uniquement, domaine R2 validé.
- **`GET /r2/proxy-by-key?key=...`** : Récupère un fichier depuis R2 par sa clé (sans URL présignée). Protection contre le directory traversal.

Les deux endpoints sont publics et set `Cache-Control: public, max-age=31536000, immutable`.

---

### Schéma récapitulatif du flux photos

```
[Upload]
  Utilisateur → GenericPhotoUpload
    → FormData (file)
    → POST /api/etablissements/:id/photos
        → EtablissementsController (FileInterceptor Multer)
        → EtablissementsService.uploadPhoto()
            1. Validation (existence, MIME, taille)
            2. R2Service.generatePhotoKey() → "etablissements/42/ts-nom.jpg"
            3. R2Service.uploadFile(key, buffer) → PutObjectCommand → Cloudflare R2
            4. Création en base Prisma (key, url directe)
            5. Audit log
        ← Réponse : photo créée

[Affichage]
  <img src={photo.url} />
    ↑ photo.url = URL présignée (valable 1h)
    ↑
  API Response (GET /api/etablissements)
    ↑
  EtablissementsService.signPhotoUrls()
    ↑ pour chaque photo :
      R2Service.getPresignedUrl(key, 3600)
        → GetObjectCommand + getSignedUrl()
        → URL signée avec X-Amz-Signature

[Suppression]
  DELETE /api/etablissements/:id/photos/:photoId
    → EtablissementsService.deletePhoto()
      1. R2Service.deleteFile(key) → DeleteObjectCommand
      2. prisma.photo.delete()
      3. Audit log
```

---

## Assistant IA (Chat IA)

### Architecture générale

L'application intègre un assistant IA basé sur **Groq API** (compatible OpenAI) avec le modèle **Llama 3.3 70B**. Il permet aux administrateurs et responsables de dialoguer en langage naturel avec les données de l'infrastructure scolaire (créer, modifier, consulter des établissements, bâtiments, salles, etc.).

**Sécurité** : Tous les endpoints sont protégés par JWT + guards de rôles (`ADMIN` ou `RESPONSABLE_INFRASTRUCTURE`). Les actions d'écriture sont loguées via `AuditService`.

---

### Fonctionnement détaillé (flux complet)

```
Utilisateur → Page Chat → ChatIaWidget → useChatIa → apiClient → Backend → Groq API → Backend → Frontend
```

#### 1. Navigation

- **`frontend\components\layout\sidebar.tsx`** : Affiche le lien "Assistant IA" (icône Bot) aux rôles ADMIN et RESPONSABLE_INFRASTRUCTURE vers `/responsable/chat-ia` ou `/admin/chat-ia`. Affiche aussi "Monitoring IA" (icône Activity) pour les ADMIN vers `/admin/ia-logs`.

#### 2. Pages

- **`frontend\app\(dashboard)\responsable\chat-ia\page.tsx`** : Page chat pour les responsables. Wrappe `ChatIaWidget` avec un fil d'Ariane et un titre.
- **`frontend\app\(dashboard)\admin\chat-ia\page.tsx`** : Page chat pour les administrateurs (identique).
- **`frontend\app\(dashboard)\admin\ia-logs\page.tsx`** : Page de monitoring IA (admin uniquement). Affiche des KPIs (requêtes, tokens, temps moyen), des graphiques (BarChart, LineChart) et une table des logs paginée et filtrable.

#### 3. Composants frontend

- **`frontend\components\chat-ia\chat-ia.tsx`** (`ChatIaWidget`) : Widget de chat complet.
  - **Ce qu'il reçoit** : rien (c'est lui qui orchestre)
  - **Ce qu'il produit** : interface utilisateur complète du chat
  - **Détails** : affiche l'historique des messages (via `ChatMessage`), une zone de saisie, des questions suggérées quand l'historique est vide, un bouton "Nouvelle conversation", les états de chargement ("Réflexion en cours..."), et le défilement automatique.

- **`frontend\components\chat-ia\chat-message.tsx`** : Bulle de message + carte de confirmation d'action.
  - Affiche les messages avec avatar (utilisateur/assistant), un bouton "Copier", et les messages systèmes dans une bannière dédiée.
  - Pour les **actions proposées** par l'IA (création/modification/suppression), affiche une `ActionPreviewCard` avec un mécanisme de **double-clic** pour confirmer (1er clic : armement avec timeout 8s, 2e clic : exécution réelle).

#### 4. Hooks frontend

- **`frontend\hooks\use-chat-ia.ts`** : Hook central du chat. Gère :
  - `sendMessage(text)` → `POST /api/chat-ia/message` avec l'historique
  - `executeAction(action)` → `POST /api/chat-ia/execute` pour confirmer une action
  - `clearConversation()` → `DELETE /api/chat-ia/conversation`
  - `fetchSchema()` → `GET /api/chat-ia/schema` (liste des entités disponibles)
  - Maintient l'état local des messages, du chargement, et des actions proposées

- **`frontend\hooks\use-ia-logs.ts`** : Hook de monitoring (React Query).
  - `useIaLogs(params)` → `GET /api/chat-ia/logs?page=&limit=&success=` (auto-refresh 30s)
  - `useIaLogStats()` → `GET /api/chat-ia/logs/stats` (auto-refresh 60s)

#### 5. Types

- **`frontend\types\chat-ia.ts`** : Définit les interfaces `ChatMessage`, `ProposedAction`, `ChatHistoryEntry`, `ChatResponse`, `ExecuteActionResponse`, `SchemaInfo`. Garantit la cohérence des données entre le frontend et le backend.

#### 6. Backend — Contrôleur

- **`backend\src\modules\chat-ia\chat-ia.controller.ts`** : Point d'entrée REST. Tous les endpoints sont sous `/api/chat-ia`, protégés par `JwtAuthGuard` + `RolesGuard`.
  - `POST /message` → `ChatIaService.sendMessage()`
  - `POST /execute` → `ChatIaService.executeAction()`
  - `GET /schema` → `ChatIaService.getSchemaInfo()`
  - `DELETE /conversation` → `ChatIaService.clearConversation()`
  - `GET /logs` → `IaMonitoringService.findAll()` (admin only)
  - `GET /logs/stats` → `IaMonitoringService.getStats()` (admin only)

#### 7. Backend — Service principal

- **`backend\src\modules\chat-ia\chat-ia.service.ts`** : Cœur de l'assistant. Voici ce qu'il se passe pour chaque message :

  1. **Construction du system prompt** : Un prompt en français qui décrit le rôle de l'assistant (gestionnaire d'infrastructure scolaire pour la région Amoron'i Mania). Il inclut EN TEMPS RÉEL :
     - Le nombre total d'établissements, bâtiments, salles, enseignants
     - La liste des entités disponibles avec leurs champs
     - Des instructions strictes pour les actions CRUD (format JSON avec ```json ... ```)
     - Les règles de validation (ex: latitude entre -90 et 90)

  2. **Gestion de la mémoire de conversation** : Une `Map<userId, messages[]>` en mémoire (non persistée en base). Chaque utilisateur a sa propre conversation. Limitée à ~50 messages max.

  3. **Appel à l'API Groq** : Via le package `openai` npm :
     ```
     openai.chat.completions.create({
       model: process.env.IA_MODEL, // "llama-3.3-70b-versatile"
       messages: [systemPrompt, ...history],
       temperature: 0.3,
       max_tokens: 2000,
     })
     ```

  4. **Extraction d'action** : Le service parse la réponse pour chercher un bloc JSON (```json ... ```). S'il en trouve un, il crée un objet `ProposedAction` (type: create/update/delete, entité, données) et le retourne au frontend sans l'exécuter.

  5. **Log monitoring** : Chaque requête/réponse est loguée via `IaMonitoringService`.

- **Ce qu'il reçoit** : le message utilisateur + l'historique
- **Ce qu'il produit** : la réponse texte + éventuellement une `ProposedAction`
- **Où ça va** : vers le contrôleur → frontend → affichage dans `ChatMessage`

#### 8. Backend — Exécution d'actions

Quand l'utilisateur confirme une action (double-clic sur `ActionPreviewCard`) :

  - `executeAction()` dans `ChatIaService` :
    1. **Vérifie le rôle** : ADMIN ou RESPONSABLE_INFRASTRUCTURE (REFUSED sinon)
    2. **Switch sur `actionType`** : `create`, `update`, ou `delete`
    3. **Appelle Prisma** : `prisma.etablissement.create(...)`, `prisma.batiment.update(...)`, etc.
    4. **Audit log** : via `AuditService` ("Création établissement via IA", etc.)
    5. **Retourne** : `{ success: true, message, data }`

#### 9. Backend — Monitoring

- **`backend\src\modules\chat-ia\ia-monitoring.service.ts`** : Persiste les métriques de chaque appel IA dans la table `ia_log` :
  - `log()` : Crée un enregistrement avec `userId`, `userEmail`, `model`, `promptTokens`, `completionTokens`, `totalTokens`, `responseTimeMs`, `promptLength`, `responseLength`, `success`, `errorMessage`
  - `findAll()` : Logs paginés avec filtre par succès/échec
  - `getStats()` : Agrégations (total requêtes, total tokens, temps moyen, etc.)
  - `cleanOldLogs()` : Nettoie les logs de plus de 90 jours

- **`backend\prisma\schema.prisma`** (modèle `IaLog`) : Définit la table `ia_log` avec les champs de monitoring et une relation `belongsTo` vers `User`.

#### 10. Backend — Module et configuration

- **`backend\src\modules\chat-ia\chat-ia.module.ts`** : Déclare le module NestJS avec `ChatIaController`, `ChatIaService`, `IaMonitoringService`.
- **`backend\src\app.module.ts`** : Importe `ChatIaModule` dans l'application.
- **`backend\src\config\index.ts`** : Lit `OPEN_API_KEY`, `IA_API_URL`, `IA_MODEL` depuis les variables d'environnement.
- **`backend\src\modules\chat-ia\dto\chat-message.dto.ts`** : DTOs de validation pour les requêtes/réponses du chat.

### Schéma récapitulatif du flux Assistant IA

```
[Utilisateur]
  │
  ├─ sidebar.tsx → clique "Assistant IA"
  │
  ├─ /responsable/chat-ia (page.tsx)
  │   └─ <ChatIaWidget> (chat-ia.tsx)
  │       ├─ Zone saisie → sendMessage(texte)
  │       ├─ Questions suggérées
  │       ├─ Liste messages (chat-message.tsx)
  │       │   └─ ActionPreviewCard (double-clic → confirm)
  │       └─ useChatIa (use-chat-ia.ts)
  │            │
  │            ▼
  │       api-client.ts (Axios + JWT)
  │            │
  │            ▼
  │    ┌───────────────────────────┐
  │    │  Backend NestJS (/api)    │
  │    │                           │
  │    │  ChatIaController         │
  │    │   POST /chat-ia/message ──┤
  │    │   POST /chat-ia/execute ──┤
  │    │   GET  /chat-ia/schema    │
  │    │   DELETE /conversation    │
  │    │   GET  /chat-ia/logs      │
  │    │   GET  /chat-ia/logs/stats│
  │    │                           │
  │    │  ChatIaService            │
  │    │   1. System prompt + stats │
  │    │   2. OpenAI (Groq) call    │
  │    │   3. Parse action (JSON)   │
  │    │   4. Log monitoring        │
  │    │   5. Execute (si confirmé) │
  │    │      → Prisma → PostgreSQL│
  │    │      → AuditService       │
  │    │                           │
  │    │  IaMonitoringService      │
  │    │   → prisma.iaLog.create() │
  │    │   → table ia_log          │
  │    └───────────────────────────┘
  │            │
  │            ▼
  │       Groq API (Llama 3.3 70B)
  │       ← Réponse texte + JSON action
  │
  └─ /admin/ia-logs (page.tsx)
      └─ useIaLogs / useIaLogStats
          → GET /chat-ia/logs
          → KPIs + graphiques + table
```

---

## CRUD Établissement — Création, Consultation, Modification, Suppression

### Architecture générale

Le CRUD Établissement est le cœur de l'application. Chaque établissement scolaire est une entité centrale qui possède des **photos**, un **directeur**, des **designations** (titres fonciers), des **structures** (types de bâtiments), des **bâtiments** (avec leurs salles, toilettes, équipements).

Toutes les opérations d'écriture (création, modification, suppression) sont protégées par JWT + guards de rôles (`ADMIN` ou `RESPONSABLE_INFRASTRUCTURE`). La consultation est publique.

---

### 1. Création (CREATE)

```
Nouveau → formulaire → Zod validation → useCreateEtablissement → POST /api/etablissements → Backend → DB
```

**Frontend - Page et formulaire**

- **`frontend\app\(dashboard)\responsable\etablissements\nouveau\page.tsx`** : Page de création. Contient un formulaire avec tous les champs (nomEtab, dren, cisco, zap, commune, fokontany, quartier, couvTelephonique, couvInternet, nbEnseignantG/F, nbSectionG/F). À la soumission :
  1. Validation Zod via **`frontend\lib\validations\etablissement.ts`** (`etablissementSchema`)
  2. Appel de `useCreateEtablissement()` depuis **`frontend\hooks\use-etablissements.ts`**
  3. `apiClient.post('/etablissements', dto)` → `POST /api/etablissements`
  4. En cas de succès : redirection vers `/responsable/etablissements`

**Backend - Contrôleur et validation**

- **`backend\src\modules\etablissements\etablissements.controller.ts`** — méthode `create()` :
  - Guards : `JwtAuthGuard` + `RolesGuard` (ADMIN ou RESPONSABLE_INFRASTRUCTURE)
  - Valide le corps via `@Body() dto: CreateEtablissementDto`
- **`backend\src\modules\etablissements\dto\create-etablissement.dto.ts`** : DTO avec `class-validator`. Tous les champs sont optionnels sauf `nomEtab` (`@IsNotEmpty`). Les nombres ont `@Min(0)`.

**Backend - Service**

- **`backend\src\modules\etablissements\etablissements.service.ts`** — méthode `create(dto)` :
  1. `prisma.etablissement.create({ data: dto, include: { photos: true } })`
  2. `auditService.creation('ETABLISSEMENT', id, nomEtab)` — trace l'opération
  3. Retourne l'établissement créé avec ses photos

**Types associés**

- **`frontend\types\etablissement.ts`** : Interface `CreateEtablissementDto` pour le typage des données envoyées.
- **`frontend\lib\validations\etablissement.ts`** : Schéma Zod côté client qui valide le formulaire avant envoi.
- **`backend\src\modules\etablissements\dto\create-etablissement.dto.ts`** : DTO côté serveur avec `class-validator`.

---

### 2. Consultation liste (READ - List)

```
Page liste → useEtablissements(query) → GET /api/etablissements?page=&limit=&search= → DataTable
```

**Frontend - Affichage**

- **`frontend\app\(dashboard)\responsable\etablissements\page.tsx`** : Page dashboard "Gestion des établissements". Affiche :
  - **SearchBar** → **`frontend\components\shared\search-bar.tsx`** : Recherche textuelle
  - **Selects** → **`frontend\components\ui\select.tsx`** : Filtres CISCO et ZAP
  - **DataTable** → **`frontend\components\shared\data-table.tsx`** : Tableau avec colonnes (photo, nom, dren, cisco, zap, commune, couvertures, actions)
  - **Pagination** → **`frontend\components\shared\pagination.tsx`**
  - **SelectionBar** → **`frontend\components\shared\selection-bar.tsx`** : Actions groupées (suppression multiple)

- **`frontend\app\(public)\etablissements\page.tsx`** : Page publique avec 3 modes de vue :
  - **Galerie** (défaut) : Cartes avec photo + infos
  - **Liste** : Même contenu en grille différente
  - **Carte** : `EtablissementsMap` (Leaflet) avec tous les établissements

**Backend**

- **`backend\src\modules\etablissements\etablissements.controller.ts`** — méthode `findAll(query)` :
  - Marqué `@Public()` — accessible sans authentification
  - Valide via `@Query() dto: EtablissementQueryDto`
- **`backend\src\modules\etablissements\dto\etablissement-query.dto.ts`** : Paramètres `page`, `limit`, `search`, `dren`, `cisco`, `zap`, `commune`.
- **`backend\src\modules\etablissements\etablissements.service.ts`** — méthode `findAll(query)` :
  1. Construit la clause `WHERE` Prisma :
     - `search` → `OR` sur `nomEtab`, `dren`, `cisco`, `commune`, `fokontany` (mode `contains`, insensible)
     - `dren`, `cisco`, `zap`, `commune` → filtres optionnels
  2. Requête avec `select` (pas `include`) pour les performances : `id`, `nomEtab`, `dren`, `cisco`, `zap`, `commune`, `fokontany`, `quartier`, `latitude`, `longitude`, `couvTelephonique`, `couvInternet`, `nbEnseignantG/F`, `nbSectionG/F`
  3. Première photo seulement (triée par `estPrincipale DESC`)
  4. `_count` de `batiments`, `designations`, `structures`, `photos`
  5. Signature des URLs photos via R2 (URLs présignées 1h)
  6. Comptage total pour la pagination
  7. Retourne `{ data: [...], meta: { total, page, limit, totalPages } }`

---

### 3. Consultation détail (READ - Single)

```
Page détail → useEtablissement(id) → GET /api/etablissements/:id → Affichage complet
```

**Frontend - Pages**

- **`frontend\app\(public)\etablissements\[id]\page.tsx`** : Page publique détail. Affiche :
  - Galerie photos avec lightbox (**`frontend\components\etablissements\EtablissementPhoto.tsx`**)
  - Carte d'identité (nom, dren, cisco, coordonnées GPS)
  - Coordonnées du directeur
  - Effectifs (enseignants, sections, salles)
  - Infrastructures (bâtiments, designations, couvertures)
  - Liste des bâtiments avec badges

- **`frontend\app\(dashboard)\responsable\etablissements\[id]\page.tsx`** : Page dashboard (édition). Affiche :
  - Formulaire pré-rempli avec les valeurs actuelles (mêmes champs que création)
  - Sections pour les entités liées :
    - **Photos** via **`frontend\components\shared\generic-photo-upload.tsx`**
    - **Bâtiments** → lien vers `/responsable/batiments/{id}`
    - **Directeur** → modal upsert + suppression
    - **Designations** → modaux création/édition/suppression
    - **Structures** → modaux création/édition/suppression
  - Bouton d'export PDF → **`frontend\components\etablissements\EtablissementExportModal.tsx`**
  - **`frontend\components\etablissements\EtablissementPDFDocument.tsx`** : Document PDF généré avec `@react-pdf/renderer`

**Backend**

- **`backend\src\modules\etablissements\etablissements.controller.ts`** — méthode `findOne(id)` :
  - `@Public()` — accessible sans authentification
- **`backend\src\modules\etablissements\etablissements.service.ts`** — méthode `findOne(id)` :
  1. `prisma.etablissement.findUnique({ where: { id }, include: { ... } })`
  2. Include toutes les relations : `directeur`, `designations`, `structures`, `photos` (triées par `estPrincipale DESC`), `batiments` → `salles` → `equipements`, `ouvertures`, `toilettes`
  3. `_count` de `batiments`, `designations`, `structures`, `photos`
  4. Signature de toutes les URLs photos via R2
  5. Retourne l'établissement complet avec toutes ses relations

**Types associés**

- **`frontend\types\etablissement.ts`** : Interface `Etablissement` (détail complet avec relations : `directeur`, `designations`, `structures`, `photos`, `batiments`).
- **`frontend\types\etablissement-export.ts`** : Types pour l'export PDF (`ExportEtablissement`, `ExportBatiment`, `ExportSalle`).
- **`frontend\hooks\use-export-etablissement.ts`** : Hook React Query pour `GET /api/etablissements/:id/export`.

---

### 4. Modification (UPDATE)

```
Page édition → formulaire pré-rempli → useUpdateEtablissement → PATCH /api/etablissements/:id → Backend → DB
```

**Frontend**

- **`frontend\app\(dashboard)\responsable\etablissements\[id]\page.tsx`** : Même page que le détail, mais le formulaire est en mode édition. À la soumission :
  1. Zod validation
  2. `useUpdateEtablissement(id)` mutation
  3. `apiClient.patch('/etablissements/' + id, dto)` → `PATCH /api/etablissements/:id`
  4. Redirection vers `/responsable/etablissements`

**Entités liées** (modifiées depuis des modaux sur la même page) :

| Entité | Endpoint | Hook | Service |
|--------|----------|------|---------|
| Directeur | `POST /api/etablissements/:id/directeur` | `useUpsertDirecteur` | `prisma.directeur.upsert()` |
| Directeur | `DELETE /api/etablissements/:id/directeur` | `useDeleteDirecteur` | `prisma.directeur.delete()` |
| Designation | `POST /api/etablissements/:id/designations` | `useCreateDesignation` | `prisma.designation.create()` |
| Designation | `PATCH /api/etablissements/:id/designations/:desId` | `useUpdateDesignation` | `prisma.designation.update()` |
| Designation | `DELETE /api/etablissements/:id/designations/:desId` | `useDeleteDesignation` | `prisma.designation.delete()` |
| Structure | `POST /api/etablissements/:id/structures` | `useCreateStructure` | `prisma.structure.create()` |
| Structure | `PATCH /api/etablissements/:id/structures/:strId` | `useUpdateStructure` | `prisma.structure.update()` |
| Structure | `DELETE /api/etablissements/:id/structures/:strId` | `useDeleteStructure` | `prisma.structure.delete()` |

**Backend**

- **`backend\src\modules\etablissements\etablissements.controller.ts`** — méthode `update(id, dto)` :
  - Guards : JWT + ADMIN ou RESPONSABLE_INFRASTRUCTURE
  - `@Body() dto: UpdateEtablissementDto` (tous champs optionnels)
- **`backend\src\modules\etablissements\dto\update-etablissement.dto.ts`** : `Partial<CreateEtablissementDto>`.
- **`backend\src\modules\etablissements\etablissements.service.ts`** — méthode `update(id, dto)` :
  1. Vérifie l'existence (throw `NotFoundException` si absent)
  2. `prisma.etablissement.update({ where: { id }, data: dto })`
  3. `auditService.modification('ETABLISSEMENT', id, nomEtab)`

**Sous-entités - DTOs spécifiques :**

- **`backend\src\modules\etablissements\dto\upsert-directeur.dto.ts`** : `nomDirecteur` (required) + `prenomDr`, `emailDr`, `telDr`
- **`backend\src\modules\etablissements\dto\create-designation.dto.ts`** / **`update-designation.dto.ts`** : `nomDesign`, `typeDesignation`, `numCadastre`, `superficieDesign`, etc.
- **`backend\src\modules\etablissements\dto\create-structure.dto.ts`** / **`update-structure.dto.ts`** : `typeStruc`, `existenceStruc`, `materiauxStruc`, `etatStruc`

**Hooks dédiés :**

- **`frontend\hooks\use-gestion-etablissement.ts`** : Centralise tous les hooks des entités liées (`useUpsertDirecteur`, `useCreateDesignation`, `useUpdateDesignation`, `useDeleteDesignation`, `useCreateStructure`, `useUpdateStructure`, `useDeleteStructure`).

---

### 5. Suppression (DELETE)

```
Bouton supprimer → Modal confirmation → useDeleteEtablissement → DELETE /api/etablissements/:id → Backend → R2 cleanup + DB cascade
```

**Frontend**

- **Suppression unique** : Clic sur l'icône poubelle dans la DataTable → modal "Confirmer la suppression" → `useDeleteEtablissement(id)` → `apiClient.delete('/etablissements/' + id)`
- **Suppression multiple** : Cases à cocher dans la DataTable → **`frontend\components\shared\selection-bar.tsx`** → `Promise.all(ids.map(id => deleteEtab(id)))`

**Backend**

- **`backend\src\modules\etablissements\etablissements.controller.ts`** — méthode `remove(id)` :
  - Guards : JWT + ADMIN ou RESPONSABLE_INFRASTRUCTURE
- **`backend\src\modules\etablissements\etablissements.service.ts`** — méthode `remove(id)` :
  1. Récupère l'établissement avec toutes ses photos (y compris celles des bâtiments et salles)
  2. Supprime TOUS les fichiers photo de Cloudflare R2 (try/catch par clé, non bloquant)
  3. `prisma.etablissement.delete({ where: { id } })` — le `onDelete: Cascade` du schéma Prisma supprime automatiquement : photos, bâtiments, salles, toilettes, équipements, ouvertures, directeur, designations, structures
  4. `auditService.suppression('ETABLISSEMENT', id)`

---

### 6. Schéma récapitulatif des endpoints CRUD

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| `GET` | `/api/etablissements` | Public | — | Liste paginée avec filtres |
| `GET` | `/api/etablissements/:id` | Public | — | Détail complet d'un établissement |
| `GET` | `/api/etablissements/:id/export` | Public | — | Données pour export PDF |
| `POST` | `/api/etablissements` | JWT | ADMIN, RESP_INFRA | Création |
| `PATCH` | `/api/etablissements/:id` | JWT | ADMIN, RESP_INFRA | Modification |
| `DELETE` | `/api/etablissements/:id` | JWT | ADMIN, RESP_INFRA | Suppression |
| `POST` | `/api/etablissements/:id/directeur` | JWT | ADMIN, RESP_INFRA | Création/mise à jour directeur |
| `DELETE` | `/api/etablissements/:id/directeur` | JWT | ADMIN, RESP_INFRA | Suppression directeur |
| `POST` | `/api/etablissements/:id/designations` | JWT | ADMIN, RESP_INFRA | Création désignation |
| `PATCH` | `/api/etablissements/:id/designations/:desId` | JWT | ADMIN, RESP_INFRA | Modification désignation |
| `DELETE` | `/api/etablissements/:id/designations/:desId` | JWT | ADMIN | Suppression désignation |
| `POST` | `/api/etablissements/:id/structures` | JWT | ADMIN, RESP_INFRA | Création structure |
| `PATCH` | `/api/etablissements/:id/structures/:strId` | JWT | ADMIN, RESP_INFRA | Modification structure |
| `DELETE` | `/api/etablissements/:id/structures/:strId` | JWT | ADMIN | Suppression structure |

---

### 7. Flux résumé pour chaque opération

```
[CREATE]
  /nouveau/page.tsx → formulaire → Zod (etablissementSchema)
    → useCreateEtablissement → POST /api/etablissements
      → Controller.create() [JwtAuthGuard + RolesGuard]
        → Service.create(dto)
          → prisma.etablissement.create()
          → auditService.creation()
        ← Établissement créé
    → router.push('/responsable/etablissements')

[LIST]
  /responsable/etablissements/page.tsx
    → useEtablissements({ page, limit, search, cisco, zap })
      → GET /api/etablissements?page=1&limit=10&search=...
        → Controller.findAll() [@Public]
          → Service.findAll(query)
            → Prisma WHERE (search OR, filters AND)
            → select + _count + signPhotoUrls()
          ← { data, meta: { total, page, limit, totalPages } }
    → DataTable + Pagination + SearchBar + Filters

[DETAIL]
  /etablissements/[id]/page.tsx
    → useEtablissement(id) → GET /api/etablissements/:id
      → Controller.findOne() [@Public]
        → Service.findOne(id)
          → prisma.findUnique({ include: { directeur, designations, structures, photos, batiments→salles→... } })
          → signPhotoUrls()
        ← Établissement complet avec toutes relations
    → Affichage : galerie, infos, bâtiments, directeur, etc.

[UPDATE]
  /responsable/etablissements/[id]/page.tsx
    → formulaire pré-rempli → Zod → useUpdateEtablissement(id)
      → PATCH /api/etablissements/:id
        → Controller.update() [JwtAuthGuard + RolesGuard]
          → Service.update(id, dto)
            → prisma.etablissement.update()
            → auditService.modification()
          ← Établissement mis à jour
    → router.push('/responsable/etablissements')

  Sous-entités :
    Directeur   → POST/DELETE /api/etablissements/:id/directeur
    Designation → POST/PATCH/DELETE /api/etablissements/:id/designations/:desId
    Structure   → POST/PATCH/DELETE /api/etablissements/:id/structures/:strId

[DELETE]
  DataTable → icône supprimer → Modal confirmation
    → useDeleteEtablissement(id) → DELETE /api/etablissements/:id
      → Controller.remove() [JwtAuthGuard + RolesGuard]
        → Service.remove(id)
          1. Récupère photos (etablissement + batiments + salles)
          2. Supprime tous les fichiers R2
          3. prisma.etablissement.delete() [CASCADE]
          4. auditService.suppression()
        ← 204 No Content
    → Rafraîchissement liste React Query
```

---

## Circulation des données — vue d'ensemble fichier par fichier

### 1. Couche Frontend — Du clic utilisateur à l'appel API

```
User → sidebar → layout → page → hooks → api-client
```

**`frontend\components\layout\sidebar.tsx`**
Pourquoi il existe : Fournir la navigation latérale. L'utilisateur clique sur "Carte" → génère une route `/responsable/carte`. Sans lui, l'utilisateur ne pourrait pas accéder à la page.

**`frontend\app\(dashboard)\layout.tsx`**
Pourquoi il existe : Protéger la route. Avant d'afficher la page, il vérifie que l'utilisateur est authentifié via Zustand. Si pas de token JWT valide → redirection vers `/login`. C'est le garde-barrière du dashboard.

**`frontend\components\layout\dashboard-layout.tsx`**
Pourquoi il existe : Fournir la structure visuelle commune (sidebar à gauche, navbar en haut, contenu au centre). Toutes les pages du dashboard l'utilisent pour avoir le même aspect.

**`frontend\app\(dashboard)\responsable\carte\page.tsx`**
Pourquoi il existe : C'est le point d'entrée de la fonctionnalité carte. Il reçoit les données, les filtre, et les passe au composant carte. Il gère l'état local (filtres, toggles). Sans lui, aucune orchestration entre les 3 sources de données.
- **Ce qu'il reçoit** : rien (c'est lui qui déclenche les appels)
- **Ce qu'il produit** : `filtered` (établissements filtrés), `showAleas`, `showTrajets`
- **Où ça va** : vers `EtablissementsMap`

**`frontend\hooks\use-etablissements.ts`**
Pourquoi il existe : Encapsuler la logique d'appel API pour les établissements avec React Query (cache, loading state, error state). Sans hook, chaque composant devrait réécrire l'appel Axios.
- **Ce qu'il envoie** : `GET /api/etablissements?page=1&limit=999`
- **Ce qu'il reçoit** : `{ data: EtablissementListe[], meta: PaginationMeta }`
- **Où ça va** : dans `page.tsx` via le retour du hook

**`frontend\hooks\use-aleas.ts`**
Pourquoi il existe : Même logique pour les aléas. Séparé des établissements car ce sont des données indépendantes qui changent à des rythmes différents.
- **Ce qu'il envoie** : `GET /api/aleas`
- **Ce qu'il reçoit** : `Alea[]` (avec effets → trajets → moyens)

**`frontend\hooks\use-trajets.ts`**
Pourquoi il existe : Même logique pour les trajets. Séparé car les trajets sont des données géospatiales distinctes.
- **Ce qu'il envoie** : `GET /api/trajets`
- **Ce qu'il reçoit** : `Trajet[]`

**`frontend\lib\api-client.ts`**
Pourquoi il existe : Centraliser la configuration HTTP (base URL, timeout, headers). L'intercepteur injecte automatiquement le token JWT (Bearer) depuis le localStorage, et un autre intercepteur redirige vers `/login` si 401. Sans lui, chaque hook devrait gérer l'auth manuellement.

**`frontend\types\etablissement.ts`**
Pourquoi il existe : Définir le contrat TypeScript des données établissement. Garantit que le frontend et le backend parlent le même langage. Contient `EtablissementListe` (avec latitude, longitude), `Etablissement` (détail avec relations), `CreateEtablissementDto`, `UpdateEtablissementDto`, et les types pour toutes les entités liées (Directeur, Designation, Structure, Photo, BatimentSummary).

**`frontend\types\alea.ts`**
Pourquoi il existe : Typage des aléas (idAleat, typeAleat, nomAleat, effets). Utilisé pour savoir si un établissement est affecté.

**`frontend\types\trajet.ts`**
Pourquoi il existe : Typage des trajets (idTrajet, nomTrajet, moyens, periode). Utilisé pour tracer les polylines sur la carte.

**`frontend\types\api.ts`**
Pourquoi il existe : Typage générique de l'enveloppe API (`ApiResponse<T>`, `PaginatedResponse<T>`). Évite de dupliquer la structure `{ success, data, meta }` pour chaque type de réponse.

**`frontend\providers\query-provider.tsx`**
Pourquoi il existe : Wrapper React Query placé dans le layout racine. Tous les hooks React Query en dépendent. Configure le stale time à 5 minutes pour éviter de re-fetch les données trop souvent.

**`frontend\hooks\use-etablissements.ts`** (hooks CRUD supplémentaires)
Pourquoi il existe : Au-delà du hook de liste, ce fichier contient `useCreateEtablissement`, `useUpdateEtablissement`, `useDeleteEtablissement`. Chacun invalide le cache React Query après succès pour rafraîchir la liste automatiquement.
- **`useCreateEtablissement`** : `POST /api/etablissements` → invalide `['etablissements']`
- **`useUpdateEtablissement(id)`** : `PATCH /api/etablissements/:id` → invalide `['etablissements']`
- **`useDeleteEtablissement`** : `DELETE /api/etablissements/:id` → invalide `['etablissements']`

**`frontend\hooks\use-gestion-etablissement.ts`**
Pourquoi il existe : Séparé du hook principal car il gère les entités liées (directeur, designations, structures) qui ont leur propre cycle de vie et leurs propres endpoints. Sans lui, le fichier use-etablissements serait trop gros.
- **Ce qu'il contient** : `useUpsertDirecteur`, `useDeleteDirecteur`, `useCreateDesignation`, `useUpdateDesignation`, `useDeleteDesignation`, `useCreateStructure`, `useUpdateStructure`, `useDeleteStructure`
- **Où ça va** : utilisé dans la page d'édition `[id]/page.tsx`

**`frontend\hooks\use-export-etablissement.ts`**
Pourquoi il existe : Hook dédié à l'export PDF. Appelle `GET /api/etablissements/:id/export` qui retourne toutes les données (avec photos signées) dans un format optimisé pour le PDF. Séparé car le endpoint export a un include plus large que le détail standard.

**`frontend\lib\validations\etablissement.ts`**
Pourquoi il existe : Schéma Zod qui valide le formulaire de création/modification **côté client** avant l'envoi au backend. Miroir des DTOs backend. Sans lui, les erreurs de validation ne seraient détectées qu'après un appel réseau.
- **Ce qu'il contient** : `etablissementSchema` — valide `nomEtab` (requis), `nbEnseignantG/F` (min 0), etc.
- **Où ça va** : utilisé dans `nouveau/page.tsx` et `[id]/page.tsx`

---

### 2. Couche CRUD Établissement — Pages et formulaires

```
Page liste → DataTable → Pagination → Filtres
Page création → Formulaire → Zod → Mutation
Page édition → Formulaire pré-rempli → Zod → Mutation + entités liées
```

**`frontend\app\(dashboard)\responsable\etablissements\page.tsx`**
Pourquoi il existe : Page "Gestion des établissements" — point d'entrée du CRUD. Sans elle, l'utilisateur ne pourrait ni lister, ni filtrer, ni déclencher les actions de création/suppression.
- **Ce qu'il reçoit** : les paramètres de filtrage (search, cisco, zap) depuis l'URL
- **Ce qu'il produit** : `useEtablissements(query)` → liste paginée affichée dans DataTable
- **Ce qu'il contient** : `SearchBar`, `Select` (CISCO, ZAP), `DataTable` (avec checkboxes + actions), `Pagination`, `SelectionBar` (suppression multiple)

**`frontend\app\(dashboard)\responsable\etablissements\nouveau\page.tsx`**
Pourquoi il existe : Page de création d'un établissement. Affiche un formulaire vide. À la soumission : validation Zod → `useCreateEtablissement` → `POST /api/etablissements` → redirection vers la liste. Sans elle, on ne pourrait pas créer d'établissement.

**`frontend\app\(dashboard)\responsable\etablissements\[id]\page.tsx`**
Pourquoi il existe : Page d'édition et de consultation détaillée. C'est la page la plus complexe : formulaire pré-rempli + sections pour chaque entité liée (photos, bâtiments, directeur, designations, structures) + export PDF.
- **Ce qu'il reçoit** : l'ID depuis l'URL
- **Ce qu'il produit** : `useEtablissement(id)` → affiche le formulaire pré-rempli
- **Sous-composants utilisés** : `GenericPhotoUpload`, modaux directeur/designation/structure, `EtablissementExportModal`

**`frontend\app\(public)\etablissements\page.tsx`**
Pourquoi il existe : Page publique de liste. 3 modes de vue (galerie, liste, carte). Accessible sans authentification. Permet aux visiteurs de parcourir les établissements.

**`frontend\app\(public)\etablissements\[id]\page.tsx`**
Pourquoi il existe : Page publique de détail. Affiche toutes les infos d'un établissement en lecture seule (galerie photos, carte d'identité, effectifs, bâtiments). Accessible sans auth. Utilise `EtablissementPhoto` (PhotoGallery) et `EtablissementsMap`.

**`frontend\components\shared\data-table.tsx`**
Pourquoi il existe : Tableau de données réutilisable avec sélection multiple, tri, et colonnes personnalisables. Utilisé par la page liste des établissements. Évite de réécrire un tableau pour chaque entité.

**`frontend\components\shared\pagination.tsx`**
Pourquoi il existe : Navigation paginée. Reçoit `total`, `page`, `limit` depuis le hook et génère les boutons page précédente/suivante. Sans elle, on ne pourrait naviguer que sur la première page.

**`frontend\components\shared\selection-bar.tsx`**
Pourquoi il existe : Barre d'actions groupées qui apparaît quand l'utilisateur sélectionne des lignes dans le DataTable. Affiche le compte et un bouton "Supprimer la sélection". Évite de devoir supprimer un par un.

**`frontend\components\etablissements\EtablissementExportModal.tsx`**
Pourquoi il existe : Modale de prévisualisation et téléchargement PDF. Propose différents thèmes de couleurs avant d'ouvrir le PDF dans un nouvel onglet.

**`frontend\components\etablissements\EtablissementPDFDocument.tsx`**
Pourquoi il existe : Composant `@react-pdf/renderer` qui génère le document PDF côté client à partir des données d'export. Contient la mise en page, les tableaux, les photos.

---

### 3. Couche Carte — Rendu visuel des données

```
page.tsx → etablissements-map.tsx → Leaflet (MapContainer, Marker, Polyline, Popup)
```

**`frontend\components\map\etablissements-map.tsx`**
Pourquoi il existe : C'est le cœur de la carte. Il transforme les données brutes (coordonnées GPS, aléas, trajets) en éléments visuels Leaflet. 
- **Ce qu'il reçoit** : `etablissements: EtablissementListe[]`, `aleas: Alea[]`, `trajets: Trajet[]`, les flags `showAleas`, `showTrajets`
- **Ce qu'il produit** : 
  - `MapContainer` + `TileLayer` (fond de carte OpenStreetMap)
  - `FitBounds` (zoom auto sur les données visibles)
  - `Marker[]` avec `divIcon` personnalisé (vert normal, violet si aléa) + `Popup` (infos établissement + lien détail)
  - `Polyline[]` bleue en tiretés pour les trajets
- **Pourquoi chargé dynamiquement** (`ssr: false`) : Leaflet utilise `window` qui n'existe pas côté serveur Next.js

**`frontend\components\shared\search-bar.tsx`**
Pourquoi il existe : Permettre la recherche textuelle sur `nomEtab` et `commune`. Filtre côté client pour éviter un appel API à chaque frappe.

**`frontend\components\ui\select.tsx`**
Pourquoi il existe : Menu déroulant pour les filtres CISCO, couverture téléphonique, état. Même logique : filtrage 100% client pour la réactivité.

**`frontend\components\shared\breadcrumb.tsx`**
Pourquoi il existe : Afficher "Carte interactive" dans le fil d'Ariane. Amélioration UX (l'utilisateur sait où il est).

---

### 3. Couche Backend — Réception et traitement des requêtes

```
Requête HTTP → main.ts → interceptors → controller → service → Prisma → PostgreSQL / R2
```

**`backend\src\main.ts`**
Pourquoi il existe : Point d'entrée du serveur NestJS. Configure le préfixe global `/api`, CORS (pour que le frontend sur un autre port puisse communiquer), Swagger (documentation API), et la ValidationPipe globale.
- **Ce qu'il reçoit** : rien (c'est le bootstrap)
- **Ce qu'il produit** : le serveur HTTP NestJS prêt à écouter

**`backend\src\common\interceptors\transform.interceptor.ts`**
Pourquoi il existe : Uniformiser la structure de toutes les réponses API en `{ success: true, data: ..., meta?: ..., timestamp: "..." }`. Sans lui, chaque contrôleur devrait wrapper manuellement.
- **Ce qu'il reçoit** : la réponse brute du contrôleur
- **Ce qu'il produit** : la réponse enveloppée envoyée au client

**`backend\src\modules\etablissements\etablissements.controller.ts`**
Pourquoi il existe : Point d'entrée REST de TOUTES les opérations CRUD des établissements et de leurs entités liées. Définit 15+ endpoints avec leurs guards et validations.
- **Ce qu'il reçoit** : requêtes HTTP avec paramètres (query, body, param)
- **Ce qu'il produit** : délègue au service et retourne le résultat
- **Endpoints CRUD principaux** :
  - `GET /api/etablissements` (`@Public`) → `findAll(query)`
  - `GET /api/etablissements/:id` (`@Public`) → `findOne(id)`
  - `GET /api/etablissements/:id/export` (`@Public`) → `findOneExport(id)` (données pour PDF)
  - `POST /api/etablissements` (JWT + ADMIN/RESP_INFRA) → `create(dto)`
  - `PATCH /api/etablissements/:id` (JWT + ADMIN/RESP_INFRA) → `update(id, dto)`
  - `DELETE /api/etablissements/:id` (JWT + ADMIN/RESP_INFRA) → `remove(id)`
- **Endpoints entités liées** :
  - `POST/DELETE /api/etablissements/:id/directeur` → upsert/delete directeur
  - `POST/PATCH/DELETE /api/etablissements/:id/designations/:desId` → CRUD designations
  - `POST/PATCH/DELETE /api/etablissements/:id/structures/:strId` → CRUD structures
- **Où ça va** : vers `EtablissementsService`

**`backend\src\modules\etablissements\etablissements.service.ts`**
Pourquoi il existe : Toute la logique métier des établissements. Gère la création, la lecture (liste avec pagination/filtres, détail avec toutes les relations), la modification, la suppression (avec nettoyage R2), et la signature des URLs photos.
- **Ce qu'il reçoit** : les paramètres/body du contrôleur
- **Méthodes CRUD** :
  - `findAll(query)` → requête Prisma avec `select` optimisé + `_count` + pagination + signature photos
  - `findOne(id)` → `prisma.findUnique` avec `include` de toutes les relations (directeur, designations, structures, photos, batiments → salles → equipements/ouvertures/toilettes)
  - `findOneExport(id)` → données complètes pour PDF (inclut photos de tous les niveaux)
  - `create(dto)` → `prisma.etablissement.create` + `auditService.creation()`
  - `update(id, dto)` → vérifie existence + `prisma.etablissement.update` + `auditService.modification()`
  - `remove(id)` → récupère toutes les clés R2 (photos de l'établissement + bâtiments + salles) → supprime les fichiers R2 → `prisma.etablissement.delete()` (CASCADE gère le reste) → `auditService.suppression()`
- **Méthodes entités liées** :
  - `upsertDirecteur(id, dto)` / `deleteDirecteur(id)`
  - `createDesignation(id, dto)` / `updateDesignation(id, desId, dto)` / `deleteDesignation(id, desId)`
  - `createStructure(id, dto)` / `updateStructure(id, strId, dto)` / `deleteStructure(id, strId)`
  - `uploadPhoto(id, file)` / `uploadMultiplePhotos(id, files)` / `setPhotoPrincipale(id, photoId)` / `deletePhoto(id, photoId)`
- **Où ça va** : réponse JSON vers le contrôleur → interceptor → client

**`backend\src\modules\etablissements\etablissements.module.ts`**
Pourquoi il existe : Déclare le module NestJS pour les établissements. Importe `R2Module` (pour le stockage photos) et enregistre le controller + service. Sans lui, NestJS ne saurait pas instancier ces classes.

**`backend\src\modules\etablissements\dto\etablissement-query.dto.ts`**
Pourquoi il existe : Valider et typer les paramètres de requête de la liste (`page`, `limit`, `search`, `dren`, `cisco`, etc.). Sans DTO, des paramètres invalides pourraient passer et causer des erreurs Prisma.

**`backend\src\modules\etablissements\dto\create-etablissement.dto.ts`**
Pourquoi il existe : DTO de création avec `class-validator`. `nomEtab` est requis (`@IsNotEmpty`), tous les autres champs sont optionnels. Les nombres ont `@Min(0)`. Garantit l'intégrité des données avant insertion.

**`backend\src\modules\etablissements\dto\update-etablissement.dto.ts`**
Pourquoi il existe : DTO de modification — tous les champs sont optionnels (`Partial<CreateEtablissementDto>`). Permet de ne modifier que les champs envoyés sans écraser les autres.

**`backend\src\modules\etablissements\dto\upsert-directeur.dto.ts`**
Pourquoi il existe : DTO pour la création/modification du directeur (`nomDirecteur` requis, `prenomDr`, `emailDr`, `telDr` optionnels). Utilise `prisma.directeur.upsert()` pour créer ou mettre à jour selon l'existence.

**`backend\src\modules\etablissements\dto\create-designation.dto.ts`** / **`update-designation.dto.ts`**
Pourquoi ils existent : DTOs pour les designations (titres fonciers). `nomDesign` requis, les autres champs optionnels (`estEnceinteEtab`, `estTitre`, `estLitigieux`, `typeDesignation`, `numCadastre`, `superficieDesign`).

**`backend\src\modules\etablissements\dto\create-structure.dto.ts`** / **`update-structure.dto.ts`**
Pourquoi ils existent : DTOs pour les structures (types de bâtiments). Tous les champs optionnels (`typeStruc`, `existenceStruc`, `materiauxStruc`, `etatStruc`).

**`backend\src\modules\aleas\aleas.controller.ts`**
Pourquoi il existe : Point d'entrée REST des aléas. Définit `GET /api/aleas` (public). Délègue au service.

**`backend\src\modules\aleas\aleas.service.ts`**
Pourquoi il existe : Récupère la liste des aléas avec leurs effets et trajets associés. Ces données sont affichées sur la carte pour colorer les marqueurs.
- **Ce qu'il reçoit** : rien (pas de paramètres)
- **Ce qu'il fait** : `findAll()` → Prisma avec `include: { effets: { include: { trajet: ... } } }`
- **Où ça va** : vers le contrôleur → client → `EtablissementsMap`

**`backend\src\modules\trajets\trajets.controller.ts`**
Pourquoi il existe : Point d'entrée REST des trajets. Définit `GET /api/trajets` (public).

**`backend\src\modules\trajets\trajets.service.ts`**
Pourquoi il existe : Récupère la liste des trajets avec moyens de transport et période difficile. Les trajets deviennent des polylines sur la carte.
- **Ce qu'il reçoit** : rien
- **Ce qu'il fait** : `findAll()` → Prisma avec `include: { moyens, periode, effets: { include: { alea } } }`

**`backend\src\app.module.ts`**
Pourquoi il existe : Module racine NestJS. Sans lui, les contrôleurs et services ne seraient pas enregistrés et NestJS ne saurait pas les instancier. Il importe `EtablissementsModule`, `AleasModule`, `TrajetsModule`, `R2Module`.

**`backend\src\prisma\prisma.service.ts`**
Pourquoi il existe : Instance unique de PrismaClient connectée à PostgreSQL. Évite de créer plusieurs connexions. Tous les services l'injectent pour accéder à la base.

**`backend\prisma\schema.prisma`**
Pourquoi il existe : Définit le schéma de la base de données (modèles, relations, types). C'est la source de vérité de la structure des données : `Etablissement` (latitude, longitude), `Photo` (key, url, estPrincipale), `Alea`, `Trajet`, etc.
- **Ce qu'il contient pour la carte** : `latitude Float?`, `longitude Float?`, `couvTelephonique Boolean`, `couvInternet Boolean`
- **Ce qu'il contient pour les photos** : modèles `Photo`, `BatimentPhoto`, `SallePhoto` avec clé étrangère + `onDelete: Cascade`
- **Ce qu'il contient pour le CRUD** : modèle `Etablissement` avec toutes ses relations (`directeur`, `designations`, `structures`, `photos`, `batiments` → `salles` → `equipements`/`ouvertures`/`toilettes`), le tout relié par clés étrangères avec `onDelete: Cascade` pour les suppressions en chaîne.

**`backend\src\modules\etablissements\etablissements.service.spec.ts`**
Pourquoi il existe : Tests unitaires du service `EtablissementsService`. Vérifie le comportement des méthodes CRUD sans nécessiter de base de données réelle (utilise un mock PrismaService). Sans tests, on ne peut pas garantir que les modifications du service ne cassent pas la logique existante.
- **Ce qu'il teste** : `create`, `findAll`, `findOne`, `update`, `remove`, et les méthodes de gestion des photos

---

### 4. Couche Stockage Photos — Cloudflare R2

```
Service → R2Service → S3Client → Cloudflare R2
```

**`backend\src\r2\r2.service.ts`**
Pourquoi il existe : Point d'accès unique au stockage Cloudflare R2 (compatible S3). Abstraction qui permet de changer de provider sans impacter le reste du code.
- **Flux upload** : `uploadFile(key, buffer, contentType)` → `PutObjectCommand` → R2
- **Flux affichage** : `getPresignedUrl(key, 3600)` → `GetObjectCommand` + `getSignedUrl()` → URL temporaire (1h) → le client l'utilise dans `<img>`
- **Flux suppression** : `deleteFile(key)` → `DeleteObjectCommand` → R2
- **Génération de clés** : `generatePhotoKey(id, name)` → `etablissements/{id}/{timestamp}-{nomAssaini}`

**`backend\src\r2\r2.controller.ts`**
Pourquoi il existe : Fournir un proxy pour servir les images via le backend dans des contextes où le client ne peut pas fetch directement (ex: génération PDF côté serveur). Endpoints : `GET /r2/proxy-image?url=...` et `GET /r2/proxy-by-key?key=...`.

**`backend\src\r2\r2.module.ts`**
Pourquoi il existe : Déclarer le module NestJS pour R2 et exporter `R2Service` (marqué `@Global()`) pour qu'il soit injectable partout sans ré-importer le module.

**`backend\src\config\index.ts`**
Pourquoi il existe : Centraliser la configuration depuis les variables d'environnement. Sans lui, les services devraient lire `process.env.R2_ACCOUNT_ID` etc. partout. Il valide aussi que les valeurs sont présentes au démarrage.

---

### 5. Couche Photos — Upload et affichage

```
GenericPhotoUpload → POST /api/.../photos → Controller → Service → R2Service + Prisma
```

**`frontend\components\shared\generic-photo-upload.tsx`**
Pourquoi il existe : Composant d'upload de photos réutilisable pour les 3 entités (établissement, bâtiment, salle). Sans lui, il faudrait réécrire 3 fois le drag & drop, la validation, la lightbox.
- **Ce qu'il fait** : drag & drop, validation (max 10 fichiers, 10 Mo, types image), construction FormData, upload, affichage des photos existantes, définir comme principale, supprimer, lightbox
- **Où il est utilisé** : dans les pages d'édition dashboard

**`frontend\components\etablissements\EtablissementPhoto.tsx`**
Pourquoi il existe : Composant d'affichage de photo avec fallback. Si l'image ne charge pas, affiche un gradient avec icône plutôt qu'un trou visuel. Contient aussi `PhotoGallery` pour le détail (carrousel + lightbox).

**`frontend\app\(dashboard)\responsable\etablissements\[id]\page.tsx`**
Pourquoi il existe : Page d'édition d'un établissement. Utilise `GenericPhotoUpload` pour gérer les photos. C'est ici que l'utilisateur téléverse les photos de l'école.

**`frontend\app\(dashboard)\responsable\batiments\[id]\page.tsx`**
Pourquoi il existe : Même chose pour les bâtiments. Les photos sont stockées dans `batiment_photo`.

**`frontend\app\(dashboard)\responsable\salles\[id]\page.tsx`**
Pourquoi il existe : Même chose pour les salles. Photos dans `salle_photo`.

**`frontend\app\(public)\etablissements\[id]\page.tsx`**
Pourquoi il existe : Page publique de détail d'un établissement. Affiche la galerie photos via `PhotoGallery`. Accessible sans authentification.

**`backend\src\modules\batiments\batiments.controller.ts`** et **`batiments.service.ts`**
Pourquoi ils existent : Même pattern CRUD que les établissements mais pour les bâtiments. Les photos sont dans la table `batiment_photo`. Pourquoi séparé ? Car un bâtiment a son propre cycle de vie et ses propres relations.

**`backend\src\modules\salles\salles.controller.ts`** et **`salles.service.ts`**
Pourquoi ils existent : Même pattern pour les salles. Table `salle_photo`. Même justification : indépendance des cycles de vie.

**`frontend\types\batiment.ts`**
Pourquoi il existe : Typage des données bâtiment, incluant `BatimentPhoto`. Contrat entre le composant `GenericPhotoUpload` et l'API.

**`frontend\types\salle.ts`**
Pourquoi il existe : Typage des données salle, incluant `SallePhoto`.

**`frontend\types\etablissement-export.ts`**
Pourquoi il existe : Typage des données d'export (PDF). Les photos exportées ont une structure légèrement différente (ExportPhoto, ExportBatimentPhoto, ExportSallePhoto).

---

### 6. Fichiers partagés / transverses

**`frontend\app\layout.tsx`**
Pourquoi il existe : Layout racine de Next.js. Toute l'application passe dedans. Il wrappe le contenu dans `QueryProvider` (React Query) et `AuthProvider` (Zustand/Supabase). Sans lui, les hooks React Query ne fonctionneraient pas.

**`frontend\app\(public)\page.tsx`**
Pourquoi il existe : Page d'accueil publique. Réutilise `EtablissementsMap` pour montrer une carte aux visiteurs (sans aléas ni trajets). Évite de dupliquer le code carte.

**`frontend\app\(public)\etablissements\page.tsx`**
Pourquoi il existe : Liste publique des établissements. Bascule entre vue liste et vue carte (réutilise `EtablissementsMap`). Le même composant carte sert donc dans 3 contextes différents.

**`backend\_check_coords.ts`**
Pourquoi il existe : Script utilitaire indépendant qui compte les établissements avec/sans coordonnées GPS. Permet de vérifier la qualité des données sans lancer le serveur.

---

### 7. Couche Assistant IA — Chat en langage naturel

```
Page chat → ChatIaWidget → useChatIa → apiClient → ChatIaController → ChatIaService → Groq API
```

**`frontend\components\layout\sidebar.tsx`**
Pourquoi il existe : Fournit les entrées "Assistant IA" et "Monitoring IA" dans la navigation. Sans lui, l'utilisateur ne peut pas accéder aux pages du chat.

**`frontend\app\(dashboard)\responsable\chat-ia\page.tsx`** et **`frontend\app\(dashboard)\admin\chat-ia\page.tsx`**
Pourquoi ils existent : Pages du chat IA pour chaque rôle. Elles wrappent `ChatIaWidget` avec le breadcrumb et le titre. Séparées car les rôles peuvent avoir des permissions différentes à l'avenir.

**`frontend\app\(dashboard)\admin\ia-logs\page.tsx`**
Pourquoi il existe : Page de monitoring réservée aux admins. Affiche les KPIs, graphiques et logs de l'assistant IA. Sans elle, les admins ne pourraient pas superviser l'utilisation de l'IA.

**`frontend\components\chat-ia\chat-ia.tsx`** (`ChatIaWidget`)
Pourquoi il existe : Composant principal du chat. Gère l'affichage des messages, la saisie, les questions suggérées, le défilement automatique, et les états de chargement. C'est l'interface utilisateur complète de l'assistant.
- **Ce qu'il reçoit** : les messages depuis `useChatIa`
- **Ce qu'il produit** : l'interface du chat + les appels à `sendMessage()`, `executeAction()`, `clearConversation()`

**`frontend\components\chat-ia\chat-message.tsx`**
Pourquoi il existe : Affiche chaque message (bulle avec avatar) et les actions proposées par l'IA. Le mécanisme de double-clic pour confirmer les actions est critique : il empêche les exécutions accidentelles de modifications en base.
- **Ce qu'il reçoit** : un `ChatMessage` (rôle, contenu, action proposée)
- **Ce qu'il produit** : le rendu visuel + déclenche `executeAction()` sur confirmation

**`frontend\hooks\use-chat-ia.ts`**
Pourquoi il existe : Centralise toute la logique de communication avec l'API IA. Gère l'état des messages, l'envoi, l'exécution d'actions, et le nettoyage de la conversation. Sans hook, le composant serait surchargé.
- **Ce qu'il envoie** : `POST /api/chat-ia/message` (message + historique), `POST /api/chat-ia/execute` (action), `DELETE /api/chat-ia/conversation`, `GET /api/chat-ia/schema`
- **Ce qu'il reçoit** : `ChatResponse` (réponse texte + action proposée), `ExecuteActionResponse` (succès/échec)
- **Où ça va** : dans l'état local du hook → affiché par `ChatIaWidget`

**`frontend\hooks\use-ia-logs.ts`**
Pourquoi il existe : Hook React Query pour le monitoring IA. Avec auto-refresh (30s pour les logs, 60s pour les stats), il permet à la page de monitoring d'être toujours à jour sans rechargement manuel.

**`frontend\types\chat-ia.ts`**
Pourquoi il existe : Typage complet des données du chat (`ChatMessage`, `ProposedAction`, `ChatResponse`, etc.). Garantit que le frontend et le backend parlent le même langage pour les actions proposées.

**`backend\src\modules\chat-ia\chat-ia.controller.ts`**
Pourquoi il existe : Point d'entrée REST de l'assistant. Définit 6 endpoints protégés par JWT + rôles. Sans lui, le frontend n'aurait pas d'API à appeler.
- **Ce qu'il reçoit** : requêtes HTTP avec JWT
- **Ce qu'il fait** : valide les rôles, délègue au service
- **Où ça va** : vers `ChatIaService` ou `IaMonitoringService`

**`backend\src\modules\chat-ia\chat-ia.service.ts`**
Pourquoi il existe : Cœur de l'assistant IA. Construit le system prompt avec les stats DB en temps réel, gère la mémoire de conversation par utilisateur, appelle l'API Groq, parse les actions proposées, et exécute les actions confirmées.
- **Flux `sendMessage()`** :
  1. Construit le prompt système (rôle + stats DB + règles CRUD)
  2. Récupère/crée la conversation en mémoire (Map userId → messages[])
  3. Appelle `openai.chat.completions.create()` (via Groq, modèle Llama 3.3 70B)
  4. Parse la réponse → extrait le bloc JSON d'action s'il existe
  5. Log via `IaMonitoringService`
  6. Retourne `{ message, proposedAction? }`
- **Flux `executeAction()`** :
  1. Vérifie le rôle (ADMIN ou RESPONSABLE_INFRASTRUCTURE)
  2. Switch sur `actionType` (`create`/`update`/`delete`)
  3. Exécute Prisma (`prisma.etablissement.create(...)`, etc.)
  4. Audit log via `AuditService`
  5. Retourne `{ success, message, data }`

**`backend\src\modules\chat-ia\ia-monitoring.service.ts`**
Pourquoi il existe : Persister les métriques de chaque appel IA dans la table `ia_log`. Permet aux admins de superviser l'utilisation (tokens, temps, succès/échec) et de détecter les anomalies.
- **Ce qu'il reçoit** : les métriques d'un appel IA (userId, tokens, durée, succès)
- **Ce qu'il produit** : un enregistrement dans `ia_log` + les endpoints `GET /logs` et `GET /logs/stats`

**`backend\src\modules\chat-ia\dto\chat-message.dto.ts`**
Pourquoi il existe : Valider les données entrantes (`ChatMessageDto`, `ExecuteActionDto`) et typer les réponses (`ChatResponseDto`, `ProposedActionDto`). Sans DTO, des messages malformés pourraient planter le service.

**`backend\src\modules\chat-ia\chat-ia.module.ts`**
Pourquoi il existe : Déclarer le module NestJS. NestJS a besoin de ce fichier pour savoir que `ChatIaController`, `ChatIaService` et `IaMonitoringService` existent et doivent être instanciés.

**`backend\src\config\index.ts`**
Pourquoi il existe : Lire `OPEN_API_KEY`, `IA_API_URL`, `IA_MODEL` depuis les variables d'environnement et les exposer de manière typée. Sans cette config, le service ne saurait pas quel modèle ni quelle API utiliser.

**`backend\prisma\schema.prisma`** (modèle `IaLog`)
Pourquoi il existe : Définir la structure de la table `ia_log` qui stocke les métriques des appels IA. Relation avec `User` pour savoir qui a fait chaque requête.
