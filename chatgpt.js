/* chatgpt.js – floating chatbox logic with drag-move + worker call */

document.addEventListener('DOMContentLoaded', () => {
  // base elements
  const widget    = document.getElementById('chat-widget');   // wrapper
  const chatBox   = document.getElementById('chat-messages');
  const inputEl   = document.getElementById('chat-input');
  const sendBtn   = document.getElementById('chat-send');

  // toggle / window elements
  const toggleBtn  = document.getElementById('chat-toggle');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn   = document.getElementById('chat-close'); // drag when open

// --- CLOSE‐button listeners (insert these) ---
closeBtn.addEventListener('mousedown', e => e.stopPropagation());   // stop drag
closeBtn.addEventListener('click', () => {
  chatWindow.classList.add('hidden');   // hide chat window
  toggleBtn.style.display = 'block';    // show circle button
});
// --------------------------------------------

// rest of your code stays the same …
  const dragHandle = document.getElementById('chat-header'); // drag when open

  /* ---------- open / close ---------- */
toggleBtn?.addEventListener('click', () => {
  // 1. Show the window so we can get its size
  chatWindow.classList.remove('hidden');
  toggleBtn.style.display = 'none';

  /* ------------------------------------------------------------------
     Calculate local offsets (left/top INSIDE the widget) so the
     chat window never goes off-screen on any side.
  ------------------------------------------------------------------- */
  const gap   = 8;                                   // breathing room
  const wRect = widget.getBoundingClientRect();      // circle position
  const winW  = window.innerWidth;
  const winH  = window.innerHeight;
  const cwW   = chatWindow.offsetWidth;
  const cwH   = chatWindow.offsetHeight;

  // Default: window sits 56 px below circle, left-aligned
  let localLeft = 0;
  let localTop  = 56;

  /* --- If the window would overflow the right edge, slide it left --- */
  const globalRight = wRect.left + localLeft + cwW;
  if (globalRight > winW - gap) {
    localLeft -= (globalRight - (winW - gap));       // shift left
  }

  /* --- If the window would overflow the bottom, flip it above circle --- */
  const globalBottom = wRect.top + localTop + cwH;
  if (globalBottom > winH - gap) {
    localTop = -cwH - gap;                           // open upward
  }

  /* --- Clamp against the left & top edges as well ------------------- */
  if (wRect.left + localLeft < gap) {
    localLeft = gap - wRect.left;
  }
  if (wRect.top + localTop < gap) {
    localTop = gap - wRect.top;
  }

  // 2. Apply the final, possibly negative, offsets
  chatWindow.style.left = `${localLeft}px`;
  chatWindow.style.top  = `${localTop}px`;
});

  /* ---------- DRAG / MOVE functionality ---------- */
  let isDragging = false, startX = 0, startY = 0;

  const startDrag = (e) => {
    if (e.target.id === 'chat-close') return;
    isDragging = true;
    startX = e.clientX - widget.offsetLeft;
    startY = e.clientY - widget.offsetTop;
    document.body.style.userSelect = 'none';

    // Clear right/bottom so the widget uses left/top only
    widget.style.right = 'auto';
    widget.style.transform = 'none';
    widget.style.bottom = 'auto';
    widget.style.left = widget.offsetLeft + 'px';
    widget.style.top = widget.offsetTop + 'px';
  };

  toggleBtn.addEventListener('mousedown', startDrag);
  dragHandle.addEventListener('mousedown', startDrag);

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const widgetWidth = widget.offsetWidth;
  const widgetHeight = widget.offsetHeight;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const newLeft = Math.min(Math.max(0, e.clientX - startX), windowWidth - widgetWidth);
  const newTop = Math.min(Math.max(0, e.clientY - startY), windowHeight - widgetHeight);

  widget.style.left = newLeft + 'px';
  widget.style.top = newTop + 'px';
});

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  /* ---------- send message logic ---------- */
  async function handleSend() {
    const prompt = (inputEl.value || '').trim();
    if (!prompt) return;

    // user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'user-message';
    userBubble.innerHTML = `
    <span class="label">You:</span>
    <span class="text">${prompt}</span>
    `;
    chatBox.appendChild(userBubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    inputEl.value = '';

    // placeholder
    const botBubble = document.createElement('div');
    botBubble.className = 'bot-message';
    botBubble.innerHTML = `
    <span class="label">GPT:</span>
    <span class="text">…</span>
    `;
    chatBox.appendChild(botBubble);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch('https://chatgpt-gpt-proxy.oheenrahman81.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = (await res.json()).reply || 'No response';
      const clean = data.replace(/^\s+/, '').replace(/\n+/g, ' ');
      botBubble.querySelector('.text').textContent = clean;
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
      botBubble.textContent = 'Error: ' + err.message;
    }
  }

  // send triggers
  sendBtn?.addEventListener('click', handleSend);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });
});