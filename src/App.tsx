import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Play, RefreshCw, AlertCircle, CheckCircle2, Search, FileDiff, Maximize2, X, Image as ImageIcon, Trash2, Download, Printer, ChevronDown } from 'lucide-react';

const PdfModal = ({ pdfDoc, pageNum, onClose }) => {
  const modalCanvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let renderTask = null;
    let isMounted = true;

    const renderPage = async () => {
      if (!pdfDoc || !modalCanvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = modalCanvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        if (isMounted) setIsRendering(false);
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') console.error("Error rendering full page:", err);
      }
    };

    renderPage();
    return () => {
      isMounted = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, pageNum]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="relative flex flex-col max-h-full max-w-full bg-slate-100 rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="font-semibold text-slate-800">Page {pageNum} Preview</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex justify-center items-start relative min-w-[300px] min-h-[300px]">
          {isRendering && <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium bg-slate-100 z-0">Rendering high-quality page...</div>}
          <canvas ref={modalCanvasRef} className={`max-w-none shadow-lg z-10 transition-opacity duration-300 bg-white ${isRendering ? 'opacity-0' : 'opacity-100'}`} />
        </div>
      </div>
    </div>
  );
};

const PdfPagePreview = ({ pdfDoc, pageNum }) => {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let renderTask = null;
    let isMounted = true;

    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.6 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        if (isMounted) setIsRendering(false);
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') console.error("Error rendering page thumbnail:", err);
      }
    };

    renderPage();
    return () => {
      isMounted = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, pageNum]);

  return (
    <>
      <div className="relative w-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 min-h-[250px] my-3 group">
        {isRendering && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium bg-slate-50">Rendering preview...</div>}
        <canvas ref={canvasRef} className={`max-w-full h-auto drop-shadow-md transition-opacity duration-300 ${isRendering ? 'opacity-0' : 'opacity-100'}`} />
        {!isRendering && (
          <button onClick={() => setIsFullscreen(true)} className="absolute top-3 right-3 p-2 bg-white/90 text-slate-700 rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 transition-all focus:opacity-100" title="View Full Page">
            <Maximize2 size={18} />
          </button>
        )}
      </div>
      {isFullscreen && <PdfModal pdfDoc={pdfDoc} pageNum={pageNum} onClose={() => setIsFullscreen(false)} />}
    </>
  );
};

const HighlightedText = ({ text, sharedWords }) => {
  const parts = text.split(/([a-zA-Z]{3,})/);
  return (
    <span>
      "
      {parts.map((part, i) => {
        if (sharedWords.has(part.toLowerCase())) {
          return <mark key={i} className="bg-yellow-300 bg-opacity-70 rounded px-0.5 font-semibold text-slate-900">{part}</mark>;
        }
        return <span key={i}>{part}</span>;
      })}
      "
    </span>
  );
};

// --- Algorithm Core ---
const STOP_WORDS = new Set(["the", "and", "is", "in", "to", "of", "it", "that", "for", "on", "with", "as", "was", "at", "by", "an", "be", "this", "which", "or", "from", "are", "we", "you", "they", "not", "but", "have", "has", "had"]);

function extractWords(text) {
  return Array.from(new Set(text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [])).filter(w => !STOP_WORDS.has(w));
}

