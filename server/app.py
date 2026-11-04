"""NOVAverse local AI companion. Runs only on loopback; no cloud API keys."""
from typing import Literal
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="NOVAverse Local AI", version="1.0.0")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sri-172.github.io",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    model: Literal["qwen2.5:3b", "llama3.2:3b", "gemma3:4b", "mistral:7b"] = "qwen2.5:3b"

@app.get("/api/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=2.5) as client:
            response = await client.get("http://127.0.0.1:11434/api/tags")
            response.raise_for_status()
            models = [item.get("name", "") for item in response.json().get("models", [])]
        return {"ok": True, "ollama_connected": True, "models": models}
    except (httpx.HTTPError, ValueError):
        return {"ok": True, "ollama_connected": False, "models": []}

@app.post("/api/chat")
async def chat(payload: ChatRequest):
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                "http://127.0.0.1:11434/api/chat",
                json={
                    "model": payload.model,
                    "stream": False,
                    "messages": [
                        {"role": "system", "content": "You are NOVA, a helpful, accurate, curious learning companion inside NOVAverse. Explain clearly, distinguish established facts from uncertainty, and never invent citations."},
                        {"role": "user", "content": payload.message},
                    ],
                },
            )
            response.raise_for_status()
            data = response.json()
            answer = data.get("message", {}).get("content", "").strip()
            if not answer:
                raise HTTPException(status_code=502, detail="The selected local model returned an empty response.")
            return {"response": answer, "model": payload.model}
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Ollama is not running at 127.0.0.1:11434.")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="The local model took too long to respond.")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f"Ollama returned HTTP {exc.response.status_code}. Check that the model is installed.")