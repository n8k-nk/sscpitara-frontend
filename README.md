# SSC Pitara web frontend

The public site uses the Next.js App Router and server-rendered HTML. Django remains the backend for the catalogue, published study material, PostgreSQL, accounts, assessments, billing and the editorial admin. The Next.js server reads public JSON from Django and forwards the authenticated routes to it on the same origin during the migration.

Clone the two repositories side by side and start Django.

```sh
git clone https://github.com/n8k-nk/sscpitara-frontend.git frontend
git clone https://github.com/n8k-nk/sscpitara-backend.git backend
```

See [the backend setup notes](https://github.com/n8k-nk/sscpitara-backend/blob/main/TECH_STACK.md#run-locally) for prerequisites. From the directory containing both clones, run the following.

```sh
cd backend
./scripts/setup
.venv/bin/python manage.py runserver 127.0.0.1:8024
```

Run the frontend in a second terminal from the directory containing both clones.

```sh
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:3000/. For a production build configure DJANGO_ORIGIN as the internal backend origin and SITE_URL as the canonical public HTTPS origin before running npm run build and npm start. Set Django PUBLIC_FRONTEND_URL and DJANGO_CSRF_TRUSTED_ORIGINS to the matching public origin. Set the Django allowed hosts for the deployed backend and forward protected routes through the same public origin. Local frontend pages send noindex. The production sitemap lists published exam pages and the public learning and study coverage pages.

The Next.js pages replace the Django directory template. The learner area, forms, pass management and admin use the existing Django views until those workflows have React equivalents.
