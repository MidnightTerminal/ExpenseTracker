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
6. Deploy this API to a public HTTPS host before creating an APK. Set `EXPO_PUBLIC_API_URL` in EAS for the environment used by the build. A local LAN URL such as `http://192.168.1.20:3000` only works while the phone and computer are on the same network, and should not be used for production builds.

## EAS build configuration

Create one public API URL per EAS environment. The URL is intentionally public because it is embedded in the mobile app; keep MongoDB credentials and `JWT_SECRET` on the server only.

```sh
eas env:set --name EXPO_PUBLIC_API_URL --value https://your-api.example.com --environment preview --visibility plaintext
eas env:set --name EXPO_PUBLIC_API_URL --value https://your-api.example.com --environment production --visibility plaintext
eas build --platform android --profile preview
```

For a store build, use `eas build --platform android --profile production`. Verify the deployed server first by opening `https://your-api.example.com/health` and checking for `{ "ok": true }`.

## How user data is stored

MongoDB contains one `User` document per account in the database named by `MONGODB_URI`:

```text
User {
	_id,
	email,                         // lowercased and unique
	passwordHash,                  // bcrypt hash; the plaintext password is never stored
	data: {
		expenses: [...],
		categories: [...],
		budget: { monthlyLimit, categoryLimits }
	},
	createdAt,
	updatedAt
}
```

After registration or sign-in, the API returns a JWT. The app stores that token in Android Secure Store and sends it as a Bearer token. The server reads the token's user id and only reads or updates that user's `data` object through `/sync`, so accounts do not share expense records. AsyncStorage also keeps a device-local cache; it is not the source of truth for cloud backup.

Do not put `MONGODB_URI`, the database password, or `JWT_SECRET` in `app.json` or the mobile app.
