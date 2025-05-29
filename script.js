// gsap.registerPlugin(SplitText); // Removed as SplitText is no longer used

const puter = window.puter;
const promptMessage = ''; // For copyPromptToClipboard - consider its use

const messages = [];

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const headerTitle = document.querySelector('.chat-header h1'); // Keep if any future use, not critical now
const modelSelectBtn = document.getElementById('model-select-btn');
const modelMenu = document.getElementById('model-menu');
const modelDropdown = document.getElementById('model-dropdown'); // Direct reference to the dropdown

const modelMapping = {
    'gpt-4o-mini': 'gpt-4o-mini',
    'gpt-4o': 'gpt-4o',
    'o1': 'o1',
    'o1-mini': 'o1-mini',
    'o1-pro': 'o1-pro',
    'o3': 'o3',
    'o3-mini': 'o3-mini',
    'o4-mini': 'o4-mini',
    'gpt-4.1': 'gpt-4.1',
    'gpt-4.1-mini': 'gpt-4.1-mini',
    'gpt-4.1-nano': 'gpt-4.1-nano',
    'gpt-4.5-preview': 'gpt-4.5-preview',
    'claude-3-7-sonnet': 'claude-3-7-sonnet',
    'claude-3-5-sonnet': 'claude-3-5-sonnet',
    'deepseek-chat': 'deepseek-chat',
    'deepseek-reasoner': 'deepseek-reasoner',
    'gemini-2.0-flash': 'gemini-2.0-flash',
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo': 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    'mistral-large-latest': 'mistral-large-latest',
    'pixtral-large-latest': 'pixtral-large-latest',
    'codestral-latest': 'codestral-latest',
    'google/gemma-2-27b-it': 'google/gemma-2-27b-it',
    'grok-beta': 'grok-beta'
};

let selectedModel = 'gpt-4o-mini'; // Default model
// let loadingMessageElement = null; // Not used in current logic, can be removed if not planned
let isProcessing = false; // For potentially blocking send button during AI response

// Function to animate sent messages (from inline script)
function animateMessage(messageDiv) {
    if (typeof gsap !== 'undefined') { // Check if GSAP is loaded
        gsap.from(messageDiv, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: 'easeInOut'
        });
    }
}

// Consolidated addMessage function
function addMessage(sender, messageContent) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (sender === 'user') {
        messageElement.classList.add('sent-message');
        messageElement.innerHTML = marked.parse(messageContent); // User message also parsed for consistency if it contains markdown-like text
        messages.push({ content: messageContent, role: 'user' });

        startTyping(); 
        isProcessing = true;
        sendButton.disabled = true;
        messageInput.disabled = true;

        puter.ai.chat(messages, { model: selectedModel })
            .then(response => {
                stopTyping();
                if (response && response.message) {
                    addMessage('assistant', response.message.content || response.message); // Handle if response.message is an object or string
                } else {
                    addMessage('assistant', "Sorry, I couldn't get a response.");
                    console.error("AI response error: Invalid response structure", response);
                }
            })
            .catch(error => {
                stopTyping();
                addMessage('assistant', "Sorry, something went wrong.");
                console.error("AI response error:", error);
            })
            .finally(() => { // Ensure these are reset regardless of success or failure
                isProcessing = false;
                sendButton.disabled = false;
                messageInput.disabled = false;
                messageInput.focus(); // Re-focus the input field
            });
    } else if (sender === 'assistant') {
        messageElement.classList.add('received-message');
        // Assuming messageContent from assistant is an object with a 'content' property or just a string
        const textToParse = typeof messageContent === 'object' && messageContent.content ? messageContent.content : messageContent;
        messages.push({ content: textToParse, role: 'assistant' });
        messageElement.innerHTML = marked.parse(textToParse);
    }

    chatMessages.appendChild(messageElement);
    if (sender === 'user') { // Animate only user messages
        animateMessage(messageElement);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
    messageInput.focus();
}


