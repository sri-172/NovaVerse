export type World = {
  id: string
  name: string
  eyebrow: string
  description: string
  color: string
  icon: string
  position: [number, number, number]
  features: string[]
  prompt: string
}

export const worlds: World[] = [
  { id: 'ai', name: 'AI World', eyebrow: 'INTELLIGENCE', description: 'Meet your local AI companion, explore ideas and turn questions into clear answers.', color: '#8b7cff', icon: '✳', position: [0, 3.8, 0], features: ['Local AI companion', 'Ask and explore', 'Prompt workspace'], prompt: 'Explain an interesting breakthrough in artificial intelligence.' },
  { id: 'knowledge', name: 'Knowledge World', eyebrow: 'DISCOVERY', description: 'Connect concepts, collect notes and build your own expanding knowledge galaxy.', color: '#55d6c2', icon: '⌘', position: [3.4, 1.9, 0], features: ['Knowledge explorer', 'Personal notes', 'Concept connections'], prompt: 'Show me how mathematics, science and philosophy connect.' },
  { id: 'science', name: 'Science World', eyebrow: 'EXPERIMENT', description: 'Explore scientific ideas through interactive explainers and safe virtual experiments.', color: '#54a9ff', icon: '⚛', position: [3.4, -2, 0], features: ['Physics playground', 'Chemistry concepts', 'Biology explorer'], prompt: 'Teach me a fascinating science experiment I can safely understand.' },
  { id: 'history', name: 'History World', eyebrow: 'TIME & CIVILIZATION', description: 'Journey through civilizations, timelines and the events that shaped humanity.', color: '#ffbd70', icon: '⌛', position: [0, -3.9, 0], features: ['Civilization timeline', 'Historical questions', 'Past and present'], prompt: 'Take me on a guided journey through the Indus Valley Civilization.' },
  { id: 'future', name: 'Future World', eyebrow: 'POSSIBILITY', description: 'Imagine tomorrow with scenario exploration, emerging technologies and future cities.', color: '#e78aff', icon: '◈', position: [-3.4, -2, 0], features: ['Future 2100', 'What-if scenarios', 'Emerging technology'], prompt: 'Explore three plausible ways artificial intelligence could change life by 2100.' },
  { id: 'creator', name: 'Creator World', eyebrow: 'IMAGINATION', description: 'Transform rough ideas into structured stories, plans, presentations and projects.', color: '#ff8fa9', icon: '✧', position: [-3.4, 1.9, 0], features: ['Idea studio', 'Writing assistant', 'Project canvas'], prompt: 'Help me transform a simple idea into a creative project plan.' },
  { id: 'research', name: 'Research World', eyebrow: 'EVIDENCE & INSIGHT', description: 'Organize research questions, evaluate evidence and build source-aware study notes.', color: '#7bd59a', icon: '⌕', position: [-1.8, 0, 2.7], features: ['Research planner', 'Evidence checklist', 'Study notes'], prompt: 'Help me create a research plan with questions, evidence and limitations.' },
  { id: 'language', name: 'Language World', eyebrow: 'COMMUNICATION', description: 'Practice languages, translate ideas and build confidence through conversation.', color: '#f0d16e', icon: '文', position: [1.8, 0, 2.7], features: ['English and Telugu', 'Translation practice', 'Conversation prompts'], prompt: 'Teach me five useful English expressions with Telugu explanations.' },
  { id: 'personal', name: 'My Universe', eyebrow: 'YOUR SPACE', description: 'Save your discoveries, capture ideas and shape a personal universe of learning.', color: '#91a8ff', icon: '✦', position: [0, 0, -3.2], features: ['Saved discoveries', 'Personal notes', 'Learning goals'], prompt: 'Help me organize my learning goals for this month.' },
]