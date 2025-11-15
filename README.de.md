# ERP Beta — Enterprise Resource Planning System

Ein umfassendes ERP-System, das als Turborepo-Monorepo mit Next.js-Frontend und Express.js-Backend entwickelt wurde. Dieses System verwaltet Mitarbeiter, Bestellungen, Urlaubsanträge, Qualifikationen und bietet Echtzeit-Benachrichtigungen mit mehrsprachiger Unterstützung (Englisch/Deutsch).

## 🎯 Systemübersicht

Das ERP Beta-System ist darauf ausgelegt, Geschäftsprozesse durch rollenbasierte Zugriffskontrolle zu optimieren und bietet separate Dashboards für Administratoren und Mitarbeiter. Das System bietet umfassendes Mitarbeitermanagement, Auftragsverfolgung, Urlaubsverwaltung und Qualifikationsverfolgung mit Echtzeit-Benachrichtigungen.

### Hauptfunktionen:
- **Rollenbasierte Zugriffskontrolle**: Admin- und Mitarbeiter-Dashboards mit spezifischen Berechtigungen
- **Mehrsprachige Unterstützung**: Englische und deutsche Lokalisierung
- **Echtzeit-Benachrichtigungen**: Live-Updates für Bestellungen, Urlaubsanträge und Systemereignisse
- **Auftragsverwaltung**: Vollständiger Auftragslebenszyklus von der Erstellung bis zur Fertigstellung
- **Mitarbeiterverwaltung**: Umfassende Mitarbeiterprofile und Zuweisungsverfolgung
- **Urlaubsverwaltung**: Antrags-, Genehmigungs- und Verfolgungssystem
- **Qualifikationssystem**: Mitarbeiter-Skill-Tracking mit Admin-Genehmigungsworkflow

## 🔧 Admin-Funktionen

### Mitarbeiterverwaltung
- **Mitarbeitererstellung**: Neue Mitarbeiter mit vollständigen Profilinformationen hinzufügen
- **Mitarbeiterbearbeitung**: Mitarbeiterdaten, Abteilungen und Positionen aktualisieren
- **Mitarbeiter sperren/entsperren**: Systemzugriff für Mitarbeiter steuern
- **Mitarbeiterzuweisung**: Mitarbeiter Aufträgen zuweisen und Arbeitsbelastung verfolgen

### Auftragsverwaltung
- **Auftragserstellung**: Neue Aufträge mit Kundendetails und Anforderungen erstellen
- **Auftragszuweisung**: Mehrere Mitarbeiter Aufträgen zuweisen (unbegrenzte Zuweisungen)
- **Auftragsverfolgung**: Auftragsstatus und Fortschritt überwachen
- **Auftragslöschung**: Aufträge bei Bedarf entfernen
- **Statusverwaltung**: Auftragsstatus während des gesamten Lebenszyklus aktualisieren

### Urlaubsverwaltung
- **Urlaubsantragsüberprüfung**: Urlaubsanträge von Mitarbeitern anzeigen und verwalten
- **Urlaubsgenehmigung/-ablehnung**: Anträge mit Begründungen genehmigen oder ablehnen
- **Urlaubskalender**: Übersicht über Teamverfügbarkeit und geplante Urlaube

### Systemadministration
- **Abteilungsverwaltung**: Organisationsabteilungen erstellen und verwalten
- **Positionsverwaltung**: Mitarbeiterpositionen definieren und zuweisen
- **Qualifikationsverwaltung**: Systemweite Qualifikationen und Kategorien erstellen
- **Qualifikationsgenehmigung**: Von Mitarbeitern eingereichte Qualifikationen prüfen und genehmigen

### Berichte & Analysen
- **Mitarbeiterleistung**: Mitarbeiterzuweisungen und Abschlussraten verfolgen
- **Auftragsanalysen**: Auftragsabschluss und Statusverteilung überwachen
- **Systemnutzung**: Übersicht über Systemaktivität und Nutzerengagement

## 👤 Mitarbeiterfunktionen

### Auftragsverwaltung
- **Auftragsanzeige**: Zugriff auf zugewiesene Aufträge mit detaillierten Informationen
- **Statusaktualisierungen**: Auftragsstatus aktualisieren (In Bearbeitung, Abgeschlossen, etc.)
- **Auftragsnotizen**: Notizen hinzufügen und mit Admin/Team kommunizieren
- **Arbeitsverfolgung**: Zeit und Fortschritt bei zugewiesenen Aufträgen verfolgen

### Urlaubsverwaltung
- **Urlaubsanträge**: Urlaubsanträge mit Daten und Begründungen einreichen
- **Urlaubsverlauf**: Vergangene und ausstehende Urlaubsanträge anzeigen
- **Urlaubssaldo**: Verfügbare Urlaubstage und Nutzung verfolgen

### Profilverwaltung
- **Persönliche Informationen**: Kontaktdaten und persönliche Informationen aktualisieren
- **Qualifikationsverwaltung**: Persönliche Qualifikationen und Zertifizierungen hinzufügen
- **Skill-Tracking**: Berufliches Kompetenzportfolio pflegen

### Kommunikation
- **Auftragsnotizen**: An auftragsbezogenen Diskussionen teilnehmen
- **Benachrichtigungen**: Echtzeit-Updates zu Zuweisungen und Genehmigungen erhalten

## 💬 Auftragsnotizensystem

