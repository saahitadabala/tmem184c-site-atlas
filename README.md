# TMEM184C Site Atlas

TMEM184C in its membrane, with every functional site clickable and the evidence
behind each one. Entirely client-side — 3Dmol.js, no database, no accounts.

## Deploying to Railway

1. Create a new GitHub repo, e.g. `tmem184c-site-atlas`.
2. From this folder:

       git init
       git add .
       git commit -m "TMEM184C Site Atlas"
       git branch -M main
       git remote add origin https://github.com/<you>/tmem184c-site-atlas.git
       git push -u origin main

3. In Railway: **New Project → Deploy from GitHub repo →** pick that repo.
   Nothing else to configure — the `Procfile` and `requirements.txt` are enough,
   and Railway supplies `PORT`.
4. **Settings → Networking → Generate Domain** for a public URL.

No environment variables. No database. It is a separate project from any other
app in your Railway account.

## Rebuilding the page

`public/` is generated — do not edit it by hand. The source lives in
`../app`, and the build adds the document skeleton that the Artifact platform
normally supplies:

    cd ../build
    python make_standalone.py "../deploy/public"

## Running locally

    pip install -r requirements.txt
    python server.py        # http://127.0.0.1:8000

## Notes

- The shared editable notes (rationale, hypothesis, added evidence) only work in
  the Claude Artifact version, which provides `window.claude`. Here the page runs
  read-only against the registry baked into `public/js/data/sites.js`, and the
  panel header says so.
- Individual sites are linkable: `/#W334`.
