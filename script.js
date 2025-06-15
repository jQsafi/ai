const puter = window.puter;

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatHistoryListElement = document.getElementById('chat-history-list');
const newChatButton = document.getElementById('new-chat-btn');

let chatHistory = [];
let currentChatId = null;

const models = [
  { id: "gpt-4o-mini", name: "gpt-4o-mini (default)" },
  { id: "gpt-4o", name: "gpt-4o" },
  { id: "o1", name: "o1" },
  { id: "o1-mini", name: "o1-mini" },
  { id: "o1-pro", name: "o1-pro" },
  { id: "o3", name: "o3" },
  { id: "o3-mini", name: "o3-mini" },
  { id: "o4-mini", name: "o4-mini" },
  { id: "gpt-4.1", name: "gpt-4.1" },
  { id: "gpt-4.1-mini", name: "gpt-4.1-mini" },
  { id: "gpt-4.1-nano", name: "gpt-4.1-nano" },
  { id: "gpt-4.5-preview", name: "gpt-4.5-preview" },
  { id: "claude-3-7-sonnet", name: "claude-3-7-sonnet" },
  { id: "claude-3-5-sonnet", name: "claude-3-5-sonnet" },
  { id: "deepseek-chat", name: "deepseek-chat" },
  { id: "deepseek-reasoner", name: "deepseek-reasoner" },
  { id: "gemini-2.0-flash", name: "gemini-2.0-flash" },
  { id: "gemini-1.5-flash", name: "gemini-1.5-flash" },
  { id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", name: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo" },
  { id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", name: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" },
  { id: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", name: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo" },
  { id: "mistral-large-latest", name: "mistral-large-latest" },
  { id: "pixtral-large-latest", name: "pixtral-large-latest" },
  { id: "codestral-latest", name: "codestral-latest" },
  { id: "google/gemma-2-27b-it", name: "google/gemma-2-27b-it" },
  { id: "grok-beta", name: "grok-beta" },
];

let selectedModel = models[0].id; // Default model
let isProcessing = false;
let thinkingIndicatorElement = null;

// Function to show the "Thinking..." indicator
function showThinkingIndicator() {
    if (thinkingIndicatorElement) return; // Already showing

    thinkingIndicatorElement = document.createElement('div');
    thinkingIndicatorElement.id = 'thinking-indicator';
    thinkingIndicatorElement.classList.add(
        'message', 'w-[90%]', 'px-4', 'py-3', 'rounded-2xl', 'text-gray-900',
        'bg-purple-100', 'mr-auto', 'rounded-tl-none', 'flex', 'items-start', 'gap-3'
    );

    const avatar = document.createElement('div');
    avatar.classList.add(
        'flex', 'items-center', 'justify-center', 'h-8', 'w-8', 'rounded-full',
        'bg-indigo-600', 'text-white', 'text-sm', 'font-semibold'
    );
    avatar.textContent = 'G';
    thinkingIndicatorElement.appendChild(avatar);

    const contentContainer = document.createElement('div');
    contentContainer.classList.add('flex', 'items-baseline'); // Align text and dots

    const thinkingTextSpan = document.createElement('span');
    thinkingTextSpan.classList.add('italic');
    thinkingTextSpan.textContent = 'Thinking';
    contentContainer.appendChild(thinkingTextSpan);

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.textContent = '.';
        dot.classList.add('animate-pulse', 'ml-px'); // Tailwind's pulse animation and minimal margin
        dot.style.animationDelay = `${i * 250}ms`; // Staggered animation for dots
        contentContainer.appendChild(dot);
    }
    thinkingIndicatorElement.appendChild(contentContainer);
    chatMessages.appendChild(thinkingIndicatorElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to hide the "Thinking..." indicator
function hideThinkingIndicator() {
    if (thinkingIndicatorElement) {
        thinkingIndicatorElement.remove();
        thinkingIndicatorElement = null;
    }
}

// Function to convert HTML (with entities) to plain text
function htmlToPlainText(htmlString) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString; // Decodes entities and parses HTML
    return tempDiv.textContent || tempDiv.innerText || ""; // Gets plain text
}

// Function to load chat history from localStorage
function loadChatHistoryFromStorage() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
    }
    renderChatHistorySidebar();
}

