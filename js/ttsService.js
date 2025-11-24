// Text-to-Speech Service menggunakan ElevenLabs API
class TTSService {
    constructor() {
        this.isMuted = false;
        this.isSpeaking = false;
        this.currentAudio = null;
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (muted && this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.setSpeakingState(false);
        }
    }

    async speak(text) {
        if (this.isMuted || !CONFIG.elevenLabs.apiKey) {
            console.log('TTS muted or no API key');
            return;
        }

        if (this.isSpeaking) {
            console.log('Already speaking, skipping...');
            return;
        }

        this.setSpeakingState(true);

        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${CONFIG.elevenLabs.voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': CONFIG.elevenLabs.apiKey
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: CONFIG.elevenLabs.model,
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5,
                            style: 0.5,
                            use_speaker_boost: true
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            this.currentAudio = new Audio(audioUrl);
            
            this.currentAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                this.setSpeakingState(false);
            };

            this.currentAudio.onerror = (error) => {
                console.error('Audio playback error:', error);
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                this.setSpeakingState(false);
            };

            await this.currentAudio.play();
            
        } catch (error) {
            console.error('TTS error:', error);
            this.setSpeakingState(false);
            
            // Show error to user if API key is missing
            if (!CONFIG.elevenLabs.apiKey) {
                alert('Please set your ElevenLabs API key in Settings');
            }
        }
    }

    setSpeakingState(speaking) {
        this.isSpeaking = speaking;
        
        // Update UI
        const indicator = document.getElementById('speakingIndicator');
        const statusText = document.getElementById('statusText');
        
        if (indicator) {
            if (speaking) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
        
        if (statusText) {
            statusText.textContent = speaking ? 'Speaking...' : 'Idle';
        }
        
        // Update VRM animation
        if (window.vrmViewer) {
            window.vrmViewer.setAnimating(speaking);
        }
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        this.setSpeakingState(false);
    }
}

// Global TTS Service instance
const ttsService = new TTSService();