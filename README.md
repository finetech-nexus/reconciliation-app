# Reconcilia — atelier

Interface de rapprochement et de supervision. Le dessin reprend le studio produit Nexus Bank : barre latérale, cartes, tableaux et formulaires.

L'atelier parle à l'API sous `/api/v1`. En développement, Vite proxyfie ce préfixe vers `http://localhost:8110`. Dans l'image, nginx le proxyfie vers `reconciliation-api:8110`.

```bash
npm install
npm run dev
```

Le sélecteur de rôle sert à exercer la séparation des tâches. En production, Kong ou le fournisseur OIDC doit injecter `X-Actor-Id` et `X-Actor-Roles`. L'interface ne décide pas des droits : un bouton masqué ne remplace pas le contrôle de l'API.

La spécification est dans `../reconciliation-api/README.md`.
