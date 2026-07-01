# School Infrastructure Management

A web application for monitoring and managing school infrastructure in the **Amoron'i Mania** region.

## Tech Stack

* Next.js
* NestJS
* Supabase
* TypeScript

## Features

* School infrastructure management
* Centralized data storage
* Secure authentication
* Dashboard for monitoring infrastructure status

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Andrififaliana/Infra-Dren-AMM.git
cd Infra-Dren-AMM
```

### Install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### Configure environment variables

Copy the `.env.example` file in both the **frontend** and **backend** directories, rename it to `.env`, and replace the placeholder values with your own configuration.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Then update each `.env` file with your own Supabase credentials and other required environment variables.

### Run the project

```bash
# Frontend
npm run dev

# Backend
npm run start:dev
```

## Project Structure

```text
frontend/    # Next.js application
backend/     # NestJS API
```

## License

This project was developed for academic purposes.
