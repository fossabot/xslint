/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {lintByName} = require('../src/linters/name-linter')
const {validate} = require('../src/validators/xpath-validator')
const {validate: parsed} = require('../src/validators/xsl-validator')
const {yaml} = require('../src/helpers')
const {harness} = require('./packs')
const path = require('path')
const assert = require('assert')

describe('name-linter', function() {
  harness({
    dir: 'name-packs',
    noun: 'name comparisons',
    run: (corpus, off) => lintByName(validate(corpus).expressions, off),
  })
  it('prescribes no rewrite it withholds in a 1.0 stylesheet', function() {
    const pack = yaml.parsedFromFile(path.resolve(
      __dirname, 'resources', 'name-packs', 'name-compared-in-xslt-1-0.yaml',
    ))
    assert.deepEqual(
      lintByName(validate(parsed([
        {file: 'test.xsl', content: pack.input},
      ]).corpus).expressions)
        .filter((defect) => defect.fix === undefined)
        .filter((defect) => defect.message.includes('self::name')),
      [],
      'a withheld rewrite is still spelled out in the message it reports',
    )
  })
})
