# SwasthOne Demo Accounts

The demo accounts are created locally from the backend using:

```powershell
npm run seed:demo-users
```

This command uses `backend/.env` and upserts the demo users into the configured MongoDB database. It does not add an account-creation button to the UI.

| Role | Email | Password |
| --- | --- | --- |
| ASHA / ANM | `asha@swasthone.demo` | `Demo@123` |
| Doctor / Medical Officer | `doctor@swasthone.demo` | `Demo@123` |
| Administrator | `admin@swasthone.demo` | `Demo@123` |

These are prototype/demo credentials only. Change them before any shared or production deployment.

> This file is developer/project documentation only. It is not displayed inside the SwasthOne UI.
