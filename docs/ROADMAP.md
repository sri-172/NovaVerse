# NOVAverse roadmap

## Initial release implemented
- [x] Responsive React + TypeScript application shell
- [x] Interactive Three.js / React Three Fiber universe
- [x] Nine selectable world portals and world profiles
- [x] Searchable world navigation
- [x] Local Ollama AI companion UI and FastAPI bridge
- [x] Browser-local personal notes
- [x] GitHub Pages build and deployment workflow

## Next milestones
- [ ] Add focused tools inside each world (science simulations, timeline, research organizer, creator canvas)
- [ ] Add document ingestion and local retrieval-augmented generation
- [ ] Add multilingual interface and Telugu learning flows
- [ ] Add local account/export/import for personal knowledge
- [ ] Add automated UI and accessibility tests
- [ ] Optimize 3D assets, lazy loading and low-power device rendering

## Local AI setup
Install Ollama, then run a model such as:
```bash
ollama pull qwen2.5:3b
```

Start the local companion:
```bash
cd server
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

The website is static-hosted. AI computation remains on the visitor's own device; the public site does not provide shared cloud inference.