import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Html, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import type { Mesh } from 'three'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, ArrowDownRight, ArrowLeft, ArrowUpRight, Atom, BookOpen, Check, ChevronRight, CircleHelp, Compass, Globe2, Languages, Layers3, Menu, MessageCircle, Mic2, Moon, Orbit, PanelRightClose, Plus, Rocket, Search, Send, Settings2, Sparkles as SparkleIcon, StickyNote, X } from 'lucide-react'
import { worlds, type World } from './lib/worlds'
import { askLocalAI, checkLocalAI } from './lib/ollama'

function Planet({ world, selected, onSelect }: { world: World; selected: boolean; onSelect: () => void }) {
  const mesh = useRef<Mesh | null>(null)
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * (selected ? 0.34 : 0.13)
      const target = selected ? 1.22 : 1
      mesh.current.scale.lerp({ x: target, y: target, z: target } as never, 0.08)
    }
  })
  return (
    <Float speed={selected ? 2 : 1.2} rotationIntensity={0.16} floatIntensity={selected ? 0.5 : 0.24}>
      <group position={world.position}>
        <mesh ref={mesh} onClick={(event) => { event.stopPropagation(); onSelect() }}>
          <icosahedronGeometry args={[0.68, 5]} />
          <meshStandardMaterial color={world.color} roughness={0.28} metalness={0.48} emissive={world.color} emissiveIntensity={selected ? 0.72 : 0.24} />
        </mesh>
        <mesh scale={selected ? 1.42 : 1.22}>
          <sphereGeometry args={[0.72, 32, 32]} />
          <meshBasicMaterial color={world.color} transparent opacity={selected ? 0.12 : 0.045} wireframe />
        </mesh>
        {selected && <Sparkles count={24} scale={2.5} size={2.5} speed={0.45} color={world.color} />}
        <Html distanceFactor={11} position={[0, -1.05, 0]} center style={{ pointerEvents: 'none' }}>
          <div className={`planet-label ${selected ? 'active' : ''}`} style={{ '--planet': world.color } as React.CSSProperties}>
            <span>{world.icon}</span>{world.name}
          </div>
        </Html>
        <mesh position={[0, 0, 0]} scale={1.65} onClick={(event) => { event.stopPropagation(); onSelect() }}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </Float>
  )
}

function Universe({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const ring = useRef<Mesh>(null)
  useFrame((_, delta) => { if (ring.current) ring.current.rotation.z += delta * 0.035 })
  return (
    <>
      <color attach="background" args={['#080b18']} />
      <fog attach="fog" args={['#080b18', 13, 29]} />
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 4, 7]} intensity={65} color="#9b8cff" distance={24} />
      <pointLight position={[-7, -4, -4]} intensity={38} color="#36b9d3" distance={20} />
      <Stars radius={85} depth={55} count={1800} factor={3} saturation={0.3} fade speed={0.35} />
      <Sparkles count={120} scale={18} size={1.2} speed={0.18} opacity={0.45} color="#9b9bff" />
      <mesh ref={ring} rotation={[1.18, 0.2, 0.2]}>
        <torusGeometry args={[5.1, 0.008, 8, 180]} />
        <meshBasicMaterial color="#6573c7" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[0.9, 0, -0.35]}>
        <torusGeometry args={[4.25, 0.006, 8, 180]} />
        <meshBasicMaterial color="#48c8cf" transparent opacity={0.18} />
      </mesh>
      {worlds.map(world => <Planet key={world.id} world={world} selected={selectedId === world.id} onSelect={() => onSelect(world.id)} />)}
      <OrbitControls enablePan={false} minDistance={9} maxDistance={20} minPolarAngle={0.55} maxPolarAngle={2.55} autoRotate autoRotateSpeed={0.22} />
    </>
  )
}

