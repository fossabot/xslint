/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {expressionsOf, whole} = require('../src/attributes')
const {xml} = require('../src/helpers')
const path = require('path')
const fs = require('fs')
const assert = require('assert')

/**
 * The stylesheet whose XSLT attributes, literal result elements, and attribute
 * value templates the spans are read from.
 * @type {Document}
 */
const SHEET = xml.parsedFromString(
  fs.readFileSync(
    path.resolve(
      __dirname, 'resources', 'attributes', 'literal-result-and-templates.xsl',
    ),
    'utf-8',
  ),
)

/**
 * A 3.0 stylesheet whose text value templates and shadow attributes carry
 * expressions alongside the ordinary attributes.
 * @type {Document}
 */
const TEMPLATED = xml.parsedFromString(
  fs.readFileSync(
    path.resolve(
      __dirname, 'resources', 'attributes', 'text-value-templates.xsl',
    ),
    'utf-8',
  ),
)

/**
 * A stylesheet raising the version twice below a 1.0 root — on a literal result
 * element and on an XSLT one — so the version in force differs from record to
 * record and reading the root's would answer four of the six wrongly.
 * @type {Document}
 */
const VERSIONS = xml.parsedFromString(
  fs.readFileSync(
    path.resolve(
      __dirname, 'resources', 'attributes', 'versions-in-force.xsl',
    ),
    'utf-8',
  ),
)

/**
 * A 3.0 stylesheet writing a select and a name in both spellings, where XSLT
 * ignores the plain one, and a 2.0 and a 1.0 element doing the same, where a
 * 3.0 processor ignores it just as surely.
 * @type {Document}
 */
const SHADOWED = xml.parsedFromString(
  fs.readFileSync(
    path.resolve(__dirname, 'resources', 'attributes', 'shadow-beside-plain.xsl'),
    'utf-8',
  ),
)

/**
 * A 2.0 stylesheet turning text value templates on, with a 1.0 element under
 * it, both of which a 3.0 processor expands.
 * @type {Document}
 */
const EXPANDED = xml.parsedFromString(
  fs.readFileSync(
    path.resolve(
      __dirname, 'resources', 'attributes', 'text-value-templates-below-3.xsl',
    ),
    'utf-8',
  ),
)

describe('attributes', function() {
  it('reads every bare and enclosed expression in document order', function() {
    assert.deepEqual(
      expressionsOf(SHEET).map(
        (found) => [found.node.nodeName, found.start, found.expression],
      ),
      [
        ['match', 0, 'section'],
        ['label', 1, 'count(item) = 0'],
        ['name', 1, 'name(.)'],
        ['select', 0, '@x'],
      ],
      'cannot read the expressions of the stylesheet',
    )
  })
  it('narrows to the whole value of an attribute of that name', function() {
    assert.ok(
      expressionsOf(SHEET).some((found) => whole(found, 'select')),
      'cannot narrow to the select a linter reads alone',
    )
  })
  it('cannot narrow to an expression a template encloses', function() {
    assert.ok(
      expressionsOf(SHEET).every((found) => !whole(found, 'label')),
      'narrows to a template of the result tree as if it were an attribute',
    )
  })
  it('cannot read a literal result attribute as an expression', function() {
    assert.ok(
      expressionsOf(SHEET).every((found) => found.node.nodeName !== 'test'),
      'reads output text on a literal result element as an expression',
    )
  })
  it('reads a text value template and a shadow attribute too', function() {
    assert.deepEqual(
      expressionsOf(TEMPLATED).map(
        (found) => [found.node.nodeName, found.start, found.expression],
      ),
      [
        ['match', 0, 'section'],
        ['#text', 1, 'count(item) = 0'],
        ['_select', 0, 'name(.)'],
        ['select', 0, '@x'],
      ],
      'cannot read a text value template or a shadow attribute',
    )
  })
  it('carries the version in force where each expression stands', function() {
    assert.deepEqual(
      expressionsOf(VERSIONS).map(
        (found) => [found.expression, found.version],
      ),
      [
        ['section', '1.0'],
        ['@x', '1.0'],
        ['count(item)', '2.0'],
        ['@y', '2.0'],
        ['@z', '3.0'],
        ['@w', '3.0'],
      ],
      'cannot read the version in force where an expression stands',
    )
  })
  it('reads the shadow and not the plain attribute it overrules', function() {
    assert.deepEqual(
      expressionsOf(SHADOWED).map(
        (found) => [found.node.nodeName, found.start, found.expression],
      ),
      [
        ['match', 0, 'section'],
        ['_select', 0, 'name(.)'],
        ['_name', 1, '\'item\''],
        ['_select', 0, '@y'],
        ['_select', 0, '@w'],
      ],
      'reads a plain attribute its shadow overrules',
    )
  })
  it('reads a text value template below version 3.0', function() {
    assert.deepEqual(
      expressionsOf(EXPANDED).map(
        (found) => [found.node.nodeName, found.expression, found.version],
      ),
      [
        ['match', 'section', '2.0'],
        ['#text', 'count(item)', '2.0'],
        ['#text', 'name(.)', '1.0'],
      ],
      'cannot read a text value template a 3.0 processor expands below 3.0',
    )
  })
})
