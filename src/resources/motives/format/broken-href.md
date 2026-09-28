# Broken href

An `xsl:import` or `xsl:include` whose `href` names a file that is not there is
not a module a processor skips. XSLT treats it as static error XTSE0165: the whole
stylesheet fails to compile, and not only the templates that would have come
from the missing module. The typical cause is a module that was renamed or
moved while a stylesheet elsewhere kept pointing at its old place, and nothing
fails until somebody runs the transformation that reaches it.

A relative `href` resolves against the directory of the stylesheet holding it,
not against the directory the processor was started in, so `../common/util.xsl`
in `html/docbook.xsl` names `common/util.xsl` beside the `html` directory.

Incorrect, where the module has moved to `lib/`:

```xsl
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="common.xsl"/>
</xsl:stylesheet>
```

Correct:

```xsl
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="lib/common.xsl"/>
</xsl:stylesheet>
```

A module a build generates, such as a parameter file written from a
specification, is missing from a source tree until that build runs, and a
stylesheet importing it cannot be run from the tree as it stands. Generate the
module first, or leave the importing stylesheet out of what is linted.

Only a relative `href` is judged. A URL, an absolute path, a `plugin:` URI, a
fragment or a value with an escape is resolved by a catalog or a processor
setting this linter does not see. An `xml:base` on the import or above it
moves where the `href` points, and a `use-when` there may keep a processor from
reading the module at all; neither is reported.
