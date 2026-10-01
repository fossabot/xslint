/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

/*
 * The import chain both graph instruments time a linter over,
 * `test/import-linter.test.js` and `test/output-linter.test.js`. A chain is
 * the shape that makes a walk per file cost the square of the corpus, or the
 * cube where each step of the walk scans every edge again (#769, #1141).
 */

const {xml} = require('../src/helpers')
const {clocked} = require('./clock')
const fs = require('fs')
const path = require('path')

/**
 * How many times longer the long chain is than the short one.
 * @type {number}
 */
const STEP = 4

/**
 * How many times each chain is timed, the lowest reading answering. Noise only
 * ever inflates a reading, so the floor of several is the honest one — of the
 * noise it reaches, the note atop `test/import-linter.test.js` naming the
 * inflation it does not.
 * @type {number}
 */
const ATTEMPTS = 3

/**
 * The one stylesheet the chain is built out of, read once. It is a committed
 * resource rather than a string spelled here, the way every test stylesheet in
 * this repository is.
 * @type {string}
 */
const SHEET = fs.readFileSync(
  path.join(__dirname, 'resources', 'imports', 'stylesheet.xsl'), 'utf-8',
)

/**
 * A chain of stylesheets numbered from one file on, each importing the one
 * before it. The first one's import resolves to a file the corpus does not
 * hold, so it is external and yields no edge, which is what leaves the chain
 * open rather than closed into a cycle.
 * @param {number} from - Number of the first stylesheet
 * @param {number} files - How many to build
 * @return {Array.<{file: string, content: string, xsl: Document}>} - Corpus
 */
const chained = function(from, files) {
  const corpus = []
  for (let at = 0; at < files; at++) {
    const content = SHEET
      .replaceAll('PREVIOUS', String(from + at - 1))
      .replaceAll('SEED', String(from + at))
    corpus.push({
      file: `s${from + at}.xsl`,
      content: content,
      xsl: xml.parsedFromString(content),
    })
  }
  return corpus
}

/**
 * Processor time one linting of a corpus costs.
 * @param {{corpus: Array.<{file: string, content: string, xsl: Document}>,
 *  passes: number, lint: function(Array): Array}} chain - Parsed stylesheets,
 *  how many passes to time, and what lints them
 * @return {number} - Microseconds spent on one pass
 */
const spentOn = function(chain) {
  return clocked(() => Array.from(
    {length: chain.passes}, () => chain.lint(chain.corpus),
  )).span / chain.passes
}

/**
 * The lowest reading a short chain and one `STEP` times longer give over
 * `ATTEMPTS` rounds, the rounds interleaved so the two meet the same machine
 * rather than one of them meeting it first. The long chain runs a `STEP`th as
 * many passes, so both windows come out the same size while the check is
 * linear in the edges.
 * @param {function(Array): Array} lint - What lints a corpus
 * @param {number} files - Stylesheets in the short chain
 * @param {number} passes - Passes in a window over the short chain
 * @return {Array.<number>} - Microseconds a pass, short chain then long
 */
const grown = function(lint, files, passes) {
  const chains = [
    {corpus: chained(0, files), passes: passes, lint: lint},
    {corpus: chained(files, files * STEP), passes: passes / STEP, lint: lint},
  ]
  const low = chains.map(() => Infinity)
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    chains.forEach((chain, at) => {
      low[at] = Math.min(low[at], spentOn(chain))
    })
  }
  return low
}

module.exports = {STEP, grown}
