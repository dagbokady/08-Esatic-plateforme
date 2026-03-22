---

## La table de correspondance commits → version

| Message de commit | Type | Résultat |
|---|---|---|
| `fix: bouton vote cassé` | Correction | `1.0.0 → 1.0.1` |
| `feat: ajout recherche ECUE` | Nouvelle feature | `1.0.1 → 1.1.0` |
| `feat!: refonte auth` | Breaking change | `1.1.0 → 2.0.0` |
| `chore: mise à jour deps` | Maintenance | Aucun changement |
| `docs: mise à jour README` | Documentation | Aucun changement |

---

## Quand est-ce que ça se déclenche ?

**Automatiquement** — quand tu fais un push sur `main`. C'est la CI/CD (Phase 5) qui lance semantic-release. En gros :
```
Push sur main
      ↓
GitHub Actions se déclenche
      ↓
Lance semantic-release
      ↓
Analyse les commits depuis la dernière version
      ↓
Incrémente la version si nécessaire
      ↓
Crée un tag Git (v1.0.1)
      ↓
Génère le CHANGELOG automatiquement
      ↓
Met à jour package.json