function calculateJaccard(setA, setB) {
  let intersection = 0;
  for (let elem of setA) {
    if (setB.has(elem)) intersection++;
  }
  let union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const yieldToBrowser = async () => new Promise(r => setTimeout(r, 0));

async function extractImageHashesFromPage(page, pageNum) {
  const images = [];
  try {
    const ops = await page.getOperatorList();
    let imgCount = 0;
    const MAX_IMAGES_PER_PAGE = 50;

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (imgCount >= MAX_IMAGES_PER_PAGE) break;

      if (ops.fnArray[i] === window.pdfjsLib.OPS.paintImageXObject ||
          ops.fnArray[i] === window.pdfjsLib.OPS.paintJpegXObject) {
        const objId = ops.argsArray[i][0];
        try {
          const img = await new Promise((resolve) => {
            let isDone = false;
            const timer = setTimeout(() => { if (!isDone) { isDone = true; resolve(null); } }, 1000);
            try {
              page.objs.get(objId, (data) => { if (!isDone) { isDone = true; clearTimeout(timer); resolve(data); } });
            } catch(e) {
              if (!isDone) { isDone = true; clearTimeout(timer); resolve(null); }
            }
          });

          if (img) {
            imgCount++;
            let hash = 0;
            let width = img.width || (img.bitmap && img.bitmap.width) || 0;
            let height = img.height || (img.bitmap && img.bitmap.height) || 0;
            if (width < 50 || height < 50) continue;

            let data = img.data;
            if (!data && img.bitmap) {
              const canvas = document.createElement('canvas');
              canvas.width = Math.min(width, 100);
              canvas.height = Math.min(height, 100);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img.bitmap, 0, 0, canvas.width, canvas.height);
              data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            }

            if (data && data.length > 0) {
              const step = Math.max(1, Math.floor(data.length / 500));
              for (let j = 0; j < data.length; j += step) {
                hash = ((hash << 5) - hash) + data[j];
                hash |= 0;
              }
              images.push({ pageNum, width, height, dataHash: hash });
            }
          }
        } catch (e) { /* Ignore unextractable objects */ }
      }
    }
  } catch (err) {
    console.warn("Operator list error", err);
  }
  return images;
}

// --- Export Utilities ---