sendButton.addEventListener('click', () => {
    if (isProcessing) return; // Check if processing
    const message = messageInput.value.trim();
    if (message !== '') {
        addMessage('user', message);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { 
        if (isProcessing) return; // Check if processing
        event.preventDefault(); 
        sendButton.click();
    }
});

// Function to send a pre-defined prompt (from inline script)
function sendPrompt(prompt) {
    if (isProcessing) return; // Check if processing before sending prompt
    messageInput.value = prompt;
    sendButton.click(); // Simulate button click to send the message
}

// Typing indicator functions
function startTyping() {
    let typingIndicator = document.querySelector('.typing-indicator');
    if (!typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'message received-message typing-indicator'; 
        // More advanced spinner (ensure CSS for .spinner and its spans is present or added)
        typingIndicator.innerHTML = '<div class="markdown-body"><div class="spinner"><span></span><span></span><span></span></div></div>'; 
        chatMessages.appendChild(typingIndicator);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function stopTyping() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}


// Model selection logic
function handleModelChange() {
    selectedModel = modelDropdown.value;
    sessionStorage.setItem('preferredModel', selectedModel); // Save preference
    console.log(`Selected model: ${selectedModel}`);
    modelMenu.style.display = 'none';

    // Create temporary tooltip (GSAP dependent)
    if (typeof gsap !== 'undefined') {
        const tooltip = document.createElement('div');
        tooltip.className = 'model-tooltip';
        tooltip.innerText = `Model changed to ${selectedModel}`;
        modelMenu.parentElement.appendChild(tooltip); // Append to header for positioning
        gsap.fromTo(
            tooltip,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3 }
        );
        setTimeout(() => {
            gsap.to(tooltip, {
                opacity: 0,
                y: 10,
                duration: 0.3,
                onComplete: () => tooltip.remove()
            });
        }, 2000);
    }
}

// Load preferred model from session storage
function loadPreferredModel() {
    const preferredModel = sessionStorage.getItem('preferredModel');
    if (preferredModel && modelMapping[preferredModel]) {
        selectedModel = preferredModel;
        modelDropdown.value = preferredModel;
    }
    // No model display name to update here as it was removed
}

// Initialize preferred model on page load
document.addEventListener('DOMContentLoaded', loadPreferredModel);


function toggleModelMenu(event) {
    event.stopPropagation();
    modelMenu.style.display = modelMenu.style.display === 'block' ? 'none' : 'block';
    if (modelMenu.style.display === 'block') {
        modelDropdown.focus();
    }
}

// Help Tooltip (if #help-tooltip element exists and is used)
function toggleHelpTooltip() {
    const tooltip = document.getElementById('help-tooltip');
    if (tooltip) { // Check if element exists
        tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
    }
}


function copyPromptToClipboard() {
    if (promptMessage) { // Only copy if there's a message
        navigator.clipboard.writeText(promptMessage)
            .then(() => {
                // Optional: Show a success tooltip (GSAP dependent)
                if (typeof gsap !== 'undefined') {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'model-tooltip'; // Reuse existing style or create new
                    tooltip.innerText = '✅ Prompt copied!';
                    // Consider appending to a more stable element like chat-container or body
                    document.body.appendChild(tooltip); 
                    gsap.fromTo(tooltip, { opacity: 0, y: 20, x: '-50%', left: '50%' }, { opacity: 1, y: 0, duration: 0.3, onComplete: () => {
                        setTimeout(() => gsap.to(tooltip, { opacity: 0, onComplete: () => tooltip.remove() }), 1500);
                    }});
                }
            })
            .catch(err => {
                console.error('Clipboard error:', err);
            });
    }
}

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    if (modelMenu && !modelMenu.contains(event.target) && modelSelectBtn && !modelSelectBtn.contains(event.target)) {
        modelMenu.style.display = 'none';
    }
});

// Event listeners
modelSelectBtn.addEventListener('click', toggleModelMenu);
modelDropdown.addEventListener('change', handleModelChange); // Added event listener for dropdown directly

modelSelectBtn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleModelMenu(event);
    }
});

// Utility: removeLocalStorageKey (if needed for debugging, otherwise can be removed)
// function removeLocalStorageKey(key) {
//     localStorage.removeItem(key);
//     console.log(`Local storage key "${key}" has been removed.`);
// }
// removeLocalStorageKey('puter.auth.token');