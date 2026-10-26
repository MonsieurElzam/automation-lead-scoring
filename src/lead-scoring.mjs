#!/usr/bin/env node
/* Note et classe une liste de prospects (CSV) selon des règles que vous définissez en JSON : qui appeler en premier. */
import { readFileSync, writeFileSync } from 'node:fs'
import { parseCsv, toNumber, toCsv } from '../lib/csv.mjs'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

const norm = (s) => String(s ?? '').trim().toLowerCase()

/** Une règle : { field, op, value, points } avec op ∈ eq, in, contains, gte, lte, gt, lt, empty, notEmpty. */
export function matches(rule, record) {
  const raw = record[rule.field]
  const v = norm(raw)
  const n = toNumber(raw)
  switch (rule.op) {
    case 'eq': return v === norm(rule.value)
    case 'in': return (rule.value ?? []).map(norm).includes(v)
    case 'contains': return v.includes(norm(rule.value))
    case 'gte': return !Number.isNaN(n) && n >= Number(rule.value)
    case 'lte': return !Number.isNaN(n) && n <= Number(rule.value)
    case 'gt': return !Number.isNaN(n) && n > Number(rule.value)
    case 'lt': return !Number.isNaN(n) && n < Number(rule.value)
    case 'empty': return v === ''
    case 'notEmpty': return v !== ''
    default: throw new Error(`opérateur inconnu : « ${rule.op} »`)
  }
}

export function score(records, config) {
  const rules = config.rules ?? config
  if (!Array.isArray(rules) || !rules.length) throw new Error('aucune règle de notation.')
  const grades = config.grades ?? { A: 70, B: 40, C: 0 }
  const gradeOf = (pts) => Object.entries(grades).sort((a, b) => b[1] - a[1]).find(([, min]) => pts >= min)?.[0] ?? '-'
  return records.map((r) => {
    const hits = rules.filter((rule) => matches(rule, r))
    const points = hits.reduce((s, rule) => s + Number(rule.points), 0)
    return { ...r, score: points, grade: gradeOf(points), raisons: hits.map((h) => h.label ?? `${h.field} ${h.op} ${Array.isArray(h.value) ? h.value.join('|') : (h.value ?? '')}`.trim()).join(' ; ') }
  }).sort((a, b) => b.score - a.score)
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help'])
  usage(`
Usage : node src/lead-scoring.mjs prospects.csv --rules scoring.json [--out classement.csv] [--top 10]
Règles : { "grades": { "A": 70, "B": 40 }, "rules": [ { "field": "budget", "op": "gte", "value": 500000, "points": 40, "label": "budget élevé" } ] }
Opérateurs : eq, in, contains, gte, lte, gt, lt, empty, notEmpty. Points négatifs autorisés.`, args, 1)
  if (!args.rules) fail('--rules est obligatoire.')
  let headers, ranked
  try {
    const csv = parseCsv(readFileSync(args._[0], 'utf8'))
    ranked = score(csv.records, JSON.parse(readFileSync(args.rules, 'utf8')))
    headers = [...csv.headers, 'score', 'grade', 'raisons']
  } catch (e) { fail(e.message) }
  if (args.out) writeFileSync(args.out, toCsv(headers, ranked))
  ranked.slice(0, Number(args.top ?? 10)).forEach((r, i) => console.log(`${String(i + 1).padStart(2)}. [${r.grade}] ${String(r.score).padStart(4)}  ${r.name ?? r.email ?? ''}${r.company ? ` — ${r.company}` : ''}  (${r.raisons})`))
  const counts = ranked.reduce((a, r) => ({ ...a, [r.grade]: (a[r.grade] ?? 0) + 1 }), {})
  console.log(`\n${ranked.length} prospect(s) : ${Object.entries(counts).sort().map(([g, n]) => `${g}=${n}`).join('  ')}`)
}
