gsap.registerPlugin(SplitText);

document.addEventListener('DOMContentLoaded', function() {
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

    const gradients = [
        { start: '#b0e0e6', end: '#87cefa' }, // Light Blue
        { start: '#dda0dd', end: '#d8bfd8' }, // Light Purple
    ];

    let currentGradientIndex = 0;
    const headerElement = document.querySelector('.chat-header');
    const sendButtonElement = document.querySelectorAll('button');

    function animateGradient() {
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        currentGradientIndex = (currentGradientIndex + 1) % gradients.length;
        const nextGradient = gradients[currentGradientIndex];

        tl.to(headerElement, {
            backgroundImage: `linear-gradient(to right, ${nextGradient.start}, ${nextGradient.end})`,
            duration: 2,
            ease: 'easeInOut'
        })
        .to(sendButtonElement, {
            backgroundImage: `linear-gradient(to right, ${nextGradient.start}, ${nextGradient.end})`,
            duration: 2,
            ease: 'easeInOut'
        });
    }

    animateGradient();
    setInterval(animateGradient, 2000);

    // Staggered letter animation for heading
    function animateHeading() {
        const split = new SplitText(headerTitle, { type: 'chars' });
        gsap.from(split.chars, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            stagger: 0.05,
            ease: 'power2.out',
            onComplete: () => {
                split.revert();
            }
        });
    }

    // Run animation after fonts are loaded or after a timeout
    function runHeadingAnimation() {
        const fontCheck = document.fonts.check('1rem "Google Sans"');
        if (fontCheck) {
            console.log('Google Sans loaded, running animateHeading');
            animateHeading();
        } else {
            document.fonts.ready.then(() => {
                console.log('Fonts ready, running animateHeading');
                animateHeading();
            }).catch((err) => {
                console.error('Font loading error:', err);
                animateHeading(); // Fallback
            });
        }
        // Fallback timeout
        setTimeout(() => {
            if (!document.fonts.check('1rem "Google Sans"')) {
                console.log('Font load timeout, running animateHeading as fallback');
                animateHeading();
            }
        }, 3000);
    }

    runHeadingAnimation();

    let selectedModel = 'gpt-4o-mini'; // Default model
    let loadingMessageElement = null;
    let isProcessing = false;

    function addMessage(sender, message) {
        if(sender === 'user') {
            messages.push({ content: message, role: 'user' });
            
            // Show loading message
            isProcessing = true;
            loadingMessageElement = document.createElement('div');
            loadingMessageElement.classList.add('message', 'received-message', 'loading');
            loadingMessageElement.textContent = 'Thinking...';
            chatMessages.appendChild(loadingMessageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            puter.ai.chat(messages,{model:selectedModel}).then(response => {
                // Remove loading message
                if (loadingMessageElement) {
                    loadingMessageElement.remove();
                }
                isProcessing = false;
                addMessage('assistant', response.message);
            }).catch(error => {
                console.error("AI response error:", error);
                if (loadingMessageElement) {
                    loadingMessageElement.textContent = 'Error: Failed to get response';
                    loadingMessageElement.classList.add('error');
                }
                isProcessing = false;
            });

        } else {
            messages.push(message);
            message=message.content;
        }
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'sent-message' : 'received-message');
        messageElement.innerHTML = marked.parse(message)
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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

    // Removed old model dropdown event listeners and replaced with modern selection logic
    const modelSearch = document.getElementById("model-search");
    const modelList = document.getElementById("model-list");
    const modelDisplay = document.getElementById("model-display");
    let selectedModel = 'gpt-4o-mini'; // Default model

    modelSearch.addEventListener("focus", () => {
        modelList.style.display = "block";
    });

    modelSearch.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        Array.from(modelList.children).forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? "block" : "none";
        });
    });

    modelList.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            selectedModel = e.target.getAttribute("data-value");
            modelDisplay.textContent = selectedModel;
            modelSearch.value = selectedModel;
            modelList.style.display = "none";

            // Temporary tooltip to confirm selection
            const tooltip = document.createElement('div');
            tooltip.className = 'model-tooltip';
            tooltip.innerText = `Model changed to ${selectedModel}`;
            document.body.appendChild(tooltip);
            
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
    });

    document.addEventListener("click", (e) => {
        if (!modelSearch.contains(e.target) && !modelList.contains(e.target)) {
            modelList.style.display = "none";
        }
    });
});