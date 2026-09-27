# Are you confusing a variable and a node?

When a variable and a node share the same name, using the bare name in
`select` silently picks the node child rather than the variable.

Incorrect:

```xsl
<xsl:template match="/">
  <xsl:variable name="title" select="'Hello'"/>
  <xsl:apply-templates select="title"/>
</xsl:template>
```

Correct:

```xsl
<xsl:template match="/">
  <xsl:variable name="title" select="'Hello'"/>
  <xsl:apply-templates select="$title"/>
</xsl:template>
```

Only a variable in scope can be confused, which is one declared in front of
the instruction or in front of one of its ancestors. One declared inside an
earlier sibling, such as an `xsl:if`, ends with that sibling, and `$heading`
there names nothing:

```xsl
<xsl:if test="title">
  <xsl:variable name="heading" select="string(title)"/>
</xsl:if>
<xsl:apply-templates select="heading"/>
```

Only the name opening a path is confused, too. A name inside a predicate is
asked of another context node, so in
`following-sibling::item[string(contrib) = $contrib]` the inner `contrib` is
the child of each `item`, and no variable could stand in for it.

A variable that may hold an atomic value is still worth the warning, but not
the dollar sign. Only a few shapes are sure to yield nodes: a path or a step,
another variable, a union, `intersect` or `except` of those, a filter over
one, a `!` mapping onto one, and a call to `key`, `id`, `idref`,
`element-with-id`, `document`, `doc`, `collection`, `root`, `outermost` or
`innermost`. Anything else may not — a literal, `string(contrib)`,
`upper-case(title)`, `count(part) + 1`, `@kind = 'x'`, `title/string()` — nor
may a variable whose `as` names an atomic type. There `select="$contrib"`
hands a string, a number or a boolean to an instruction that selects nodes,
which is a type error. Rename the variable instead, or spell the child as
`child::contrib`.

A variable bound by *content* rather than by `select` is a different thing, and
a bare name standing beside one is usually right. Its nodes form a tree of
their own, parented by nothing in the source document, so they are members of
no `node()` the source yields. `node() except errors` subtracts the child
element it names; `node() except $errors` subtracts nothing at all, which turns
an identity transform that replaces an element into one that emits it twice:

```xsl
<xsl:template match="object">
  <xsl:variable name="errors" as="element()*">
    <xsl:apply-templates select="metas"/>
  </xsl:variable>
  <xsl:copy>
    <xsl:apply-templates select="(node() except errors)|@*"/>
  </xsl:copy>
</xsl:template>
```
