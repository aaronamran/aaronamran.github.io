# Modular Dorks Structure

## Overview
Split the monolithic `dorks.json` into separate category files for better maintainability and organization.

## New Directory Structure
```
DorkIndex/
├── categories/
│   ├── 01-vulnerability-parameters.json
│   ├── 02-sensitive-files-data.json
│   ├── 03-error-messages-debug.json
│   ├── 04-authentication-identity.json
│   ├── 05-apis-documentation.json
│   ├── 06-web-frameworks-cms.json
│   ├── 07-infrastructure-orchestration.json
│   ├── 08-monitoring-dashboards.json
│   ├── 09-databases-search.json
│   ├── 10-cicd-devops.json
│   ├── 11-cloud-storage.json
│   ├── 12-code-repositories.json
│   ├── 13-bug-bounty-security.json
│   ├── 14-people-organization.json
│   ├── 15-file-sharing-transfer.json
│   └── 16-miscellaneous.json
├── dorks.json (original, kept as backup)
├── app.js (updated to load from categories/)
└── index.html
```

## Category File Format
Each category file will contain:
```json
{
  "category": "Category Name",
  "dorks": [
    {
      "title": "Dork Title",
      "google": "query",
      "bing": "query",
      "duckduckgo": "query",
      "yandex": "query",
      "brave": "query",
      "baidu": "query",
      "mojeek": "query"
    }
  ]
}
```

## Category Mapping
1. `01-vulnerability-parameters.json` → "Vulnerability Parameters"
2. `02-sensitive-files-data.json` → "Sensitive Files & Data"
3. `03-error-messages-debug.json` → "Error Messages & Debug"
4. `04-authentication-identity.json` → "Authentication & Identity"
5. `05-apis-documentation.json` → "APIs & Documentation"
6. `06-web-frameworks-cms.json` → "Web Frameworks & CMS"
7. `07-infrastructure-orchestration.json` → "Infrastructure & Orchestration"
8. `08-monitoring-dashboards.json` → "Monitoring & Dashboards"
9. `09-databases-search.json` → "Databases & Search"
10. `10-cicd-devops.json` → "CI/CD & DevOps"
11. `11-cloud-storage.json` → "Cloud & Storage"
12. `12-code-repositories.json` → "Code Repositories"
13. `13-bug-bounty-security.json` → "Bug Bounty & Security"
14. `14-people-organization.json` → "People & Organization"
15. `15-file-sharing-transfer.json` → "File Sharing & Transfer"
16. `16-miscellaneous.json` → "Miscellaneous"

## Benefits
- **Easier Maintenance**: Each category is in its own file
- **Better Organization**: Clear separation of concerns
- **Scalability**: Can add new categories without bloating a single file
- **Version Control**: Easier to track changes per category
- **Collaboration**: Multiple people can work on different categories simultaneously

## Migration Plan
1. ✅ Backup original `dorks.json`
2. ✅ Design new structure (this document)
3. Create `categories/` directory
4. Generate individual category JSON files from master dorks.json
5. Update `app.js` to:
   - Load all category files asynchronously
   - Merge dorks from all categories
   - Maintain existing rendering logic
6. Test that all 141 dorks load correctly
7. Verify UI displays all categories properly
8. Update `README.md` with new structure information
