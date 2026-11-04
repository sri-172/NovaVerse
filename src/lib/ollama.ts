import type { MLCEngine } from '@mlc-ai/web-llm'

// NOVAverse runs its model inside the browser. No Ollama, local server, or API key.
const DEFAULT_MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
let enginePromise: Promise<MLCEngine> | null = null

export async function checkLocalAI(): Promise<boolean> {
  try {
    if (!('gpu' in navigator)) return false
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu
    if (!gpu) return false
    return Boolean(await gpu.requestAdapter())
  } catch {
    return false
  }
}

async function getEngine(model = DEFAULT_MODEL): Promise<MLCEngine> {
  if (!enginePromise) {
    enginePromise = import('@mlc-ai/web-llm').then(({ CreateMLCEngine }) =>
      CreateMLCEngine(model, {
        initProgressCallback: (progress) => {
          window.dispatchEvent(new CustomEvent('novaverse-ai-progress', { detail: progress }))
        },
      }),
    ).catch((error) => {
      enginePromise = null
      throw error
    })
  }
  return enginePromise
}

export async function askLocalAI(message: string, model = DEFAULT_MODEL): Promise<string> {
  if (!(await checkLocalAI())) {
    throw new Error('This browser or device does not support WebGPU. Please use an up-to-date Chrome or Edge browser with graphics acceleration enabled.')
  }
  const engine = await getEngine(model)
  const result = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are NOVA AI, a helpful educational assistant. Explain clearly, accurately, and step by step. Support English and Telugu when asked. If uncertain, say so.' },
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 700,
  })
  return result.choices[0]?.message.content?.toString() || 'I could not generate a response. Please try again.'
}
