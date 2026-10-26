import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toDate } from '../lib/csv.mjs'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)
const run = (n, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../src/${n}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' })
const samplePath = (n) => fileURLToPath(new URL(`../samples/${n}`, import.meta.url))

test('31 prospects : opérateurs, points négatifs, grades, tri', async () => {
  const { matches, score } = await mod('lead-scoring')
  assert.ok(matches({ field: 'a', op: 'gte', value: 5 }, { a: '5' })); assert.ok(!matches({ field: 'a', op: 'gte', value: 5 }, { a: 'abc' })); assert.ok(matches({ field: 'a', op: 'in', value: ['X', 'y'] }, { a: ' Y ' })); assert.ok(matches({ field: 'a', op: 'empty' }, {})); assert.throws(() => matches({ field: 'a', op: '??' }, {}), /inconnu/)
  const ranked = score(parseCsv(sample('prospects.csv')).records, JSON.parse(sample('scoring.json')))
  assert.deepEqual(ranked.map((r) => [r.name, r.score, r.grade]), [['Awa Diallo', 95, 'A'], ['Mariam Traoré', 95, 'A'], ['Koffi Mensah', 10, 'C'], ['Yao Amegan', -35, '-']])
  assert.match(ranked[3].raisons, /pas d'e-mail/); assert.throws(() => score([], { rules: [] }), /aucune règle/)
})
