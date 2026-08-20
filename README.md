# Pieces of This Chapter

A mobile-first digital graduation guestbook for collecting messages, memories, prayers and encouragement through a simple shareable link or QR code.

## Included

- Editorial, mobile-first graduation landing page
- Guest message form
- Memory wall
- Mood/emoji selection
- QR code generation for the current guestbook URL
- Copy-link sharing
- Local browser persistence with `localStorage`
- Responsive desktop layout
- No backend required for the static demo

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Deploy

This is a static site and can be deployed directly to Vercel, GitHub Pages, Netlify, or another static host. The QR code automatically encodes the deployed page URL.

> Note: the current version stores submitted messages in the visitor's browser via localStorage. For a real shared guestbook where every visitor sees the same messages, connect the form to a database/API in the next phase.
