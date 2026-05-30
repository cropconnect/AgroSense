import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { useSensors } from '../hooks/useSensors.js';
import { useWeather } from '../hooks/useWeather.js';

export default function AIAdvisor() {
  const { latest } = useSensors();
  const weather = useWeather();
  const [tab, setTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'AgroSense AI ready. Ask about irrigation, drought risk, or crop advice.' }]);
  const [crops, setCrops] = useState(null);
  const [sending, setSending] = useState(false);
  const [cropsLoading, setCropsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const text = message.trim();
    if (!text || sending) return;
    setMessage(''); setSending(true);
    setMessages(m => [...m, { role: 'user', text }]);
    try {
      const { data } = await api.post('/api/ai/chat', { message: text, sensor_data: latest, weather_data: weather, location: 'Farm block A' });
      setMessages(m => [...m, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, AI is unavailable right now. Check the Gemini API key in your backend .env file.' }]);
    } finally { setSending(false); }
  }

  async function recommend() {
    setCropsLoading(true);
    try {
      const { data } = await api.post('/api/ai/crop-recommend', { sensor_data: latest, location: 'Farm block A', season: 'current' });
      setCrops(data);
    } catch {
      setCrops({ crops: [], summary: 'Could not fetch recommendations. Check Gemini API key.' });
    } finally { setCropsLoading(false); }
  }

  return (
    <div className="page space-y-5">
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>AI Advisor</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Gemini AI with live sensor and weather context.</p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className={`btn ${tab === 'chat' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('chat')}>Chat</button>
        <button className={`btn ${tab === 'crops' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('crops')}>Crop Recommendations</button>
      </div>

      {tab === 'chat' ? (
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ maxWidth: '82%', borderRadius: 10, border: '1px solid var(--border)', padding: '10px 14px', fontSize: 14, lineHeight: 1.6,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'var(--accent-primary-tint)' : 'var(--bg-base)',
                color: 'var(--text-primary)' }}>
                {m.text}
              </div>
            ))}
            {sending && <div style={{ alignSelf: 'flex-start', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={message} onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about irrigation, drought risk, or crops" />
            <button className="btn btn-primary" onClick={send} disabled={sending}><Send size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '18px 20px' }}>
          <button className="btn btn-primary" onClick={recommend} disabled={cropsLoading}>
            {cropsLoading ? 'Getting recommendations...' : 'Get AI Crop Recommendations'}
          </button>
          {crops?.summary && <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '14px 0', lineHeight: 1.6 }}>{crops.summary}</p>}
          {crops?.crops?.length > 0 && (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', marginTop: 12 }}>
              {crops.crops.map(crop => (
                <div key={crop.name} className="card card-green" style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{crop.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{crop.water_requirement_mm} mm · {crop.climate_suitability_score}% suitability</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{crop.planting_advice}</p>
                </div>
              ))}
            </div>
          )}
          {crops?.crops?.length === 0 && <p style={{ fontSize: 13, color: 'var(--accent-danger)', marginTop: 12 }}>{crops.summary}</p>}
        </div>
      )}
    </div>
  );
}
