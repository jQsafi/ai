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
        document.head.appendChild(style);
      
        // Chat button
        const chatBtn = document.createElement('button');
        chatBtn.className = 'mini-chat-btn';
        chatBtn.title = 'Chat with us';
        chatBtn.innerHTML = '<span>💬</span>';
        document.body.appendChild(chatBtn);
      
        // Chat window
        let chatWindow = null;
        let chatHistory = [];
      
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
          `;
          document.body.appendChild(chatWindow);
      
          // Close button
          chatWindow.querySelector('.mini-chat-close').onclick = closeChatWindow;
      
          // Send message
          const form = chatWindow.querySelector('form');
          const input = chatWindow.querySelector('.mini-chat-input');
          const messages = chatWindow.querySelector('.mini-chat-messages');
          form.onsubmit = async function(e) {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            addMessage('user', text);
            chatHistory.push({ role: 'user', content: text });
            input.value = '';
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