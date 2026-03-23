# Übernommene Funktionen für das native Skill-Modul

Wir übernehmen die folgenden produktionsreifen Funktionen aus den Referenzprojekten und fügen sie als native Module ins Plugin ein.

1. **Automatische Skill-Discovery** (SkillPort, Skillz, local-skills-mcp)
   * Warum: Diese Projekte bieten Mechanismen, um OpenAI-kompatible `/models`-Listen dynamisch einzulesen und zu katalogisieren. Wir übernehmen das, damit die Dashboard-Modelle nahtlos Skill-Port, BobMatNYC’s MCP-Skillset und Algiras Skillz anbieten, ohne separate MCP-Server zu starten.

2. **Skill-Metadaten + Suche** (SkillPort: `search_skills`, Metadata)
   * Warum: Bereitschaft, Fähigkeiten mit Metadaten zu katalogisieren und per Suche abzufragen, macht das Skill-Modul nutzbar. Wir bauen eine interne Version (z. B. mit lokalem Index) und verknüpfen sie mit `/v1/models` und den Dashboard-Filtern.

3. **Konfigurationsworkflow & UI** (mcp-skillset + Skillz)
   * Warum: Die Referenzen zeigen, wie MCP-Endpoints eingebunden und mit Metadaten getaggt werden. Wir übernehmen dieselbe UX (Provider-URLs, API Keys, Headers, Auto-Discovery) direkt in unserem Dashboard als Core-Feature, inklusive Test/Fetch-Buttons.

4. **MCP-Tool-Ausgabe & Status** (local-skills-mcp)
   * Warum: Die Skill-Servers liefern Toollisten und Statusbereiche. Wir integrieren diese Informationen in die MCP-Karte unserer Dashboard-UI und verbinden sie mit den vorhandenen MCP-Events in `CopilotApiGateway`.

5. **Lokale Laufzeit + Branding** (SkillPort + Skillz)
   * Warum: Beide Projekte sind auf lokale Ausführung ausgelegt. Wir übernehmen das Prinzip: keine Cloud-Server, alles läuft lokal (wie bereits mit GitHub Copilot API Gateway). Die neue Marke soll das betonen („native Skill-Core“), inklusive neuer Texte und Assets.

