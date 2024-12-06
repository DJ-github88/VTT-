// GM Tools System
const gmTools = {
    isGM: false,
    
    init() {
        // Set initial window.isGM state
        window.isGM = this.isGM;
        
        this.createGMToggle();
        this.setupKeyBindings();
        this.interceptHotkeys();

        // Immediately update UI on initialization
        this.updateUIForRole();

        // Also dispatch initial gmModeChange event
        const gmModeChangeEvent = new CustomEvent('gmModeChange', { detail: { isGM: this.isGM } });
        document.dispatchEvent(gmModeChangeEvent);

        // Wait for any later DOM updates
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUIForRole();
        });
    },

    createGMToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'gmToggle';
        toggle.className = 'gm-toggle-button';
        toggle.innerHTML = 'Player Mode';
        toggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1000;
            transition: background-color 0.3s;
            font-size: 14px;
        `;

        toggle.addEventListener('click', () => this.toggleGMMode());
        document.body.appendChild(toggle);
    },

    updateUIForRole() {
        // Update navigation visibility
        const navBar = document.querySelector('.navigation');
        if (!navBar) return;
    
        // Hide/show GM-only buttons
        ['creatureLibraryButton', 'itemLibraryButton', 'initiateCombatButton'].forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.style.display = this.isGM ? 'flex' : 'none';
            }
        });
    
        // Update party frame controls visibility
        if (window.partySystem) {
            window.partySystem.updatePartyFrame();
        }
    
        // Update settings menu with GM-only options
        this.updateSettingsMenu();
    },
    

    updateSettingsMenu() {
        const settingsMenu = document.getElementById('settingsMenu');
        if (!settingsMenu) return;

        // Find or create GM settings section
        let gmSection = settingsMenu.querySelector('.gm-settings-section');
        if (!gmSection && this.isGM) {
            gmSection = document.createElement('div');
            gmSection.className = 'menu-section gm-settings-section';
            gmSection.innerHTML = `
                <h3>GM Controls</h3>
                <div class="setting-group">
                    <h4>Rest Options</h4>
                    <button id="shortRestButton" class="settings-button">Short Rest</button>
                    <button id="longRestButton" class="settings-button">Long Rest</button>
                </div>
                <div class="setting-group">
                    <h4>Environment</h4>
                    <button id="toggleDayNight" class="settings-button">Toggle Day/Night</button>
                    <button id="toggleWeather" class="settings-button">Toggle Weather</button>
                </div>
            `;
            settingsMenu.querySelector('.menu-content').appendChild(gmSection);
            this.setupGMSettingsListeners();
        } else if (gmSection && !this.isGM) {
            gmSection.remove();
        }
    },

    setupGMSettingsListeners() {
        // Short Rest Handler
        document.getElementById('shortRestButton')?.addEventListener('click', () => {
            if (!this.isGM) return;
            this.initiateShortRest();
        });

        // Long Rest Handler
        document.getElementById('longRestButton')?.addEventListener('click', () => {
            if (!this.isGM) return;
            this.initiateLongRest();
        });

        // Environment Controls
        document.getElementById('toggleDayNight')?.addEventListener('click', () => {
            if (!this.isGM) return;
            // Toggle day/night implementation placeholder
            window.addMessage('chat', 'System', 'Time of day toggled');
        });

        document.getElementById('toggleWeather')?.addEventListener('click', () => {
            if (!this.isGM) return;
            // Weather toggle implementation placeholder
            window.addMessage('chat', 'System', 'Weather changed');
        });
    },

    initiateShortRest() {
        // Assuming partySystem is defined and has partyMembers
        partySystem.partyMembers.forEach(member => {
            // Create rest prompt for each party member
            this.showRestPrompt(member, 'short');
        });
    },

    initiateLongRest() {
        // Assuming partySystem is defined and has partyMembers
        partySystem.partyMembers.forEach(member => {
            // Create rest prompt for each party member
            this.showRestPrompt(member, 'long');
        });
    },

    showRestPrompt(member, restType) {
        const prompt = document.createElement('div');
        prompt.className = 'rest-prompt';
        prompt.innerHTML = `
            <div class="rest-prompt-content">
                <h3>${member.displayName} - ${restType.charAt(0).toUpperCase() + restType.slice(1)} Rest</h3>
                <div class="rest-options">
                    ${restType === 'short' ? `
                        <button class="roll-hit-dice">Roll Hit Dice</button>
                        <input type="number" min="1" max="${member.hitDice || 1}" value="1" class="hit-dice-count">
                    ` : ''}
                    <button class="skip-rest">Skip Rest</button>
                    <button class="complete-rest">Complete Rest</button>
                </div>
            </div>
        `;

        document.body.appendChild(prompt);

        // Add event listeners for rest options
        prompt.querySelector('.complete-rest')?.addEventListener('click', () => {
            if (restType === 'long') {
                // Full heal and resource restoration
                partySystem.applyHealingToPartyMember(member.displayName, member.maxHealth);
                partySystem.regenerateManaForPartyMember(member.displayName, member.maxMana);
                partySystem.regenerateApForPartyMember(member.displayName, member.maxAp);
            }
            prompt.remove();
        });

        prompt.querySelector('.skip-rest')?.addEventListener('click', () => {
            prompt.remove();
        });

        if (restType === 'short') {
            prompt.querySelector('.roll-hit-dice')?.addEventListener('click', () => {
                const diceCount = parseInt(prompt.querySelector('.hit-dice-count').value);
                // Implement hit dice rolling logic here
            });
        }
    },

    setupKeyBindings() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                this.toggleGMMode();
            }
        });
    },

    interceptHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGM) {
                const key = e.key.toLowerCase();
                if (key === 'i' || key === 'l') {
                    // Prevent the default action and stop propagation
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log(`Blocked hotkey '${e.key}' in player mode.`);
                }
            }
        }, true); // Use capture phase to intercept before other handlers
    },

    toggleGMMode() {
        this.isGM = !this.isGM;
        window.isGM = this.isGM;
    
        const toggle = document.getElementById('gmToggle');
        if (toggle) {
            toggle.innerHTML = this.isGM ? 'GM Mode' : 'Player Mode';
            toggle.style.background = this.isGM ? '#8e44ad' : '#3498db';
        }
    
        this.updateUIForRole();
        this.interceptHotkeys(); // Re-attach hotkey interception
    
        // Dispatch gmModeChange event
        const gmModeChangeEvent = new CustomEvent('gmModeChange', { detail: { isGM: this.isGM } });
        document.dispatchEvent(gmModeChangeEvent);
    
        window.addMessage('chat', 'System', 
            `Switched to ${this.isGM ? 'GM' : 'Player'} mode.`);
    }
}; // Closing brace to properly close the gmTools object

// Add CSS for new components
const style = document.createElement('style');
style.textContent = `
    .gm-toggle.active {
        background: #8e44ad;
    }
    
    .rest-prompt {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #333;
        padding: 20px;
        border-radius: 4px;
        z-index: 1000;
    }
    
    .rest-prompt-content {
        color: #fff;
    }
    
    .rest-options {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .rest-options button {
        background: linear-gradient(to bottom, #3a3a3a, #202020);
        border: 1px solid #333;
        color: #ffd700;
        padding: 5px 10px;
        cursor: pointer;
    }
    
    .rest-options button:hover {
        border-color: #ffd700;
    }
    
    .hit-dice-count {
        width: 50px;
        background: #1a1a1a;
        border: 1px solid #333;
        color: #fff;
        padding: 5px;
    }
`;
document.head.appendChild(style);

// Initialize GM tools immediately
gmTools.init();
window.gmTools = gmTools;
