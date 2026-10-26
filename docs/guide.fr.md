## À quoi ça sert

Vous avez 80 prospects et le temps d'en appeler 10. Ce script les note selon **vos** critères (budget, taille, source, ancienneté du dernier contact…) et les classe, pour savoir par qui commencer. Les règles sont dans un fichier, donc visibles et modifiables : pas de boîte noire.

## Avant de commencer

- Un CSV de prospects (un en-tête par critère : `budget`, `employees`, `source`, `country`…).
- Un fichier de règles JSON.

## Pas à pas

1. Écrivez vos règles : chaque règle donne des points (ou en retire) quand une condition est vraie.
   ```json
   { "grades": { "A": 70, "B": 40, "C": 0 },
     "rules": [
       { "field": "budget", "op": "gte", "value": 500000, "points": 40, "label": "budget élevé" },
       { "field": "email", "op": "empty", "points": -15, "label": "pas d'e-mail" } ] }
   ```
2. Classez :
   ```bash
   node src/lead-scoring.mjs samples/prospects.csv --rules samples/scoring.json --top 10 --out classement.csv
   ```
3. Appelez les « A » en premier ; relisez les raisons de chaque note.

## Lire le résultat

Pour chaque prospect : score, lettre (A, B, C ; un score négatif donne `-`) et la liste des règles qui ont joué. Opérateurs : `eq`, `in`, `contains`, `gte`, `lte`, `gt`, `lt`, `empty`, `notEmpty`.

## L'automatiser

Relancez après chaque mise à jour du CSV ; comparez ensuite les notes à la réalité (qui a réellement acheté) pour ajuster les poids.

## Pièges à éviter

- Un score reflète vos hypothèses, pas la vérité : vérifiez-le sur vos ventes passées.
- Ne notez pas sur des critères qui seraient discriminatoires ou que vous n'avez pas le droit d'utiliser.
