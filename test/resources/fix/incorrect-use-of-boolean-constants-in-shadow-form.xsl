<?xml version="1.0" encoding="UTF-8"?>
<!--
* SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
* SPDX-License-Identifier: MIT
-->
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <xsl:if _test="'true'">
      <p>yes</p>
    </xsl:if>
    <xsl:if _test="{&quot;'false'&quot;}">
      <p>no</p>
    </xsl:if>
    <xsl:if _test="{'true'}">
      <p>a test naming an element called true</p>
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
