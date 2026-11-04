import type { TextGenerationPipeline } from '@huggingface/transformers'

// CPU/WASM browser inference. This path does not require WebGPU.
const MODEL_ID = 'onnx-community/SmolLM2-135M-Instruct-ONNX'
let generatorPromise: Promise<TextGenerationPipeline> | null = null

export async function checkLocalAI(): Promise<boolean> {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine
}

async function getGenerator(): Promise<TextGenerationPipeline> {
  if (!generatorPromise) {
    generatorPromise = import('@huggingface/transformers').then(async ({ pipeline, env }) => {
      env.allowLocalModels = false
      return await pipeline('text-generation', MODEL_ID, {
        dtype: 'q4',
        progress_callback: (progress: unknown) => {
          window.dispatchEvent(new CustomEvent('novaverse-ai-progress', { detail: progress }))
        },
      }) as TextGenerationPipeline
    }).catch((error) => {
      generatorPromise = null
      throw error
    })
  }
  return generatorPromise
}

export async function askLocalAI(message: string): Promise<string> {
  if (!navigator.onLine) throw new Error('Connect to the internet for the first model download, then try again.')
  const generator = await getGenerator()
  const messages = [
    { role: 'system' as const, content: 'You are NOVA AI, a friendly educational assistant. Explain in clear, simple steps. Answer briefly and accurately. If the user asks in Telugu, reply in Telugu. If you do not know, say so.' },
    { role: 'user' as const, content: message },
  ]
  const output = await generator(messages, {
    max_new_tokens: 220,
    temperature: 0.7,
    do_sample: true,
  }) as Array<{ generated_text: string | Array<{ role: string; content: string }> }>
  const generated = output[0]?.generated_text
  if (Array.isArray(generated)) return generated.at(-1)?.content?.trim() || 'Please try asking in a different way.'
  if (typeof generated === 'string') return generated.trim()
  return 'I could not generate a response. Please try again.'
}
