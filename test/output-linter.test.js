/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {lintByOutput} = require('../src/linters/output-linter')
const {chained, judged} = require('./chains')
const {harness} = require('./packs')
const assert = require('assert')

/**
 * Stylesheets in the short chain. A hundred rather than the forty
 * `test/scaling.test.js` builds, where the walk per file still hid under the
 * parse and the stage read a growth of 3.11 on one runner and passed on the
 * next, and rather than the two hundred `test/import-linter.test.js` builds,
 * over which the cube took a long chain past a second a pass (#1141).
 * @type {number}
 */
const CHAIN = 100

/**
 * How many times longer the long chain is than the short one.
 * @type {number}
 */
const STEP = 4

/**
 * How many times over the check runs inside one timed window, over the short
 * chain — a quarter as often over the long one, so both come out the same size
 * while the check is linear in the edges, and clear the clock's granularity.
 * @type {number}
 */
const PASSES = 64

/**
 * How many times more a pass over the long chain may cost than one over the
 * short. The bar stands at the geometric middle of two measured distributions:
 * a walk from every file, scanning every edge at each step, reads 50.01 to
 * 51.25 over eight runs, where one walk back and one forward reads 3.94 to
 * 4.51 over eight more.
 * @type {number}
 */
const GROWTH = 15

describe('output-linter', function() {
  harness({
    dir: 'output-packs',
    noun: 'missing serializations',
    run: (corpus, off) => lintByOutput(corpus, off),
  })
  it('cannot walk the chain it is handed once for every file', function() {
    const readings = judged([
      {corpus: chained(0, CHAIN), passes: PASSES, lint: lintByOutput},
      {
        corpus: chained(CHAIN, CHAIN * STEP),
        passes: PASSES / STEP,
        lint: lintByOutput,
      },
    ])
    const grew = readings[1] / readings[0]
    assert.ok(
      grew < GROWTH,
      [
        `growing ${grew.toFixed(2)} times over a chain ${STEP} times longer`,
        `is not under ${GROWTH}, at ${(readings[0] / 1000).toFixed(2)} and`,
        `${(readings[1] / 1000).toFixed(2)} milliseconds a pass`,
      ].join(' '),
    )
  })
})
