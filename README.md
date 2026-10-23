# CollabSphere — Full-stack project

A developer collaboration workspace with projects, project notes, shared files, team invitations, and Gemini-powered code/documentation tools.

## Project structure

- `backend/` — Express, MongoDB/Mongoose, JWT authentication, uploads, and AI endpoints.
- `frontend/` — React + Vite application with responsive styling.

## Requirements

- Node.js 20+ recommended
- MongoDB connection string
- Gemini API key for AI Studio features

## Configure the backend

1. Open a terminal in `backend/`.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`.
4. Set `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` in `backend/.env`.
5. Start the API: `npm run dev` (or `npm start`).

The backend listens on port `5000` by default. The default CORS origin is `http://localhost:5173`.

## Configure the frontend

1. Open another terminal in `frontend/`.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` if you use a non-default API address.
4. Start Vite: `npm run dev`
5. Open the local URL printed by Vite, usually `http://localhost:5173`.

Frontend API URL defaults to `http://localhost:5000/api`; override it with `VITE_API_URL` if needed.

## Connected API features

- Register and login (`/api/auth`)
- Authenticated profile (`/api/auth/profile`)
- Project CRUD and adding collaborators (`/api/projects`)
- Project notes (`/api/projects/:id/notes`, `/api/notes/:id`)
- Project file upload/list/delete (`/api/files/:projectId/files`)
- AI code explanation, README generation, and documentation (`/api/ai`)

## Notes

- Never commit `.env` files, MongoDB credentials, JWT secrets, or Gemini API keys.
- The backend currently accepts JPG, PNG, PDF, and TXT uploads up to 5 MB.
- Profile display fields are stored locally in the browser because the existing backend does not expose a profile-update endpoint.
- AI Studio requires a valid `GEMINI_API_KEY` and a model available to your Google AI account.
