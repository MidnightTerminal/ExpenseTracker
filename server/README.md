# Expense Tracker API

This server keeps MongoDB credentials off the Expo client. It provides:

- `POST /auth/register`
- `POST /auth/login`
- `GET /sync`
- `PUT /sync`

## Setup

1. Create a MongoDB Atlas free M0 cluster and a database user.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` to the Atlas connection string, including the database name.
4. Set `JWT_SECRET` to a long random value.
5. Run `npm install` and `npm start` from this directory.
6. Set the mobile app `expo.extra.apiUrl` in `app.json` to the reachable server URL, for example `http://192.168.1.20:3000` for a physical device on the same Wi-Fi.

Do not put `MONGODB_URI`, the database password, or `JWT_SECRET` in `app.json` or the mobile app.
