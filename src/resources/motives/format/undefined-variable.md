# Undefined variable

A variable reference that no binding in scope declares is a static error,
`XPST0008`, and every processor refuses the whole stylesheet for it before it
transforms a single node. One misspelled name in one template of a large
module is enough, and the message names only the first such reference, so a
file can hide several behind the one that is reported.

A variable is in scope in the places XSLT gives it and nowhere else. A local
`xsl:variable` or `xsl:param` reaches the siblings that follow it and
everything they hold, so a variable declared inside an `xsl:if` or an
`xsl:when` is gone at the closing tag, a variable read above its declaration
is not yet bound, and a parameter of one template is not in scope in another.
A template's own parameters do not reach its `match` pattern either, which
sees the globals alone, and a parameter's default sees only the parameters in
front of it. A `for`, `let`, `some` or `every` clause and an inline function
bind their names inside the expression, an `xsl:accumulator-rule` binds
`$value`, and an `xsl:catch` binds the `err:` names. A global binding, a
top-level `xsl:variable` or `xsl:param`, is in scope everywhere in the
stylesheet, whichever module declares it and whichever way the import between
the two runs. A name spelled with a prefix is the namespace that prefix binds,
so `$my:limit` and `$limit` are two different variables.

A module is judged against the stylesheet it belongs to: a module where a
transformation starts, holding a template that matches the root or the
initial template and pulled in by no other, together with every module it
imports and includes. A module no such stylesheet holds is a library whose
globals may come from whatever imports it, and a stylesheet pulling in a
module the linted files do not hold, or using a package, may take a global
from there, so a reference past its locals is left alone in either.

Incorrect:

```xsl
<xsl:template match="/">
  <xsl:param name="title"/>
  <xsl:if test="$title">
    <xsl:variable name="heading" select="upper-case($title)"/>
  </xsl:if>
  <h1>
    <xsl:value-of select="$heading"/>
  </h1>
</xsl:template>
```

Correct:

```xsl
<xsl:template match="/">
  <xsl:param name="title"/>
  <xsl:variable name="heading" select="upper-case($title)"/>
  <xsl:if test="$title">
    <h1>
      <xsl:value-of select="$heading"/>
    </h1>
  </xsl:if>
</xsl:template>
```

The fix is one of three, and only the author knows which. A misspelled name
is corrected to the binding it meant, which is usually a character or two
away. A variable read outside the block declaring it moves up to a level
whose siblings include the reference. A value a caller is meant to supply
becomes an `xsl:param` of the template reading it, with an `xsl:with-param`
at every call.
