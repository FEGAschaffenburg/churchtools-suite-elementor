# ChurchTools Suite - Elementor Integration - Changelog

## v0.5.0 - Initial Beta Release (13. Februar 2026)

### ✨ Neue Features
- **ChurchTools Events Widget** - Elementor Page Builder Integration
  - 28+ Kontrollparameter (Content, Filters, Display, Grid, Style, Advanced)
  - Unterstützt List, Grid, Calendar Views
  - Shortcode-Wrapper Architektur (re-use Main Plugin functionality)
  - Live-Preview im Elementor Editor

### 🏗️ Architektur
- **Sub-Plugin System** - Extrahiert aus ChurchTools Suite v1.0.8.0
  - Nutzt `churchtools_suite_loaded` Hook (Main Plugin >= v1.0.9.0)
  - Saubere Dependency Checks (ChurchTools Suite, Elementor)
  - Klassen umbenannt: `ChurchTools_Suite_Elementor_*` → `CTS_Elementor_*`
  - Log-Option umbenannt: `churchtools_suite_elementor_log` → `cts_elementor_log`

### 🔧 Technische Details
- **Requires:** ChurchTools Suite >= v1.0.9.0
- **Requires:** Elementor >= v3.0.0
- **Requires:** WordPress >= 6.0
- **Requires:** PHP >= 8.0
- **License:** GPL-3.0-or-later

### 📦 Komponenten
- `churchtools-suite-elementor.php` - Main Plugin File mit Dependency Checks
- `includes/class-cts-elementor-integration.php` - Widget Registration (114 Zeilen)
- `includes/class-cts-elementor-events-widget.php` - Elementor Widget (627 Zeilen)
- `readme.txt` - WordPress.org Format

### ✅ Kompatibilität
- **Backward Compatible:** Funktioniert parallel zu Main Plugin v1.0.9.0 - v1.9.x
- **Forward Compatible:** Einzige Option ab Main Plugin v2.0.0 (Q4 2026)
- **Widget Settings:** 100% kompatibel mit bestehenden Elementor-Widgets
- **Shortcodes:** Nutzt Main Plugin Shortcodes (`cts_list`, `cts_grid`, `cts_calendar`)

### 📚 Dokumentation
- Installation Guide in readme.txt
- FAQ für End-User
- Support via GitHub Issues

### 🎯 Roadmap
- **v0.6.0:** WordPress.org Submission
- **v0.7.0:** Elementor Pro Features (wenn verfügbar)
- **v1.0.0:** Stable Release nach ausreichend Beta-Testing

---

**Download:** https://github.com/FEGAschaffenburg/churchtools-suite-elementor/releases/tag/v0.5.0  
**Migration Guide:** https://github.com/FEGAschaffenburg/churchtools-suite/blob/main/MIGRATION-ELEMENTOR.md  
**Main Plugin:** https://github.com/FEGAschaffenburg/churchtools-suite
