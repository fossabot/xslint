<?xml version="1.0" encoding="UTF-8"?>
<!--
* SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
* SPDX-License-Identifier: MIT
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="3.0">
  <xsl:import href="modules/present.xsl"/>
  <xsl:import href="modules/vanished-7q.xsl"/>
  <xsl:import href="modules"/>
  <xsl:import href="https://example.org/remote-k2.xsl"/>
  <xsl:import href="/nowhere/absolute-x9.xsl"/>
  <xsl:import href="plugin:org.example.gone:xsl/plugged.xsl"/>
  <xsl:import href="modules/present.xsl#fragment"/>
  <xsl:include href="modules\backslashed.xsl"/>
  <xsl:include _href="lost-w4.xsl"/>
  <xsl:template match="/">
    <xsl:value-of select="."/>
  </xsl:template>
</xsl:stylesheet>