function escapeCsvCell(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function exportToCsv(matches) {
  const headers = ['Match #', 'Type', 'Score', 'Group A Document', 'Group A Page', 'Group B Document', 'Group B Page', 'Group A Snippet', 'Group B Snippet'];
  const rows = matches.map((m, idx) => [
    idx + 1,
    m.type === 'image' ? 'Image' : 'Text',
    m.type === 'image' ? '100%' : `${Math.round(m.score * 100)}%`,
    m.docNameA,
    m.pageA,
    m.docNameB,
    m.pageB,
    m.type === 'text' ? (m.chunkA || '').replace(/\s+/g, ' ').trim().slice(0, 200) : `Image: ${m.details || ''}`,
    m.type === 'text' ? (m.chunkB || '').replace(/\s+/g, ' ').trim().slice(0, 200) : `Image: ${m.details || ''}`,
  ]);

  const csvContent = [headers, ...rows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medical-records-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openPrintReport(results) {
  const textMatches = results.topMatches.filter(m => m.type === 'text');
  const imageMatches = results.topMatches.filter(m => m.type === 'image');
  const dateStr = new Date().toLocaleString();

  const matchRows = results.topMatches.map((m, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${m.type === 'image' ? 'Image' : 'Text'}</td>
      <td>${m.type === 'image' ? 'Exact' : Math.round(m.score * 100) + '%'}</td>
      <td>${escapeHtml(m.docNameA)} — Page ${m.pageA}</td>
      <td>${escapeHtml(m.docNameB)} — Page ${m.pageB}</td>
      <td class="snippet">${m.type === 'text' ? escapeHtml((m.chunkA || '').slice(0, 150)) + '…' : `[Image: ${escapeHtml(m.details || '')}]`}</td>
    </tr>
  `).join('');

  const docNames = [...new Set(results.parsedDocs.map(d => d.name))];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Medical Records Comparison Report — ${dateStr}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Verdana, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.6; padding: 32px; }
  h1 { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #64748b; margin-bottom: 24px; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .summary-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .summary-box .label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .summary-box .value { font-size: 22px; font-weight: bold; }
  .value.blue { color: #2563eb; }
  .value.rose { color: #e11d48; }
  h2 { font-size: 13px; font-weight: bold; margin: 24px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .doc-list { list-style: none; margin-bottom: 8px; }
  .doc-list li { padding: 3px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
  th { background: #f8fafc; font-weight: bold; text-align: left; padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
  td { padding: 5px 8px; border: 1px solid #e2e8f0; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }
  .snippet { color: #475569; font-style: italic; max-width: 200px; word-break: break-word; }
  .footer { margin-top: 32px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  @media print {
    body { padding: 16px; }
    @page { margin: 1.5cm; }
  }
</style>
</head>
<body>
  <h1>Medical Records Comparison Report</h1>
  <div class="subtitle">Generated: ${dateStr} &nbsp;|&nbsp; Medical Records Sorter Assist &nbsp;|&nbsp; All processing done locally in-browser. No data was uploaded.</div>

  <div class="summary-grid">
    <div class="summary-box"><div class="label">Documents Analyzed</div><div class="value">${results.parsedDocs.length}</div></div>
    <div class="summary-box"><div class="label">Pages Processed</div><div class="value">${results.totalPages}</div></div>
    <div class="summary-box"><div class="label">Text Matches</div><div class="value blue">${textMatches.length}</div></div>
    <div class="summary-box"><div class="label">Image Matches</div><div class="value rose">${imageMatches.length}</div></div>
  </div>

  <h2>Documents Included</h2>
  <ul class="doc-list">
    ${docNames.map(n => `<li>${escapeHtml(n)}</li>`).join('')}
  </ul>

  <h2>All Detected Matches (${results.topMatches.length} total)</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Type</th>
        <th>Score</th>
        <th>Group A</th>
        <th>Group B</th>
        <th>Snippet</th>
      </tr>
    </thead>
    <tbody>${matchRows}</tbody>
  </table>

  <div class="footer">Medical Records Sorter Assist &nbsp;·&nbsp; Privacy-first, browser-based document comparison &nbsp;·&nbsp; No data leaves your device.</div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Main App ---

export default function App() {
  const [appState, setAppState] = useState('IDLE');
  const [filesA, setFilesA] = useState([]);
  const [filesB, setFilesB] = useState([]);
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [results, setResults] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('text');
  const [visibleCount, setVisibleCount] = useState(100);

  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // Reset visible count when tab changes
  useEffect(() => {
    setVisibleCount(100);
  }, [activeResultTab]);

  const handleFileUpload = (e, setFiles) => {
    const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (selectedFiles.length === 0) return;
    const newFiles = selectedFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (idToRemove, setFiles) => {
    setFiles(prev => prev.filter(f => f.id !== idToRemove));
  };

  const runComparison = async () => {
    if (filesA.length === 0 || filesB.length === 0) {
      alert("Please upload at least one document in both Group A and Group B.");
      return;
    }
    if (!window.pdfjsLib) {
      alert("PDF processing library is still loading. Please wait a moment.");
      return;
    }

    setAppState('PROCESSING');
    let totalPagesProcessed = 0;

    const parseFiles = async (fileList, startPct, endPct, label) => {
      const parsedDocs = [];
      for (let docIdx = 0; docIdx < fileList.length; docIdx++) {
        const fileItem = fileList[docIdx];
        try {
          setProgress({ percent: startPct, message: `Opening ${fileItem.name} (${label})...` });
          const arrayBuffer = await fileItem.file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
          const pages = [];
          const imageHashes = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              pages.push({ pageNum: i, text: textContent.items.map(item => item.str).join(' ') });
              imageHashes.push(...(await extractImageHashesFromPage(page, i)));
              page.cleanup();
            } catch (pageErr) {
              console.warn(`Skipping corrupted page ${i} in ${fileItem.name}`, pageErr);
            }

            totalPagesProcessed++;

            if (i % 5 === 0 || i === pdf.numPages) {
              const basePct = startPct + ((docIdx / fileList.length) * (endPct - startPct));
              const progressWithinDoc = (i / pdf.numPages) * ((endPct - startPct) / fileList.length);
              setProgress({
                percent: Math.floor(basePct + progressWithinDoc),
                message: `Reading ${label} - ${fileItem.name} (Page ${i} of ${pdf.numPages})...`
              });
              await yieldToBrowser();
            }
          }
          parsedDocs.push({ id: fileItem.id, name: fileItem.name, pages, imageHashes, pdfDoc: pdf });
        } catch (err) {
          console.error(`Error parsing ${fileItem.name}:`, err);
          alert(`Could not extract data from ${fileItem.name}. Skipping file.`);
        }
      }
      return parsedDocs;
    };

    const parsedDocsA = await parseFiles(filesA, 0, 25, "Group A");
    const parsedDocsB = await parseFiles(filesB, 25, 50, "Group B");

    if (parsedDocsA.length === 0 || parsedDocsB.length === 0) {
      setAppState('IDLE');
      return;
    }

    setProgress({ percent: 55, message: 'Structuring medical records for cross-analysis...' });
    await yieldToBrowser();

    const allChunksA = [];
    parsedDocsA.forEach(doc => {
      doc.pages.forEach(p => {
        const words = p.text.split(/\s+/);
        for (let i = 0; i < words.length; i += 100) {
          const chunkText = words.slice(i, i + 100).join(' ');
          if (chunkText.length > 50) allChunksA.push({ docId: doc.id, docName: doc.name, pageNum: p.pageNum, text: chunkText });
        }
      });
    });

    const allChunksB = [];
    parsedDocsB.forEach(doc => {
      doc.pages.forEach(p => {
        const words = p.text.split(/\s+/);
        for (let i = 0; i < words.length; i += 100) {
          const chunkText = words.slice(i, i + 100).join(' ');
          if (chunkText.length > 50) allChunksB.push({ docId: doc.id, docName: doc.name, pageNum: p.pageNum, text: chunkText });
        }
      });
    });

    setProgress({ percent: 60, message: 'Building target search index (Group B)...' });
    await yieldToBrowser();

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

    const matches = [];
    const SIMILARITY_THRESHOLD = 0.45;
    let lastYield = Date.now();

    for (let i = 0; i < allChunksA.length; i++) {
      const chunkA = allChunksA[i];
      const candidateScores = new Map();

      chunkA.wordSet.forEach(w => {
        const occurrences = globalIndexB.get(w);
        if (occurrences) {
          occurrences.forEach(idxB => {
            candidateScores.set(idxB, (candidateScores.get(idxB) || 0) + 1);
          });
        }
      });

      const chunkMatches = [];
      for (let [idxB, sharedCount] of candidateScores.entries()) {
        if (sharedCount >= 3) {
          const chunkB = allChunksB[idxB];
          const score = calculateJaccard(chunkA.wordSet, chunkB.wordSet);
          if (score >= SIMILARITY_THRESHOLD) {
            chunkMatches.push({ idxB, score });
          }
        }
      }

      if (chunkMatches.length > 0) {
        chunkMatches.sort((a, b) => b.score - a.score);
        const best = chunkMatches[0];
        const chunkB = allChunksB[best.idxB];
        matches.push({
          type: 'text',
          docA: chunkA.docId, docNameA: chunkA.docName, pageA: chunkA.pageNum, chunkA: chunkA.text,
          docB: chunkB.docId, docNameB: chunkB.docName, pageB: chunkB.pageNum, chunkB: chunkB.text,
          score: best.score
        });
      }

      if (Date.now() - lastYield > 50) {
        setProgress({
          percent: 65 + Math.floor((i / allChunksA.length) * 20),
          message: `Cross-referencing text... (${i} / ${allChunksA.length} sections)`
        });
        await yieldToBrowser();
        lastYield = Date.now();
      }
    }

    setProgress({ percent: 90, message: 'Detecting visual duplicates...' });
    await yieldToBrowser();

    const allImagesA = [];
    parsedDocsA.forEach(doc => { doc.imageHashes.forEach(img => { allImagesA.push({ ...img, docId: doc.id, docName: doc.name }); }); });
    const allImagesB = [];
    parsedDocsB.forEach(doc => { doc.imageHashes.forEach(img => { allImagesB.push({ ...img, docId: doc.id, docName: doc.name }); }); });

    const getIgnoreHashes = (images) => {
      const counts = {};
      images.forEach(img => { counts[img.dataHash] = (counts[img.dataHash] || 0) + 1; });
      const limit = Math.max(5, totalPagesProcessed / 10);
      return new Set(Object.keys(counts).filter(k => counts[k] >= limit).map(Number));
    };
    const ignoreHashesA = getIgnoreHashes(allImagesA);
    const ignoreHashesB = getIgnoreHashes(allImagesB);

    for (let i = 0; i < allImagesA.length; i++) {
      const imgA = allImagesA[i];
      if (ignoreHashesA.has(imgA.dataHash) || ignoreHashesB.has(imgA.dataHash)) continue;
      for (let j = 0; j < allImagesB.length; j++) {
        const imgB = allImagesB[j];
        if (imgA.dataHash === imgB.dataHash && imgA.width === imgB.width && imgA.height === imgB.height) {
          matches.push({
            type: 'image',
            docA: imgA.docId, docNameA: imgA.docName, pageA: imgA.pageNum,
            docB: imgB.docId, docNameB: imgB.docName, pageB: imgB.pageNum,
            score: 1.0,
            details: `${imgA.width}x${imgA.height}px`
          });
          break;
        }
      }
    }

    setProgress({ percent: 98, message: 'Finalizing report...' });
    await yieldToBrowser();

    matches.sort((a, b) => b.score - a.score);

    setResults({
      parsedDocs: [...parsedDocsA, ...parsedDocsB],
      totalMatches: matches.length,
      totalPages: totalPagesProcessed,
      topMatches: matches
    });

    setActiveResultTab('text');
    setVisibleCount(100);
    setAppState('RESULTS');
  };

  const resetApp = () => {
    // Destroy PDF documents to free memory
    if (results && results.parsedDocs) {
      results.parsedDocs.forEach(doc => {
        try { doc.pdfDoc && doc.pdfDoc.destroy(); } catch (e) { /* ignore */ }
      });
    }
    setAppState('IDLE');
    setResults(null);
    setFilesA([]);
    setFilesB([]);
    setActiveResultTab('text');
    setVisibleCount(100);
  };

  const renderFileList = (files, setFiles) => {
    if (files.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 min-h-[150px]">
          <FileText size={36} className="mb-3 opacity-20" />
          <p className="font-semibold text-center text-sm">No documents uploaded.</p>
        </div>
      );
    }
    return (
      <ul className="space-y-3 mt-4 max-h-[200px] overflow-y-auto pr-2">
        {files.map((fileItem) => (
          <li key={fileItem.id} className="bg-white border border-slate-200 p-3 rounded-lg flex justify-between items-center shadow-sm">
            <div className="flex items-center overflow-hidden mr-3">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-md mr-3 shrink-0"><FileText size={16} /></div>
              <div className="truncate">
                <p className="font-bold text-slate-800 text-sm truncate" title={fileItem.name}>{fileItem.name}</p>
                <p className="text-xs text-slate-500 font-medium">{fileItem.size}</p>
              </div>
            </div>
            <button onClick={() => removeFile(fileItem.id, setFiles)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0" title="Remove file">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const renderIdleState = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center"><FileText className="mr-2 text-blue-600" /> Group A (Primary)</h2>
            <p className="text-slate-500 text-sm mt-1">Upload the main documents here. You can select multiple files at once.</p>
          </div>
          <input type="file" accept=".pdf" multiple ref={fileInputARef} onChange={(e) => handleFileUpload(e, setFilesA)} className="hidden" />
          <button onClick={() => fileInputARef.current.click()} className="w-full flex flex-col justify-center items-center py-6 px-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors">
            <UploadCloud className="mb-2" size={28} />
            <span className="font-bold text-base mb-1">Add PDF Files</span>
          </button>
          <div className="mt-4 flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">{renderFileList(filesA, setFilesA)}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center"><FileText className="mr-2 text-indigo-600" /> Group B (Target)</h2>
            <p className="text-slate-500 text-sm mt-1">Upload the documents to compare against. You can select multiple files at once.</p>
          </div>
          <input type="file" accept=".pdf" multiple ref={fileInputBRef} onChange={(e) => handleFileUpload(e, setFilesB)} className="hidden" />
          <button onClick={() => fileInputBRef.current.click()} className="w-full flex flex-col justify-center items-center py-6 px-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors">
            <UploadCloud className="mb-2" size={28} />
            <span className="font-bold text-base mb-1">Add PDF Files</span>
          </button>
          <div className="mt-4 flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">{renderFileList(filesB, setFilesB)}</div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={runComparison}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-12 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center text-lg disabled:opacity-50 disabled:hover:scale-100"
          disabled={filesA.length === 0 || filesB.length === 0}
        >
          <Play className="mr-2" fill="currentColor" size={20} />
          Run AI Comparison
        </button>
      </div>
    </div>
  );

  const renderProcessingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-32 h-32 mb-8">
        <svg className="animate-spin w-full h-full text-blue-100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
        </svg>
        <svg className="absolute top-0 left-0 w-full h-full text-blue-600" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress.percent) / 100}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-700">{progress.percent}%</div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Documents</h3>
      <p className="text-slate-500 font-medium">{progress.message}</p>
    </div>
  );

  const renderResultsState = () => {
    if (!results) return null;

    const textMatches = results.topMatches.filter(m => m.type === 'text');
    const imageMatches = results.topMatches.filter(m => m.type === 'image');
    const displayMatches = activeResultTab === 'text' ? textMatches : imageMatches;
    const visibleMatches = displayMatches.slice(0, visibleCount);
    const hasMore = visibleCount < displayMatches.length;
    const remaining = displayMatches.length - visibleCount;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-end mb-4">
          <button
            onClick={resetApp}
            className="flex items-center text-slate-600 hover:text-slate-900 font-bold py-2 px-6 rounded-full border-2 border-slate-300 hover:bg-slate-100 transition-colors bg-white shadow-sm"
          >
            <RefreshCw className="mr-2" size={18} />
            Start New Batch Analysis
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Analysis Complete</h2>
            <p className="text-slate-500 flex items-center font-medium">
              <CheckCircle2 className="mr-2 text-emerald-500" size={18} />
              Processed {results.totalPages} pages across {results.parsedDocs.length} document(s).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Stats */}
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[130px]">
              <div className="text-sm text-slate-500 mb-1 font-bold">Context Matches</div>
              <div className="text-3xl font-extrabold text-blue-600">{textMatches.length}</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[130px]">
              <div className="text-sm text-slate-500 mb-1 font-bold">Image Matches</div>
              <div className="text-3xl font-extrabold text-rose-600">{imageMatches.length}</div>
            </div>

            {/* Export buttons */}
            <div className="flex flex-col gap-2 ml-2">
              <button
                onClick={() => exportToCsv(results.topMatches)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-colors text-sm"
                title="Download all matches as a CSV spreadsheet"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() => openPrintReport(results)}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-colors text-sm"
                title="Open a print-ready summary report"
              >
                <Printer size={16} />
                Print Report
              </button>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><FileDiff className="mr-3" />Detected Similarities</h3>

        <div className="flex space-x-2 mb-6 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveResultTab('text')}
            className={`px-6 py-3 font-bold border-b-2 transition-colors flex items-center shrink-0 ${activeResultTab === 'text' ? 'border-blue-600 text-blue-800 bg-blue-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <FileText size={18} className="mr-2" />
            Context Overlaps ({textMatches.length})
          </button>
          <button
            onClick={() => setActiveResultTab('image')}
            className={`px-6 py-3 font-bold border-b-2 transition-colors flex items-center shrink-0 ${activeResultTab === 'image' ? 'border-rose-600 text-rose-800 bg-rose-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <ImageIcon size={18} className="mr-2" />
            Image Duplicates ({imageMatches.length})
          </button>
        </div>

        {displayMatches.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
            <h4 className="text-xl font-bold text-slate-800 mb-2">No {activeResultTab === 'text' ? 'Context' : 'Image'} Duplicates Found</h4>
            <p className="text-slate-500 font-medium">Group A documents appear to have no {activeResultTab === 'text' ? 'textual' : 'visual'} overlaps with Group B records.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {visibleMatches.map((match, idx) => {
                const isImage = match.type === 'image';
                const sharedWords = !isImage ? new Set([...extractWords(match.chunkA)].filter(x => new Set(extractWords(match.chunkB)).has(x))) : new Set();
                const pdfDocA = results.parsedDocs.find(d => d.id === match.docA)?.pdfDoc;
                const pdfDocB = results.parsedDocs.find(d => d.id === match.docB)?.pdfDoc;

                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-lg">
                        Match #{idx + 1} {isImage && <span className="ml-2 text-rose-600 text-base font-bold">(Image)</span>}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${isImage ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isImage ? 'Exact Image Match' : `${Math.round(match.score * 100)}% Match`}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                      <div className="p-6 flex flex-col">
                        <div className="text-sm font-bold text-blue-700 mb-3">
                          <div className="uppercase tracking-wider mb-1">Group A (Primary)</div>
                          <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                            <span className="truncate flex-1 mr-2" title={match.docNameA}>{match.docNameA}</span>
                            <span className="shrink-0 bg-blue-600 text-white px-2 py-0.5 rounded text-xs">Page {match.pageA}</span>
                          </div>
                        </div>
                        <PdfPagePreview pdfDoc={pdfDocA} pageNum={match.pageA} />
                        <div className={`mt-3 p-4 border rounded-xl text-base leading-loose ${isImage ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                          {isImage ? (
                            <div className="flex items-center font-medium"><ImageIcon size={20} className="mr-2" /><span className="font-bold mr-2">Duplicate Image Detected:</span>{match.details}</div>
                          ) : (
                            <><span className="block font-bold text-slate-900 mb-2">Overlapping text:</span><HighlightedText text={match.chunkA} sharedWords={sharedWords} /></>
                          )}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col">
                        <div className="text-sm font-bold text-indigo-700 mb-3">
                          <div className="uppercase tracking-wider mb-1">Group B (Target)</div>
                          <div className="flex items-center bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                            <span className="truncate flex-1 mr-2" title={match.docNameB}>{match.docNameB}</span>
                            <span className="shrink-0 bg-indigo-600 text-white px-2 py-0.5 rounded text-xs">Page {match.pageB}</span>
                          </div>
                        </div>
                        <PdfPagePreview pdfDoc={pdfDocB} pageNum={match.pageB} />
                        <div className={`mt-3 p-4 border rounded-xl text-base leading-loose ${isImage ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                          {isImage ? (
                            <div className="flex items-center font-medium"><ImageIcon size={20} className="mr-2" /><span className="font-bold mr-2">Duplicate Image Detected:</span>{match.details}</div>
                          ) : (
                            <><span className="block font-bold text-slate-900 mb-2">Overlapping text:</span><HighlightedText text={match.chunkB} sharedWords={sharedWords} /></>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-slate-500 font-medium text-sm">
                  Showing {visibleMatches.length} of {displayMatches.length} matches
                </p>
                <button
                  onClick={() => setVisibleCount(v => v + 100)}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-full border-2 border-slate-300 shadow-sm transition-colors"
                >
                  <ChevronDown size={18} />
                  Load {Math.min(100, remaining)} more
                </button>
              </div>
            )}

            {!hasMore && displayMatches.length > 100 && (
              <div className="mt-6 text-center text-slate-500 font-medium text-sm">
                All {displayMatches.length} matches shown.
              </div>
            )}
          </>
        )}

        <div className="mt-10 flex justify-center">
          <button onClick={resetApp} className="flex items-center text-slate-600 hover:text-slate-900 font-bold py-3 px-8 rounded-full border-2 border-slate-300 hover:bg-slate-100 transition-colors">
            <RefreshCw className="mr-2" size={20} />
            Start New Batch Analysis
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Verdana','sans-serif'] tracking-wide leading-relaxed p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center md:justify-start">
              <Search className="mr-3 text-blue-600" size={32} />
              Medical Records Sorter Assist
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Easily cross-reference multiple patient files and detect duplicate pages.</p>
          </div>
          {appState === 'IDLE' && (
            <div className="mt-4 md:mt-0 bg-blue-50 text-blue-800 text-sm px-5 py-3 rounded-xl border border-blue-200 flex items-center font-bold">
              <AlertCircle size={20} className="mr-2 shrink-0" />
              Tip: Supports batch uploading and 2000+ page documents.
            </div>
          )}
        </header>

        <main>
          {appState === 'IDLE' && renderIdleState()}
          {appState === 'PROCESSING' && renderProcessingState()}
          {appState === 'RESULTS' && renderResultsState()}
        </main>
      </div>
    </div>
  );
}
