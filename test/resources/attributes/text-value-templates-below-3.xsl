<?xml version="1.0" encoding="UTF-8"?>
<!--
* SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
* SPDX-License-Identifier: MIT
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0" expand-text="yes">
  <xsl:template match="section">
    <p>{count(item)}</p>
    <q xsl:version="1.0">{name(.)}</q>
  </xsl:template>
</xsl:stylesheet>
