# Duplicate `xsl:with-param` name

A single `xsl:call-template`, `xsl:apply-templates`, `xsl:apply-imports`, or
`xsl:next-match` supplies each parameter at most once. Two `xsl:with-param`
children with matching `@name` is a static error — the processor cannot tell
which value to bind — and rejects the stylesheet.

XSLT 3.0 writes the name `_name` as readily as `name`, the underscore form an
attribute value template a processor evaluates before it compiles anything. So
`_name="{'colour'}"` beside `name="colour"` supplies one parameter twice and is
refused the same way. A shadow name computed from a static parameter names
whatever that parameter holds, and is not compared.

Incorrect:

```xsl
<xsl:call-template name="render">
  <xsl:with-param name="colour" select="'red'"/>
  <xsl:with-param name="colour" select="'blue'"/>
</xsl:call-template>
```

Correct:

```xsl
<xsl:call-template name="render">
  <xsl:with-param name="colour" select="'red'"/>
  <xsl:with-param name="weight" select="'bold'"/>
</xsl:call-template>
```
