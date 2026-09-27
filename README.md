# PackCheck AI — SIH 2026 (Problem Statement SIH26034)

> **Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.**

PackCheck AI is an **AI-assisted preliminary compliance assessment system** designed for Legal Metrology Enforcement Officers and Supervisors. It extracts packaged commodity label declarations using OCR, evaluates versioned Legal Metrology rule compliance, highlights evidence via interactive bounding boxes, and provides a manual review workflow for preliminary reporting.

---

## System Architecture & Ports

| Micro-tier Component | Technology | Default Port | Health Endpoint |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React 18 + Vite + Tailwind CSS | `3000` | `http://localhost:3000` |
| **Backend Domain** | Java 17 + Spring Boot 3 + JPA | `8080` | `http://localhost:8080/api/v1/health` |
| **AI Vision Service** | Python 3.10 + FastAPI + OpenCV | `8000` | `http://localhost:8000/health` |
| **Database** | MySQL 8.x / H2 | `3306` | `packcheck_db` |

---

## Directory Structure

```
PROJECT-SIH/
├── frontend/             # React + Vite + Tailwind CSS User Interface (Dockerfile included)
├── backend/              # Spring Boot 3 REST API & Versioned Rule Engine (Dockerfile included)
├── ai-services/          # Python FastAPI OCR & Extraction Microservice (Dockerfile included)
├── database/             # Versioned MySQL Initialization SQL Scripts
├── docs/                 # System Architecture, Database, API, Test & Dev Guides
├── docker-compose.yml    # One-command full-stack container deployment
├── .env.example          # Environment Configuration Blueprint
├── README.md             # Project Overview & Setup Guide
└── implementation_plan.md# Approved SIH Architectural Specification
```

---

## ▲ Deploy the Frontend on Vercel

The repository now includes a root `vercel.json`, so Vercel can import this repository directly and build the React/Vite frontend from `frontend/`.

### Required Vercel environment variable

```text
VITE_API_BASE_URL=https://your-deployed-spring-backend.example.com
```

The Vercel deployment hosts the **frontend only**. The Spring Boot API, FastAPI OCR service, and database remain separate services because they are long-running backend workloads and are not bundled into the static Vite deployment.

After the Vercel URL is created, configure the Spring backend CORS environment with that URL, for example:

```text
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

Direct visits to `/scan`, `/scans`, scan-detail routes, and `/reviews` are handled by the included Vercel SPA rewrites.

---

## 🌐 Prototype Deployment Preparation

### 1. Local Development Architecture
```
React/Vite Frontend (Port 3000)
       │
       ▼
Spring Boot REST API (Port 8080)
       ├──► FastAPI AI OCR Microservice (Port 8000)
       └──► MySQL / H2 Database (Port 3306)
```

### 2. Environment Variables Summary

#### Frontend (`frontend/.env`)
| Variable | Description | Local Default | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of Spring Boot REST API | `http://localhost:8080` | `https://api.packcheck.ai` |

#### Backend (`backend/.env`)
| Variable | Description | Local Default | Production Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Spring Boot HTTP Server Port | `8080` | `8080` / `$PORT` |
| `DB_URL` | JDBC Database Connection URL | `jdbc:mysql://localhost:3306/packcheck_db?...` | `jdbc:mysql://cloud-db:3306/packcheck_db` |
| `DB_USERNAME` | Database User | `root` | `admin_user` |
| `DB_PASSWORD` | Database Password | `password` | `<STRONG_SECRET_PASSWORD>` |
| `AI_SERVICE_URL` | FastAPI Microservice URL | `http://localhost:8000` | `https://ai.packcheck.ai` |
| `JWT_SECRET` | 256-bit JWT Signing Secret Key | `PackCheckPrototypeSecretKey...` | `<PRODUCTION_256BIT_SECRET>` |
| `FRONTEND_URL` | CORS Allowed Origins | `http://localhost:3000,http://localhost:5173` | `https://dashboard.packcheck.ai` |
| `UPLOAD_DIR` | Local Image File Storage Path | `uploads` | `/var/app/uploads` |

#### AI Vision Microservice (`ai-services/.env`)
| Variable | Description | Local Default | Production Example |
| :--- | :--- | :--- | :--- |
| `PORT` | FastAPI Execution Port | `8000` | `$PORT` / `8000` |
| `ENVIRONMENT` | Runtime Mode | `development` | `production` |

