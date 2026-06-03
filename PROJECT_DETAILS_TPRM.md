# PROJECT_DETAILS_TPRM

Excellenta TPRM is a multi-tenant third-party risk management platform that helps organizations manage vendor relationships from onboarding to offboarding in one secure workflow. The system supports vendor due diligence, questionnaire management, risk scoring, document handling, approvals, audit visibility, and reporting, while keeping each client organization's data isolated. It is designed for practical, day-to-day risk operations, giving business, procurement, and risk teams a shared workspace to make faster and better-informed decisions about third-party risk.

## Tech Stack and Requirements

- Backend: Flask (Python), SQLAlchemy, Flask-Login, Flask-WTF
- Frontend: Bootstrap 5, Jinja2 templates, vanilla JavaScript
- Database: SQLite for development, PostgreSQL for production
- Reporting: ReportLab-based PDF generation (pure Python)
- AI Integration: Groq-powered Tess assistant and AI due diligence features
- Security: RBAC, CSRF protection, input validation, multi-tenant client isolation

### Runtime and Setup Requirements

- Python 3.8+
- Virtual environment support (`venv` recommended)
- Git
- Environment variable configuration for:
  - Application secrets and database connection
  - SMTP email delivery
  - AI and external service keys where applicable

## Deployment

Deployment follows a Git-driven flow through Azure DevOps and then onto Hetzner infrastructure:

- Source control is maintained in Git.
- Code changes are pushed to Azure DevOps repositories as the central integration point.
- From Azure DevOps, the deployment workflow is promoted to the Hetzner-hosted environment.
- Hetzner runs the production instance of the Excellenta TPRM platform.

This flow provides a controlled path from development to production, with versioned history in Git and operational deployment on Hetzner.