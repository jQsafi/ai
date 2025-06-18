gsap.registerPlugin(SplitText);

const puter = window.puter;
const promptMessage = '';

const messages = [];

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const headerTitle = document.querySelector('.chat-header h1');
const modelDisplay = document.getElementById('model-display');
const modelSelectBtn = document.getElementById('model-select-btn');
const modelMenu = document.getElementById('model-menu');



let currentGradientIndex = 0;
const headerElement = document.querySelector('.chat-header');
const sendButtonElement = document.querySelectorAll('button');

);
}




// Run animation after fonts are loaded or after a timeout



let selectedModel = 'gpt-4o-mini'; // Default model
let isProcessing = false;

function addMessage(sender, message) {
            if(sender === 'user') {
                messages.push({ content: message, role: 'user' });
                puter.ai.chat(messages,{model:selectedModel}).then(response => {
                    addMessage('assistant', response.message);
                }).catch(error => {
                    console.error("AI response error:", error);
                });

            } else {
                messages.push(message);
                message=message.content;
            }
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add(sender === 'user' ? 'sent-message' : 'received-message');
            messageElement.innerHTML = marked.parse(message)
            // messageElement.innerHTML = message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            // messageInput.focus();
    isProcessing=false;
        }

sendButton.addEventListener('click', () => {
    if (isProcessing) return; // Block if processing
    const message = messageInput.value.trim();
    if (message !== '') {
        addMessage('user', message);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !isProcessing) {
        sendButton.click();
    }
});

function removeLocalStorageKey(key) {
    localStorage.removeItem(key);
    console.log(`Local storage key "${key}" has been removed.`);
}
//removeLocalStorageKey('puter.auth.token');



// Event listeners for button
