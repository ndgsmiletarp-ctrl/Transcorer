/* script.js - polished but simple frontend logic
   Comments and short functions for beginners
*/

/* DOM refs */
const transcriptEl = document.getElementById('transcript');
const durationEl = document.getElementById('duration');
const fileInput = document.getElementById('fileInput');
const scoreBtn = document.getElementById('scoreBtn');
const sampleBtn = document.getElementById('sampleBtn');
const resetBtn = document.getElementById('resetBtn');
const formMessage = document.getElementById('formMessage');

const loader = document.getElementById('loader');
const results = document.getElementById('results');
const resultPanel = document.getElementById('resultPanel');
const overallScoreEl = document.getElementById('overallScore');
const wordCountEl = document.getElementById('wordCount');
const sentenceCountEl = document.getElementById('sentenceCount');
const wpmEl = document.getElementById('wpm');
const metricsTableBody = document.querySelector('#metricsTable tbody');
const suggestionsList = document.getElementById('suggestionsList');

const downloadJsonBtn = document.getElementById('downloadJson');
const exportPdfBtn = document.getElementById('exportPdf');
const themeToggle = document.getElementById('themeToggle');

let chart = null;
let lastResponse = null;

/* Theme toggle - default dark cyber */
function applyTheme(isLight){
  if(isLight) document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');
  localStorage.setItem('transcorer-light', isLight ? '1' : '0');
}
const saved = localStorage.getItem('transcorer-light') === '1';
applyTheme(saved);
themeToggle.checked = saved;
themeToggle.addEventListener('change', e => applyTheme(e.target.checked));

/* Read .txt uploads */
fileInput.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  if(!f.name.toLowerCase().endsWith('.txt')) {
    formMessage.textContent = 'Please upload a .txt file.';
    return;
  }
  const r = new FileReader();
  r.onload = () => {
    transcriptEl.value = r.result || '';
    formMessage.textContent = 'File loaded.';
  };
  r.readAsText(f);
});

/* Sample */
sampleBtn.addEventListener('click', () => {
  transcriptEl.value = `Hello everyone, my name is Aisha. I am 12 years old and I study in class 7 at Starlight School. I live with my family which includes my parents and one younger brother. I enjoy painting and reading books in my free time. A fun fact about me is that I bake cupcakes for my friends. My ambition is to become a doctor and help people. Thank you for listening.`;
  durationEl.value = 60;
  formMessage.textContent = 'Sample loaded.';
});

/* Reset */
resetBtn.addEventListener('click', () => {
  transcriptEl.value = '';
  durationEl.value = '';
  fileInput.value = '';
  formMessage.textContent = '';
  results.classList.add('hidden');
});

/* basic helpers */
function wc(text){ return text ? text.trim().split(/\s+/).filter(Boolean).length : 0; }
function sc(text){ return text ? text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).length : 0; }
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

/* show/hide loader */
function setLoading(on){
  document.getElementById('loader').classList.toggle('hidden', !on);
  if(on) results.classList.add('hidden'); else results.classList.remove('hidden');
}

/* update UI from response */
function render(resp){
  lastResponse = resp;
  overallScoreEl.textContent = Math.round(resp.overall_score || 0);
  wordCountEl.textContent = resp.word_count || wc(transcriptEl.value);
  sentenceCountEl.textContent = resp.sentence_count ?? sc(transcriptEl.value);
  wpmEl.textContent = Math.round(resp.wpm || 0);

  // metrics table
  metricsTableBody.innerHTML = '';
  resp.metrics.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(m.metric)}</td><td>${m.score}</td><td>${m.max}</td><td>${escapeHtml(m.feedback||'')}</td>`;
    metricsTableBody.appendChild(tr);
  });

  // suggestions
  suggestionsList.innerHTML = '';
  if(resp.feedback) {
    const li = document.createElement('li'); li.textContent = resp.feedback; suggestionsList.appendChild(li);
  }
  resp.metrics.forEach(m => { if(m.feedback){ const li = document.createElement('li'); li.textContent = m.feedback; suggestionsList.appendChild(li); } });

  // chart
  const labels = resp.metrics.map(m => m.metric);
  const values = resp.metrics.map(m => Math.round((m.score / Math.max(1,m.max)) * 100));
  const colors = values.map(v => v>=80? 'rgba(34,197,94,0.9)' : v>=50 ? 'rgba(245,158,11,0.9)' : 'rgba(244,63,94,0.9)');

  const ctx = document.getElementById('metricsChart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ data: values, backgroundColor: colors }] }, options:{ indexAxis:'y', plugins:{ legend:{ display:false } }, scales:{ x:{ max:100, ticks:{ callback: v => v + '%' } } } } });

  results.classList.remove('hidden');
}

/* POST to backend - uses relative path (works on same Vercel domain) */
async function postScore(text, duration){
  const payload = { text, duration: Number(duration) };
  const resp = await fetch('/api/scoreTranscript', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  if(!resp.ok){
    const txt = await resp.text().catch(()=>'');
    throw new Error('Server error: ' + resp.status + (txt ? ' - ' + txt : ''));
  }
  return resp.json();
}

/* main action */
scoreBtn.addEventListener('click', async () => {
  formMessage.textContent = '';
  results.classList.add('hidden');

  const text = transcriptEl.value;
  const duration = durationEl.value;

  if(!text || !text.trim()){ formMessage.textContent = 'Please paste or upload a transcript.'; return; }
  if(!duration || Number(duration) <= 0){ formMessage.textContent = 'Enter duration in seconds.'; return; }

  setLoading(true);
  try{
    const json = await postScore(text, duration);

    // ensure some fields
    if(!json.word_count) json.word_count = wc(text);
    if(!json.sentence_count) json.sentence_count = sc(text);
    if(!json.wpm) json.wpm = Math.round(json.word_count / (Number(duration)/60));

    render(json);
    formMessage.textContent = 'Scoring complete.';
  } catch(err){
    console.error(err);
    formMessage.textContent = 'Error: ' + (err.message || 'Failed to score.');
  } finally {
    setLoading(false);
  }
});

/* download JSON */
downloadJsonBtn.addEventListener('click', () => {
  if(!lastResponse){ formMessage.textContent = 'No result to download.'; return; }
  const blob = new Blob([JSON.stringify(lastResponse, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'transcript_score.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

/* export PDF */
exportPdfBtn.addEventListener('click', async () => {
  if(!lastResponse){ formMessage.textContent = 'No result to export.'; return; }
  formMessage.textContent = 'Preparing PDF...';
  try{
    const node = document.querySelector('.card.result-card');
    const canvas = await html2canvas(node, { scale:2, useCORS:true });
    const img = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit:'px', format:[canvas.width, canvas.height] });
    pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('transcript_score.pdf');
    formMessage.textContent = 'PDF saved.';
  } catch(e){
    console.error(e);
    formMessage.textContent = 'PDF error: ' + e.message;
  }
});
