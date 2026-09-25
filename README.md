# SwasthOne — Integrated Frontend + Backend

## Integration status
The frontend and backend have been wired together for the main demo flow. The integrated package was audited against the uploaded frontend and backend versions; several connection and workflow issues were corrected, including API wiring, referral/follow-up tracking, role handling, the malformed Screening schema, and duplicate JSX attributes.

This package combines the latest uploaded frontend app-shell with the fixed Express/MongoDB backend.

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI and JWT_SECRET in .env
npm install
npm run dev
```

Default backend port: **5050**.

Health check:

```bash
curl http://localhost:5050/api/health
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Frontend API target: `http://localhost:5050/api`

## Test account

Use an existing backend account or create one through:

```bash
curl -X POST http://localhost:5050/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test ASHA","email":"testasha@example.com","password":"Test@123","role":"health_worker"}'
```

Then log in from the frontend.

## Integrated workflow

Login → patient registration → screening → rPPG result persistence → TrustScore → backend triage → referral → patient record → follow-up.

## rPPG note

The browser rPPG screen currently uses the project's prototype/demo measurement values (HR 72, motion 0.1, TrustScore 86) and persists them through `/api/rppg`. The uploaded ALIVE repository is a research/training codebase rather than a ready HTTP inference service, so production ML inference is not claimed by this package.

## Important

Do not commit `.env` files, JWT secrets, or database credentials.


## Main demo flow

1. Login as an ASHA/ANM (backend role: `health_worker`).
2. Register a patient.
3. Capture symptoms/manual vitals.
4. Run the 30-second prototype rPPG screen.
5. Persist the rPPG result and TrustScore.
6. Run backend triage.
7. Create a referral using facility data from the backend.
8. Track and advance the referral status.
9. Open the longitudinal patient record.
10. Schedule a follow-up.

## Prototype limitations

- The browser rPPG screen still uses the project's demo values (HR 72, motion 0.1, TrustScore 86). It is wired to persistence, but it is not a production ML inference service.
- Offline screens can continue locally, but a full background synchronization engine is not included yet.
- Patient self-login is intentionally not enabled because the supplied backend provisions `health_worker`, `doctor`, and `admin` accounts, not patient accounts.
- ABDM/eSanjeevani are not claimed as live integrations.

### Authentication

The app supports three frontend roles: Patient, ASHA/ANM, and Doctor/Medical Officer. Patient self-sign-up is available from the public entry screen; ASHA/ANM and doctor accounts are intended to be provisioned/registered by an authorized project administrator or backend workflow. If `JWT_SECRET` is omitted for local development, the backend generates a temporary process-level secret and warns in the terminal; set a real `JWT_SECRET` for shared/production deployments.
