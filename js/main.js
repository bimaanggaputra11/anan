// Main application script - menghubungkan semua komponen
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Agent VRM initialized');
    
    // Load saved settings
    loadSettingsToUI();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Mute button
    const muteBtn = document.getElementById('muteBtn');
    const volumeIcon = document.getElementById('volumeIcon');
    let isMuted = false;
    
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        ttsService.setMuted(isMuted);
        
        // Update icon
        if (isMuted) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
        } else {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
        }
    });
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    
    settingsBtn.addEventListener('click', () => {
        const isHidden = settingsPanel.style.display === 'none' || !settingsPanel.style.display;
        settingsPanel.style.display = isHidden ? 'block' : 'none';
    });
    
    // Save settings button
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    saveSettingsBtn.addEventListener('click', () => {
        const settings = {
            elevenLabsKey: document.getElementById('elevenLabsKey').value,
            voiceId: document.getElementById('voiceId').value,
            pumpfunUrl: document.getElementById('pumpfunUrl').value
        };
        
        saveSettings(settings);
        
        // Show success message
        saveSettingsBtn.textContent = 'Saved!';
        setTimeout(() => {
            saveSettingsBtn.textContent = 'Save Settings';
        }, 2000);
        
        // Hide settings panel
        settingsPanel.style.display = 'none';
    });
    
    // Connect button
    const connectBtn = document.getElementById('connectBtn');
    connectBtn.addEventListener('click', () => {
        if (chatManager.isConnected) {
            chatManager.disconnect();
        } else {
            chatManager.connect();
        }
    });
}

function loadSettingsToUI() {
    // Load settings from CONFIG
    document.getElementById('elevenLabsKey').value = CONFIG.elevenLabs.apiKey || '';
    document.getElementById('voiceId').value = CONFIG.elevenLabs.voiceId || '';
    document.getElementById('pumpfunUrl').value = CONFIG.pumpfun.wsUrl || '';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to toggle settings
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const settingsPanel = document.getElementById('settingsPanel');
        const isHidden = settingsPanel.style.display === 'none' || !settingsPanel.style.display;
        settingsPanel.style.display = isHidden ? 'block' : 'none';
    }
    
    // Ctrl/Cmd + M to toggle mute
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        document.getElementById('muteBtn').click();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (chatManager) {
        chatManager.disconnect();
    }
    if (ttsService) {
        ttsService.stop();
    }
    if (vrmViewer) {
        vrmViewer.dispose();
    }
});

console.log('Main script loaded. Shortcuts: Ctrl+K (Settings), Ctrl+M (Mute)');