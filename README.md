# CANOVA - MERN Final Evaluation

CANOVA is a full-stack form builder and response analysis platform built with React, Node.js, Express, and MongoDB.

## Tech Stack

- Frontend: React (Create React App), Vanilla CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT

## Repository Structure

```text
MERN - Final Evaluation/
  backend/
    src/
      config/
      middleware/
      models/
      routes/
      services/
      index.js
  frontend/
    src/
      components/
      context/
      pages/
      services/
```

## Features

- Authentication: signup, login, forgot password, OTP verification, reset password
- Dashboard modules: home, recent work, shared content, analysis, projects, profile, settings
- Form builder:
  - create project with initial form
  - create additional forms under a project
  - multi-page sections
  - question types (short answer, long answer, MCQ, dropdown, date, linear scale, rating)
  - text/image/video blocks
  - condition flow setup
  - autosave and manual save
  - publish and share
- Response collection on public form links
- Analysis and export actions
- Profile editing and theme setting (light/dark)

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (local installation or MongoDB Atlas URI)

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd "MERN - Final Evaluation"
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/canova
JWT_SECRET=replace_with_secure_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_SERVICE=
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

Start backend:

```bash
npm run dev
```

Backend will run on `http://localhost:5001`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5001
```

Start frontend:

```bash
npm start
```

Frontend will run on `http://localhost:3000`.

## Scripts

### Backend

- `npm run dev` - run backend with nodemon
- `npm start` - run backend with node

### Frontend

- `npm start` - run frontend in development mode
- `npm run build` - production build
- `npm test` - run tests

## Environment Notes

- If SMTP credentials are missing, OTP email delivery will not work in production.
- For local development, OTP fallback can be returned in API response depending on backend configuration.
- Make sure `REACT_APP_API_URL` points to the backend URL you are running.

## Main API Routes (Summary)

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `PATCH /api/auth/settings`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/recent`
- `PATCH /api/projects/:id/rename`
- `POST /api/projects/:id/copy`
- `POST /api/projects/:id/share`
- `DELETE /api/projects/:id`

### Forms

- `GET /api/forms`
- `POST /api/forms/project/:projectId`
- `GET /api/forms/:id`
- `PUT /api/forms/:id`
- `PATCH /api/forms/:id/rename`
- `POST /api/forms/:id/copy`
- `POST /api/forms/:id/share`
- `POST /api/forms/:id/publish`
- `DELETE /api/forms/:id`
- `GET /api/forms/:id/responses/summary`
- `GET /api/forms/:id/responses/analytics`
- `GET /api/forms/public/slug/:slug`

### Responses

- `POST /api/responses/form/:formId`

## Typical User Flow

1. Signup or login.
2. Create a project and initial form.
3. Build pages and add components/questions.
4. Save and publish the form.
5. Share public/restricted link.
6. Collect responses.
7. Track results in analysis.
8. Manage profile and settings.

## Troubleshooting

- Backend not starting:
  - check MongoDB connection string
  - verify `PORT` is free
- OTP not sending:
  - verify `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, and `EMAIL_PORT`
  - if using Gmail, use an app password
- Frontend API errors:
  - confirm `REACT_APP_API_URL` matches backend URL
  - check browser network tab for exact API response