function App() {
  const [selectedId, setSelectedId] = useState('ai')
  const [query, setQuery] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [model, setModel] = useState('Qwen2.5-0.5B-Instruct-q4f16_1-MLC')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([{ role: 'assistant', text: 'Welcome to NOVAverse. I run directly in your browser. The first launch downloads a small AI model; after that, it is cached on this device.' }])
  const [sending, setSending] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [note, setNote] = useState(() => localStorage.getItem('novaverse-note') || '')
  const [mobileMenu, setMobileMenu] = useState(false)
  const selected = worlds.find(w => w.id === selectedId) || worlds[0]
  const filteredWorlds = useMemo(() => worlds.filter(w => (w.name + w.description + w.eyebrow).toLowerCase().includes(query.toLowerCase())), [query])

  async function refreshAI() {
    setAiStatus('checking')
    setAiStatus(await checkLocalAI() ? 'online' : 'offline')
  }
  async function sendMessage(text = chatInput) {
    const clean = text.trim()
    if (!clean || sending) return
    setMessages(old => [...old, { role: 'user', text: clean }])
    setChatInput('')
    setSending(true)
    try {
      const response = await askLocalAI(clean, model)
      setMessages(old => [...old, { role: 'assistant', text: response }])
      setAiStatus('online')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Local AI is unavailable.'
      setMessages(old => [...old, { role: 'assistant', text: `NOVAverse browser AI could not start. ${reason} Check WebGPU support and internet access, then retry.` }])
      setAiStatus('offline')
    } finally { setSending(false) }
  }
  function saveNote(value: string) {
    setNote(value)
    localStorage.setItem('novaverse-note', value)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setSelectedId('ai')} aria-label="NOVAverse home">
          <span className="brand-mark"><Orbit size={21} /></span>
          <span>NOVA<span>verse</span><small>INFINITE KNOWLEDGE UNIVERSE</small></span>
        </button>
        <div className="top-center"><span className="live-dot" /> YOUR UNIVERSE IS READY <span className="top-divider">/</span> EXPLORE WITHOUT LIMITS</div>
        <div className="top-actions">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu"><Menu size={18}/></button>
          <button className="top-action" onClick={() => setShowNotes(true)}><StickyNote size={16}/> <span>My notes</span></button>
          <button className="ai-top-button" onClick={() => { setShowAI(true); void refreshAI() }}><SparkleIcon size={16}/> AI companion</button>
          <div className="avatar">N</div>
        </div>
      </header>

      <div className="workspace">
        <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
          <div className="side-label">NAVIGATION</div>
          <button className="nav-item active"><Compass size={17}/> Universe overview <span className="nav-count">09</span></button>
          <button className="nav-item" onClick={() => { setShowAI(true); void refreshAI() }}><SparkleIcon size={17}/> AI companion</button>
          <button className="nav-item" onClick={() => setShowNotes(true)}><BookOpen size={17}/> My knowledge</button>
          <div className="side-label worlds-heading">YOUR WORLDS <span>09</span></div>
          <label className="search-box"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a world..." /><kbd>/</kbd></label>
          <div className="world-list">
            {filteredWorlds.map(world => <button key={world.id} className={`world-nav ${selectedId === world.id ? 'selected' : ''}`} onClick={() => { setSelectedId(world.id); setMobileMenu(false) }}>
              <span className="world-dot" style={{ background: world.color, boxShadow: `0 0 12px ${world.color}88` }}>{world.icon}</span><span>{world.name}</span><ChevronRight size={14}/>
            </button>)}
            {filteredWorlds.length === 0 && <p className="empty-search">No worlds found.</p>}
          </div>
          <div className="sidebar-bottom">
            <div className="local-card">
              <div className="local-card-top"><span className={`status-dot ${aiStatus}`}/> LOCAL AI ENGINE</div>
              <strong>{aiStatus === 'online' ? 'Connected' : aiStatus === 'checking' ? 'Checking...' : 'Not connected'}</strong>
              <p>{aiStatus === 'online' ? 'WebGPU is available on this device.' : 'Browser-based AI · no installation or API key.'}</p>
              <button onClick={() => { setShowAI(true); void refreshAI() }}> {aiStatus === 'online' ? 'Open companion' : 'Connect AI'} <ArrowUpRight size={13}/></button>
            </div>
            <div className="sidebar-foot"><span>✦</span> Built for curious minds <span>v1.0</span></div>
          </div>
        </aside>

        <section className="main-stage">
          <div className="stage-heading">
            <div><div className="eyebrow"><span/> THE INFINITE FRONTIER</div><h1>One universe.<br/><em>Infinite possibilities.</em></h1><p>Navigate the worlds of knowledge, creativity and discovery.</p></div>
            <div className="stage-stats"><div><strong>09</strong><span>WORLDS</span></div><i/><div><strong>∞</strong><span>POSSIBILITIES</span></div></div>
          </div>
          <div className="universe-wrap">
            <div className="universe-hint"><Orbit size={14}/> DRAG TO ROTATE <span>·</span> SCROLL TO ZOOM</div>
            <Canvas camera={{ position: [0, 0.2, 15.5], fov: 43 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: false }} onPointerMissed={() => {}}>
              <Suspense fallback={null}><Universe selectedId={selectedId} onSelect={setSelectedId}/></Suspense>
            </Canvas>
            <div className="universe-caption"><span className="caption-line"/><span>SELECT A WORLD TO BEGIN YOUR JOURNEY</span><span className="caption-line"/></div>
          </div>
          <div className="world-strip">
            {worlds.map((world, i) => <button key={world.id} onClick={() => setSelectedId(world.id)} className={selectedId === world.id ? 'active' : ''} style={{ '--world-color': world.color } as React.CSSProperties}><span>{String(i + 1).padStart(2, '0')}</span>{world.icon}</button>)}
          </div>
          <div className="bottom-insight"><div className="insight-icon"><Globe2 size={17}/></div><div><strong>A universe built around curiosity</strong><span>Every world is a doorway to a new perspective. Pick one and see where it leads.</span></div><button onClick={() => { setShowAI(true); void refreshAI() }}>Ask the universe <ArrowUpRight size={15}/></button></div>
        </section>

        <aside className="detail-panel">
          <div className="detail-top"><span>WORLD PROFILE</span><span className="detail-index">0{worlds.findIndex(w => w.id === selected.id) + 1} / 09</span></div>
          <div className="selected-orb" style={{ '--world-color': selected.color } as React.CSSProperties}><div className="orb-ring"/><div className="orb-core">{selected.icon}</div><SparkleIcon className="orb-spark" size={18}/></div>
          <div className="detail-content" key={selected.id}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="eyebrow detail-eyebrow">{selected.eyebrow}</div>
              <h2>{selected.name}</h2>
              <p className="detail-description">{selected.description}</p>
              <div className="detail-rule"/>
              <div className="feature-title">WHAT YOU CAN EXPLORE</div>
              <div className="feature-list">{selected.features.map(feature => <div key={feature}><span style={{ color: selected.color }}><Check size={14}/></span>{feature}</div>)}</div>
              <button className="enter-world" onClick={() => { setShowAI(true); setMessages(old => [...old, { role: 'assistant', text: `Welcome to ${selected.name}. What would you like to explore?` }]); void refreshAI() }}>Enter this world <ArrowUpRight size={16}/></button>
              <button className="suggestion-button" onClick={() => { setShowAI(true); void sendMessage(selected.prompt); }}><MessageCircle size={15}/> Explore with AI <ArrowUpRight size={14}/></button>
            </motion.div>
          </div>
          <div className="detail-footer"><span><Activity size={13}/> EXPLORATION MODE</span><span>READY</span></div>
        </aside>
      </div>

      <footer className="footer"><span>© 2026 NOVAverse <i>·</i> EXPLORE. DISCOVER. CREATE. EVOLVE.</span><span><span className="footer-status"/> ALL SYSTEMS NOMINAL <i>·</i> OPEN SOURCE SPIRIT</span></footer>

      <AnimatePresence>
        {showAI && <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAI(false)}>
          <motion.aside className="ai-drawer" initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }} transition={{ type: 'spring', damping: 28 }} onClick={e => e.stopPropagation()}>
            <div className="drawer-header"><div className="drawer-title-icon"><SparkleIcon size={19}/></div><div><strong>NOVA AI Companion</strong><span>LOCAL INTELLIGENCE · PRIVATE BY DESIGN</span></div><button className="icon-button" onClick={() => setShowAI(false)}><X size={18}/></button></div>
            <div className="ai-connection"><span className={`status-dot ${aiStatus}`}/><div><strong>{aiStatus === 'online' ? 'Browser AI ready' : aiStatus === 'checking' ? 'Checking local engine' : 'Browser AI unavailable'}</strong><small>{aiStatus === 'online' ? 'Messages run on your device.' : 'Runs in this browser using WebGPU. First launch downloads the model.'}</small></div><button onClick={() => void refreshAI()}><Activity size={15}/></button></div>
            <div className="chat-context"><span>ACTIVE WORLD</span><strong style={{ color: selected.color }}>{selected.icon} {selected.name}</strong></div>
            <div className="chat-messages">{messages.map((message, i) => <div key={i} className={`chat-message ${message.role}`}><span className="message-avatar">{message.role === 'assistant' ? '✳' : 'Y'}</span><div><small>{message.role === 'assistant' ? 'NOVA AI' : 'YOU'}</small><p>{message.text}</p></div></div>)}{sending && <div className="typing"><span/><span/><span/> NOVA is thinking...</div>}</div>
            <div className="quick-prompts"><button onClick={() => void sendMessage(selected.prompt)}>Explore this world <ArrowUpRight size={12}/></button><button onClick={() => void sendMessage('Explain this simply with an example.')}>Explain simply</button></div>
            <div className="model-select"><Settings2 size={14}/><span>BROWSER MODEL</span><select value={model} onChange={e => setModel(e.target.value)}><option value="Qwen2.5-0.5B-Instruct-q4f16_1-MLC">Qwen 2.5 · 0.5B (Lightweight)</option></select></div>
            <form className="chat-form" onSubmit={e => { e.preventDefault(); void sendMessage() }}><textarea value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask anything in your universe..." rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage() } }}/><button type="submit" disabled={!chatInput.trim() || sending}><Send size={17}/></button></form>
            <div className="privacy-note"><Activity size={12}/> AI runs on your device in this browser. No Ollama, separate install, or paid API. The first model download requires internet.</div>
          </motion.aside>
        </motion.div>}
        {showNotes && <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotes(false)}>
          <motion.aside className="notes-drawer" initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }} onClick={e => e.stopPropagation()}>
            <div className="drawer-header"><div className="drawer-title-icon"><StickyNote size={19}/></div><div><strong>My Universe Notes</strong><span>SAVED LOCALLY IN THIS BROWSER</span></div><button className="icon-button" onClick={() => setShowNotes(false)}><X size={18}/></button></div>
            <div className="notes-world"><span style={{ color: selected.color }}>{selected.icon}</span><div><small>CURRENT WORLD</small><strong>{selected.name}</strong></div></div>
            <textarea className="notes-area" value={note} onChange={e => saveNote(e.target.value)} placeholder="Capture a discovery, question or idea..."/>
            <div className="notes-save"><Check size={14}/> Auto-saved on this device</div>
            <div className="notes-tip">Your notes stay in this browser's local storage. They are not uploaded to a server.</div>
          </motion.aside>
        </motion.div>}
      </AnimatePresence>
    </main>
  )
}

export default App