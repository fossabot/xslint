/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {capped} = require('./clock')
const assert = require('assert')

describe('clock', function() {
  it('charges no window what one thread cannot have spent in it', function() {
    assert.deepEqual(
      [capped(148153, 59923), capped(31700, 31800)],
      [59923, 31700],
      [
        'a window whose processor clock summed the threads beside the one',
        'running the timed work is no longer charged the wall it spanned, or',
        'one a single thread could have spent is no longer charged what it read',
      ].join(' '),
    )
  })
})
