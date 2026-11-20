# VisaDesk client and agent workspace

This frontend is served with the administrator workspace and API by the unified Node.js application.

Run the API package with `npm run dev` and open `http://localhost:4000`. The workspace calls `/api/v1` on the same origin. Admins can sign in at `http://localhost:4000/admin`.

See the [repository setup guide](../README.md) for local setup. Documents currently display metadata only; secure download/preview is not yet available. The starter stores JWTs in localStorage and should be reviewed for production session security.
