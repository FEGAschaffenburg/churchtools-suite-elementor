# ChurchTools Suite - Elementor Integration

![Version](https://img.shields.io/badge/version-0.5.0-blue) ![License](https://img.shields.io/badge/license-GPL--3.0-green) ![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue) ![PHP](https://img.shields.io/badge/PHP-8.0%2B-purple)

**Elementor Page Builder Widget für [ChurchTools Suite](https://github.com/FEGAschaffenburg/churchtools-suite)** - Zeigt ChurchTools Events in Listen-, Raster- oder Kalender-Ansicht mit 28+ Anpassungsoptionen.

---

## 📋 Übersicht

Dieses **Sub-Plugin** erweitert [ChurchTools Suite](https://github.com/FEGAschaffenburg/churchtools-suite) um ein leistungsstarkes Elementor Widget.

### ✨ Features

- **13+ Vordefinierte Templates** - Classic, Modern, Minimal (Liste), Simple, Modern (Raster), Monthly, Weekly (Kalender)
- **28+ Kontrollparameter** - Content, Filters, Display, Grid, Style, Advanced Sections
- **Live-Preview** - Änderungen sofort im Elementor Editor sichtbar
- **Shortcode-Wrapper** - Re-Use der bewährten ChurchTools Suite Shortcodes
- **Responsive Design** - Optimiert für Desktop, Tablet und Mobile
- **Dependency Checks** - Automatische Prüfung von ChurchTools Suite und Elementor

---

## 📦 Installation

### Voraussetzungen

- **WordPress** >= 6.0
- **PHP** >= 8.0
- **[ChurchTools Suite](https://github.com/FEGAschaffenburg/churchtools-suite)** >= v1.0.9.0
- **[Elementor](https://elementor.com/)** >= v3.0.0

### Schritt-für-Schritt

1. **ChurchTools Suite installieren** (>= v1.0.9.0)
   ```
   https://github.com/FEGAschaffenburg/churchtools-suite/releases
   ```

2. **Elementor installieren** (>= v3.0.0)
   ```
   WordPress Admin → Plugins → Installieren → "Elementor" suchen
   ```

3. **Sub-Plugin installieren**
   - Download: [Latest Release](https://github.com/FEGAschaffenburg/churchtools-suite-elementor/releases/latest)
   - WordPress Admin → Plugins → Installieren → ZIP hochladen
   - Aktivieren

4. **Widget nutzen**
   - Seite in Elementor bearbeiten
   - Widget-Panel → "ChurchTools Suite" Kategorie
   - "ChurchTools Events" Widget per Drag & Drop hinzufügen

---

## 🎯 Verwendung

### Widget-Einstellungen

Das Widget bietet **6 Collapsible Sections**:

#### 1️⃣ Content Section
- **Ansichtstyp:** Liste, Raster oder Kalender
- **Template-Auswahl:** 13+ vordefinierte Designs
- **Anzahl Events:** 1-100 (nur Liste/Raster)
- **Event-Aktion:** Modal, Seite oder nicht anklickbar

#### 2️⃣ Filters Section
- **Kalender-Filter:** Multi-Select aus synced Calendars
- **Tags-Filter:** Multi-Select aus verfügbaren Tags
- **Vergangene Events:** Toggle

#### 3️⃣ Display Section
- **Event-Beschreibung:** Anzeigen/Verbergen
- **Termin-Beschreibung:** Anzeigen/Verbergen
- **Ort:** Anzeigen/Verbergen
- **Uhrzeit:** Anzeigen/Verbergen
- **Tags:** Anzeigen/Verbergen
- **Bilder:** Anzeigen/Verbergen
- **Kalendername:** Anzeigen/Verbergen
- **Dienste:** Anzeigen/Verbergen

#### 4️⃣ Grid Section
- **Spalten:** 1-6 (nur Raster-Ansicht)

#### 5️⃣ Style Section
- **Style-Modus:** Plugin-Styles, Theme-Styles oder Custom
- **Kalender-Farben:** Toggle
- **Custom Colors:** Primary, Text, Background
- **Custom Layout:** Border Radius, Font Size, Padding, Spacing

#### 6️⃣ Advanced Section
- **Zusätzliche Shortcode-Parameter:** Freies Textfeld für erweiterte Optionen

---

## 🏗️ Architektur

### Warum ein separates Plugin?

Ab ChurchTools Suite **v1.0.9.0** wird die Elementor-Integration modularisiert:

- **Optional** - Nur für Elementor-Nutzer relevant
- **Wartbar** - Separate Releases möglich
- **Zukunftssicher** - Weitere Sub-Plugins folgen (WooCommerce, Gravity Forms, etc.)

Ab ChurchTools Suite **v2.0.0** (Q4 2026) ist dieses Sub-Plugin **zwingend erforderlich** für Elementor-Nutzung.

### Hook-System

Das Sub-Plugin nutzt den neuen `churchtools_suite_loaded` Hook (seit v1.0.9.0):

```php
add_action( 'churchtools_suite_loaded', function( $plugin ) {
    // Zugriff auf Main Plugin API
    $version = $plugin->get_version();
    
    // Repository Factory nutzen
    $calendars = churchtools_suite_get_repository( 'calendars' );
    
    // Sub-Plugin initialisieren
    CTS_Elementor_Integration::init();
}, 10, 1 );
```

### Komponenten

- **churchtools-suite-elementor.php** - Main Plugin File (165 Zeilen)
  - Dependency Checks
  - Admin Notices
  - Hook Registration

- **includes/class-cts-elementor-integration.php** - Integration (106 Zeilen)
  - Widget Category Registration
  - Widget Class Loading
  - Debug Logging

- **includes/class-cts-elementor-events-widget.php** - Widget (627 Zeilen)
  - 6 Control Sections
  - Shortcode Builder
  - Repository Integration

---

## 🔧 Development

### Local Setup

```bash
git clone https://github.com/FEGAschaffenburg/churchtools-suite-elementor.git
cd churchtools-suite-elementor
```

### File Structure

```
churchtools-suite-elementor/
├── churchtools-suite-elementor.php  # Main Plugin File
├── readme.txt                        # WordPress.org Format
├── README.md                         # GitHub README (this file)
├── CHANGELOG.md                      # Version History
└── includes/
    ├── class-cts-elementor-integration.php     # Widget Registration
    └── class-cts-elementor-events-widget.php   # Elementor Widget
```

### Coding Standards

- **PHP:** PSR-12, WordPress Coding Standards
- **Text Domain:** `churchtools-suite-elementor`
- **Namespace:** `CTS_Elementor_*` (kein WordPress Namespace Conflict)
- **Logging:** Option `cts_elementor_log` (max 50 Einträge)

---

## 📚 Migration Guide

### Für Nutzer

**Von ChurchTools Suite v1.0.8.0 (eingebaute Elementor-Integration):**

1. Update auf ChurchTools Suite >= v1.0.9.0
2. Sub-Plugin installieren (optional bis v2.0.0)
3. Widget funktioniert weiterhin identisch

**Ab ChurchTools Suite v2.0.0 (Q4 2026):**
- Sub-Plugin ist **zwingend erforderlich**
- Eingebaute Elementor-Integration entfernt

### Für Entwickler

**Breaking Changes in v2.0.0:**
- Klassen entfernt: `ChurchTools_Suite_Elementor_Integration`, `ChurchTools_Suite_Elementor_Events_Widget`
- Neue Klassen: `CTS_Elementor_Integration`, `CTS_Elementor_Events_Widget`

**API bleibt verfügbar:**
- `do_action( 'churchtools_suite_loaded', $plugin )`
- `churchtools_suite_get_repository( $type )`
- `do_shortcode( '[cts_list ...]' )`

Siehe [MIGRATION-ELEMENTOR.md](https://github.com/FEGAschaffenburg/churchtools-suite/blob/main/MIGRATION-ELEMENTOR.md)

---

## 🐛 Support

- **Issues:** [GitHub Issues](https://github.com/FEGAschaffenburg/churchtools-suite-elementor/issues)
- **Discussions:** [GitHub Discussions](https://github.com/FEGAschaffenburg/churchtools-suite/discussions)
- **Main Plugin:** [ChurchTools Suite](https://github.com/FEGAschaffenburg/churchtools-suite)

---

## 📝 Changelog

### v0.5.0 - 2026-02-13 - Initial Beta Release

**Features:**
- ChurchTools Events Widget (28+ Kontrollparameter)
- 13+ View Templates (List, Grid, Calendar)
- Dependency Checks (ChurchTools Suite >= v1.0.9.0, Elementor >= v3.0.0)
- Admin Notices bei fehlenden Dependencies
- Hooks into `churchtools_suite_loaded` action

**Architektur:**
- Extracted from ChurchTools Suite v1.0.8.0
- Renamed Classes: `ChurchTools_Suite_Elementor_*` → `CTS_Elementor_*`
- Renamed Option: `churchtools_suite_elementor_log` → `cts_elementor_log`

Siehe [CHANGELOG.md](CHANGELOG.md)

---

## 📄 License

GPL-3.0-or-later - siehe [LICENSE](LICENSE)

---

## 🙏 Credits

Entwickelt von [FEG Aschaffenburg](https://www.feg-aschaffenburg.de)

**Main Plugin:** [ChurchTools Suite](https://github.com/FEGAschaffenburg/churchtools-suite)  
**ChurchTools API:** [ChurchTools](https://www.church.tools/)
