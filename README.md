# NOVAMED Clinic Appointment Booking System

A full-stack clinic appointment booking application for an imaginary clinic group called **NOVAMED**, supporting patients, doctors, desk staff, and admin roles. Built with an ASP.NET Core 8 backend and a Next.js 16 frontend.

## 🏗️ Application Structure

The project is split into two parts:

- **`backend/`** — ASP.NET Core 8 + Entity Framework Core + MySQL. Handles all business logic, REST API routes, and database operations.
- **`frontend/`** — Next.js 16 (App Router) + React 19 + Tailwind CSS. The public site and a role-based staff portal.

## 🚀 Features

### Public site
- **Home** (`/`) — landing page with quick links
- **Book an appointment** (`/book`) — no account needed; doctors are filtered by the chosen clinic, and the booking rules are shown next to the form
- **Find a doctor** (`/doctors`) — all doctors, with search by first/last name
- **Availability** (`/calendar`) — month and day view of booked times (no patient data), filterable by doctor
- **About us, Contact, Privacy policy**

### Staff portal (`/staff`, staff login required)
- **Dashboard** — today's and upcoming appointments
- **Appointments, Calendar, Patients** — Staff and Admin
- **Doctors, Clinics, Specialities, Staff users** — Admin only (hidden from Staff and blocked in three places: `proxy.ts`, the page, and the API)
- **My account** — change your own password
- A patient, doctor or clinic that still has appointments cannot be deleted

## 🔐 Authentication & Roles

The API uses JWT bearer tokens. Patients do not have accounts; only clinic staff log in.

| Role | Can do |
|---|---|
| **Public** (no login) | Book an appointment (`with-patient`), search doctors, list clinics / doctors / specialities, see busy time slots (no patient data) |
| **Staff** (front desk) | Everything public, plus manage appointments and patients |
| **Admin** | Everything Staff can, plus manage clinics, doctors, specialities and staff accounts |

- **Secure by default:** a fallback authorization policy requires login for every endpoint that is not explicitly marked public
- **No public registration:** the first admin is created on startup from the `SeedAdmin` settings (only when there are no users yet); all other accounts are created by an admin
- Passwords are hashed with ASP.NET Core's `PasswordHasher` (PBKDF2); emails are stored lower-case and are unique
- Login is rate limited to 5 attempts per minute per IP address, and returns the same error for an unknown email and a wrong password
- The public calendar uses `GET /api/appointments/busy`, which returns only time ranges and doctor names, never patient data

## 📅 Booking Rules

All booking rules live in one place, `backend/Services/AppointmentValidator.cs`, and are enforced the same way when an appointment is created, created together with a new patient, or updated:

- Appointments are on **weekdays only**
- The whole appointment must fit inside working hours: it starts at **08:00** or later and ends at **18:00** at the latest
- Appointments cannot be booked in the past, and the duration must be greater than zero
- A **doctor** cannot have two overlapping appointments
- A **patient** cannot have two overlapping appointments
- Doctor, clinic and patient must exist
- When booking with patient details, the patient is matched by name and email, and a new patient is only created if the appointment itself is valid

The current time comes from .NET's `TimeProvider`, so the rules can be tested against a fixed date.

## 🛠 Tech Stack

**Backend:** ASP.NET Core 8, Entity Framework Core, MySQL, JWT authentication, rate limiting, Swagger, LINQ, CORS
**Frontend:** Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript, Tailwind CSS, `@daypilot/daypilot-lite-react` (calendar), `lucide-react` (icons)

## 🧭 Frontend Architecture

- **The browser never calls the API directly.** Server Components load data and Server Actions send changes, both through `lib/api.ts` on the Next.js server (a small "backend for frontend")
- **The JWT lives in an httpOnly cookie**, so client-side JavaScript cannot read it; `lib/api.ts` adds it as a Bearer token to API calls
- **Three layers of access control:** `proxy.ts` redirects before a page renders, staff portal pages check the session again, and the API verifies the token and role on every request
- **Small design system:** one palette taken from the logo (navy, sand, two pastel accents) defined in `tailwind.config.ts`, plus a few shared components (`Button`, `Alert`, `DataTable`, `ConfirmDelete`, `FormCard`)
- User-entered text shown in the calendar is HTML-escaped

## 📂 Project Structure

```
ClinicAppointmentSystem/
├── docker-compose.yml  # MySQL + API + frontend
├── .github/workflows/  # CI
├── backend.Tests/      # xUnit unit + integration tests
├── backend/
│   ├── Controllers/
│   │   ├── AppointmentsController.cs
│   │   ├── AuthController.cs
│   │   ├── ClinicController.cs
│   │   ├── DoctorsController.cs
│   │   ├── PatientsController.cs
│   │   ├── SearchDoctorController.cs
│   │   ├── SpecialitiesController.cs
│   │   └── UsersController.cs
│   ├── DTOs/            # Response shaping, avoids entity leakage
│   ├── Models/
│   ├── Auth/            # JWT options and claim names
│   ├── Services/        # AppointmentValidator, token service, admin seeder
│   └── Migrations/
└── frontend/
    ├── app/
    │   ├── (site)/        # public pages: home, book, doctors, calendar, login, ...
    │   └── staff/         # staff portal (role-based)
    ├── components/        # ui/, site/, staff/, forms/, calendar/
    ├── lib/
    │   ├── api.ts         # server-side API client (adds the JWT)
    │   ├── session.ts     # reads the session cookie
    │   └── actions/       # Server Actions: auth, public, admin
    └── proxy.ts           # redirects logged-out users, and Staff away from admin-only pages
```

