# Dork Categories

This document describes the organization structure of `dorks.json` to make it easier to add new dorks to the correct category.

**Note:** Categories are now visually displayed in the web interface! Each dork has a `category` field, and the interface groups dorks under their respective category headers.

## Category Organization

The dorks are organized in the following order:

### 1. Vulnerability Parameters
- XSS prone parameters
- SQLi Prone Parameters
- LFI Prone Parameters
- RCE Prone Parameters
- SSRF Prone Parameters
- Open Redirect prone parameters
- IDOR Prone Parameters
- File upload endpoints
- JWT Tokens
- CORS Headers

### 2. Sensitive Files & Data
- Juicy Extensions
- Backup Files
- Exposed .env Files (includes API_KEY, AWS_ACCESS_KEY_ID)
- Version Control Exposure (Git & SVN)
- Sensitive Documents
- Sensitive Parameters
- High % inurl keywords
- Directory Listings
- Archive Files
- Source Code Files
- Nginx Config Files
- Credentials Files
- Local Storage Data
- Email Addresses
- Sitemap Files
- SQL Files
- Debug Log Files
- Application Log Files
- Database Credentials

### 3. Error Messages & Debug
- Server Errors
- CSP Reports

### 4. Authentication & Identity
- Login Pages
- Exposed Admin Panels
- Keycloak
- Shibboleth

### 5. APIs & Documentation
- API Endpoints
- API Docs
- GraphQL Endpoints
- Postman Collections
- Kong
- Apache APISIX

### 6. Web Frameworks & CMS
- PHP extension w/ parameters
- WordPress Specific
- Ghost Admin
- Dolibarr
- Adobe Experience Manager (AEM)
- Salesforce Aura Components
- Spring Boot Actuator
- DokuWiki
- phpBB Forums
- Directus CMS
- Webmin
- ISPConfig
- Apache Struts

### 7. Infrastructure & Orchestration
- Kubernetes Dashboard
- Consul
- HashiCorp Nomad
- HashiCorp Vault
- Apache Airflow
- Traefik
- Kubernetes API
- Proxmox
- Home Assistant
- OpenProject
- Docker Registry

### 8. Monitoring & Dashboards
- Grafana
- Kibana
- Prometheus
- Netdata
- Flower (Celery)
- Zabbix
- Exposed Dashboards
- Nagios
- Metabase
- Splunk

### 9. Databases & Search
- Elasticsearch (includes /_search endpoint)
- Redis Commander
- Apache Solr
- RabbitMQ
- NATS
- Apache Superset
- phpMyAdmin
- Couchbase
- MQTT Broker
- MongoDB Exposure

### 10. CI/CD & DevOps
- Jenkins & CI/CD
- TeamCity
- Drone CI
- Harbor
- Portainer
- Pipeline Configs
- Rundeck

### 11. Cloud & Storage
- Cloud Storage
- Firebase
- JFrog Artifactory

### 12. Code Repositories
- GitHub Exposure
- GitLab Leaks
- Bitbucket Leaks
- Sourcegraph
- Code Leaks

### 13. Bug Bounty & Security
- HackerOne Reports
- Bugcrowd Reports
- Disclosed XSS and Open Redirects
- Security.txt
- Web Shells & Backdoors

### 14. People & Organization
- LinkedIn - Technical Staff
- LinkedIn - Tech Developers
- LinkedIn - Employee Emails
- LinkedIn - Leadership Roles
- Trello Boards
- Google Groups
- Third-Party Integrations
- Pastebin & Code Sharing

### 15. File Sharing & Transfer
- Unauthenticated ZFile
- FileCatalyst

### 16. Miscellaneous
- Test Environments
- ArcGIS FeatureServer
- Jira (includes multiple endpoints: Dashboard, RapidBoard, projects)
- Wayback Machine
- Helpdesk Systems
- Test Pages
- Job Postings
- Queue Management
- Streaming Services (M3U8)
- Device Status Pages
- Status Pages
- VNC Access
- WebSocket Endpoints
- Signup & Registration
- Bot Endpoints
- GitLab File Browser
- Display Pages
- Computer Management
- Issue Tracking
- Console Pages
- UI Interfaces
- Guacamole Remote Desktop
- OpenVAS Scanner
- FTP Servers
- Printer Admin Panels
- CGI Scripts
- Script Management

## Adding New Dorks

When adding a new dork:

1. Determine which category it belongs to
2. Add it to the end of that category's section in `dorks.json`
3. Ensure it follows the standard format:
```json
{
  "title": "Dork Name",
  "google": "site:example.com ...",
  "bing": "site:example.com ...",
  "duckduckgo": "site:example.com ...",
  "yandex": "site:example.com ...",
  "brave": "site:example.com ...",
  "baidu": "site:example.com ...",
  "mojeek": "site:example.com ...",
  "category": "Category Name"
}
```
4. Make sure the `category` field matches one of the 16 categories listed above

If the dork doesn't fit any existing category, consider creating a new category or adding it to "Miscellaneous".
