// AI Voice DJ — uses the browser's built-in speech synthesis to naturally
// introduce the next track, like a real radio DJ. Zero cost, no API needed.

const STORAGE = 'soniq_voicedj';

export function isVoiceDjOn(): boolean {
  try { return localStorage.getItem(STORAGE) === '1'; } catch { return false; }
}
export function setVoiceDj(on: boolean) {
  try { localStorage.setItem(STORAGE, on ? '1' : '0'); } catch {}
}

const INTROS = [
  (t: string, a: string) => `Up next, ${t} by ${a}. Enjoy!`,
  (t: string, a: string) => `Now playing ${t} from ${a}. Turn it up!`,
  (t: string, a: string) => `Here's ${t} by ${a}. This one's a vibe.`,
  (t: string, a: string) => `Coming up, ${t} — ${a}. Let's go!`,
  (t: string, a: string) => `You're listening to SONIQ. Next up: ${t} by ${a}.`,
];

let lastSpokenId: string | number | null = null;

export function announceTrack(title: string, artist: string, id: string | number) {
  if (!isVoiceDjOn()) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (lastSpokenId === id) return; // don't repeat for the same track
  lastSpokenId = id;

  // Clean the title/artist for natural speech
  const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, '').replace(/[|•].*/, '').trim();
  const cleanArtist = (artist || 'an amazing artist').split(/[,&]/)[0].replace(/VEVO|- Topic/gi, '').trim();

  const line = INTROS[Math.floor(Math.random() * INTROS.length)](cleanTitle, cleanArtist);
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(line);
    u.rate = 1.02;
    u.pitch = 1;
    u.volume = 1;
    // Prefer an English voice
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find((v) => /en[-_]/i.test(v.lang) && /female|samantha|google/i.test(v.name)) || voices.find((v) => /en[-_]/i.test(v.lang));
    if (en) u.voice = en;
    window.speechSynthesis.speak(u);
  } catch {}
}
