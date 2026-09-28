/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {lintByVariable} = require('../src/linters/variable-linter')
const {harness} = require('./packs')

describe('variable-linter', function() {
  harness({
    dir: 'variable-packs',
    noun: 'undefined variables',
    run: (corpus, off) => lintByVariable(corpus, off),
  })
})
