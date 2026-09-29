# UPSale

MERN-style monorepo with **Next.js** (frontend + admin) and **NestJS** (backend) + **MongoDB**.

## Structure

```
UPSale/
├── frontend/   # Business Owner Dashboard + (later) customer QR pages (port 3000)
├── backend/    # NestJS API + MongoDB (port 4000)
└── admin/      # Super Admin console (port 3001)
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

## Setup

```bash
npm install
```

Copy env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env.local
```

## Run

```bash
# frontend + admin only (no MongoDB needed)
npm run dev

# everything including NestJS API (MongoDB required)
npm run dev:all

# individually
npm run dev:frontend
npm run dev:admin
npm run dev:backend
```

| App | URL | Role |
|-----|-----|------|
| Frontend | http://localhost:3000 | Business owner dashboard (`/login`, offers, customers…) |
| Admin | http://localhost:3001 | Super admin (platform) |
| Backend | http://localhost:4000/api | NestJS API |

## Tech stack

- **Frontend / Admin**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, MongoDB (Mongoose), TypeScript
- **Shared**: npm workspaces
