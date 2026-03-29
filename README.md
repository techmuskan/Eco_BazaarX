# EcoBazaarX

EcoBazaarX is a full-stack role-based e-commerce platform built with React, Spring Boot, and MySQL. The application supports three main experiences:

- `USER`: shopping, cart, wishlist, checkout, orders, sustainability insights
- `SELLER`: store profile, product management, seller orders, fulfillment workflow
- `ADMIN`: platform dashboard, seller approvals, user-role management, catalog moderation

## Tech Stack

- Frontend: React, React Router, Axios, React Icons
- Backend: Spring Boot, Spring Security, Spring Data JPA, JWT
- Database: MySQL
- Mail: Spring Mail for OTP / password reset workflows
- Testing: Maven test suite, React build validation

## Current Platform Structure

### Public entry

- `/` public landing page
- `/login`
- `/signup`
- `/forgot-password`

### User workspace

- `/user/dashboard`
- `/user/catalog`
- `/user/cart`
- `/user/checkout`
- `/user/payment`
- `/user/order-success`
- `/user/orders`
- `/user/wishlist`
- `/user/insights`

### Seller workspace

- `/seller/dashboard`
- `/seller/products`
- `/seller/products/new`
- `/seller/products/:id/edit`
- `/seller/orders`
- `/seller/profile`
- `/seller/catalog`

### Admin workspace

- `/admin/dashboard`
- `/admin/management`
- `/admin/catalog`
- `/admin/products/new`
- `/admin/products/:id/edit`

## Main Features

### Authentication and access control

- JWT-based login/signup flow
- Forgot password with OTP flow
- Role-based route protection
- Role-aware redirects after authentication

### User features

- Product browsing
- Cart and wishlist management
- Checkout and order placement
- Order history
- Sustainability / carbon insights

### Seller features

- Seller profile and store metadata
- Seller-owned product management
- Seller order view
- Fulfillment status updates
- Approval-based seller workflow

### Admin features

- Admin overview dashboard
- User role management
- Seller approval queue
- Catalog moderation
- Platform metrics and emission trends

## Project Structure

```text
EcoBazaarX/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
├── Backend/
│   └── SignupForm/
│       └── SignupForm/
│           ├── src/main/java/com/SignupForm/
│           ├── src/main/resources/
│           └── pom.xml
```

## Local Setup

### Prerequisites

- Node.js and npm
- Java 21
- Maven
- MySQL running locally

### Frontend configuration

Copy from `Frontend/.env.example` and create `Frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Backend configuration

Backend configuration is in:

- `Backend/SignupForm/SignupForm/src/main/resources/application.properties`

Important values:

- `SERVER_PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `APP_JWT_SECRET`
- `APP_CORS_ALLOWED_ORIGINS`

It is recommended to override these with environment variables instead of relying on defaults.

For a ready-to-copy backend template, use:

- `Backend/SignupForm/SignupForm/.env.example`

For a ready-to-copy frontend template, use:

- `Frontend/.env.example`

## Running The Project

### 1. Start the backend

```bash
cd Backend/SignupForm/SignupForm
mvn spring-boot:run
```

Backend default URL:

```text
http://localhost:8080
```

### 2. Start the frontend

```bash
cd Frontend
npm install
npm start
```

Frontend default URL:

```text
http://localhost:3000
```

## Build And Validation

### Frontend build

```bash
cd Frontend
npm run build
```

### Backend tests

```bash
cd Backend/SignupForm/SignupForm
mvn test
```

## Development Notes

- The platform now uses SaaS-style route separation instead of one mixed dashboard.
- Some legacy alias routes still exist for backward compatibility, but canonical routes are role-based.
- Seller accounts are approval-aware.
- Admin flows are split into overview, management, and catalog workspaces.
- Sustainability insights depend on order data being present for the logged-in user.

## Status

The project has been refactored from a simple login/signup marketplace into a more structured role-based platform with:

- separate user, seller, and admin flows
- seller profile domain support
- admin approval and catalog governance
- cleaner route architecture
- public landing page for login/signup entry
