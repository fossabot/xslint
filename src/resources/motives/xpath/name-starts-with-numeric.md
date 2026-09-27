# Name starts with a numeric character

Variable, parameter, template, and function names must not start with a
digit. Such a name is not a QName, so a processor refuses the stylesheet
rather than running it, and no expression could name it anyway: `$1st` is a
syntax error in XPath.

Every name is judged on its local part, the prefix being the namespace and not
the name: `my:9lives` is reported where `my:lives` is not, whether it names a
variable, a parameter, a template, or a function.

An empty name starts with nothing rather than with a digit, so it is outside
this check and left alone. It is wrong for its own reason — an empty string is
not a QName, and a processor refuses the stylesheet over it rather than running
it — and reporting that as a name beginning with a digit tells the reader
something untrue about their own code.

Incorrect:

```xsl
<xsl:param name="1st" select="'first'"/>
```

Correct:

```xsl
<xsl:param name="first" select="'first'"/>
```
