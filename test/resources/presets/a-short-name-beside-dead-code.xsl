<?xml version="1.0" encoding="UTF-8"?>
<!--
* SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
* SPDX-License-Identifier: MIT
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:bk="urn:x-bookkeeping" version="2.0" id="preset" exclude-result-prefixes="xs bk">
  <xsl:output encoding="UTF-8" method="xml"/>
  <xsl:function name="bk:orphaned" as="xs:string">
    <xsl:param name="chapter" as="element()"/>
    <xsl:sequence select="string($chapter/@id)"/>
  </xsl:function>
  <xsl:template match="/">
    <xsl:variable name="q" select="count(//chapter)"/>
    <xsl:variable name="forgotten" select="'nothing reads me'"/>
    <total>
      <xsl:value-of select="$q"/>
    </total>
  </xsl:template>
</xsl:stylesheet>
