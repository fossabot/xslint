<?xml version="1.0" encoding="UTF-8"?>
<!--
* SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
* SPDX-License-Identifier: MIT
-->
<xsl:template match="ulink" name="ulink">
  <a href="{@url}">
    <xsl:apply-templates/>
  </a>
</xsl:template>
