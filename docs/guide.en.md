## What it's for

You have 80 prospects and time to call 10. This script scores them against **your** criteria (budget, size, source, age of last contact…) and ranks them, so you know where to start. The rules live in a file, so they are visible and editable: no black box.

## Before you start

- A CSV of prospects (one header per criterion: `budget`, `employees`, `source`, `country`…).
- A JSON rules file.

## Step by step

1. Write your rules: each rule adds (or removes) points when a condition is true.
   ```json
   { "grades": { "A": 70, "B": 40, "C": 0 },
     "rules": [
       { "field": "budget", "op": "gte", "value": 500000, "points": 40, "label": "high budget" },
       { "field": "email", "op": "empty", "points": -15, "label": "no e-mail" } ] }
   ```
2. Rank:
   ```bash
   node src/lead-scoring.mjs samples/prospects.csv --rules samples/scoring.json --top 10 --out ranking.csv
   ```
3. Call the "A"s first; read the reasons behind each score.

## Reading the output

For each prospect: score, letter (A, B, C; a negative score gives `-`) and the list of rules that applied. Operators: `eq`, `in`, `contains`, `gte`, `lte`, `gt`, `lt`, `empty`, `notEmpty`.

## Automating it

Re-run after each CSV update; then compare the scores with reality (who actually bought) to adjust the weights.

## Pitfalls

- A score reflects your assumptions, not the truth: check it against your past sales.
- Do not score on criteria that would be discriminatory or that you are not allowed to use.