Das Auftragsnotizensystem erleichtert die Kommunikation zwischen Admins und zugewiesenen Mitarbeitern:

- **Echtzeit-Kommunikation**: Sofortnachrichten im Auftragskontext
- **Statusaktualisierungen**: Automatische Benachrichtigungen bei Änderungen des Auftragsstatus
- **Dateianhänge**: Dokumente und Bilder im Zusammenhang mit Aufträgen teilen
- **Verlaufsverfolgung**: Vollständiger Prüfpfad aller Auftragskommunikationen
- **Mehrere Teilnehmer**: Alle zugewiesenen Mitarbeiter und Admins können teilnehmen
- **Benachrichtigungsintegration**: Automatische Benachrichtigungen für neue Notizen und Updates

## 🔔 Benachrichtigungssystem

Umfassendes Echtzeit-Benachrichtigungssystem mit:

### Auftragsbenachrichtigungen
- **Neue Zuweisungen**: Mitarbeiter werden über neue Auftragszuweisungen benachrichtigt
- **Statusänderungen**: Updates bei Änderung des Auftragsstatus
- **Notizhinzufügungen**: Benachrichtigungen, wenn neue Notizen zu Aufträgen hinzugefügt werden
- **Abschlussanfragen**: Benachrichtigungen für Auftragsabschluss und Überprüfung

### Urlaubsbenachrichtigungen
- **Antragseinreichungen**: Admins werden über neue Urlaubsanträge benachrichtigt
- **Genehmigung/Ablehnung**: Mitarbeiter werden über Urlaubsantragsentscheidungen benachrichtigt
- **Bevorstehende Urlaube**: Erinnerungen an geplante Urlaubszeiten

### Systembenachrichtigungen
- **Qualifikationsaktualisierungen**: Benachrichtigungen für Skill-Genehmigungen/-ablehnungen
- **Profiländerungen**: Updates für wichtige Profiländerungen
- **Systemankündigungen**: Administrative Nachrichten und Updates

### Benachrichtigungsfunktionen
- **Echtzeit-Zustellung**: Sofortige Benachrichtigungen ohne Seitenaktualisierung
- **Mehrsprachig**: Benachrichtigungen in der bevorzugten Sprache des Benutzers
- **Aktionsintegration**: Benachrichtigungen anklicken, um zu relevanten Seiten zu navigieren
- **Gelesen/Ungelesen-Tracking**: Visuelle Indikatoren für Benachrichtigungsstatus
- **Batch-Operationen**: Alle Benachrichtigungen als gelesen markieren

## 🏗️ Repository-Struktur

Dies ist ein **Turborepo-Monorepo** mit der folgenden Struktur:

```
erp-beta/
├── apps/
│   ├── web/          # Next.js Frontend-Anwendung
│   └── api/          # Express.js Backend-API
├── packages/
│   ├── db/           # Prisma-Datenbankschema und Migrationen
│   ├── eslint-config/# Gemeinsame ESLint-Konfiguration
│   ├── typescript-config/ # Gemeinsame TypeScript-Konfiguration
│   ├── jest-presets/ # Jest-Testkonfiguration
│   └── logger/       # Gemeinsame Logging-Utilities
├── docker-compose.yml # Docker-Container-Orchestrierung
└── turbo.json        # Turborepo-Pipeline-Konfiguration
```

### Technologie-Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Datenbank**: PostgreSQL (konfigurierbar)
- **Authentifizierung**: NextAuth.js mit JWT
- **Internationalisierung**: react-i18next
- **State Management**: Zustand
- **UI-Komponenten**: Benutzerdefinierte Komponenten mit Radix UI-Primitiven

## 🚀 Erste Schritte

### Voraussetzungen
- Node.js 18+
- Yarn oder npm
- PostgreSQL-Datenbank
- Docker (optional)

### Installation

1. **Repository klonen**:
```bash
git clone <repository-url>
cd erp-beta
```

2. **Abhängigkeiten installieren**:
```bash
yarn install
# oder
npm install
```

3. **Umgebungseinrichtung**:
Erstellen Sie `.env`-Dateien in den Verzeichnissen `apps/web` und `apps/api`:

**apps/api/.env**:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/erp_beta"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
PORT=3001
```

**apps/web/.env.local**:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

4. **Datenbank-Setup**:
```bash
# Datenbankmigrationen ausführen
yarn workspace @repo/db prisma migrate dev

# Initialdaten einfügen (optional)
yarn workspace @repo/db prisma db seed
```

5. **Entwicklungsserver starten**:

**Option A: Alle Services starten**:
```bash
yarn dev
```

**Option B: Einzeln starten**:
```bash
# Terminal 1 - API-Server
yarn workspace api dev

# Terminal 2 - Webanwendung
yarn workspace web dev
```

### Zugriffspunkte
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database Studio**: `yarn workspace @repo/db prisma studio`

## 📝 Datenbankverwaltung

```bash
# Neue Migration erstellen
yarn workspace @repo/db prisma migrate dev --name migration_name

# Datenbank zurücksetzen
yarn workspace @repo/db prisma migrate reset

# Prisma Client generieren
yarn workspace @repo/db prisma generate

# Prisma Studio öffnen
yarn workspace @repo/db prisma studio
```

---

**Erstellt mit modernen Webtechnologien**

## 🌐 Sprachversionen
- [English](./README.md)
