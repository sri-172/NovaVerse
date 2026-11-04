# NOVAverse

**Explore. Discover. Create. Evolve.**

An immersive, open-source 3D knowledge universe with nine explorable worlds and optional local AI through Ollama.

## Stack
- React, TypeScript and Vite
- Three.js, React Three Fiber and Drei
- Ollama for local open-source AI (optional)
- FastAPI local companion for the Ollama connection
- GitHub Actions and GitHub Pages

## Run the website
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Local AI (optional)
1. Install Ollama from https://ollama.com/.
2. Pull a model, for example `ollama pull qwen2.5:3b`.
3. In `server/`, install `requirements.txt` and run `uvicorn app:app --host 127.0.0.1 --port 8000`.
4. Keep the companion running on your own computer and use the AI panel in NOVAverse.

The public GitHub Pages site is static. AI inference runs on the visitor's own machine; no hosted AI endpoint or paid API is included.

## Deploy
Push to `main`. The GitHub Actions workflow builds the Vite app and deploys `dist/` to GitHub Pages. Enable GitHub Pages with **GitHub Actions** as the build and deployment source in repository Settings if it is not already enabled.

## Security
No API keys or credentials are stored in the frontend. The local companion binds to loopback by default and is intended for local use only.

## License
MIT