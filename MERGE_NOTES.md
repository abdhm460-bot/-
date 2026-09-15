# Complete merge

- The first project remains the operational base, preserving its API, Neon database, encrypted IBAN flow, Blob upload flow, admin page, and application form.
- The canonical application page is `portal.html` and uses the original working `/api/applications` flow.
- The canonical tracking page is `track.html`, connected to the new `/api/track` endpoint.
- The reference website pages/assets are preserved under `foundation/`.
- Do not deploy or present the portal as an official organization website without the required authorization and clear ownership disclosures.
- Required environment variables remain those used by the first project, including DATABASE_URL, BLOB_READ_WRITE_TOKEN, IBAN_ENCRYPTION_KEY, and admin configuration.
