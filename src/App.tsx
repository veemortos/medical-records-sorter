import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Play, RefreshCw, AlertCircle, CheckCircle2, Search, FileDiff, Maximize2, X, Image as ImageIcon, Trash2, Download, Printer, ChevronDown, Moon, Sun } from 'lucide-react';

const makeStyles = (dark) => ({
  page: { minHeight: '100vh', background: dark ? '#0f172a' : '#f8fafc', color: dark ? '#e2e8f0' : '#0f172a', fontFamily: 'Verdana, sans-serif', letterSpacing: '0.02em', lineHeight: 1.7, padding: '48px', transition: 'background 0.2s, color 0.2s' },
  wrap: { maxWidth: '1100px', margin: '0 auto' },
  header: { marginBottom: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  h1: { fontSize: '28px', fontWeight: 800, color: dark ? '#f1f5f9' : '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 },
  subtitle: { marginTop: '8px', color: dark ? '#94a3b8' : '#64748b', fontWeight: 500, fontSize: '15px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  tipBox: { background: dark ? '#1e3a5f' : '#eff6ff', color: dark ? '#93c5fd' : '#1e40af', fontSize: '13px', padding: '12px 20px', borderRadius: '12px', border: `1px solid ${dark ? '#2563eb' : '#bfdbfe'}`, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 },
  darkBtn: { background: dark ? '#1e293b' : '#f1f5f9', color: dark ? '#94a3b8' : '#475569', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Verdana, sans-serif', fontSize: '13px', fontWeight: 700 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', marginBottom: '32px', alignItems: 'start' },
  card: { background: dark ? '#1e293b' : '#fff', padding: '24px', borderRadius: '20px', boxShadow: dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.07)', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', alignSelf: 'stretch' },
  cardTitle: { fontSize: '18px', fontWeight: 700, color: dark ? '#f1f5f9' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  cardDesc: { color: dark ? '#94a3b8' : '#64748b', fontSize: '13px', marginBottom: '16px' },
  uploadBtn: (color) => ({ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', border: `2px dashed ${color}`, borderRadius: '14px', color, background: 'transparent', cursor: 'pointer', fontFamily: 'Verdana, sans-serif', gap: '6px' }),
  uploadBtnText: { fontWeight: 700, fontSize: '15px' },
  fileListWrap: { marginTop: '12px', flex: 1, background: 'transparent', border: 'none', padding: '0', maxHeight: '180px', overflowY: 'auto' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', color: dark ? '#475569' : '#94a3b8', minHeight: '120px' },
  fileItem: { background: dark ? '#1e293b' : '#fff', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  fileIcon: { background: dark ? '#1e3a5f' : '#dbeafe', color: dark ? '#60a5fa' : '#1d4ed8', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 },
  fileName: { fontWeight: 700, color: dark ? '#e2e8f0' : '#0f172a', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' },
  fileSize: { fontSize: '11px', color: '#64748b', fontWeight: 500 },
  trashBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: dark ? '#475569' : '#94a3b8', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
  runBtn: (disabled) => ({ background: disabled ? (dark ? '#334155' : '#94a3b8') : (dark ? '#3b82f6' : '#0f172a'), color: '#fff', fontWeight: 700, padding: '16px 48px', borderRadius: '999px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontFamily: 'Verdana, sans-serif', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }),
  center: { display: 'flex', justifyContent: 'center' },
  processingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' },
  processingTitle: { fontSize: '24px', fontWeight: 700, color: dark ? '#f1f5f9' : '#0f172a', marginBottom: '8px' },
  processingMsg: { color: dark ? '#94a3b8' : '#64748b', fontWeight: 500 },
  summaryCard: { background: dark ? '#1e293b' : '#fff', borderRadius: '20px', boxShadow: dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.07)', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, padding: '32px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' },
  summaryTitle: { fontSize: '28px', fontWeight: 700, color: dark ? '#f1f5f9' : '#0f172a', marginBottom: '8px' },
  statBox: { textAlign: 'center', padding: '16px', background: dark ? '#0f172a' : '#f8fafc', borderRadius: '14px', border: `1px solid ${dark ? '#334155' : '#f1f5f9'}`, minWidth: '120px' },
  statLabel: { fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px' },
  exportBtn: (bg) => ({ background: bg, color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'Verdana, sans-serif' }),
  sectionTitle: { fontSize: '22px', fontWeight: 700, color: dark ? '#f1f5f9' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  tabBar: { display: 'flex', gap: '8px', borderBottom: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, marginBottom: '24px', overflowX: 'auto' },
  tab: (active, color) => ({ padding: '12px 24px', fontWeight: 700, border: 'none', borderBottom: active ? `2px solid ${color}` : '2px solid transparent', background: active ? (color === '#2563eb' ? (dark ? '#1e3a5f' : '#eff6ff') : (dark ? '#3b0a1a' : '#fff1f2')) : 'transparent', color: active ? color : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Verdana, sans-serif', fontSize: '14px', whiteSpace: 'nowrap', borderRadius: active ? '8px 8px 0 0' : 0 }),
  matchCard: { background: dark ? '#1e293b' : '#fff', borderRadius: '20px', boxShadow: dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.07)', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, overflow: 'hidden', marginBottom: '24px' },
  matchHeader: { background: dark ? '#0f172a' : '#f8fafc', padding: '16px 24px', borderBottom: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  matchTitle: { fontWeight: 700, color: dark ? '#f1f5f9' : '#0f172a', fontSize: '17px' },
  badge: (isImage) => ({ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, background: isImage ? (dark ? '#3b0a1a' : '#fff1f2') : (dark ? '#3b2a00' : '#fef3c7'), color: isImage ? (dark ? '#fda4af' : '#9f1239') : (dark ? '#fcd34d' : '#92400e') }),
  matchCols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' },
  matchCol: { padding: '24px', display: 'flex', flexDirection: 'column' },
  groupLabel: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' },
  docBadge: (bg, border, color) => ({ display: 'flex', alignItems: 'center', background: bg, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${border}`, color }),
  pagePill: (bg) => ({ background: bg, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, flexShrink: 0, marginLeft: '8px' }),
  previewWrap: { position: 'relative', width: '100%', background: dark ? '#0f172a' : '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, minHeight: '220px', margin: '12px 0' },
  textBox: (isImage) => ({ marginTop: '12px', padding: '16px', border: `1px solid ${isImage ? (dark ? '#7f1d1d' : '#fecdd3') : (dark ? '#334155' : '#e2e8f0')}`, borderRadius: '12px', fontSize: '15px', lineHeight: 1.8, background: isImage ? (dark ? '#3b0a1a' : '#fff1f2') : (dark ? '#0f172a' : '#f8fafc'), color: isImage ? (dark ? '#fda4af' : '#9f1239') : (dark ? '#e2e8f0' : '#0f172a') }),
  noResults: { background: dark ? '#1e293b' : '#fff', padding: '48px', borderRadius: '20px', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, textAlign: 'center' },
  loadMoreWrap: { marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  loadMoreBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: dark ? '#1e293b' : '#fff', color: dark ? '#94a3b8' : '#334155', fontWeight: 700, padding: '12px 32px', borderRadius: '999px', border: `2px solid ${dark ? '#334155' : '#cbd5e1'}`, cursor: 'pointer', fontFamily: 'Verdana, sans-serif', fontSize: '14px' },
  resetBtn: { display: 'flex', alignItems: 'center', gap: '8px', color: dark ? '#94a3b8' : '#475569', fontWeight: 700, padding: '12px 32px', borderRadius: '999px', border: `2px solid ${dark ? '#334155' : '#cbd5e1'}`, background: dark ? '#1e293b' : '#fff', cursor: 'pointer', fontFamily: 'Verdana, sans-serif', fontSize: '14px' },
  modalOverlay: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', padding: '32px' },
  modalBox: { position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '100%', maxWidth: '100%', background: dark ? '#1e293b' : '#f1f5f9', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', overflow: 'hidden' },
  modalHeader: { background: dark ? '#0f172a' : '#fff', borderBottom: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { flex: 1, overflow: 'auto', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', minWidth: '300px', minHeight: '300px' },
  fullscreenBtn: { position: 'absolute', top: '12px', right: '12px', padding: '8px', background: dark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)', color: dark ? '#94a3b8' : '#334155', borderRadius: '8px', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, cursor: 'pointer', display: 'flex', alignItems: 'center' },
});

const STOP_WORDS = new Set(["the","and","is","in","to","of","it","that","for","on","with","as","was","at","by","an","be","this","which","or","from","are","we","you","they","not","but","have","has","had","page","printed","date","signed","mrn","visit","dob","male","female","admit"]);

function extractWords(text) {
  // Normalize: lowercase, strip page headers/footers, extract meaningful words
  const cleaned = text.toLowerCase()
    .replace(/page \d+ of \d+/gi, '')
    .replace(/printed \d{4}/gi, '')
    .replace(/\b\d{1,2}[-\/]\w{3,}[-\/]\d{2,4}\b/g, '') // dates
    .replace(/\b\d{4,}\b/g, ''); // long numbers (IDs, MRNs)
  return Array.from(new Set(cleaned.match(/\b[a-z]{3,}\b/g)||[])).filter(w=>!STOP_WORDS.has(w));
}

function extractWordsRaw(text) {
  // Less aggressive — keeps numbers, for fingerprinting
  return text.toLowerCase().match(/\b\w{3,}\b/g) || [];
}

function calculateJaccard(setA,setB) { let i=0; for(let e of setA){if(setB.has(e))i++;} let u=setA.size+setB.size-i; return u===0?0:i/u; }

function fingerprintPage(text) {
  // Create a stable fingerprint from the most distinctive words on a page
  const words = extractWordsRaw(text);
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w]||0)+1; });
  // Take top 30 most frequent non-stopword tokens as the fingerprint
  return new Set(
    Object.entries(freq)
      .filter(([w]) => !STOP_WORDS.has(w) && w.length >= 3)
      .sort((a,b) => b[1]-a[1])
      .slice(0,30)
      .map(([w]) => w)
  );
}
const yieldToBrowser = async()=>new Promise(r=>setTimeout(r,0));

// Faster: process pages in parallel batches of 8
async function extractTextFromPdf(pdf, fileName, onProgress) {
  const BATCH = 8;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i += BATCH) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH, pdf.numPages + 1); j++) {
      batch.push(
        pdf.getPage(j).then(async page => {
          const textContent = await page.getTextContent();
          const text = textContent.items.map(item => item.str).join(' ');
          page.cleanup();
          return { pageNum: j, text };
        }).catch(() => ({ pageNum: j, text: '' }))
      );
    }
    const results = await Promise.all(batch);
    pages.push(...results);
    onProgress(Math.min(i + BATCH - 1, pdf.numPages), pdf.numPages);
    await yieldToBrowser();
  }
  return pages;
}

async function extractImageHashesFromPage(page, pageNum) {
  const images = [];
  try {
    const ops = await page.getOperatorList();
    let imgCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (imgCount >= 50) break;
      if (ops.fnArray[i] === window.pdfjsLib.OPS.paintImageXObject || ops.fnArray[i] === window.pdfjsLib.OPS.paintJpegXObject) {
        const objId = ops.argsArray[i][0];
        try {
          const img = await new Promise((resolve) => {
            let isDone = false;
            const timer = setTimeout(() => { if (!isDone) { isDone = true; resolve(null); } }, 1000);
            try { page.objs.get(objId, (data) => { if (!isDone) { isDone = true; clearTimeout(timer); resolve(data); } }); }
            catch(e) { if (!isDone) { isDone = true; clearTimeout(timer); resolve(null); } }
          });
          if (img) {
            imgCount++;
            let hash = 0;
            let width = img.width||(img.bitmap&&img.bitmap.width)||0;
            let height = img.height||(img.bitmap&&img.bitmap.height)||0;
            if (width < 50 || height < 50) continue;
            let data = img.data;
            if (!data && img.bitmap) {
              const canvas = document.createElement('canvas');
              canvas.width = Math.min(width,100); canvas.height = Math.min(height,100);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img.bitmap,0,0,canvas.width,canvas.height);
              data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
            }
            if (data && data.length > 0) {
              const step = Math.max(1,Math.floor(data.length/500));
              for (let j = 0; j < data.length; j += step) { hash=((hash<<5)-hash)+data[j]; hash|=0; }
              images.push({ pageNum, width, height, dataHash: hash });
            }
          }
        } catch(e) {}
      }
    }
  } catch(err) {}
  return images;
}

function escapeCsvCell(value) {
  const str = String(value==null?'':value);
  if (str.includes(',')||str.includes('"')||str.includes('\n')) return '"'+str.replace(/"/g,'""')+'"';
  return str;
}
function exportToCsv(matches) {
  const headers = ['Match #','Type','Score','Group A Document','Group A Page','Group B Document','Group B Page','Group A Snippet','Group B Snippet'];
  const rows = matches.map((m,idx) => [idx+1,m.type==='image'?'Image':'Text',m.type==='image'?'100%':`${Math.round(m.score*100)}%`,m.docNameA,m.pageA,m.docNameB,m.pageB,m.type==='text'?(m.chunkA||'').replace(/\s+/g,' ').trim().slice(0,200):`Image: ${m.details||''}`,m.type==='text'?(m.chunkB||'').replace(/\s+/g,' ').trim().slice(0,200):`Image: ${m.details||''}`]);
  const csv = [headers,...rows].map(r=>r.map(escapeCsvCell).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=`medical-records-comparison-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function openPrintReport(results) {
  const textMatches = results.topMatches.filter(m=>m.type==='text');
  const imageMatches = results.topMatches.filter(m=>m.type==='image');
  const dateStr = new Date().toLocaleString();
  const matchRows = results.topMatches.map((m,idx)=>`<tr><td>${idx+1}</td><td>${m.type==='image'?'Image':'Text'}</td><td>${m.type==='image'?'Exact':Math.round(m.score*100)+'%'}</td><td>${escapeHtml(m.docNameA)} — Page ${m.pageA}</td><td>${escapeHtml(m.docNameB)} — Page ${m.pageB}</td><td class="snippet">${m.type==='text'?escapeHtml((m.chunkA||'').slice(0,150))+'…':`[Image: ${escapeHtml(m.details||'')}]`}</td></tr>`).join('');
  const docNames = [...new Set(results.parsedDocs.map(d=>d.name))];
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Medical Records Report</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Verdana,sans-serif;font-size:11px;color:#1e293b;line-height:1.6;padding:32px}h1{font-size:18px;font-weight:bold;margin-bottom:4px}.subtitle{font-size:11px;color:#64748b;margin-bottom:24px}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}.summary-box{border:1px solid #e2e8f0;border-radius:8px;padding:12px}.label{font-size:10px;font-weight:bold;color:#64748b;text-transform:uppercase;margin-bottom:4px}.value{font-size:22px;font-weight:bold}.blue{color:#2563eb}.rose{color:#e11d48}h2{font-size:13px;font-weight:bold;margin:24px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}.doc-list{list-style:none}.doc-list li{padding:3px 0;border-bottom:1px solid #f1f5f9;color:#475569}table{width:100%;border-collapse:collapse;margin-top:8px;font-size:10px}th{background:#f8fafc;font-weight:bold;text-align:left;padding:6px 8px;border:1px solid #e2e8f0;font-size:9px;text-transform:uppercase;color:#64748b}td{padding:5px 8px;border:1px solid #e2e8f0;vertical-align:top}tr:nth-child(even) td{background:#f8fafc}.snippet{color:#475569;font-style:italic;max-width:200px;word-break:break-word}.footer{margin-top:32px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}</style></head><body><h1>Medical Records Comparison Report</h1><div class="subtitle">Generated: ${dateStr} | Medical Records Sorter Assist | All processing done locally. No data was uploaded.</div><div class="summary-grid"><div class="summary-box"><div class="label">Documents</div><div class="value">${results.parsedDocs.length}</div></div><div class="summary-box"><div class="label">Pages</div><div class="value">${results.totalPages}</div></div><div class="summary-box"><div class="label">Text Matches</div><div class="value blue">${textMatches.length}</div></div><div class="summary-box"><div class="label">Image Matches</div><div class="value rose">${imageMatches.length}</div></div></div><h2>Documents Included</h2><ul class="doc-list">${docNames.map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul><h2>All Matches (${results.topMatches.length} total)</h2><table><thead><tr><th>#</th><th>Type</th><th>Score</th><th>Group A</th><th>Group B</th><th>Snippet</th></tr></thead><tbody>${matchRows}</tbody></table><div class="footer">Medical Records Sorter Assist · Privacy-first · No data leaves your device.</div><script>window.onload=()=>window.print()<\/script></body></html>`;
  const win = window.open('','_blank');
  if (win) { win.document.write(html); win.document.close(); }
}

const PdfModal = ({ pdfDoc, pageNum, onClose, S }) => {
  const modalCanvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  useEffect(() => {
    let renderTask = null; let isMounted = true;
    const renderPage = async () => {
      if (!pdfDoc || !modalCanvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = modalCanvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height; canvas.width = viewport.width;
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        if (isMounted) setIsRendering(false);
      } catch (err) { if (err.name !== 'RenderingCancelledException') console.error(err); }
    };
    renderPage();
    return () => { isMounted = false; if (renderTask) renderTask.cancel(); };
  }, [pdfDoc, pageNum]);
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={{ fontWeight: 600 }}>Page {pageNum} Preview</span>
          <button onClick={onClose} style={S.trashBtn}><X size={20} /></button>
        </div>
        <div style={S.modalBody}>
          {isRendering && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>Rendering...</div>}
          <canvas ref={modalCanvasRef} style={{ maxWidth: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', background: '#fff', opacity: isRendering ? 0 : 1, transition: 'opacity 0.3s' }} />
        </div>
      </div>
    </div>
  );
};

const PdfPagePreview = ({ pdfDoc, pageNum, S }) => {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    let renderTask = null; let isMounted = true;
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.6 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height; canvas.width = viewport.width;
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        if (isMounted) setIsRendering(false);
      } catch (err) { if (err.name !== 'RenderingCancelledException') console.error(err); }
    };
    renderPage();
    return () => { isMounted = false; if (renderTask) renderTask.cancel(); };
  }, [pdfDoc, pageNum]);
  return (
    <>
      <div style={S.previewWrap}>
        {isRendering && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 500 }}>Rendering preview...</div>}
        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', opacity: isRendering ? 0 : 1, transition: 'opacity 0.3s' }} />
        {!isRendering && <button onClick={() => setIsFullscreen(true)} style={S.fullscreenBtn} title="View Full Page"><Maximize2 size={18} /></button>}
      </div>
      {isFullscreen && <PdfModal pdfDoc={pdfDoc} pageNum={pageNum} onClose={() => setIsFullscreen(false)} S={S} />}
    </>
  );
};

const HighlightedText = ({ text, sharedWords }) => {
  const parts = text.split(/([a-zA-Z]{3,})/);
  return (
    <span>"{parts.map((part, i) => {
      if (sharedWords.has(part.toLowerCase())) return <mark key={i} style={{ background: 'rgba(253,224,71,0.7)', borderRadius: '3px', padding: '0 2px', fontWeight: 700, color: '#0f172a' }}>{part}</mark>;
      return <span key={i}>{part}</span>;
    })}"</span>
  );
};

export default function App() {
  const [dark, setDark] = useState(false);
  const [appState, setAppState] = useState('IDLE');
  const [filesA, setFilesA] = useState([]);
  const [filesB, setFilesB] = useState([]);
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [results, setResults] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('text');
  const [visibleCount, setVisibleCount] = useState(100);
  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);
  const S = makeStyles(dark);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'; };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  useEffect(() => { setVisibleCount(100); }, [activeResultTab]);

  const handleFileUpload = (e, setFiles) => {
    const selectedFiles = Array.from(e.target.files).filter(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf'));
    if (!selectedFiles.length) return;
    setFiles(prev=>[...prev,...selectedFiles.map(f=>({ id:Math.random().toString(36).substr(2,9), file:f, name:f.name, size:(f.size/(1024*1024)).toFixed(2)+' MB' }))]);
    e.target.value='';
  };

  const removeFile = (id, setFiles) => setFiles(prev=>prev.filter(f=>f.id!==id));

  const runComparison = async () => {
    if (!filesA.length||!filesB.length) { alert("Please upload at least one document in both groups."); return; }
    if (!window.pdfjsLib) { alert("PDF library still loading. Please wait."); return; }
    setAppState('PROCESSING');
    let totalPagesProcessed = 0;

    const parseFiles = async (fileList, startPct, endPct, label) => {
      const parsedDocs = [];
      for (let docIdx=0; docIdx<fileList.length; docIdx++) {
        const fileItem = fileList[docIdx];
        try {
          setProgress({percent:startPct, message:`Opening ${fileItem.name} (${label})...`});
          const arrayBuffer = await fileItem.file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;

          // Fast parallel text extraction
          const pages = await extractTextFromPdf(pdf, fileItem.name, (done, total) => {
            const basePct = startPct + ((docIdx/fileList.length)*(endPct-startPct));
            const withinDoc = (done/total)*((endPct-startPct)/fileList.length);
            setProgress({
              percent: Math.floor(basePct + withinDoc),
              message: `Reading ${label} — ${fileItem.name} (${done}/${total} pages)...`
            });
          });
          totalPagesProcessed += pages.length;

          // Image extraction (sequential, fault-tolerant)
          const imageHashes = [];
          for (let i=1; i<=pdf.numPages; i++) {
            try {
              const page = await pdf.getPage(i);
              imageHashes.push(...(await extractImageHashesFromPage(page, i)));
              page.cleanup();
            } catch(e) {}
            if (i % 20 === 0) await yieldToBrowser();
          }

          parsedDocs.push({id:fileItem.id, name:fileItem.name, pages, imageHashes, pdfDoc:pdf});
        } catch(err) {
          console.error(err);
          alert(`Could not read ${fileItem.name}. Skipping.`);
        }
      }
      return parsedDocs;
    };

    const parsedDocsA = await parseFiles(filesA, 0, 25, "Group A");
    const parsedDocsB = await parseFiles(filesB, 25, 50, "Group B");
    if (!parsedDocsA.length||!parsedDocsB.length) { setAppState('IDLE'); return; }

    setProgress({percent:55, message:'Structuring records for cross-analysis...'});
    await yieldToBrowser();

    // Build page-level word sets for whole-page comparison
    const makePageSets = (docs) => {
      const pages = [];
      docs.forEach(doc => {
        doc.pages.forEach(p => {
          const words = extractWords(p.text);
          const fingerprint = fingerprintPage(p.text);
          if (words.length > 5) {
            pages.push({ docId: doc.id, docName: doc.name, pageNum: p.pageNum, text: p.text, wordSet: new Set(words), fingerprint });
          }
        });
      });
      return pages;
    };

    // Build sliding-window chunks (50-word stride for better boundary coverage)
    const makeChunks = (docs) => {
      const chunks = [];
      docs.forEach(doc => {
        doc.pages.forEach(p => {
          const words = p.text.split(/\s+/).filter(w => w.length > 0);
          const WINDOW = 100; const STRIDE = 50;
          for (let i = 0; i < words.length; i += STRIDE) {
            const t = words.slice(i, i + WINDOW).join(' ');
            if (t.length > 60) chunks.push({ docId: doc.id, docName: doc.name, pageNum: p.pageNum, text: t });
          }
        });
      });
      return chunks;
    };

    const pageSetsA = makePageSets(parsedDocsA);
    const pageSetsB = makePageSets(parsedDocsB);
    const allChunksA = makeChunks(parsedDocsA);
    const allChunksB = makeChunks(parsedDocsB);

    setProgress({percent:58, message:'Running page-level duplicate detection...'});
    await yieldToBrowser();

    const matches = [];
    const PAGE_THRESHOLD = 0.25; // Lower threshold for whole-page comparison
    const CHUNK_THRESHOLD = 0.30; // Lower threshold for chunk comparison
    const seenPagePairs = new Set();
    let lastYield = Date.now();

    // PASS 1: Whole-page comparison — catches scanned/formatted duplicates
    for (let i = 0; i < pageSetsA.length; i++) {
      const pageA = pageSetsA[i];
      for (let j = 0; j < pageSetsB.length; j++) {
        const pageB = pageSetsB[j];
        // Check both full word set and fingerprint similarity
        const score = calculateJaccard(pageA.wordSet, pageB.wordSet);
        const fpScore = calculateJaccard(pageA.fingerprint, pageB.fingerprint);
        const bestScore = Math.max(score, fpScore);
        if (bestScore >= PAGE_THRESHOLD) {
          const pairKey = `${pageA.docId}-${pageA.pageNum}|${pageB.docId}-${pageB.pageNum}`;
          if (!seenPagePairs.has(pairKey)) {
            seenPagePairs.add(pairKey);
            const snippetA = pageA.text.slice(0, 300);
            const snippetB = pageB.text.slice(0, 300);
            matches.push({ type: 'text', docA: pageA.docId, docNameA: pageA.docName, pageA: pageA.pageNum, chunkA: snippetA, docB: pageB.docId, docNameB: pageB.docName, pageB: pageB.pageNum, chunkB: snippetB, score: bestScore });
          }
        }
      }
      if (Date.now() - lastYield > 100) {
        setProgress({ percent: 58 + Math.floor((i / pageSetsA.length) * 10), message: `Page-level scan... (${i}/${pageSetsA.length} pages)` });
        await yieldToBrowser();
        lastYield = Date.now();
      }
    }

    setProgress({percent:68, message:'Building chunk search index (Group B)...'});
    await yieldToBrowser();

    // PASS 2: Sliding-window chunk comparison — catches partial overlaps
    const globalIndexB = new Map();
    allChunksB.forEach((chunk, idx) => {
      const words = extractWords(chunk.text);
      chunk.wordSet = new Set(words);
      words.forEach(w => {
        if (!globalIndexB.has(w)) globalIndexB.set(w, []);
        globalIndexB.get(w).push(idx);
      });
    });
    allChunksA.forEach(chunk => { chunk.wordSet = new Set(extractWords(chunk.text)); });

    for (let i = 0; i < allChunksA.length; i++) {
      const chunkA = allChunksA[i];
      const candidateScores = new Map();
      chunkA.wordSet.forEach(w => {
        const occ = globalIndexB.get(w);
        if (occ) occ.forEach(idxB => { candidateScores.set(idxB, (candidateScores.get(idxB) || 0) + 1); });
      });
      const chunkMatches = [];
      for (let [idxB, sharedCount] of candidateScores.entries()) {
        if (sharedCount >= 3) {
          const score = calculateJaccard(chunkA.wordSet, allChunksB[idxB].wordSet);
          if (score >= CHUNK_THRESHOLD) chunkMatches.push({ idxB, score });
        }
      }
      if (chunkMatches.length > 0) {
        chunkMatches.sort((a, b) => b.score - a.score);
        const best = chunkMatches[0];
        const chunkB = allChunksB[best.idxB];
        const pairKey = `${chunkA.docId}-${chunkA.pageNum}|${chunkB.docId}-${chunkB.pageNum}`;
        // Only add chunk match if no page-level match already covers this page pair
        if (!seenPagePairs.has(pairKey)) {
          seenPagePairs.add(pairKey);
          matches.push({ type: 'text', docA: chunkA.docId, docNameA: chunkA.docName, pageA: chunkA.pageNum, chunkA: chunkA.text, docB: chunkB.docId, docNameB: chunkB.docName, pageB: chunkB.pageNum, chunkB: chunkB.text, score: best.score });
        }
      }
      if (Date.now() - lastYield > 100) {
        setProgress({ percent: 70 + Math.floor((i / allChunksA.length) * 18), message: `Cross-referencing chunks... (${i} / ${allChunksA.length})` });
        await yieldToBrowser();
        lastYield = Date.now();
      }
    }

    setProgress({percent:90, message:'Detecting visual duplicates...'});
    await yieldToBrowser();

    const allImagesA=[]; parsedDocsA.forEach(doc=>doc.imageHashes.forEach(img=>allImagesA.push({...img,docId:doc.id,docName:doc.name})));
    const allImagesB=[]; parsedDocsB.forEach(doc=>doc.imageHashes.forEach(img=>allImagesB.push({...img,docId:doc.id,docName:doc.name})));
    const getIgnoreHashes = (images) => {
      const counts={};
      images.forEach(img=>{counts[img.dataHash]=(counts[img.dataHash]||0)+1;});
      const limit=Math.max(5,totalPagesProcessed/10);
      return new Set(Object.keys(counts).filter(k=>counts[k]>=limit).map(Number));
    };
    const ignoreA=getIgnoreHashes(allImagesA); const ignoreB=getIgnoreHashes(allImagesB);
    for (let i=0; i<allImagesA.length; i++) {
      const imgA=allImagesA[i];
      if (ignoreA.has(imgA.dataHash)||ignoreB.has(imgA.dataHash)) continue;
      for (let j=0; j<allImagesB.length; j++) {
        const imgB=allImagesB[j];
        if (imgA.dataHash===imgB.dataHash&&imgA.width===imgB.width&&imgA.height===imgB.height) {
          matches.push({type:'image',docA:imgA.docId,docNameA:imgA.docName,pageA:imgA.pageNum,docB:imgB.docId,docNameB:imgB.docName,pageB:imgB.pageNum,score:1.0,details:`${imgA.width}x${imgA.height}px`});
          break;
        }
      }
    }

    setProgress({percent:98, message:'Finalizing report...'});
    await yieldToBrowser();
    matches.sort((a,b) => b.score-a.score);
    setResults({parsedDocs:[...parsedDocsA,...parsedDocsB], totalMatches:matches.length, totalPages:totalPagesProcessed, topMatches:matches});
    setActiveResultTab('text'); setVisibleCount(100); setAppState('RESULTS');
  };

  const resetApp = () => {
    if (results?.parsedDocs) results.parsedDocs.forEach(doc=>{ try{ doc.pdfDoc?.destroy(); }catch(e){} });
    setAppState('IDLE'); setResults(null); setFilesA([]); setFilesB([]); setActiveResultTab('text'); setVisibleCount(100);
  };

  const renderFileList = (files, setFiles) => {
    if (!files.length) return (
      <div style={S.emptyState}>
        <FileText size={36} style={{ opacity: 0.2, marginBottom: '8px' }} />
        <span style={{ fontWeight: 600, fontSize: '13px' }}>No documents uploaded.</span>
      </div>
    );
    return files.map(fileItem => (
      <div key={fileItem.id} style={S.fileItem}>
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', marginRight: '8px' }}>
          <div style={S.fileIcon}><FileText size={16} /></div>
          <div style={{ overflow: 'hidden' }}>
            <div style={S.fileName} title={fileItem.name}>{fileItem.name}</div>
            <div style={S.fileSize}>{fileItem.size}</div>
          </div>
        </div>
        <button onClick={() => removeFile(fileItem.id, setFiles)} style={S.trashBtn}><Trash2 size={16} /></button>
      </div>
    ));
  };

  const UploadZone = ({ label, desc, color, files, setFiles, inputRef }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (!droppedFiles.length) return;
      setFiles(prev => [...prev, ...droppedFiles.map(f => ({ id: Math.random().toString(36).substr(2, 9), file: f, name: f.name, size: (f.size / (1024 * 1024)).toFixed(2) + ' MB' }))]);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const cardStyle = {
      ...S.card,
      border: isDragging ? `2px dashed ${color}` : `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
      background: isDragging ? (dark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.02)') : (dark ? '#1e293b' : '#fff'),
      transition: 'border 0.15s, background 0.15s',
    };

    return (
      <div
        style={cardStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div style={S.cardTitle}><FileText size={20} color={color} />{label}</div>
        <div style={S.cardDesc}>{desc}</div>
        <input type="file" accept=".pdf" multiple ref={inputRef} onChange={e => handleFileUpload(e, setFiles)} style={{ display: 'none' }} />

        {/* Drop zone click area */}
        <div
          onClick={() => inputRef.current.click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '28px 16px', borderRadius: '12px', cursor: 'pointer', gap: '6px',
            border: `2px dashed ${isDragging ? color : (dark ? '#334155' : '#e2e8f0')}`,
            color: isDragging ? color : (dark ? '#64748b' : '#94a3b8'),
            background: isDragging ? 'transparent' : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
          }}
        >
          <UploadCloud size={28} color={isDragging ? color : undefined} />
          <span style={{ fontWeight: 700, fontSize: '14px' }}>
            {isDragging ? 'Drop PDF files here' : 'Drag & drop PDFs here'}
          </span>
          <span style={{ fontSize: '12px', opacity: 0.6 }}>or click to browse</span>
        </div>

        {/* File list — only shown when files exist */}
        {files.length > 0 && (
          <div style={{ marginTop: '12px', maxHeight: '180px', overflowY: 'auto' }}>
            {files.map(fileItem => (
              <div key={fileItem.id} style={S.fileItem}>
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', marginRight: '8px' }}>
                  <div style={S.fileIcon}><FileText size={16} /></div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={S.fileName} title={fileItem.name}>{fileItem.name}</div>
                    <div style={S.fileSize}>{fileItem.size}</div>
                  </div>
                </div>
                <button onClick={() => removeFile(fileItem.id, setFiles)} style={S.trashBtn}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderIdleState = () => (
    <div>
      <div style={S.grid2}>
        <UploadZone label="Received Medical Records" desc="Upload the main documents here. You can select multiple files at once." color="#3b82f6" files={filesA} setFiles={setFilesA} inputRef={fileInputARef} />
        <UploadZone label="ERE Medical Records" desc="Upload the documents to compare against. You can select multiple files at once." color="#6366f1" files={filesB} setFiles={setFilesB} inputRef={fileInputBRef} />
      </div>
      <div style={S.center}>
        <button onClick={runComparison} disabled={!filesA.length || !filesB.length} style={S.runBtn(!filesA.length || !filesB.length)}>
          <Play fill="currentColor" size={20} />Run Duplicate Checker
        </button>
      </div>
    </div>
  );

  const renderProcessingState = () => (
    <div style={S.processingWrap}>
      <div style={{ position: 'relative', width: '128px', height: '128px', marginBottom: '32px' }}>
        <svg style={{ width: '100%', height: '100%', color: dark ? '#1e3a5f' : '#dbeafe', animation: 'spin 1s linear infinite' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
        </svg>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: '#2563eb', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283-(283*progress.percent)/100} style={{ transition: 'stroke-dashoffset 0.3s ease-out' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700 }}>{progress.percent}%</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.processingTitle}>Analyzing Documents</div>
      <div style={S.processingMsg}>{progress.message}</div>
    </div>
  );

  const renderResultsState = () => {
    if (!results) return null;
    const textMatches = results.topMatches.filter(m=>m.type==='text');
    const imageMatches = results.topMatches.filter(m=>m.type==='image');
    const displayMatches = activeResultTab==='text' ? textMatches : imageMatches;
    const visibleMatches = displayMatches.slice(0, visibleCount);
    const hasMore = visibleCount < displayMatches.length;
    const remaining = displayMatches.length - visibleCount;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button onClick={resetApp} style={S.resetBtn}><RefreshCw size={18} />Start New Batch Analysis</button>
        </div>
        <div style={S.summaryCard}>
          <div>
            <div style={S.summaryTitle}>Analysis Complete</div>
            <div style={{ color: dark?'#94a3b8':'#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />Processed {results.totalPages} pages across {results.parsedDocs.length} document(s).
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <div style={S.statBox}><div style={S.statLabel}>Context Matches</div><div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb' }}>{textMatches.length}</div></div>
            <div style={S.statBox}><div style={S.statLabel}>Image Matches</div><div style={{ fontSize: '28px', fontWeight: 800, color: '#e11d48' }}>{imageMatches.length}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => exportToCsv(results.topMatches)} style={S.exportBtn('#059669')}><Download size={16} />Export CSV</button>
              <button onClick={() => openPrintReport(results)} style={S.exportBtn('#334155')}><Printer size={16} />Print Report</button>
            </div>
          </div>
        </div>

        <div style={S.sectionTitle}><FileDiff size={24} />Detected Similarities</div>
        <div style={S.tabBar}>
          <button onClick={() => setActiveResultTab('text')} style={S.tab(activeResultTab==='text','#2563eb')}><FileText size={18} />Context Overlaps ({textMatches.length})</button>
          <button onClick={() => setActiveResultTab('image')} style={S.tab(activeResultTab==='image','#e11d48')}><ImageIcon size={18} />Image Duplicates ({imageMatches.length})</button>
        </div>

        {displayMatches.length === 0 ? (
          <div style={S.noResults}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px', display: 'block' }} />
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No {activeResultTab==='text'?'Context':'Image'} Duplicates Found</div>
            <div style={{ color: dark?'#94a3b8':'#64748b', fontWeight: 500 }}>Received Medical Records appear to have no {activeResultTab==='text'?'textual':'visual'} overlaps with Group B records.</div>
          </div>
        ) : (
          <>
            {visibleMatches.map((match, idx) => {
              const isImage = match.type==='image';
              const sharedWords = !isImage ? new Set([...extractWords(match.chunkA)].filter(x=>new Set(extractWords(match.chunkB)).has(x))) : new Set();
              const pdfDocA = results.parsedDocs.find(d=>d.id===match.docA)?.pdfDoc;
              const pdfDocB = results.parsedDocs.find(d=>d.id===match.docB)?.pdfDoc;
              return (
                <div key={idx} style={S.matchCard}>
                  <div style={S.matchHeader}>
                    <span style={S.matchTitle}>Match #{idx+1}{isImage&&<span style={{ color:'#e11d48', marginLeft:'8px' }}>(Image)</span>}</span>
                    <span style={S.badge(isImage)}>{isImage?'Exact Image Match':`${Math.round(match.score*100)}% Match`}</span>
                  </div>
                  <div style={S.matchCols}>
                    {[
                      { group:'Received Medical Records', labelColor:dark?'#60a5fa':'#1d4ed8', docName:match.docNameA, page:match.pageA, bg:dark?'#1e3a5f':'#eff6ff', border:dark?'#2563eb':'#bfdbfe', pillBg:'#2563eb', chunk:match.chunkA, pdfDoc:pdfDocA },
                      { group:'ERE Medical Records', labelColor:dark?'#a5b4fc':'#4338ca', docName:match.docNameB, page:match.pageB, bg:dark?'#1e1b4b':'#eef2ff', border:dark?'#4f46e5':'#c7d2fe', pillBg:'#4f46e5', chunk:match.chunkB, pdfDoc:pdfDocB },
                    ].map(({ group, labelColor, docName, page, bg, border, pillBg, chunk, pdfDoc }, colIdx) => (
                      <div key={group} style={{ ...S.matchCol, borderRight: colIdx===0?`1px solid ${dark?'#334155':'#e2e8f0'}`:'none' }}>
                        <div style={{ ...S.groupLabel, color: labelColor }}>{group}</div>
                        <div style={S.docBadge(bg, border, labelColor)}>
                          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, fontSize:'13px', fontWeight:700 }} title={docName}>{docName}</span>
                          <span style={S.pagePill(pillBg)}>Page {page}</span>
                        </div>
                        <PdfPagePreview pdfDoc={pdfDoc} pageNum={page} S={S} />
                        <div style={S.textBox(isImage)}>
                          {isImage ? (
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:500 }}>
                              <ImageIcon size={20} /><strong>Duplicate Image Detected:</strong> {match.details}
                            </div>
                          ) : (
                            <><span style={{ display:'block', fontWeight:700, marginBottom:'8px' }}>Overlapping text:</span><HighlightedText text={chunk} sharedWords={sharedWords} /></>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div style={S.loadMoreWrap}>
                <span style={{ color:'#64748b', fontWeight:500, fontSize:'13px' }}>Showing {visibleMatches.length} of {displayMatches.length} matches</span>
                <button onClick={() => setVisibleCount(v=>v+100)} style={S.loadMoreBtn}><ChevronDown size={18} />Load {Math.min(100, remaining)} more</button>
              </div>
            )}
            {!hasMore && displayMatches.length > 100 && (
              <div style={{ marginTop:'24px', textAlign:'center', color:'#64748b', fontWeight:500, fontSize:'13px' }}>All {displayMatches.length} matches shown.</div>
            )}
          </>
        )}
        <div style={{ ...S.center, marginTop:'40px' }}>
          <button onClick={resetApp} style={S.resetBtn}><RefreshCw size={20} />Start New Batch Analysis</button>
        </div>
      </div>
    );
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <header style={S.header}>
          <div>
            <h1 style={S.h1}><Search size={32} color="#2563eb" />Medical Records Sorter Assist</h1>
            <p style={S.subtitle}>Easily cross-reference multiple patient files and detect duplicate pages.</p>
          </div>
          <div style={S.headerRight}>
            {appState==='IDLE' && <div style={S.tipBox}><AlertCircle size={20} style={{ flexShrink:0 }} />Tip: Supports batch uploading and 2000+ page documents.</div>}
            <button onClick={() => setDark(d=>!d)} style={S.darkBtn}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              {dark ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>
        <main>
          {appState==='IDLE' && renderIdleState()}
          {appState==='PROCESSING' && renderProcessingState()}
          {appState==='RESULTS' && renderResultsState()}
        </main>
      </div>
    </div>
  );
}
