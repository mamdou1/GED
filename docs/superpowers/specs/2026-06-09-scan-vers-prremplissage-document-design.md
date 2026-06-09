# Spec — Scan physique vers pré-remplissage des champs document

**Date :** 2026-06-09
**Projet :** GED (PADME) — React (CRA) + Express/Node + MySQL (Docker)
**Statut :** Validé (design), prêt pour plan d'implémentation

## 1. Objectif

Dans le formulaire d'upload de document, ajouter une option **« Scanner »** par pièce
(mode `INDIVIDUEL` de `DocumentUploadPieces.tsx`) qui :

1. pilote un **scanner physique** branché sur le poste de l'utilisateur ;
2. produit un **PDF** du document scanné et l'**attache** au champ fichier de la pièce ;
3. **OCR** le document localement et **pré-remplit** les champs méta (`text`, `date`, `number`)
   de la pièce, sous forme de **suggestions éditables**.

Le pré-remplissage est une aide à la saisie : l'utilisateur vérifie et corrige avant
d'enregistrer. Aucune donnée n'est enregistrée tant qu'il ne valide pas le formulaire existant.

## 2. Contraintes & décisions structurantes

- **Un navigateur ne peut pas piloter un scanner** (pas d'API web TWAIN/WIA), et le **backend
  tourne dans Docker (Linux)** → aucun accès au matériel USB du poste. Le pilotage du scanner se
  fait donc obligatoirement via un **agent local** qui tourne sur le poste Windows, hors Docker.
- **Source de capture :** scanner physique via **agent local + NAPS2** (logiciel libre, gratuit).
- **Extraction :** **OCR local (Tesseract)** + **moteur de règles**, 100 % hors-ligne — les
  documents ne quittent jamais le poste.
- **Mapping texte → champs :** stratégie **hybride** — recherche par libellé (label) par défaut,
  avec override optionnel par champ (mots-clés + regex) pour calibration.
- **Périmètre UX :** bouton par pièce en mode `INDIVIDUEL` uniquement.

## 3. Architecture (flux end-to-end)

```
[Poste Windows de l'utilisateur]
  Scanner USB ──► Agent local (Node/Express, hors Docker, port 7777)
                    • pilote NAPS2 (NAPS2.Console.exe + profil) : scan → PDF
                    • OCR Tesseract (-l fra) → texte
                    • GET /health, POST /scan, CORS limité à l'origine frontend
        ▲  │ { pdfBase64, ocrText }
        │  ▼
  [Navigateur] DocumentUploadPieces.tsx (mode INDIVIDUEL)
    • bouton « Scanner » par pièce
    • health-check agent → POST /scan → reçoit { pdfBase64, ocrText }
    • attache le PDF au champ fichier : handleFormFileSelect(pieceId, fileFieldId, file)
    • POST ocrText + pieceId au backend
        │
        ▼
  [Backend Docker] POST /api/extraction/pieces/:pieceId/suggest
    • charge les piece_meta_fields de la pièce (label, type, override extraction)
    • moteur de règles (fonctions pures) → { fieldId, label, fieldType, value, confidence }
        │
        ▼
  Frontend pré-remplit les champs VIDES (éditables, badge « suggéré par scan »)
    → l'utilisateur vérifie/corrige → enregistre via le flux existant inchangé
```

**Validations :** le `fetch` vers `127.0.0.1` s'exécute dans le navigateur de l'utilisateur →
atteint sa propre machine (l'agent tourne par poste). Frontend `http` + agent `http` → pas de
blocage *mixed-content*.

## 4. Composant A — Agent local de scan (nouveau)

**Nature :** service Node/Express autonome, hors du repo Docker, lancé sur chaque poste Windows
disposant d'un scanner.

- **Port fixe** : `7777` (configurable). Le frontend le connaît via
  `REACT_APP_SCAN_AGENT_URL=http://127.0.0.1:7777`.
- **Endpoints :**
  - `GET /health` → `{ status: "ok", scannerReady: boolean }`. Permet au front de détecter la
    présence de l'agent et l'état du scanner.
  - `POST /scan` body `{ profile?: string, lang?: string }` → `{ pdfBase64: string,
    ocrText: string, pages: number }`. Erreurs → HTTP 4xx/5xx + `{ error }`.
- **Pipeline interne :**
  1. NAPS2 scanne via un **profil pré-configuré** sur le poste (sélection du scanner + réglages) :
     `NAPS2.Console.exe -p <profil> -o <temp>.pdf` (PDF) et/ou export image pour l'OCR.
  2. **OCR Tesseract `-l fra`** sur la (les) page(s) → texte.
  3. Renvoie le PDF (base64) + le texte OCR. Fichiers temporaires nettoyés.
- **CORS :** autorise uniquement l'origine du frontend (ex. `http://localhost:4000`).
- **Mode `--mock`** : renvoie un PDF + un texte OCR de fixture, sans matériel → permet de
  développer et tester le front/back sans scanner.
- **Prérequis poste (documentés) :** NAPS2 installé, pack langue Tesseract `fra`, un profil de
  scan nommé. Doc d'installation + script `npm start` fournis. (Packaging d'un installeur =
  hors périmètre.)

## 5. Composant B — Endpoint d'extraction (backend Docker, nouveau)

- **Route :** `POST /api/extraction/pieces/:pieceId/suggest`
  - body : `{ ocrText: string }`
  - réponse : `{ suggestions: [{ fieldId, label, fieldType, value, confidence }] }`
- **Moteur de règles** (module de **fonctions pures**, sans I/O → unit-testable) :
  - **Mots-clés** d'un champ = `extraction_keywords` si défini, sinon `[label]`.
    Normalisation insensible à la casse et aux accents pour la recherche.
  - **Capture de valeur** : si `extraction_pattern` (regex) est défini, on l'applique ; sinon on
    prend le texte après le mot-clé sur la même ligne (après `:` éventuel) ou, à défaut, la
    ligne suivante non vide.
  - **Normalisation par type :**
    - `date` → reconnaît les formats FR courants (`jj/mm/aaaa`, `jj-mm-aaaa`, `jj mois aaaa`) →
      ISO `aaaa-mm-jj` (cohérent avec le `Calendar` du front).
    - `number` → suppression des caractères non numériques (garde séparateurs décimaux).
    - `text` → trim + nettoyage espaces.
  - **Confiance** : heuristique simple (mot-clé trouvé + valeur parsée proprement = confiance
    haute ; mot-clé trouvé sans valeur exploitable = basse ; non trouvé = champ omis).
- **Migration DB (Sequelize)** sur `piece_meta_fields` :
  - `extraction_keywords` — JSON/TEXT, **nullable**.
  - `extraction_pattern` — VARCHAR, **nullable**.
  - Colonnes nulles → repli automatique sur le `label`. **Aucun impact** sur les données ni le
    comportement existants.

## 6. Composant C — Frontend (`DocumentUploadPieces.tsx`, mode INDIVIDUEL)

- **Bouton « Scanner »** ajouté par pièce (près de l'en-tête de pièce / du champ fichier).
- **Au clic :**
  1. `GET /health` de l'agent. Si absent → bouton en état « Agent scanner non détecté » +
     instructions ; on n'appelle pas `/scan`.
  2. `POST /scan` (spinner pendant le scan). Sur succès :
     - Construit un `File` à partir de `pdfBase64` → `handleFormFileSelect(pieceId, fileFieldId,
       file)` (attache le PDF au champ fichier de la pièce).
     - `POST` `ocrText` + `pieceId` au backend → reçoit les suggestions →
       `handleFormValueChange(pieceId, fieldId, value)` **uniquement pour les champs vides**
       (ne remplace jamais une saisie utilisateur existante).
- **UX de revue :** chaque champ pré-rempli porte un badge **« suggéré par scan »** + un indice
  de confiance. L'utilisateur édite librement. Rien n'est persisté tant qu'il ne soumet pas le
  formulaire (flux d'enregistrement existant **inchangé**).
- **Nouveaux modules API :** `frontend/src/api/scan.ts` (appels agent), `frontend/src/api/
  extraction.ts` (appels backend).

## 7. Gestion des erreurs

| Cas | Comportement |
|-----|--------------|
| Agent non démarré (`/health` échoue) | Bouton désactivé « Agent scanner non détecté » + instructions |
| Scan annulé / erreur scanner | Toast d'erreur, aucun changement de formulaire |
| OCR vide / illisible | Le PDF est quand même attaché ; message « aucune donnée détectée, saisie manuelle » |
| Échec endpoint extraction | Le PDF reste attaché ; pas de suggestions (dégradation gracieuse) |
| Frontend servi en HTTPS (futur) | Caveat connu : appel HTTP vers `127.0.0.1` bloqué (*mixed-content*) — à traiter le moment venu |

## 8. Stratégie de test

- **Backend (TDD)** : tests unitaires du moteur de règles sur fixtures de texte OCR — dates FR,
  nombres, labels avec/sans accents, repli label vs override mots-clés, override regex,
  champ non trouvé, normalisation ISO des dates.
- **Agent** : mode `--mock` (fixture PDF + texte) pour tests sans matériel ; test de l'endpoint
  `/scan` en mock et des en-têtes CORS / `/health`.
- **Frontend** : test composant mockant agent + backend → vérifie que le PDF est attaché, que les
  champs vides sont pré-remplis, que les badges apparaissent, et que **la saisie utilisateur
  existante est préservée** (non écrasée).

## 9. Hors périmètre (YAGNI)

- Mode `LOT_UNIQUE` (PDF global du dossier).
- 2ᵉ formulaire `RechercheUploadPieces.tsx` (même pattern → **suite possible** une fois le
  composant pièce validé).
- Templates d'extraction spatiaux (zones par coordonnées).
- Langues OCR autres que `fra`.
- Packaging d'un installeur de l'agent (doc + script npm suffisent pour démarrer).

## 10. Fichiers concernés (indicatif)

- **Nouveau** : `scan-agent/` (projet Node autonome, hors Docker) — `server.js`, `naps2.js`,
  `ocr.js`, mode mock, README d'installation.
- **Backend** : `backend/routes/extraction.routes.js` (nouveau), `backend/controllers/
  extraction.controller.js` (nouveau), `backend/services/extraction.matcher.js` (nouveau, pur),
  migration Sequelize sur `piece_meta_fields`, modèle `PieceMetaField` mis à jour.
- **Frontend** : `frontend/src/pages/Document/DocumentUploadPieces.tsx` (bouton + flux scan),
  `frontend/src/api/scan.ts` (nouveau), `frontend/src/api/extraction.ts` (nouveau),
  variable d'env `REACT_APP_SCAN_AGENT_URL`.
