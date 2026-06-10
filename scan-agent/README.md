# PADME — Agent local de scan

Pilote un scanner physique (via NAPS2) et OCR le document (via Tesseract) pour
le formulaire d'upload du GED. Tourne **sur le poste de l'utilisateur**, hors Docker.

## Prérequis (par poste)

1. **Node.js 18+**
2. **NAPS2** (gratuit) — https://www.naps2.com/ — puis créer un **profil** de scan
   nommé (ex. `Default`) qui sélectionne votre scanner.
3. **Tesseract OCR** + pack langue **français** — https://github.com/UB-Mannheim/tesseract/wiki
   - Vérifier : `tesseract --version` et `tesseract --list-langs` (doit lister `fra`).

## Installation

```bash
cd scan-agent
npm install
```

## Variables d'environnement (optionnel)

| Variable | Défaut | Rôle |
|----------|--------|------|
| `SCAN_AGENT_PORT` | `7777` | Port d'écoute (127.0.0.1) |
| `FRONTEND_ORIGIN` | `http://localhost:4000` | Origine CORS autorisée |
| `NAPS2_PATH` | `C:\Program Files\NAPS2\NAPS2.Console.exe` | Exécutable NAPS2 |
| `NAPS2_PROFILE` | `Default` | Nom du profil NAPS2 |
| `TESSERACT_PATH` | `tesseract` | Exécutable Tesseract |

## Démarrer

- Réel (scanner branché) : `npm start`
- Test sans scanner (mock) : `npm run mock`

## Endpoints

- `GET /health` → `{ status: "ok" }`
- `POST /scan` → `{ pdfBase64, ocrText, pages }`

## Démarrage automatique (recommandé)

Pour lancer l'agent au démarrage de Windows, créer une tâche planifiée
(Planificateur de tâches → action : `node`, argument : chemin vers `src/server.js`),
ou utiliser un gestionnaire de service (ex. NSSM).
