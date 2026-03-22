# Ça, personne ne retient par cœur :
```js
token = jwt.encode(contenu, SECRET_KEY, algorithm=ALGORITHM)

payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```



Ce code dépend entièrement de la bibliothèque `python-jose`. Si demain tu utilises une autre bibliothèque JWT, la syntaxe change complètement. Ce serait stupide de mémoriser quelque chose qui change selon l'outil.

Tout développeur senior va sur la doc de `python-jose` pour écrire ces lignes. C'est normal, c'est attendu.

---

## La règle simple à retenir

CONCEPT         → retenir
SYNTAXE PROPRE  → retenir  (if, for, def, class...)
BIBLIOTHÈQUE    → doc officielle

Concrètement pour ton projet :

| Code | Retenir ? |
|---|---|
| `if`, `for`, `def`, `return` | ✅ Oui — c'est Python de base |
| `datetime.utcnow() + timedelta(...)` | ✅ Oui — logique de dates, standard Python |
| `jwt.encode(...)` | ❌ Non — syntaxe de `python-jose`, lis la doc |
| `create_engine(DATABASE_URL)` | ❌ Non — syntaxe de SQLAlchemy, lis la doc |
| `db.query(User).filter(...).first()` | ⚠️ À force de l'écrire tu vas le retenir naturellement |
| La logique des tokens JWT | ✅ Oui — concept universel |
| La logique de connexion DB | ✅ Oui — concept universel |
---

## Comment les vrais développeurs travaillent

Un développeur senior sur ce même fichier ferait exactement ça :
```
1. Il sait qu'il a besoin de JWT
   ↓
2. Il tape "python-jose documentation" dans Google
   ↓
3. Il lit les exemples 2 minutes
   ↓
4. Il écrit son code en adaptant l'exemple à son besoin
   ↓
5. La prochaine fois il s'en souvient à 80%
   et vérifie juste un détail de syntaxe