### 3. Database Configuration
- Supports both MySQL 8.x and H2 in-memory databases.
- Schema auto-initializes via `database/init_schema.sql` (MySQL) or Hibernate DDL (`ddl-auto: update`).
- Compatible with low-cost hosted MySQL providers (e.g., PlanetScale, Aiven, Supabase Postgres via dialect, or AWS RDS Free Tier).

### 4. Local Docker Compose Command
Run the complete stack locally using Docker Compose:
```bash
docker-compose up --build -d
```

### 5. Future Cloud Deployment Architecture (Target Specs)
- **Frontend**: Vercel / Netlify (Static Web Hosting using Vite `npm run build`).
- **Backend API**: Render Web Service / Railway / AWS Elastic Beanstalk (Java 17 runtime container).
- **AI OCR Microservice**: Render Web Service / AWS ECS / GCP Cloud Run (Python 3.10 + Tesseract runtime).
- **Database**: Hosted Managed MySQL Instance.

### 6. Ephemeral File Storage Limitation Note
> ℹ️ **Notice on File Storage:** In this prototype, scanned label images are stored in local filesystem directory `uploads/` (`UPLOAD_DIR`). Cloud application platforms (e.g., Render, Heroku) use ephemeral filesystems where uploaded files do not persist across restarts. For full production scale, integrate S3-compatible cloud object storage (e.g., AWS S3, Cloudflare R2, or MinIO).

### 7. Statutory Compliance Disclaimer
> ⚖️ **Legal Notice:** PackCheck AI is an automated decision-support prototype under Legal Metrology Rules, 2011. AI preliminary compliance assessments are advisory; human officer verification and sign-off are required prior to issuing official statutory notices or penalty enforcement orders.

---

## Quick Start (Manual Local Run Commands)

### 1. Database Setup
```bash
mysql -u root -p < database/init_schema.sql
```

### 2. Run AI Microservice (Port 8000)
```bash
cd ai-services
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Run Spring Boot Backend (Port 8080)
```bash
cd backend
mvn spring-boot:run
```

### 4. Run React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Prototype Authentication & Role-Based Access Control (RBAC)

PackCheck AI integrates a Spring Security + JWT prototype authentication system enforcing Role-Based Access Control (RBAC).

### Supported Roles
1. `ENFORCEMENT_OFFICER`: Initiate product scan analyses, view scans & histories, perform review actions.
2. `SUPERVISOR`: View scans, audit officer compliance assessments, access supervisor review reports.
3. `ADMIN`: System administration, compliance rule configuration, user role management.

### Prototype Demo Credentials
When `app.demo-users.enabled=true` (default), the system automatically seeds three demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **ENFORCEMENT_OFFICER** | `officer@packcheck.ai` | `PackCheck@123` |
| **SUPERVISOR** | `supervisor@packcheck.ai` | `PackCheck@123` |
| **ADMIN** | `admin@packcheck.ai` | `PackCheck@123` |

> ⚠️ **Notice:** Demo credentials are provided strictly for local SIH prototype demonstration and testing. For staging or production deployments, set `APP_DEMO_USERS_ENABLED=false`.

### Authentication API
- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "officer@packcheck.ai",
    "password": "PackCheck@123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "<JWT_BEARER_TOKEN>",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": 2,
      "full_name": "Demo Officer",
      "email": "officer@packcheck.ai",
      "role": "ENFORCEMENT_OFFICER",
      "jurisdiction_zone": "Zone-A",
      "active": true
    }
  }
  ```

---

## 📋 Review & History REST APIs

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/scans/analyze` | Officer/Supervisor/Admin | Upload product label image & run preliminary compliance scan |
| `GET` | `/api/v1/scans` | Officer/Supervisor/Admin | Fetch scan history summary list |
| `GET` | `/api/v1/scans/{scanReference}` | Officer/Supervisor/Admin | Retrieve complete scan details, OCR extractions & review audit logs |
| `GET` | `/api/v1/reviews` | Officer/Supervisor/Admin | Retrieve scans requiring manual review queue |
| `PUT` | `/api/v1/scans/{scanReference}/review` | Officer/Supervisor/Admin | Submit officer manual review decision & record audit log |

---

## Documentation Links
- [System Architecture](docs/architecture.md)
- [Database Schema & ERD](docs/database-design.md)
- [API Specification](docs/api-design.md)
- [Development Guide](docs/development-guide.md)
- [Synthetic Test Plan](docs/test-plan.md)