// Function to save chat history to localStorage
function saveChatHistoryToStorage() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Function to render chat history in the sidebar
function renderChatHistorySidebar() {
    if (!chatHistoryListElement) return;
    chatHistoryListElement.innerHTML = ''; // Clear existing items
    chatHistory.forEach(session => {
        const listItem = document.createElement('li');
        listItem.classList.add('p-2', 'text-gray-700', 'rounded', 'cursor-pointer', 'hover:bg-gray-200', 'select-none', 'truncate');
        listItem.textContent = session.title || `Chat ${new Date(session.id).toLocaleString()}`;
        listItem.setAttribute('data-chat-id', String(session.id)); // Ensure it's a string for comparison
        if (session.id === currentChatId) {
            listItem.classList.add('bg-gray-300', 'font-semibold'); // Active state
        }
        listItem.addEventListener('click', () => {
            loadChatSession(session.id);
        });
        chatHistoryListElement.appendChild(listItem);
    });
}

// Function to start a new chat session
function startNewChat() {
    chatMessages.innerHTML = ''; // Clear chat display
    currentChatId = Date.now();
    const newTitle = `New Chat ${new Date(currentChatId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newSession = {
        id: currentChatId,
        title: newTitle,
        messages: []
    };
    chatHistory.unshift(newSession); // Add to the beginning of history
    saveChatHistoryToStorage();
    renderChatHistorySidebar();
    messageInput.value = ''; // Clear input field
    messageInput.focus();
    updateSendButtonVisibility();
}

// Function to load a specific chat session
function loadChatSession(chatId) {
    const session = chatHistory.find(s => s.id === chatId);
    if (session) {
        currentChatId = chatId;
        chatMessages.innerHTML = ''; // Clear chat display
        session.messages.forEach(msg => {
            displayMessage(msg.role, msg.content);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
        renderChatHistorySidebar(); // Re-render to update active state
        messageInput.value = ''; // Clear input field
        messageInput.focus();
        updateSendButtonVisibility();
    }
}

// Helper function to copy text to clipboard and provide feedback
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<span class="material-icons text-sm">done</span> Copied!';
        // Temporarily change button style for feedback
        const originalClasses = Array.from(buttonElement.classList);
        buttonElement.classList.remove('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
        buttonElement.classList.add('bg-green-500', 'hover:bg-green-600', 'text-white');
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.classList.remove('bg-green-500', 'hover:bg-green-600', 'text-white');
            originalClasses.forEach(cls => {
                if (!buttonElement.classList.contains(cls) && !['bg-green-500', 'hover:bg-green-600', 'text-white'].includes(cls)) {
                     buttonElement.classList.add(cls);
                }
            });
             // Ensure original hover/bg classes are restored if they were part of the initial set
            if (!buttonElement.classList.contains('bg-gray-200')) buttonElement.classList.add('bg-gray-200');
            if (!buttonElement.classList.contains('hover:bg-gray-300')) buttonElement.classList.add('hover:bg-gray-300');
            if (!buttonElement.classList.contains('text-gray-700')) buttonElement.classList.add('text-gray-700');

        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        const originalText = buttonElement.innerHTML;
        buttonElement.textContent = 'Error';
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
        }, 2000);
    });
}

// Separated function to display a message in the chat UI
function displayMessage(sender, content) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'w-[90%]', 'px-4', 'py-3', 'rounded-2xl', 'text-gray-900', 'whitespace-pre-wrap', 'break-words');
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content'); // Add a class to target message content
    // Treat all content as Markdown and parse it to HTML for display.
    contentElement.innerHTML = DOMPurify.sanitize(marked.parse(content));

    if (sender === 'user') { // User message
        messageElement.classList.add('bg-blue-100', 'ml-auto', 'rounded-tr-none');
        messageElement.appendChild(contentElement);
    } else { // 'assistant'
        messageElement.classList.add('mr-auto', 'rounded-tl-none', 'flex', 'items-start', 'gap-3');
        const avatar = document.createElement('img');
        avatar.src = 'logo.png';
        avatar.alt = 'Avatar';
        avatar.classList.add('h-8', 'w-8', 'rounded-full', 'object-cover');
        
        const messageBodyContainer = document.createElement('div');
        messageBodyContainer.classList.add('flex-grow', 'flex', 'flex-col'); // Allow content and button to stack
        messageBodyContainer.appendChild(contentElement);

        const copyMessageButton = document.createElement('button');
        copyMessageButton.innerHTML = '<span class="material-icons text-sm leading-none">content_copy</span><span class="ml-1">Copy</span>';
        copyMessageButton.classList.add(
            'mt-2', 'self-end', 'px-2', 'py-1', 'text-xs', 'bg-gray-200', 'hover:bg-gray-300',
            'text-gray-700', 'rounded', 'flex', 'items-center', 'transition-colors'
        );
        copyMessageButton.addEventListener('click', () => {
            // Use innerText of the parsed content to get a plain text representation
            copyToClipboard(contentElement.innerText, copyMessageButton);
        });
        messageBodyContainer.appendChild(copyMessageButton);

        messageElement.appendChild(avatar); 
        messageElement.appendChild(messageBodyContainer);
    }
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(sender, messageContent) {
    isProcessing = true;

    let currentSession = chatHistory.find(s => s.id === currentChatId);
    // If no current session, startNewChat should have been called.
    // As a fallback, if currentChatId is somehow null or session not found, create one.
    if (!currentSession) {
        currentChatId = Date.now();
        const newTitle = `Chat ${new Date(currentChatId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        currentSession = { id: currentChatId, title: newTitle, messages: [] };
        chatHistory.unshift(currentSession);
    }

    const messageObject = { role: sender, content: messageContent };

    if (sender === 'user') {
        currentSession.messages.push(messageObject);
        // Update title if it's the first user message of a new chat
        if (currentSession.messages.filter(m => m.role === 'user').length === 1 && currentSession.title.startsWith("New Chat")) {
            // Parse user's Markdown to HTML, then convert to plain text for the title
            const plainText = htmlToPlainText(marked.parse(messageContent));
            const words = plainText.split(/\s+/).filter(Boolean); // Split into words and remove empty strings
            let newTitle = words.slice(0, 10).join(" ");
            if (words.length > 10) {
                newTitle += "...";
            }
            currentSession.title = newTitle || `Chat ${new Date(currentSession.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        displayMessage(sender, messageContent); // Display user's message
        showThinkingIndicator(); // Show thinking indicator
        messageInput.disabled = true;
        sendButton.disabled = true;

        puter.ai.chat(currentSession.messages, { model: selectedModel }).then(response => {
            hideThinkingIndicator(); // Hide indicator
            messageInput.disabled = false;
            // sendButton.disabled = false; // updateSendButtonVisibility will handle this
            addMessage('assistant', response.message.content);
            updateSendButtonVisibility(); // Re-evaluate based on (now empty) input
        }).catch(error => {
            hideThinkingIndicator(); // Hide indicator on error too
            messageInput.disabled = false;
            // sendButton.disabled = false; // updateSendButtonVisibility will handle this
            console.error("AI response error:", error);
            addMessage('assistant', "Sorry, I encountered an error. Please try again.");
            updateSendButtonVisibility(); // Re-evaluate
        });
    } else { // Assistant message
        currentSession.messages.push(messageObject);
        displayMessage(sender, messageContent);
        isProcessing = false; // Processing ends after assistant message is added and displayed
    }

    saveChatHistoryToStorage();
    renderChatHistorySidebar();
}

sendButton.addEventListener('click', () => {
    if (isProcessing) return; // Block if processing
    // User input is passed directly to addMessage. // displayMessage will handle escaping it.
    // displayMessage will handle escaping it.
    const message = messageInput.value.trim();
    if (message !== '') {
        addMessage('user', message);
        messageInput.value = '';
        updateSendButtonVisibility();
    }
});

messageInput.addEventListener('input', () => {
    updateSendButtonVisibility();
});

function updateSendButtonVisibility() {
    if (messageInput.value.trim() === '') {
        sendButton.style.opacity = '0';
        sendButton.disabled = true;
    } else {
        sendButton.style.opacity = '1';
        sendButton.disabled = false;
    }
}

// Initialize send button visibility on page load
updateSendButtonVisibility();

messageInput.addEventListener('keydown', function(event) { // Use 'function' for 'this' to refer to messageInput
    if (event.key === 'Enter' && !isProcessing) {
        if (event.ctrlKey || event.metaKey) {
            // Ctrl+Enter or Cmd+Enter: insert newline
            event.preventDefault(); // Prevent any default action
            const cursorPos = this.selectionStart;
            const textBefore = this.value.substring(0, cursorPos);
            const textAfter  = this.value.substring(this.selectionEnd, this.value.length);
            
            this.value = textBefore + "\n" + textAfter;
            this.selectionStart = this.selectionEnd = cursorPos + 1; // Move cursor after newline
            
            // Manually trigger input event if you have auto-grow or other listeners
            // this.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (!event.shiftKey) {
            // Enter alone: send message
            event.preventDefault(); // Prevent default action (newline in textarea)
            if (this.value.trim() !== '') { // Ensure message is not just whitespace
                sendButton.click();
            }
        }
        // If Shift+Enter, do nothing, let the default newline happen in textarea.
    }
});

// Renamed to escapeHTML and corrected.
// This function escapes HTML special characters to display a string as plain text.
function escapeHTML(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Model selection handling for top panel
const modelDisplayBtn = document.getElementById('model-display-btn');
const modelSelectionPanel = document.getElementById('model-selection-panel');
const modelSelectionList = document.getElementById('model-selection-list');

function generateModelSelectionList() {
    if (!modelSelectionList) return;
    modelSelectionList.innerHTML = '';
    models.forEach((model) => {
        const li = document.createElement('li');
        li.classList.add('cursor-pointer', 'px-4', 'py-2', 'hover:bg-indigo-100', 'flex', 'items-center', 'justify-between');
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '0');
        li.textContent = model.name;
        li.setAttribute('data-model', model.id);

        if (model.id === selectedModel) {
            const checkIcon = document.createElement('span');
            checkIcon.classList.add('material-icons', 'text-indigo-600');
            checkIcon.textContent = 'check';
            li.appendChild(checkIcon);
        }

        li.addEventListener('click', () => {
            selectModel(li);
        });

        li.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectModel(li);
            }
        });

        modelSelectionList.appendChild(li);
    });
}

function selectModel(modelItem) {
    // Remove selected class and check icon from all
    const items = modelSelectionList.querySelectorAll('li');
    items.forEach(item => {
        item.classList.remove('selected');
        const checkIcon = item.querySelector('.check-icon');
        if (checkIcon) {
            checkIcon.remove();
        }
    });

    // Add selected class to clicked
    modelItem.classList.add('selected');

    // Add check icon to selected
    const checkIcon = document.createElement('span');
    checkIcon.classList.add('material-icons', 'check-icon');
    checkIcon.textContent = 'check';
    modelItem.appendChild(checkIcon);

    // Update selected model
    selectedModel = modelItem.getAttribute('data-model');
    console.log(`Selected model: ${selectedModel}`);

    // Update model display text in main content
    const modelDisplayText = document.getElementById('model-display-text');
    if (modelDisplayText) {
        modelDisplayText.textContent = selectedModel;
    }

    // Hide model selection panel if open
    if (modelSelectionPanel) {
        modelSelectionPanel.classList.add('hidden');
    }

    // Show tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'model-tooltip';
    tooltip.innerText = `Model changed to ${selectedModel}`;
    modelSelectionList.parentElement.appendChild(tooltip);
    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}

generateModelSelectionList();

if (modelDisplayBtn && modelSelectionPanel) {
    modelDisplayBtn.addEventListener('click', () => {
        const isHidden = modelSelectionPanel.classList.contains('hidden');
        if (isHidden) {
            modelSelectionPanel.classList.remove('hidden');
            modelDisplayBtn.setAttribute('aria-expanded', 'true');
        } else {
            modelSelectionPanel.classList.add('hidden');
            modelDisplayBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (event) => {
        if (!modelSelectionPanel.contains(event.target) && !modelDisplayBtn.contains(event.target)) {
            modelSelectionPanel.classList.add('hidden');
            modelDisplayBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistoryFromStorage();
    if (chatHistory.length === 0) {
        startNewChat();
    } else {
        loadChatSession(chatHistory[0].id); // Load the most recent chat
    }

    if (newChatButton) {
        newChatButton.addEventListener('click', startNewChat);
    }

    // --- Mobile sidebar functionality START ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('main');

    if (mobileMenuBtn && sidebar && closeSidebarBtn && mainContent) {
        mobileMenuBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from bubbling to document listener
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
            // Dim and disable main content on mobile when sidebar is an overlay
            if (window.innerWidth < 768) {
                mainContent.classList.add('opacity-50', 'pointer-events-none');
            }
        });

        closeSidebarBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from bubbling
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');
            mainContent.classList.remove('opacity-50', 'pointer-events-none');
        });

        // Click outside (on document) to close sidebar on mobile
        document.addEventListener('click', (event) => {
            // Check if sidebar is open (i.e., has 'translate-x-0')
            if (sidebar.classList.contains('translate-x-0')) {
                // Check if the click was outside the sidebar and not on the mobile menu button
                if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                    // Only trigger close if on mobile view (where sidebar is an overlay)
                    if (window.innerWidth < 768) { // Tailwind 'md' breakpoint (768px)
                        closeSidebarBtn.click(); // Simulate click on the close button
                    }
                }
            }
        });
    }

    // Handle window resize events
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) { // Resized to desktop
            if (mainContent) {
                mainContent.classList.remove('opacity-50', 'pointer-events-none');
            }
            // Tailwind's md: classes will handle sidebar visibility/positioning
        } else { // Resized to mobile
            // If sidebar is open and main content isn't dimmed (e.g., was resized from desktop)
            if (sidebar && sidebar.classList.contains('translate-x-0') && mainContent && !mainContent.classList.contains('opacity-50')) {
                mainContent.classList.add('opacity-50', 'pointer-events-none');
            }
        }
    });
    // --- Mobile sidebar functionality END ---
});
