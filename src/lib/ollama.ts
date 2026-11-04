const LOCAL_API = 'http://127.0.0.1:8000'

export async function checkLocalAI(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_API}/api/health`, { signal: AbortSignal.timeout(2500) })
    if (!response.ok) return false
    const data = await response.json()
    return Boolean(data.ollama_connected)
  } catch {
    return false
  }
}

export async function askLocalAI(message: string, model: string): Promise<string> {
  const response = await fetch(`${LOCAL_API}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model }),
    signal: AbortSignal.timeout(120000),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.detail || 'The local AI companion could not answer.')
  return data.response as string
}