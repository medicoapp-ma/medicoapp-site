MEDICOAPP.MA — QUICK SETUP
===========================

Purpose
-------
Minimal public landing page for medicoapp.ma.
It contains no application code, patient data, analytics, cookies, or third-party assets.

Recommended hosting
-------------------
GitHub Pages using a SEPARATE PUBLIC repository, for example:
    medicoapp-site

Do NOT put these files inside the private MedicoApp application repository.

Files
-----
index.html      Website
CNAME           Custom domain for GitHub Pages
.nojekyll       Serve static files directly
robots.txt      Search-engine crawler policy
sitemap.xml     Minimal sitemap

DNS records for medicoapp.ma (GitHub Pages)
-------------------------------------------
At the DNS provider, configure these A records for the ROOT / @ host:

    @    A    185.199.108.153
    @    A    185.199.109.153
    @    A    185.199.110.153
    @    A    185.199.111.153

For www, use:

    www  CNAME  <YOUR-GITHUB-USERNAME>.github.io

IMPORTANT:
- Do not delete or modify MX records used by email.
- Do not delete SPF/DKIM/DMARC TXT/CNAME records used by email.
- Replace only conflicting web records for @ / www.
- Do not create wildcard DNS records such as *.
- GitHub recommends verifying the custom domain before changing DNS.

GitHub Pages
------------
1. Create a NEW PUBLIC repository named medicoapp-site.
2. Upload the five files from this folder to the repository root.
3. Repository Settings > Pages.
4. Source: Deploy from a branch.
5. Branch: main / root.
6. Custom domain: medicoapp.ma
7. Save.
8. After DNS is correct, enable Enforce HTTPS when available.

After publication
-----------------
Open:
    https://medicoapp.ma

Verify that the page loads over HTTPS and shows:
    Published by Atlasline LLC

Then use this exact URL in Microsoft Store Developer:
    https://medicoapp.ma

Microsoft account email
-----------------------
Use the private individual work email already created on the domain for Partner Center.
Do not publish that private account email on this website.

Last updated: 2026-07-29
