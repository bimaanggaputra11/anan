// Chat Manager untuk handle PumpFun WebSocket dan chat UI
class ChatManager {
    constructor() {
        this.messages = [];
        this.isConnected = false;
        this.ws = null;
        this.reconnectTimer = null;
        this.processingMessageId = null;
        
        this.chatContainer = document.getElementById('chatContainer');
        this.messageCount = document.getElementById('messageCount');
    }

    connect() {
        if (this.isConnected || !CONFIG.pumpfun.wsUrl) {
            console.log('Already connected or no WebSocket URL configured');
            // Start demo mode if no URL
            if (!CONFIG.pumpfun.wsUrl) {
                this.startDemoMode();
            }
            return;
        }

        try {
            this.ws = new WebSocket(CONFIG.pumpfun.wsUrl);
            
            this.ws.onopen = () => {
                console.log('Connected to PumpFun');
                this.isConnected = true;
                this.updateConnectionUI();
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleNewMessage(data);
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
            this.ws.onclose = () => {
                console.log('Disconnected from PumpFun');
                this.isConnected = false;
                this.updateConnectionUI();
                
                // Auto reconnect
                this.scheduleReconnect();
            };
            
        } catch (error) {
            console.error('Connection error:', error);
            this.startDemoMode();
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.isConnected = false;
        this.updateConnectionUI();
    }

    scheduleReconnect() {
        if (this.reconnectTimer) return;
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (!this.isConnected) {
                console.log('Attempting to reconnect...');
                this.connect();
            }
        }, CONFIG.pumpfun.reconnectInterval);
    }

    startDemoMode() {
        console.log('Starting demo mode with simulated messages');
        this.isConnected = true;
        this.updateConnectionUI();
        
        const demoMessages = [
            { username: 'CryptoTrader', text: 'Halo! Bagaimana kabar project ini?' },
            { username: 'MoonBoy', text: 'Kapan listing di exchange besar?' },
            { username: 'DiamondHands', text: 'Apa roadmap untuk Q2 2025?' },
            { username: 'WhaleAlert', text: 'Volume trading naik terus nih!' },
            { username: 'HODLER', text: 'Community-nya solid banget! 🚀' }
        ];
        
        let index = 0;
        const sendDemo = () => {
            if (index < demoMessages.length && this.isConnected) {
                this.handleNewMessage(demoMessages[index]);
                index++;
                setTimeout(sendDemo, 8000); // Send every 8 seconds
            }
        };
        
        // Start after 2 seconds
        setTimeout(sendDemo, 2000);
    }

    async handleNewMessage(data) {
        const message = {
            id: Date.now() + Math.random(),
            username: data.username || data.user || 'Anonymous',
            text: data.text || data.message || data.content || '',
            timestamp: new Date().toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            reply: null,
            processing: true
        };
        
        // Add message to list
        this.messages.push(message);
        this.processingMessageId = message.id;
        this.renderMessages();
        
        // Generate AI reply
        const reply = await aiService.generateReply(message.text);
        
        // Update message with reply
        const msgIndex = this.messages.findIndex(m => m.id === message.id);
        if (msgIndex !== -1) {
            this.messages[msgIndex].reply = reply;
            this.messages[msgIndex].processing = false;
        }
        
        this.processingMessageId = null;
        this.renderMessages();
        
        // Speak the reply
        await ttsService.speak(reply);
    }

    renderMessages() {
        // Clear empty state
        const emptyState = this.chatContainer.querySelector('.chat-empty');
        if (emptyState && this.messages.length > 0) {
            emptyState.remove();
        }
        
        // Render all messages
        if (this.messages.length === 0) {
            return;
        }
        
        this.chatContainer.innerHTML = '';
        
        this.messages.forEach(msg => {
            const messageEl = this.createMessageElement(msg);
            this.chatContainer.appendChild(messageEl);
        });
        
        // Update message count
        this.messageCount.textContent = `${this.messages.length} messages`;
        
        // Scroll to bottom
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = 'chat-message';
        if (message.processing) {
            div.classList.add('processing');
        }
        
        const initials = message.username.substring(0, 2).toUpperCase();
        
        div.innerHTML = `
            <div class="message-header">
                <div class="user-avatar">${initials}</div>
                <div class="message-info">
                    <span class="message-username">${message.username}</span>
                    <span class="message-time">${message.timestamp}</span>
                    ${message.processing ? '<span class="message-processing">Processing...</span>' : ''}
                </div>
            </div>
            <div class="message-text">${message.text}</div>
            ${message.reply ? `
                <div class="message-reply">
                    <div class="reply-label">AI Reply:</div>
                    <div class="reply-text">${message.reply}</div>
                </div>
            ` : ''}
        `;
        
        return div;
    }

    updateConnectionUI() {
        const connectBtn = document.getElementById('connectBtn');
        if (connectBtn) {
            if (this.isConnected) {
                connectBtn.textContent = 'Connected';
                connectBtn.classList.add('connected');
            } else {
                connectBtn.textContent = 'Connect to PumpFun';
                connectBtn.classList.remove('connected');
            }
        }
    }

    clearMessages() {
        this.messages = [];
        this.renderMessages();
    }
}

// Global Chat Manager instance
const chatManager = new ChatManager();