// Mini Chat Widget
(function() {
    // Auto-load puter.js if not present
    function loadPuterJs(callback) {
      if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
        callback();
        return;
      }
      // Prevent double loading
      if (window.__puterJsLoading) {
        document.addEventListener('__puterJsLoaded', callback, { once: true });
        return;
      }
      window.__puterJsLoading = true;
      var script = document.createElement('script');
      script.src = 'https://jqsafi.github.io/ai/puter.js'; // <-- Use the hosted version
      script.onload = function() {
        window.__puterJsLoading = false;
        document.dispatchEvent(new Event('__puterJsLoaded'));
        callback();
      };
      script.onerror = function() {
        window.__puterJsLoading = false;
        alert('Failed to load puter.js. AI chat will not work.');
      };
      document.head.appendChild(script);
    }
  
    // Avoid double-injecting
    if (window.__miniChatWidgetLoaded) return;
    window.__miniChatWidgetLoaded = true;
  
    document.addEventListener('DOMContentLoaded', function() {
      loadPuterJs(function() {
        // Create root container and shadow root
        const widgetRoot = document.createElement('div');
        widgetRoot.id = 'mini-chat-widget-root';
        document.body.appendChild(widgetRoot);
        const shadow = widgetRoot.attachShadow({ mode: 'open' });

        // Styles
        const style = document.createElement('style');
        style.textContent = `
          .mini-chat-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            background: #0078d7;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 56px;
            height: 56px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-size: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          .mini-chat-btn:hover {
            background: #005fa3;
          }
          .mini-chat-window {
            position: fixed;
            bottom: 90px;
            right: 24px;
            width: 320px;
            max-width: 90vw;
            height: 400px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.18);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: Arial, sans-serif;
            animation: mini-chat-fadein 0.2s;
          }
          @keyframes mini-chat-fadein {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .mini-chat-header {
            background: #0078d7;
            color: #fff;
            padding: 14px 16px;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .mini-chat-close {
            background: none;
            border: none;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
          }
          .mini-chat-messages {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            background: #f7f7f7;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .mini-chat-msg {
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 16px;
            font-size: 15px;
            line-height: 1.4;
            word-break: break-word;
            box-sizing: border-box;
          }
          .mini-chat-msg.user {
            align-self: flex-end;
            background: #0078d7;
            color: #fff;
            border-bottom-right-radius: 4px;
          }
          .mini-chat-msg.bot {
            align-self: flex-start;
            background: #e5e5ea;
            color: #222;
            border-bottom-left-radius: 4px;
          }
          .mini-chat-input-row {
            display: flex;
            border-top: 1px solid #eee;
            background: #fff;
            padding: 8px;
          }
          .mini-chat-input {
            flex: 1;
            border: 1px solid #ccc;
            border-radius: 20px;
            padding: 8px 14px;
            font-size: 15px;
            outline: none;
            margin-right: 8px;
          }
          .mini-chat-send-btn {
            background: #0078d7;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          .mini-chat-send-btn:disabled {
            background: #b3d3f7;
            cursor: not-allowed;
          }
        `;
        shadow.appendChild(style);

        // Chat button
        const chatBtn = document.createElement('button');
        chatBtn.className = 'mini-chat-btn';
        chatBtn.title = 'Chat with us';
        chatBtn.innerHTML = '<span>💬</span>';
        shadow.appendChild(chatBtn);

        // Make chat button draggable
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        let btnPos = { bottom: 24, right: 24 };

        function setBtnPosition(pos) {
          // Remove all position styles
          chatBtn.style.top = '';
          chatBtn.style.left = '';
          chatBtn.style.bottom = '';
          chatBtn.style.right = '';
          // Set new position
          if (pos.top !== undefined) chatBtn.style.top = pos.top + 'px';
          if (pos.left !== undefined) chatBtn.style.left = pos.left + 'px';
          if (pos.bottom !== undefined) chatBtn.style.bottom = pos.bottom + 'px';
          if (pos.right !== undefined) chatBtn.style.right = pos.right + 'px';
        }
        setBtnPosition(btnPos);

        function getViewportRect() {
          return { width: window.innerWidth, height: window.innerHeight };
        }

        function onDragStart(e) {
          isDragging = true;
          chatBtn.style.transition = 'none';
          const rect = chatBtn.getBoundingClientRect();
          if (e.type === 'touchstart') {
            dragOffsetX = e.touches[0].clientX - rect.left;
            dragOffsetY = e.touches[0].clientY - rect.top;
          } else {
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
          }
          document.addEventListener('mousemove', onDragMove);
          document.addEventListener('mouseup', onDragEnd);
          document.addEventListener('touchmove', onDragMove, { passive: false });
          document.addEventListener('touchend', onDragEnd);
        }

        function onDragMove(e) {
          if (!isDragging) return;
          e.preventDefault && e.preventDefault();
          let clientX, clientY;
          if (e.type.startsWith('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
          } else {
            clientX = e.clientX;
            clientY = e.clientY;
          }
          const vp = getViewportRect();
          let left = clientX - dragOffsetX;
          let top = clientY - dragOffsetY;
          // Clamp to viewport
          left = Math.max(0, Math.min(left, vp.width - chatBtn.offsetWidth));
          top = Math.max(0, Math.min(top, vp.height - chatBtn.offsetHeight));
          // Remove bottom/right, use top/left
          btnPos = { top, left };
          setBtnPosition(btnPos);
        }

        function onDragEnd() {
          isDragging = false;
          chatBtn.style.transition = '';
          document.removeEventListener('mousemove', onDragMove);
          document.removeEventListener('mouseup', onDragEnd);
          document.removeEventListener('touchmove', onDragMove);
          document.removeEventListener('touchend', onDragEnd);
        }

        chatBtn.addEventListener('mousedown', onDragStart);
        chatBtn.addEventListener('touchstart', onDragStart, { passive: false });

        // Chat window
        let chatWindow = null;
        let chatHistory = [];
        let pageContentSent = false;

        function createChatWindow() {
          if (chatWindow) return;
          chatWindow = document.createElement('div');
          chatWindow.className = 'mini-chat-window';
          chatWindow.innerHTML = `
            <div class="mini-chat-header">
              Chat
              <button class="mini-chat-close" title="Close">&times;</button>
            </div>
            <div class="mini-chat-messages"></div>
            <form class="mini-chat-input-row">
              <input class="mini-chat-input" type="text" placeholder="Type a message..." autocomplete="off" />
              <button class="mini-chat-send-btn" type="submit">➤</button>
            </form>
            <div class="mini-chat-suggestion-row" style="padding: 0 8px 8px 8px;">
              <button class="mini-chat-suggestion-btn" style="background: #f0f4fa; color: #0078d7; border: none; border-radius: 16px; padding: 6px 16px; font-size: 14px; cursor: pointer; margin-top: 4px;">Summarize this page</button>
            </div>
          `;
          shadow.appendChild(chatWindow);

          // Position chat window relative to chatBtn
          const btnRect = chatBtn.getBoundingClientRect();
          const vp = getViewportRect();
          // Prefer bottom if enough space, else top
          let winTop = btnRect.bottom + 10;
          if (winTop + 400 > vp.height) winTop = btnRect.top - 410;
          winTop = Math.max(0, Math.min(winTop, vp.height - 400));
          let winLeft = btnRect.left;
          if (winLeft + 320 > vp.width) winLeft = vp.width - 320;
          winLeft = Math.max(0, winLeft);
          chatWindow.style.position = 'fixed';
          chatWindow.style.top = winTop + 'px';
          chatWindow.style.left = winLeft + 'px';
          chatWindow.style.right = '';
          chatWindow.style.bottom = '';
      
          // Close button
          chatWindow.querySelector('.mini-chat-close').onclick = closeChatWindow;
      
          // Remove minimize button logic
      
          // Suggestion logic
          const suggestionRow = chatWindow.querySelector('.mini-chat-suggestion-row');
          const suggestionBtn = chatWindow.querySelector('.mini-chat-suggestion-btn');
          let suggestionUsed = false;
          function hideSuggestion() {
            if (suggestionRow) suggestionRow.style.display = 'none';
          }
          if (suggestionBtn) {
            suggestionBtn.onclick = function() {
              if (suggestionUsed) return;
              suggestionUsed = true;
              hideSuggestion();
              // Simulate user sending 'Summarize this page'
              input.value = 'Summarize this page';
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            };
          }
      
          // Send message
          const form = chatWindow.querySelector('form');
          const input = chatWindow.querySelector('.mini-chat-input');
          const messages = chatWindow.querySelector('.mini-chat-messages');
          form.onsubmit = async function(e) {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            // On first user message, add page content as system message (hidden from UI)
            if (!pageContentSent) {
              const pageText = document.body.innerText.trim();
              if (pageText) {
                const systemPrompt = `You are an assistant embedded on a web page. Use the following page content as context to help answer the user's questions. Only use this as background information, do not repeat it unless asked.\n\n--- Page Content Start ---\n${pageText}\n--- Page Content End ---`;
                chatHistory.push({ role: 'system', content: systemPrompt });
              }
              pageContentSent = true;
            }
            addMessage('user', text);
            chatHistory.push({ role: 'user', content: text });
            input.value = '';
            hideSuggestion();
            // Show a thinking indicator
            const thinkingMsg = document.createElement('div');
            thinkingMsg.className = 'mini-chat-msg bot';
            thinkingMsg.textContent = 'Thinking...';
            messages.appendChild(thinkingMsg);
            messages.scrollTop = messages.scrollHeight;
            try {
              const response = await window.puter.ai.chat(chatHistory, { model: 'gpt-4o-mini' });
              if (thinkingMsg.parentNode) thinkingMsg.remove();
              const aiReply = response && response.message && response.message.content ? response.message.content : 'Sorry, I could not get a reply.';
              addMessage('bot', aiReply);
              chatHistory.push({ role: 'assistant', content: aiReply });
            } catch (err) {
              if (thinkingMsg.parentNode) thinkingMsg.remove();
              addMessage('bot', 'Sorry, there was an error getting a reply.');
            }
          };
        }
      
        function closeChatWindow() {
          if (chatWindow) {
            chatWindow.remove();
            chatWindow = null;
          }
        }
      
        function addMessage(sender, text) {
          if (!chatWindow) return;
          const messages = chatWindow.querySelector('.mini-chat-messages');
          const msg = document.createElement('div');
          msg.className = 'mini-chat-msg ' + sender;
          msg.textContent = text;
          messages.appendChild(msg);
          messages.scrollTop = messages.scrollHeight;
        }
      
        // Open chat window on button click
        chatBtn.onclick = function() {
          if (!chatWindow) {
            createChatWindow();
          }
        };
      });
    });
  })(); 