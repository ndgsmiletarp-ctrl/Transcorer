/* script.js
   Plain vanilla JS for UI behavior:
   - file reading (.txt)
   - form validation
   - POST to Vercel backend API
   - render results table + chart + suggestions
   - download JSON + export PDF
   - theme toggle with localStorage
*/

/* ---------------------------
   DOM references
--------------------------- */
const transcriptEl = document.getElementById('transcript');
const durationEl = document.getElementById('duration');
const fileInput = document.getElementById('fileInput');
const scoreBtn = document.getElementById('scoreBtn');
const sampleBtn = document.getElementById('sampleBtn');
const resetBtn = document.getElementById('resetBtn');
const formMessage = document.getElementById('formMessage');

const loader = document.getElementById('loader');
const resultsCard = document.getElementById('results');
const overallScoreEl = document.getElementById('overallScore');
const wordCountEl = document.getElementById('wordCount');
const sentenceCountEl = document.getElementById('sentenceCount');
const wpmEl = document.getElementById('wpm');
const metricsTableBody = document.querySelector('#metricsTable tbody');
const suggestionsList = document.getElementById('suggestionsList');

const downloadJsonBtn = document.getElementById('downloadJson');
const exportPdfBtn = document.getElementById('exportPdf');

const themeToggle = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');

/* Chart instance */
let chart = null;
let lastResponse = null;

/* ---------------------------
   Theme: restore / toggle
--------------------------- */
function applyTheme(isDark){
  if(isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  themeText.textContent = isDark ? 'Dark' : 'Light';
  localStorage.setItem('rb-theme-dark', isDark ? '1' : '0');
}

const savedTheme = localStorage.getItem('rb-theme-dark');
applyTheme(savedTheme === '1');
themeToggle.checked = savedTheme === '1';
themeToggle.addEventListener('change', e => applyTheme(e.target.checked));

/* ---------------------------
   File read (.txt)
--------------------------- */
fileInput.addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  if(!f.name.toLowerCase().endsWith('.txt')){
    formMessage.textContent = 'Please upload a .txt file.';
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    transcriptEl.value = reader.result || '';
    formMessage.textContent = 'File loaded.';
  };
  reader.readAsText(f);
});

/* ---------------------------
   Sample transcript (button)
--------------------------- */
sampleBtn.addEventListener('click', () => {
  const sample = `Hello everyone, my name is Aisha. I am 12 years old and I study in class 7 at Starlight School. I live with my family which includes my parents and one younger brother. I enjoy painting and reading books in my free time. A fun fact about me is that I bake cupcakes for my friends. My ambition is to become a doctor and help people. Thank you for listening.`;
  transcriptEl.value = sample;
  durationEl.value = 60;
  formMessage.textContent = 'Sample loaded.';
});

/* ---------------------------
   Reset form
--------------------------- */
resetBtn.addEventListener('click', () => {
  transcriptEl.value = '';
  durationEl.value = '';
  fileInput.value = '';
  formMessage.textContent = '';
  resultsCard.classList.add('hidden');
});

/* ---------------------------
   Validators
--------------------------- */
function countWords(text){
  if(!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text){
  if(!text) return 0;
  return text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).length;
}

function validate(text, duration){
  if(!text || !text.trim()) return 'Please paste or upload a transcript.';
  if(!duration || isNaN(duration) || Number(duration) <= 0) return 'Please enter a valid duration in seconds.';
  if(countWords(text) < 3) return 'Transcript too short.';
  return null;
}

/* ---------------------------
   UI helpers
--------------------------- */
function showLoader(show){
  loader.classList.toggle('hidden', !show);
  if(show) {
    resultsCard.classList.add('hidden');
  } else {
    resultsCard.classList.remove('hidden');
  }
}

function clearResults(){
  metricsTableBody.innerHTML = '';
  suggestionsList.innerHTML = '';
  if(chart){ chart.destroy(); chart = null; }
}

