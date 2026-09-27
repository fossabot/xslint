# Using not outermost stylesheet

The stylesheet root — `xsl:stylesheet`, its synonym `xsl:transform`, or the
XSLT 3.0 `xsl:package` — must be the outermost element of an XSLT document. Any
of the three nested inside a module, as a top-level element or in a template
body, is invalid and will be rejected by a conformant XSLT processor.

Incorrect:

```xsl
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>
  <xsl:template match="/">
    <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    </xsl:stylesheet>
  </xsl:template>
</xsl:stylesheet>
```

Correct:

```xsl
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>
  <xsl:template match="/">
    <p><xsl:value-of select="."/></p>
  </xsl:template>
</xsl:stylesheet>
```