## 📖 API Endpoints Overview

| Resource | Endpoints |
|---|---|
| **Appointments** | `GET/POST /api/appointments`, `POST /api/appointments/with-patient`, `GET/PUT/DELETE /api/appointments/{id}` |
| **Patients** | `GET/POST /api/patients`, `GET/PUT/DELETE /api/patients/{id}` |
| **Doctors** | `GET/POST /api/doctors`, `GET/PUT/DELETE /api/doctors/{id}` |
| **Clinics** | `GET/POST /api/clinics`, `GET/PUT/DELETE /api/clinics/{id}` |
| **Specialities** | `GET/POST /api/specialities`, `GET/PUT/DELETE /api/specialities/{id}` |
| **Doctor Search** | `POST /api/search/doctors` — search by first/last name |
| **Auth** | `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/password` |
| **Users** (admin) | `GET/POST /api/users`, `PUT /api/users/{id}/password`, `DELETE /api/users/{id}` |
| **Busy slots** (public) | `GET /api/appointments/busy?from=&to=&doctorId=` |

List endpoints always return `200 OK`; an empty result is an empty list. All endpoints are documented and testable via Swagger UI: log in with `POST /api/auth/login`, then paste the token into the **Authorize** button.

Sample search request body:
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

## ▶️ Getting Started

### Option A — Automatic startup (recommended)

The root `package.json` uses `concurrently` to run both backend and frontend together:
```json
{
  "scripts": {
    "dev": "concurrently -k -n FRONT,BACK -c green,blue \"npm run front\" \"npm run back\"",
    "front": "npm --prefix frontend run dev",
    "back": "dotnet watch run --project backend"
  }
}
```

From the root folder:
```bash
npm install
npm run dev
```
Frontend logs appear in green, backend logs in blue.

### Option C — Docker (MySQL + API + frontend)

Everything runs in containers; no local MySQL, .NET or Node.js needed.

```bash
cp .env.example .env      # then edit the passwords, JWT_KEY and the first admin
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Swagger: http://localhost:5196/swagger
- On the first start the API applies the EF Core migrations (`Database__MigrateOnStartup=true`) and creates the admin from `SEED_ADMIN_*`
- MySQL data is kept in the `db-data` volume; `docker compose down -v` deletes it
- The frontend calls the API inside the Docker network (`API_URL=http://api:8080/api`); behind HTTPS set `SESSION_COOKIE_SECURE=true`

### Option B — Manual startup

**Backend:**
```bash
cd backend
dotnet build
```
Create `appsettings.json` (it is git-ignored; see `appsettings.json.sample.txt`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=medicalclinics;user=root;password=yourpassword"
  },
  "Jwt": {
    "Key": "a-random-secret-of-at-least-32-characters",
    "Issuer": "ClinicBooking",
    "Audience": "ClinicBooking",
    "ExpiryMinutes": 60
  },
  "SeedAdmin": {
    "Email": "admin@novamed.no",
    "Password": "a-strong-password",
    "FullName": "Administrator"
  },
  "AllowedHosts": "*"
}
```
The API refuses to start without a `Jwt:Key` of at least 32 characters.
Then:
```bash
dotnet ef database update
dotnet run
```
Swagger UI: `http://localhost:5196/swagger` (verify the port in `Properties/launchSettings.json`)

**Frontend:**
```bash
cd frontend
npm install
```
Create `.env.local` with the backend URL (see `env.local.example`):
```
API_URL="http://localhost:5196/api"
```
Then:
```bash
npm run dev
```
> ⚠️ Make sure the backend is running before starting the frontend.

## 🧪 Tests & CI

Backend tests live in `backend.Tests/` (xUnit) and need no database server:

- **Unit tests** — booking rules (working hours, weekends, overlaps), appointment and user endpoints, login, the admin seeder, and an authorization matrix that fails when a new endpoint is added without deciding who may call it
- **Integration tests** — the real API pipeline via `WebApplicationFactory` with an in-memory database: 401 without a token, 403 for Staff on admin endpoints, real JWT login, forged tokens rejected, public booking, and the login rate limit

```bash
dotnet test backend.Tests
# or from the root folder
npm test
```

**GitHub Actions** (`.github/workflows/ci.yml`) runs on every push and pull request:
- Backend: restore, build, test (results uploaded as an artifact)
- Frontend: `npm ci`, lint, type check, production build

## 🔐 CORS Configuration

All origins, headers, and methods are currently allowed (development setting):
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});
```

## 📝 Notes

- Only non-sensitive personally identifiable information is stored
- DTOs shape all API responses to avoid leaking EF Core entities directly
- XML comments are included throughout for Swagger documentation
- NOVAMED, its texts and images are placeholders and have no relation to any real clinic

## 📚 References

1. Noroff Learning Resources — Front-End Technologies (Module 4), Back-End Technologies
2. The author's own [Movie Theater project](https://github.com/devrimsavas/Movie_Theater_New) — reused for Next.js component structure
3. [DayPilot](https://code.daypilot.org) — appointment calendar component
