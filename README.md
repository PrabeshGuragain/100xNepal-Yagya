# 100xNepal-Yagya

This repository contains a small full-stack project focused on augmented-location-enabled travel tools. It combines a Python FastAPI backend, a React + Vite TypeScript frontend (TravelSphere), and a few static helpers (an AR detector example). The codebase is organized to let you run and develop the backend API and the frontend UI independently.

## Table of contents

- Project overview
- Architecture and tech stack
- Quick start (setup & run)
	- Backend (FastAPI)
	- Frontend (TravelSphere)
	- AR detector( WebAR )
- Development notes
- Testing
- Project structure
- Contributing
- Troubleshooting
- License

## Project overview

100xNepal-Yagya is an experimental project that bundles together services and a UI for location-aware travel features. The repository includes:

- `server/` — FastAPI backend providing API endpoints and services (authentication, data models, travel/agent helpers).
- `travelSphere/` — React + Vite frontend (TypeScript) implementing map-based UI and pages.
- `ar-detector/` — small example demonstrating an AR detector UI/asset.

The backend exposes endpoints and services used by the frontend. The frontend is a Vite React app that uses Leaflet for mapping and communicates with the backend for travel/AR data.

## Architecture and tech stack

- Backend: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy, pydantic and related libraries. The backend code is in `server/` and includes router modules and models.
- Frontend: React (TypeScript), Vite, Tailwind CSS (configured), React-Leaflet (Leaflet) for maps, axios for HTTP requests.
- Other: Small static examples under `ar-detector/` and a `targets/` data file.

Key libraries (from project files):

- Backend: fastapi, uvicorn, python-jose, passlib, bcrypt, python-multipart, sqlalchemy, authlib, python-dotenv, pydantic, requests, langchain + related packages.
- Frontend: react, react-dom, react-router-dom, react-leaflet, leaflet, axios, vite, typescript, tailwindcss, eslint.

## Quick start (setup & run)

These instructions assume a Windows environment (PowerShell). Adjust commands for macOS/Linux shells accordingly.

Prerequisites

- Python 3.11 or later
- Node.js (>=18 recommended) and npm or pnpm

1) Clone the repo

	git clone <your-repo-url>
	cd 100xHack

### Backend (FastAPI)

1. Create and activate a virtual environment (PowerShell):

	python -m venv .venv
	.\.venv\Scripts\Activate.ps1

2. Upgrade pip and install dependencies. The project lists dependencies in `server/pyproject.toml`. To install them with pip, run:

	python -m pip install --upgrade pip
	python -m pip install fastapi uvicorn[standard] python-jose[cryptography] passlib[bcrypt] bcrypt python-multipart sqlalchemy authlib python-dotenv pydantic-settings requests beautifulsoup4

Alternatively, if you prefer installing exactly the versions in `pyproject.toml`, create a requirements file or use a tool like poetry.

3. Run the backend (from the repository root):

	# Option A: Run the module script
	python server/main.py

	# Option B: Use uvicorn (recommended during development for auto-reload)
	cd server
	python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

The backend will be available at http://127.0.0.1:8000. Health check endpoint:

	GET /health  -> returns {"status": "healthy"}

Environment variables

The backend references `python-dotenv` in dependencies. If the app needs secrets (API keys, database URLs), create a `server/.env` file and add variables there. Example entries (adjust to what the project actually needs):

	# server/.env
	DATABASE_URL=sqlite:///./dev.db
	SECRET_KEY=replace-with-a-secure-key
	GOOGLE_API_KEY=...

### Frontend (TravelSphere)

1. Install frontend dependencies and run dev server:

	cd travelSphere
	npm install
	npm run dev

This starts Vite's dev server (default: http://localhost:5173). Use `npm run build` to create a production build and `npm run preview` to preview the built output.

If the frontend needs to call the backend during development, configure a proxy or set the backend URL in the frontend config / environment variables.

### AR detector 

The `ar-detector/` directory contains a basic HTML interface. Open `ar-detector/index.html` in a browser or serve it with a file server.

## Development notes

- Backend entrypoint: `server/main.py`. It configures CORS (currently allowing all origins) and exposes simple root and health endpoints. Add routers under `server/` (modules like `ArLocation`, `auth`, `travel`, etc.) to expand functionality.
- Frontend entrypoint: `travelSphere/src/main.tsx`. Pages live under `travelSphere/src/pages/`.
- Map UI: the frontend uses `react-leaflet` + `leaflet` for maps and interactive markers.

Edge cases & considerations

- Authentication & secrets: never commit `.env` or secrets. Use environment variables or a secrets manager.
- Database migrations: if you add SQLAlchemy models, integrate Alembic or another migration tool.
- CORS: adjust allowed origins in production instead of `*`.

## Running tests

The repository includes a small test file `test_travel_api.py`. To run tests with pytest:

	# From the repository root (with your venv activated)
	python -m pip install pytest
	python -m pytest -q

Add additional unit/integration tests under a `tests/` directory for consistent discovery.

## Project structure (high level)

- ar-detector/
	- index.html
	- data/
		- locations.json
- server/
	- main.py
	- pyproject.toml
	- ArLocation/
	- auth/
	- core/
	- db/
	- travel/
	- ... (routers, models, schemas)
- travelSphere/
	- package.json
	- src/
		- pages/
			- home.tsx
			- ArLocationMap.tsx
			- AddPlace.tsx

## Contact

If you need help running the project or want to propose changes, open an issue or a pull request in this repository.

---