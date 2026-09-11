# Corazón Aventurero · Dashboard (frontend)

Dashboard web para la operación de Corazón Aventurero: tours, buses, viajes,
pasajeros y usuarios. Consume la API de
[`dashboard-transporte-backend`](https://github.com/whisgelGonzalezDev/dashboard-transporte-backend).

- **Landing pública (`/`)**: vista principal al desplegar. Muestra los tours
  activos (imagen, título, precio y descripción breve) obtenidos de
  `GET /tours/active`.
- **Panel administrativo (`/admin/*`)**: CRUD completo sobre los 5 recursos
  del backend — tours, buses, viajes, pasajeros y usuarios.

## Stack

React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, TanStack Query, Axios.

## Desarrollo

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:3000
npm run dev
```

## Build

```bash
npm run build
```
