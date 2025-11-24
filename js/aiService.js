// AI Service untuk generate response menggunakan Claude API
class AIService {
    constructor() {
        this.isProcessing = false;
    }

    async generateReply(message) {
        if (this.isProcessing) {
            console.log('AI already processing a message');
            return null;
        }

        this.isProcessing = true;

        try {
            const response = await fetch(CONFIG.claude.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: CONFIG.claude.model,
                    max_tokens: CONFIG.claude.maxTokens,
                    messages: [
                        {
                            role: 'user',
                            content: `Kamu adalah AI agent yang ramah dan membantu di komunitas crypto PumpFun. Jawab pesan ini dengan santai, menarik, dan informatif (maksimal 2-3 kalimat). Gunakan bahasa Indonesia yang gaul tapi profesional. Pesan: "${message}"`
                        }
                    ],
                })
            });

            if (!response.ok) {
                throw new Error(`Claude API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Extract text from response
            let replyText = '';
            if (data.content && data.content.length > 0) {
                for (const item of data.content) {
                    if (item.type === 'text') {
                        replyText += item.text;
                    }
                }
            }

            this.isProcessing = false;
            return replyText || 'Maaf, saya tidak bisa memproses pesan ini saat ini.';

        } catch (error) {
            console.error('AI Service error:', error);
            this.isProcessing = false;
            
            // Return fallback response
            return this.getFallbackResponse(message);
        }
    }

    getFallbackResponse(message) {
        // Fallback responses jika API gagal
        const responses = [
            'Halo! Terima kasih sudah chat. Saya sedang belajar untuk menjawab lebih baik!',
            'Wah menarik! Bisa jelasin lebih detail?',
            'Thanks infonya! Komunitas kita makin keren nih!',
            'Setuju banget! WAGMI! 🚀',
            'Mantap! Mari kita build together!',
        ];

        // Simple keyword-based responses
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('halo') || lowerMsg.includes('hai') || lowerMsg.includes('hello')) {
            return 'Halo juga! Senang bisa chat sama kamu. Ada yang bisa saya bantu?';
        }
        
        if (lowerMsg.includes('roadmap')) {
            return 'Roadmap kita fokus ke community building dan innovation! Stay tuned untuk update selanjutnya!';
        }
        
        if (lowerMsg.includes('price') || lowerMsg.includes('harga')) {
            return 'Untuk info harga real-time, cek langsung di PumpFun ya! DYOR selalu!';
        }
        
        if (lowerMsg.includes('moon') || lowerMsg.includes('lambo')) {
            return 'To the moon! 🚀 Tapi ingat, invest bijak dan DYOR ya!';
        }
        
        // Return random response
        return responses[Math.floor(Math.random() * responses.length)];
    }

    isCurrentlyProcessing() {
        return this.isProcessing;
    }
}

// Global AI Service instance
const aiService = new AIService();