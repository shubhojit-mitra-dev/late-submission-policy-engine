# Late Submission Policy Engine (LSPE)

A comprehensive, microservices-based system to handle, manage, and evaluate student submission policies seamlessly. Designed to be scalable, production-ready, and fully containerized out of the box.

## 👥 Team
- **Shubhojit** - Backend Architecture & Microservices
- **Nandik** - Frontend Development & UX
- **Shruti** - Requirement Analysis & Quality Assurance
- **Harsh** - Policy Engine & Evaluation Logic

---

## 🏗️ Architecture & Microservices

The application is built using a modern **Spring Boot** (Java 21) microservices architecture, paired with a high-performance **React** frontend. 

### 1. API Gateway (`api-gateway`)
- **Port:** `8080`
- **Role:** Acts as the single unified entry point for all client requests. It intelligently routes incoming HTTP requests to the respective downstream microservices, ensuring security and load balancing.

### 2. Policy Service (`policy-service`)
- **Port:** `8081`
- **Role:** The core rule engine of the platform. It defines, manages, and executes the mathematical and logical rules for late submission policies.
- **Database:** PostgreSQL (`policy_schema`)

### 3. Assignment Service (`assignment-service`)
- **Port:** `8082`
- **Role:** Manages the lifecycle of assignments, including due dates, descriptions, and mapping to specific grading policies.
- **Database:** PostgreSQL (`assignment_schema`)

### 4. Submission Service (`submission-service`)
- **Port:** `8083`
- **Role:** Handles student submissions and orchestrates the evaluation process based on the configured assignment policies.
- **Database:** PostgreSQL (`submission_schema`)

### 5. Frontend UI (`frontend`)
- **Port:** `5173` (Mapped from internal Nginx port `80`)
- **Role:** A dynamic, responsive React application (built with Vite) serving as the dashboard to manage policies, view assignments, and process grades.

---

## 🔄 Service-to-Service Communication

The engine relies on a robust hybrid communication strategy to ensure low latency and high availability:

1. **Synchronous REST (HTTP):** 
   Used for immediate, required data retrieval. For example:
   - The `api-gateway` routes front-end traffic down to the internal microservices over HTTP.
   - The `assignment-service` and `submission-service` communicate synchronously with the `policy-service` to immediately fetch and apply active grading criteria.

2. **Asynchronous Messaging (RabbitMQ):** 
   Used to decouple intensive compute tasks and promote fault tolerance. 
   - The `submission-service` publishes and subscribes to events on **RabbitMQ** to process intensive submission workflows, notifications, or grade calculations asynchronously without blocking the user.

---

## 🗂️ Monorepo Structure

The project embraces a **Monorepo** pattern, consolidating all backend services, shared libraries, infrastructure code, and the frontend into a single repository. 

```text
late-submission-policy-engine/
├── frontend/                 # React UI (Vite, PNPM, Multi-stage Nginx Docker build)
├── infra/
│   └── docker/               # Container Orchestration
│       ├── docker-compose.yml
│       └── init-scripts/     # PostgreSQL init scripts for schemas
├── services/                 # Spring Boot Microservices
│   ├── api-gateway/          
│   ├── assignment-service/   
│   ├── policy-service/       
│   └── submission-service/   
├── shared/
│   └── common-lib/           # Shared Java library
├── pom.xml                   # Root Maven Project (Dependency Management)
└── test-all-e2e.sh           # End-to-end testing scripts
```

### Maven Multi-Module Architecture
The Java backend utilizes a Maven Multi-Module setup:
- **Root `pom.xml`**: Acts as the orchestrator, managing global dependencies, Spring Cloud versions, and build plugins.
- **`shared/common-lib`**: A dedicated library shared across all microservices. It enforces the DRY (Don't Repeat Yourself) principle by centralizing shared DTOs, global exception handlers, security configurations, MapStruct mappers, and common utilities. 

---

## 🐳 Running the Application Locally

The entire application stack—Databases, Message Broker, Backend Microservices, and the Frontend Nginx server—is fully containerized. You can boot the complete production-grade environment with a **single command**.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Start the Stack
Navigate to the docker infrastructure directory and run the compose up command. The `--build` flag ensures all local Java and React code is compiled into fresh images.

```bash
cd infra/docker
docker compose up -d --build
```

### 🌐 Accessing the Services
Once the containers report as `healthy` (wait ~30-60 seconds for Spring Boot services to fully initialize), you can access the platform:

- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **API Gateway:** [http://localhost:8080](http://localhost:8080)
- **RabbitMQ Management Console:** [http://localhost:15672](http://localhost:15672) *(Credentials: `lspe_user` / `lspe_password`)*
- **PostgreSQL Database:** `localhost:5432` *(Credentials: `lspe_user` / `lspe_password`)*

### Stopping the Stack
To tear down the environment, run:
```bash
docker compose down
```
*(To completely wipe the database volumes and start fresh, run `docker compose down -v`)*