/* ---------------------------
   Render results
--------------------------- */
function renderResults(json){
  lastResponse = json;

  overallScoreEl.textContent = Math.round(json.overall_score || 0);
  wordCountEl.textContent = json.word_count || 0;

  const sCount = json.sentence_count !== undefined ? json.sentence_count : countSentences(transcriptEl.value);
  sentenceCountEl.textContent = sCount;

  wpmEl.textContent = Math.round(json.wpm || 0);

  metricsTableBody.innerHTML = '';
  json.metrics.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(m.metric)}</td>
      <td>${m.score}</td>
      <td>${m.max}</td>
      <td>${escapeHtml(m.feedback || '')}</td>
    `;
    metricsTableBody.appendChild(tr);
  });

  suggestionsList.innerHTML = '';
  if(json.feedback){
    const li = document.createElement('li');
    li.textContent = json.feedback;
    suggestionsList.appendChild(li);
  }

  json.metrics.forEach(m => {
    if(m.feedback){
      const li = document.createElement('li');
      li.textContent = m.feedback;
      suggestionsList.appendChild(li);
    }
  });

  const labels = json.metrics.map(m => m.metric);
  const percents = json.metrics.map(m => Math.round((m.score / m.max) * 100));
  const colors = percents.map(p => p >= 80 ? 'rgba(34,197,94,0.85)' : p >= 50 ? 'rgba(245,158,11,0.85)' : 'rgba(239,68,68,0.85)');

  const ctx = document.getElementById('metricsChart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Percent of category',
        data: percents,
        backgroundColor: colors
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display:false }},
      scales: {
        x: { max: 100, ticks: { callback: v => v + '%' }}
      }
    }
  });

  resultsCard.classList.remove('hidden');
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, function(m){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}

/* ---------------------------
   POST to backend (Vercel)
--------------------------- */
async function postScore(text, duration){
  const payload = { text, duration: Number(duration) };

  const resp = await fetch('https://transcorer-ou6n.vercel.app/', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });

  if(!resp.ok){
    const t = await resp.text();
    throw new Error('Server error: ' + resp.status + ' - ' + t);
  }

  return resp.json();
}

/* ---------------------------
   Score button
--------------------------- */
scoreBtn.addEventListener('click', async () => {
  formMessage.textContent = '';
  clearResults();

  const text = transcriptEl.value;
  const duration = durationEl.value;

  const v = validate(text, duration);
  if(v){ formMessage.textContent = v; return; }

  showLoader(true);

  try{
    const wc = countWords(text);
    const sCount = countSentences(text);
    const wpmCalc = Math.round(wc / (Number(duration)/60));

    const json = await postScore(text, duration);

    if(!json.sentence_count) json.sentence_count = sCount;
    if(!json.word_count) json.word_count = wc;
    if(!json.wpm) json.wpm = wpmCalc;

    renderResults(json);
    formMessage.textContent = 'Scoring complete.';
  }
  catch(err){
    console.error(err);
    formMessage.textContent = 'Error: ' + err.message;
  }
  finally{
    showLoader(false);
  }
});

/* ---------------------------
   Download JSON
--------------------------- */
downloadJsonBtn.addEventListener('click', () => {
  if(!lastResponse){
    formMessage.textContent = 'No result to download.';
    return;
  }

  const blob = new Blob(
    [JSON.stringify(lastResponse, null, 2)],
    {type:'application/json'}
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; 
  a.download = 'transcript_score.json';
  document.body.appendChild(a); 
  a.click(); 
  a.remove();

  URL.revokeObjectURL(url);
});

/* ---------------------------
   Export PDF
--------------------------- */
exportPdfBtn.addEventListener('click', async () => {
  if(!lastResponse){
    formMessage.textContent = 'No result to export.';
    return;
  }

  formMessage.textContent = 'Preparing PDF...';

  try{
    const node = document.querySelector('.results');
    const canvas = await html2canvas(node, { scale:2, useCORS:true });
    const img = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      unit:'px',
      format:[canvas.width, canvas.height]
    });

    pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('transcript_score.pdf');

    formMessage.textContent = 'PDF saved.';
  }
  catch(e){
    console.error(e);
    formMessage.textContent = 'PDF error: ' + e.message;
  }
});
