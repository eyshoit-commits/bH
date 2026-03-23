# Taskplan: Native Skill-Modul aus Referenzprojekten

## Ziele
- Alle relevanten Funktionen aus SkillPort, mcp-skillset, Skillz und local-skills-mcp als native Module integrieren.
- Interface und Dashboard so überarbeiten, dass Anwender über neue Einstellungen alle MCP-Endpoints verwalten, bandbreitenunabhängig starten und ihre Modelle direkt in `/v1/models` sehen.
- Das Plugin neu „rebranden“ (UI-Text, Karten, Grafiken) und die neuen Fähigkeiten als zentrale Kernfunktionen darstellen.

## Arbeitspakete
1. **Feature-Analyse & Dokumentation**
   - Erfasse pro Quelle (SkillPort, mcp-skillset, Skillz, local-skills-mcp) die konkreten Features, die übernommen werden (Auto-Discovery, Metadata, Search, Tools, Status, Branding).
   - Notiere Begründung und Mapping auf unsere Module in `docs/features.md` (erledigt).

2. **Gateway/Provider-Logik**
   - Erweitere `CustomProviderConfig` und Backend-Cache so dass Auto-Discovery (via `/models`) automatisch alle Modelle lädt, mit manuellen Overrides kombiniert und in `/v1/models` einspielt.
   - Implementiere dedizierte Hooks für Skill-Port/SKILLZ-spezifische Metadaten (z. B. `search_skills`-ähnliche Indizes) und mache sie über `/v1/tools` oder `audit` abrufbar.
   - Stelle sicher, dass die MCP-Integration (Tool-Listen, Status) die neuen Provider abbildet.

3. **Dashboard-Rebranding**
   - Passe Texte, Buttons & Karten an die neue Marke „Native Skill Core“ an; zeige bei jedem Provider Auto-Discovery-Status.
   - Füge eine neue Karte hinzu, die die eingebundenen Skill-Quellen und ihre Tool-Lists (gemäß SkillPort/mcp-skillset) darstellt.
   - Binde UI-Steuerelemente für Skill-Port/Skillz-bezogene Aktionen (z. B. „Skill-Katalog aktualisieren“) ein.

4. **Test + Dokumentation**
   - Schreibe Tests für Auto-Discovery-Cache/Fehlerfälle sowie den Merge in `/v1/models`.
   - Dokumentiere neue Features in `docs/rebrand-skill-module-plan.md` und `docs/tasks/merged-feature-plan.md` plus eine Übersicht über die neuen Dashboard-Einstellungen (z. B. `docs/tasks/skill-module-config.md`).
   - Beschreibe Upgrade-Schritte für bestehende Nutzer (z. B. „Schalte Auto-Discovery ein, damit SkillPort-Modelle erscheinen“).

## Abnahmekriterien
- `/v1/models` zeigt nach Aktivierung einer MCP-Quelle deren Modelle ohne manuelles Eintragen.
- Dashboard zeigt Provider-Status + Toollisten/Statistiken im neuen Branding.
- Dokumentation listet alle übernommenen Funktionen inkl. Begründung (siehe `docs/features.md` und diese Taskliste).

## Annahmen
- SkillPort/mcp-skillset/Skillz liefern OpenAI-konforme `/models`-Daten; wir brauchen keine vollständige Serverintegration.
- Neu eingebundene Features dürfen in TypeScript reimplementiert werden (keine Copy-Paste). Alle Komponenten sind im Repo implementierbar.
