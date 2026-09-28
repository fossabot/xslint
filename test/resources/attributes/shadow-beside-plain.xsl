<?xml version="1.0" encoding="UTF-8"?>
<!--
* SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
* SPDX-License-Identifier: MIT
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="3.0">
  <xsl:template match="section">
    <xsl:value-of select="(((" _select="name(.)"/>
    <xsl:element name="{(((}" _name="{'item'}"/>
    <xsl:value-of version="2.0" select="@x" _select="@y"/>
    <xsl:value-of version="1.0" select="@v" _select="@w"/>
  </xsl:template>
</xsl:stylesheet>
