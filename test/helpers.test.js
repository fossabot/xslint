/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {subsetsOf, xml, yaml} = require('../src/helpers')
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const os = require('os')

/**
 * Sources `xml.parsedFromString` refuses. Each is a well-formedness error that
 * `@xmldom/xmldom` does not throw on — it grades the first a `warning` and says
 * nothing at all about the second — and repairs, so parsing either one would
 * hand every stage downstream a document the parser invented (#574).
 * @type {Array.<{name: string, content: string}>}
 */
const REFUSED = [
  {
    name: 'refuses an attribute value the parser only warns about',
    content: '<a b=c></a>',
  },
  {
    name: 'refuses an ampersand in text that opens no reference',
    content: '<a>Tom & Jerry</a>',
  },
  {
    name: 'refuses a section close in text that closes no section',
    content: '<a>Tom ]]> Jerry</a>',
  },
]

/**
 * Stylesheets whose entities name one another, each paired with the `select`
 * its one `xsl:value-of` reads once every reference is resolved, again until
 * nothing is left to expand. A name reaching itself stays the reference it
 * is, and so does one outgrowing the cap: of ten laughs, `lol5` is the first
 * past it, so `lol9` holds ten thousand references to it (#1044).
 * @type {Array.<{name: string, file: string, select: string}>}
 */
const NESTED = [
  {
    name: 'resolves an inline entity naming another that names a third',
    file: 'nested-inline.xsl',
    select: 'count(//alpha | //beta)',
  },
  {
    name: 'resolves an entity naming another behind a parameter entity',
    file: 'nested-behind-a-parameter-entity.xsl',
    select: 'generate-id((ancestor::section)[last()])',
  },
  {
    name: 'leaves a reference standing where two entities name each other',
    file: 'cyclic.xsl',
    select: 'count(&pong;)',
  },
  {
    name: 'leaves a reference standing where an entity names itself',
    file: 'self-reaching.xsl',
    select: 'count(&self;)',
  },
  {
    name: 'leaves a reference standing where its value would outgrow the cap',
    file: 'laughing.xsl',
    select: `count(${'&lol5;'.repeat(10 ** 4)})`,
  },
]

/**
 * Stylesheets referencing `lol9` of `laughing.xsl` more often than one value
 * or one document may grow by, each paired with what is read back once the
 * rest are left standing. Each resolves to sixty thousand characters, so
 * unbounded, twenty already join over a million (#1044).
 * @type {Array.<{name: string, file: string,
 *   read: function(Document): string, expected: string}>}
 */
const GROWN = [
  {
    name: 'leaves the references standing once an attribute would outgrow the cap',
    file: 'laughing-in-an-attribute.xsl',
    read: (doc) => doc.getElementsByTagName('xsl:value-of')[0]
      .getAttribute('select'),
    expected: `count(${'&lol5;'.repeat(10 ** 4)}${'&lol9;'.repeat(19)})`,
  },
  {
    name: 'leaves the references standing once a text would outgrow the cap',
    file: 'laughing-in-a-text.xsl',
    read: (doc) => doc.getElementsByTagName('xsl:text')[0].textContent,
    expected: `${'&lol5;'.repeat(10 ** 4)}${'&lol9;'.repeat(19)}`,
  },
  {
    name: 'leaves the references standing once a document would outgrow the cap',
    file: 'laughing-in-a-document.xsl',
    read: (doc) => String(
      Array.from(doc.getElementsByTagName('xsl:value-of')).filter(
        (one) => one.getAttribute('select') === 'count(&lol9;)').length),
    expected: '23',
  },
]

describe('helpers', function() {
  it('refuses to parse a file that does not exist', function() {
    assert.throws(() => xml.parsedFromFile(path.join(os.tmpdir(), 'no.xml')))
  })
  it('refuses to parse a directory', function() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xslint-help-'))
    let threw = false
    try {
      xml.parsedFromFile(dir)
    } catch {
      threw = true
    }
    fs.rmSync(dir, {recursive: true, force: true})
    assert.ok(threw)
  })
  it('reports YAML that does not parse', function() {
    assert.throws(() => yaml.parsedFromString('"unterminated'))
  })
  REFUSED.forEach(({name, content}) => {
    it(name, function() {
      assert.throws(() => xml.parsedFromString(content))
    })
  })
  it('reads the subset a parameter entity names beside the stylesheet',
    function() {
      const file = path.resolve(
        __dirname, 'resources', 'entities', 'behind-a-parameter-entity.xsl')
      assert.deepEqual(
        subsetsOf(file, fs.readFileSync(file, 'utf-8')),
        new Map([[
          'shared.ent',
          fs.readFileSync(path.resolve(path.dirname(file), 'shared.ent'),
            'utf-8'),
        ]]),
        [
          'cannot read the file a SYSTEM identifier names relative to the',
          'stylesheet declaring it (#1010)',
        ].join(' '),
      )
    })
  it('binds the first of two declarations of one entity', function() {
    const file = path.resolve(
      __dirname, 'resources', 'entities', 'declared-twice.xsl')
    const content = fs.readFileSync(file, 'utf-8')
    assert.equal(
      xml.parsedFromString(content, subsetsOf(file, content))
        .getElementsByTagName('xsl:value-of')[0].getAttribute('select'),
      'count(//alpha)',
      [
        'bound the declaration standing after the one a parameter entity',
        'brought, where XML binds the first a document gives',
      ].join(' '),
    )
  })
  NESTED.forEach(({name, file, select}) => {
    it(name, function() {
      this.timeout(5000)
      const where = path.resolve(__dirname, 'resources', 'entities', file)
      const content = fs.readFileSync(where, 'utf-8')
      assert.equal(
        xml.parsedFromString(content, subsetsOf(where, content))
          .getElementsByTagName('xsl:value-of')[0].getAttribute('select'),
        select,
        'did not expand the replacement text of an entity until nothing was left',
      )
    })
  })
  GROWN.forEach(({name, file, read, expected}) => {
    it(name, function() {
      this.timeout(5000)
      const where = path.resolve(__dirname, 'resources', 'entities', file)
      const content = fs.readFileSync(where, 'utf-8')
      assert.equal(
        read(xml.parsedFromString(content, subsetsOf(where, content))),
        expected,
        'did not leave a reference standing where expanding it would outgrow the cap',
      )
    })
  })
})
