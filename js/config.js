// Configuration file untuk menyimpan settings
const CONFIG = {
    elevenLabs: {
        apiKey: '',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        model: 'eleven_monolingual_v1'
    },
    pumpfun: {
        wsUrl: '',
        reconnectInterval: 5000
    },
    claude: {
        apiUrl: 'https://api.anthropic.com/v1/messages',
        model: 'claude-sonnet-4-20250514',
        maxTokens: 1000
    }
};

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('aiAgentSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            CONFIG.elevenLabs.apiKey = settings.elevenLabsKey || '';
            CONFIG.elevenLabs.voiceId = settings.voiceId || CONFIG.elevenLabs.voiceId;
            CONFIG.pumpfun.wsUrl = settings.pumpfunUrl || '';
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// Save settings to localStorage
function saveSettings(settings) {
    localStorage.setItem('aiAgentSettings', JSON.stringify(settings));
    CONFIG.elevenLabs.apiKey = settings.elevenLabsKey;
    CONFIG.elevenLabs.voiceId = settings.voiceId;
    CONFIG.pumpfun.wsUrl = settings.pumpfunUrl;
}

// Initialize settings on load
loadSettings();