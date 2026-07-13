# Hero videos

Large WhatsApp exports (e.g. `IMG_8136.MP4`) are not committed to Git — they exceed GitHub's 100 MB limit.

**Local dev:** copy your video here as `IMG_8136.MP4`.

**Production (Vercel):** upload the video to your host's static storage, or run `npm run compress-video` and commit only `hero-compressed.mp4` (typically under 20 MB).
