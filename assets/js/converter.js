(() => {
  const card = document.querySelector('[data-converter]');
  if (!card) return;
  const type = card.dataset.converter, output = card.dataset.output;
  const input = document.getElementById('file-input'), zone = document.getElementById('upload-zone');
  const panel = document.getElementById('file-panel'), nameEl = document.getElementById('file-name');
  const sizeEl = document.getElementById('file-size'), status = document.getElementById('status');
  const convert = document.getElementById('convert-button'), download = document.getElementById('download-button');
  const remove = document.getElementById('remove-file'), progress = document.getElementById('progress-track');
  let file = null, resultUrl = null;
  const pretty = n => n < 1024*1024 ? `${(n/1024).toFixed(1)} KB` : `${(n/1024/1024).toFixed(2)} MB`;
  function reset() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = null; file = null; input.value = ''; panel.hidden = true; zone.hidden = false;
    download.hidden = true; progress.hidden = true; convert.hidden = false; convert.disabled = false;
  }
  function accept(f) {
    if (!f) return;
    if (type === 'image' && !f.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    if (type === 'video' && !f.type.startsWith('video/')) { alert('Please choose a video file.'); return; }
    reset(); file = f; zone.hidden = true; panel.hidden = false;
    nameEl.textContent = f.name; sizeEl.textContent = pretty(f.size); status.textContent = 'Ready to convert';
    document.getElementById('file-symbol').textContent = f.name.split('.').pop().slice(0,5).toUpperCase();
  }
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }});
  input.addEventListener('change', () => accept(input.files[0]));
  ['dragenter','dragover'].forEach(ev => zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add('dragging')}));
  ['dragleave','drop'].forEach(ev => zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove('dragging')}));
  zone.addEventListener('drop', e => accept(e.dataTransfer.files[0]));
  remove.addEventListener('click', reset);
  function save(blob) {
    resultUrl = URL.createObjectURL(blob);
    const base = file.name.replace(/\.[^.]+$/, '');
    download.href = resultUrl; download.download = `${base}.${output}`;
    download.hidden = false; status.textContent = 'Conversion complete. Your file is ready.';
    convert.hidden = true;
  }
  convert.addEventListener('click', async () => {
    if (!file) return;
    convert.disabled = true; progress.hidden = false; status.textContent = 'Converting…';
    try {
      if (type === 'image') {
        const img = new Image(), src = URL.createObjectURL(file);
        await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src});
        const canvas = document.createElement('canvas'); canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        const ctx=canvas.getContext('2d');
        if (output === 'jpg') {ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}
        ctx.drawImage(img,0,0); URL.revokeObjectURL(src);
        const mime = output === 'jpg' ? 'image/jpeg' : 'image/png';
        const blob = await new Promise(resolve=>canvas.toBlob(resolve,mime,0.92));
        if (!blob) throw new Error('This image could not be converted.');
        save(blob);
      } else {
        if (!('MediaRecorder' in window)) throw new Error('This browser does not support video recording. Try the latest Chrome or Edge.');
        const video=document.createElement('video'), src=URL.createObjectURL(file);
        video.muted=true; video.playsInline=true; video.src=src;
        await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error('Could not read this video.'))});
        if (!video.captureStream) throw new Error('Video conversion is not supported in this browser.');
        const stream=video.captureStream();
        const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
        if (!mime) throw new Error('WebM recording is not supported in this browser.');
        const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000}), chunks=[];
        recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
        const finished=new Promise((resolve,reject)=>{recorder.onstop=()=>resolve(new Blob(chunks,{type:'video/webm'}));recorder.onerror=()=>reject(new Error('Video recording failed.'))});
        recorder.start(250); await video.play();
        await new Promise(resolve=>{video.onended=resolve;video.onerror=resolve});
        recorder.stop(); const blob=await finished;
        stream.getTracks().forEach(t=>t.stop()); URL.revokeObjectURL(src);
        save(blob);
      }
    } catch(err) { status.textContent=err.message || 'Conversion failed.'; convert.disabled=false; }
  });
})();
