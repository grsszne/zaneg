# Laser asset hosting

The viewers load automatically near the viewport. Their GLBs are fetched by the
browser directly from jsDelivr's GitHub CDN. STEP download links go directly to a
GitHub release. Neither path proxies the large response through Vercel.

The source exports remain in `public/models/laser` for local conversion and Git
history. Next.js redirects all eight old `.glb`/`.step` URLs before static-file
serving, preserving bookmarks without sending the file bodies from Vercel.

`src/app/lib/laser-assets.mjs` owns the model list, source commit, release tag,
URLs and legacy redirects. Both PCB and mechanical viewers use it.

## Current version

- Source commit: `d08d7f54adeec0b196e6750ff64e2db045c7b141`
- STEP release: `https://github.com/grsszne/zaneg/releases/tag/laser-assets-2026-10-31`
- Release assets: `usb-interface.step`, `tx-a.step`, `rx-a.step`, `laser-sled.step`
- `SHA256SUMS.txt` records the STEP checksums; GitHub's upload digests were checked
  against the source files before the release was published.

The `.glb` files are self-contained. No external buffers or textures need another
host. Their current sizes are 6.5–19.1 MB, below jsDelivr's default 20 MB single-file
limit for GitHub assets.

## Publishing a new export

1. Rebuild with the procedures in `PCB-MODELS.md` or `MECHANICAL-MODEL.md`.
2. Commit and push the new exports so their full commit SHA is accessible publicly.
3. Upload the matching STEP files and checksums to a new GitHub release. Use a
   separate asset release tag; it does not need to become the repository's latest
   software release. Verify each uploaded size and SHA-256 digest.
4. Update `LASER_ASSET_COMMIT` and `LASER_STEP_RELEASE` in `laser-assets.mjs`.
5. Verify every CDN URL returns 200 and `Access-Control-Allow-Origin: *`, and every
   STEP link reaches a downloadable attachment. Keep GLBs below the CDN file-size
   limit, or use an appropriate asset host if the exports grow past it.
6. Build and deploy. Check that the old model paths return redirects, and that the
   browser loads models directly from `cdn.jsdelivr.net` while scrolling.

Use full commit hashes for CDN URLs, not moving branch names. Keep previous asset
releases available so older deployments and cached pages keep working.
