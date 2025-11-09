import Config from 'react-native-config';

const HF_TOKEN = String(Config.HF_TOKEN || '').trim();
if (!HF_TOKEN.startsWith('hf_')) {
  throw new Error('HF token missing. .env içine HF_TOKEN=hf_xxx ekle ve yeniden başlat.');
}

const BASES = [
  'https://router.huggingface.co/hf-inference',
  'https://api-inference.huggingface.co'
];

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function headers(){
  return {
    Authorization: `Bearer ${HF_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Wait-For-Model': 'true'
  };
}

async function postWithFallback(path, payload){
  let lastErr;
  for(const BASE of BASES){
    const url = `${BASE}${path}`;
    try{
      let res = await fetch(url,{method:'POST',headers:headers(),body:JSON.stringify(payload)});
      if(res.status===503){
        await sleep(1500);
        res = await fetch(url,{method:'POST',headers:headers(),body:JSON.stringify(payload)});
      }
      if(res.status===401){
        const t = await res.text();
        throw new Error(`401 Unauthorized. Body: ${t}`);
      }
      if(res.status===404 || res.status===410){
        continue;
      }
      if(!res.ok){
        const t = await res.text();
        throw new Error(`HF Error ${res.status}: ${t}`);
      }
      return res.json();
    }catch(e){
      lastErr = e;
      continue;
    }
  }
  throw lastErr ?? new Error('HF ulaşılmıyor');
}

const SENTIMENT_MODEL = 'cardiffnlp/twitter-xlm-roberta-base-sentiment';

export async function analyzeSentiment(text) {
  const path = `/models/${SENTIMENT_MODEL}`;
  const out = await postWithFallback(path, { inputs: text });
  const preds = Array.isArray(out) ? (Array.isArray(out[0]) ? out[0] : out) : out;
  const top = preds.reduce((a, b) => (a.score > b.score ? a : b));
  let raw = (top.label || '').toUpperCase();
  let score = top.score ?? 0;
  let label = raw === 'LABEL_2' || raw === 'POSITIVE' ? 'positive'
            : raw === 'LABEL_0' || raw === 'NEGATIVE' ? 'negative'
            : 'neutral';
  if (score < 0.60) label = 'neutral';
  const level = Math.min(5, Math.max(1, Math.round(1 + score * 4)));
  const trLabel = label === 'positive' ? 'pozitif' : label === 'negative' ? 'negatif' : 'nötr';
  return { label, trLabel, score, level };
}

const ENABLE_REMOTE_GEN = false;
const GEN_MODEL_CANDIDATES = ENABLE_REMOTE_GEN ? [
  'gpt2',
  'bigscience/bloom-560m'
] : [];

async function tryGenerateWithModel(model, prompt){
  const path = `/models/${model}`;
  const res = await postWithFallback(path,{
    inputs: prompt,
    parameters: { max_new_tokens: 100, temperature: 0.25, top_p: 0.9 }
  });
  const text = Array.isArray(res)
    ? (res[0]?.generated_text || res[0]?.generated_texts?.[0] || '')
    : (res.generated_text || res.generated_texts?.[0] || '');
  if(!text) throw new Error(`Empty generation from ${model}`);
  return text.replace(/\n+/g,' ').trim();
}

function extractSignals(text){
  const t = (text||'').toLowerCase();
  const topics=[];
  const hit = arr => arr.some(k=>t.includes(k));
  if(hit(['ders','sınav','ödev','çalış','proje'])) topics.push('akademik/iş');
  if(hit(['yorgun','enerji','uyku','uykusuz','bitkin'])) topics.push('enerji/uyku');
  if(hit(['üzg','mutsuz','stres','kayg','anksiyete'])) topics.push('duygusal stres');
  if(hit(['arkadaş','aile','ilişki','sevgili'])) topics.push('sosyal');
  if(hit(['para','bütçe','fatura'])) topics.push('finans');
  if(hit(['ağrı','hasta','düştüm','sakat','grip','ateş'])) topics.push('sağlık');
  return { topics };
}

function autoTone(label,score,text){
  const t = text.toLowerCase();
  if(label==='negative' && (score>=0.45 || /ağrı|hasta|düştüm|üzg|mutsuz|stres|kayg|ateş/.test(t))) return 'empath';
  if(label==='positive' && score>=0.75) return 'funny';
  if(label==='neutral' && /hedef|plan|çalış|ödev|iş/.test(t)) return 'coach';
  if(label==='negative') return 'empath';
  return 'coach';
}

function localMessage(text, trLabel){
  const t = (text||'').toLowerCase();
  if(trLabel==='pozitif')
    return 'Bugünkü duygu tonun pozitif; bu enerjiyi küçük ama anlamlı bir adım için kullanabilirsin.';
  if(trLabel==='negatif'){
    if(/ağrı|sızı|düştüm|ateş|hasta|grip|migren|sakat|kan/.test(t))
      return 'Bugün zorlayıcı görünüyorsun; kendine nazik ol, dinlen, gerekirse bir sağlık profesyoneline danış.';
    if(/yorgun|uyku|bitkin/.test(t))
      return 'Yorgunluk öne çıkıyor; temponu hafiflet, kısa bir mola ver ve su içmeyi ihmal etme.';
    return 'Duygusal olarak ağır bir gün; kendine anlayış gösterip yükünü biraz hafifletmen iyi gelebilir.';
  }
  return 'Duygu tonun daha nötr; küçük, net bir hedefle güne hafif bir ivme katabilirsin.';
}

export async function generateMessage(text, trLabel, label, score=0.5){
  const { topics } = extractSignals(text);
  const tone = autoTone(label, score, text);
  let message = '';
  for(const m of GEN_MODEL_CANDIDATES){
    try{
      message = await tryGenerateWithModel(m, `Türkçe tek cümle: ${text} ifadesine uygun, ${trLabel} tonda kısa ve saygılı geri bildirim ver.`);
      break;
    }catch(e){
      continue;
    }
  }
  if(!message) message = localMessage(text, trLabel);
  return { message, topics, tone };
}
