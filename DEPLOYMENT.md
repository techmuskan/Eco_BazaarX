# EcoBazaarX Deployment Guide

## What to deploy

- Backend: `Backend/SignupForm/SignupForm`
- Frontend: `Frontend`

Use `Frontend/` as the deployable React app. The lowercase `frontend/` folder exists in the repo, but this hardening pass targets the uppercase `Frontend/` app.

## 1. Backend environment

Copy values from:

- `Backend/SignupForm/SignupForm/.env.example`

Set these in your deployment platform or shell:

- `SERVER_PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JPA_DDL_AUTO`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`
- `APP_PUBLIC_BASE_URL`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION_MS`
- `BOOTSTRAP_ADMIN_ENABLED`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_PHONE`
- `APP_SIGNUP_ADMIN_ENABLED`

## 2. Frontend environment

Copy values from:

- `Frontend/.env.example`

Required:

- `REACT_APP_API_BASE_URL`

Example production value:

```env
REACT_APP_API_BASE_URL=https://api.your-domain.com
```

## 3. Local verification

Backend:

```bash
cd Backend/SignupForm/SignupForm
mvn test
mvn spring-boot:run
```

Frontend:

```bash
cd Frontend
npm install
npm run build
```

## 4. First admin setup

Public signup creates only shopper accounts. Admin access is intentionally provisioned separately.

Local or staging first-admin flow:

1. Set `BOOTSTRAP_ADMIN_ENABLED=true`
2. Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`
3. Start the backend once
4. Log in from the frontend with the provisioned admin credentials
5. After the first admin exists, set `BOOTSTRAP_ADMIN_ENABLED=false` again

This keeps public registration safe while still giving you a predictable admin onboarding flow.

Optional demo mode:

1. Set `APP_SIGNUP_ADMIN_ENABLED=true`
2. Users can choose `Admin Account` from the signup form
3. Turn it back to `false` after the demo if you do not want open admin self-signup

## 5. Production checklist

1. Use a strong `APP_JWT_SECRET`
2. Set `BOOTSTRAP_ADMIN_ENABLED=false` after first setup unless intentionally needed
3. Update `APP_CORS_ALLOWED_ORIGINS` to your real frontend domain
4. Set `APP_PUBLIC_BASE_URL` to your real backend public URL
5. Set `REACT_APP_API_BASE_URL` to the deployed backend URL
6. Use a real production MySQL database
7. Confirm mail credentials are app-specific and not personal account secrets in source

## 6. Current deployment posture

This project is now suitable for demo/staging deployment with environment-based config. Before public production exposure, you should still do:

1. End-to-end smoke testing
2. Rate limiting / abuse protection
3. HTTPS-only deployment
4. Better error monitoring and logging
5. Optional Docker or CI/CD setup if you want repeatable one-command deploys
