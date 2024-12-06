// HUD.js

characterState.name = "Beadle";

// Function to initialize health and mana bars based on derived stats
function initializeHUD() {
    console.log("Initializing HUD with characterState:", characterState);
    
    characterState.derivedStats.currentHealth = characterState.derivedStats.maxHealth;
    characterState.derivedStats.currentMana = characterState.derivedStats.maxMana;
    updateHealthBar();
    updateManaBar();
    initializeCharacterName();
}

function initializeCharacterName() {
    // Set initial name in characterState
    characterState.name = "Beadle";

    // Update the tokenName element to show the static name
    const nameElement = document.getElementById('tokenName');
    if (nameElement) {
        nameElement.textContent = characterState.name;
    }

    // Update player token if it exists
    const playerToken = document.querySelector('.token.player-token');
    if (playerToken) {
        playerToken.dataset.name = characterState.name;
    }
}







// Function to display the target pop-up
function showTargetDisplay(token) {
    const targetDisplay = document.getElementById('targetDisplay');
    const targetName = document.getElementById('targetName');
    const targetHealthBar = document.getElementById('targetHealthBar');
    const targetHealthValue = document.getElementById('targetHealthValue');
    const targetManaBar = document.getElementById('targetManaBar');
    const targetManaValue = document.getElementById('targetManaValue');
    const targetPortrait = document.getElementById('targetPortrait');
    const originalShowTargetDisplay = window.showTargetDisplay;
    window.showTargetDisplay = function(token) {
    originalShowTargetDisplay(token);
    if (combatState.isInCombat) {
        updateTargetAP(token);
    }
};


    // Populate the target display with token data
    targetName.textContent = token.dataset.name || 'Unknown Token';
    targetHealthValue.textContent = `${token.dataset.currentHealth || 0} / ${token.dataset.maxHealth || 100}`;
    targetManaValue.textContent = `${token.dataset.currentMana || 0} / ${token.dataset.maxMana || 100}`;
    targetPortrait.src = token.dataset.portraitUrl || 'path/to/default/portrait.jpg';

    // Set health and mana bar widths
    const healthPercent = ((parseInt(token.dataset.currentHealth) || 0) / (parseInt(token.dataset.maxHealth) || 1)) * 100;
    const manaPercent = ((parseInt(token.dataset.currentMana) || 0) / (parseInt(token.dataset.maxMana) || 1)) * 100;
    targetHealthBar.style.width = '100%'; // Background bar
    targetHealthBar.querySelector('::after').style.width = `${healthPercent}%`; // Foreground bar
    targetManaBar.style.width = '100%';
    targetManaBar.querySelector('::after').style.width = `${manaPercent}%`;

    // Display the pop-up
    targetDisplay.style.display = 'block';
}

function updateAdjustmentControlsVisibility() {
    const isGM = window.gmTools && typeof window.gmTools.isGM === 'boolean' ? window.gmTools.isGM : true;
    console.log('GM Mode:', isGM);

    // Hide or show adjustment controls
    const adjustmentControls = document.querySelectorAll('.adjustment-controls');
    console.log('Found', adjustmentControls.length, 'adjustment controls');

    adjustmentControls.forEach(control => {
        control.style.display = isGM ? 'flex' : 'none';
    });

    // Adjust bar widths
    const barContainers = document.querySelectorAll('.bar-container');
    barContainers.forEach(container => {
        const bar = container.querySelector('.bar');
        if (bar) {
            bar.style.width = isGM ? 'calc(100% - 150px)' : '100%';
        }
    });
}

// Function to observe changes in token dataset
function observeTokenChanges(token) {
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName.startsWith('data-')) {
                // Update HUD if the token is the player and is targeted
                if (token.classList.contains('player-token') && characterState.currentTarget === token) {
                    updateTargetInfo(token);
                    // Optionally, update HUD if necessary
                    updateHealthBar();
                    updateManaBar();
                }
            }
        }
    });

    observer.observe(token, { attributes: true });
}

function updateStatsDisplay(container, selector, value) {
    const element = container.querySelector(selector);
    if (element && value !== undefined) {
        element.textContent = value;
    }
}

const floatingTextQueue = {
    queue: [],
    isProcessing: false,
    delay: 200, // Delay between showing queued texts

    add(token, value, type) {
        this.queue.push({ token, value, type });
        if (!this.isProcessing) {
            this.processQueue();
        }
    },

    async processQueue() {
        this.isProcessing = true;
        while (this.queue.length > 0) {
            const { token, value, type } = this.queue.shift();
            showFloatingCombatText(token, value, type);
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }
        this.isProcessing = false;
    }
};

function showFloatingCombatText(element, value, type = 'damage') {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-combat-text';

    // Set color and content based on type
    switch (type) {
        case 'healing':
            floatingText.style.color = '#2ecc71';
            floatingText.textContent = '+' + Math.abs(value);
            break;
        case 'damage':
            floatingText.style.color = '#e74c3c';
            floatingText.textContent = '-' + Math.abs(value);
            break;
        case 'mana':
            floatingText.style.color = '#3498db';
            floatingText.textContent = (value > 0 ? '+' : '-') + Math.abs(value) + ' MP';
            break;
        case 'ap':
            floatingText.style.color = '#f1c40f';
            floatingText.textContent = (value > 0 ? '+' : '-') + Math.abs(value) + ' AP';
            break;
    }

    const rect = element.getBoundingClientRect();
    floatingText.style.position = 'absolute';
    floatingText.style.left = `${rect.left + rect.width / 2}px`;
    floatingText.style.top = `${rect.top}px`;
    floatingText.style.transform = 'translate(-50%, 0)';
    floatingText.style.zIndex = '1001';

    document.body.appendChild(floatingText);

    requestAnimationFrame(() => {
        floatingText.style.transition = 'all 1s ease-out';
        floatingText.style.transform = 'translate(-50%, -30px)';
        floatingText.style.opacity = '0';
    });

    setTimeout(() => floatingText.remove(), 1000);
}


// Expose the function globally if needed
window.showFloatingCombatText = showFloatingCombatText;




function calculateAbilityDamage(ability, source) {
    const damageRoll = rollDice(ability.damage);
    let bonus = 0;

    // Add stat modifier bonus
    if (ability.statModifier) {
        const statValue = parseInt(source.dataset[ability.statModifier]) || 10;
        bonus += Math.floor((statValue - 10) / 2);
    }

    // Add bonus damage type (physical or spell)
    if (ability.bonusDamage) {
        bonus += parseInt(source.dataset[ability.bonusDamage]) || 0;
    }

    return {
        total: damageRoll.total + bonus,
        rolls: damageRoll.rolls,
        bonus: bonus
    };
}

// After creating the player token, start observing
document.addEventListener('DOMContentLoaded', () => {
    const playerToken = document.querySelector('.token.player-token');
    if (playerToken) {
        observeTokenChanges(playerToken);
    }
});

// Function to update the health bar based on current health
function updateHealthBar() {
    console.log("Updating Health Bar. Current State:", characterState.derivedStats);

    const healthBarFill = document.getElementById('healthBar');
    const healthValue = document.getElementById('healthValue');

    const currentHealth = characterState.derivedStats.currentHealth || 0;
    const maxHealth = characterState.derivedStats.maxHealth || 1; // Prevent division by zero

    console.log(`Health: ${currentHealth} / ${maxHealth}`);

    const healthPercent = (currentHealth / maxHealth) * 100;
    healthBarFill.style.width = `${healthPercent}%`;
    healthValue.textContent = `${currentHealth} / ${maxHealth}`;

    // Update opacity for water effect
    healthBarFill.style.opacity = 0.7 + (healthPercent / 300);

    // If player token is targeted, update target display
    const playerToken = document.querySelector('.token.player-token');
    if (characterState.currentTarget === playerToken) {
        updateTargetInfo(playerToken);
    }
}


// Function to update the mana bar based on current mana
function updateManaBar() {
    console.log("Updating Mana Bar. Current State:", characterState.derivedStats);
    
    const manaBarFill = document.getElementById('manaBar');
    const manaValue = document.getElementById('manaValue');

    const currentMana = characterState.derivedStats.currentMana || 0;
    const maxMana = characterState.derivedStats.maxMana || 1; // Prevent division by zero

    console.log(`Mana: ${currentMana} / ${maxMana}`);

    const manaPercent = (currentMana / maxMana) * 100;
    manaBarFill.style.width = `${manaPercent}%`;
    manaValue.textContent = `${currentMana} / ${maxMana}`;

    // Update opacity for water effect
    manaBarFill.style.opacity = 0.7 + (manaPercent / 300);

    // If player token is targeted, update target display
    const playerToken = document.querySelector('.token.player-token');
    if (characterState.currentTarget === playerToken) {
        updateTargetInfo(playerToken);
    }
}



function initializeAPBar() {
    console.log("Initializing AP Bar");
    const healthManaSection = document.querySelector('.health-mana-bars');
    if (!healthManaSection) {
        console.error('Health-mana-bars section not found');
        return;
    }

    // Check if an AP bar container already exists
    const existingAPContainer = healthManaSection.querySelector('.bar-container:has(.ap)');
    if (existingAPContainer) {
        console.log('AP bar already exists, skipping initialization');
        return;
    }

    const apContainer = document.createElement('div');
    apContainer.className = 'bar-container ap-container';  // Added unique class
    apContainer.innerHTML = `
        <div class="bar">
            <div class="ap" id="apBar"></div>
            <div class="bar-text">AP: <span id="apValue">0/10</span></div>
        </div>
        <div class="adjustment-controls">
            <button id="useAPButton" class="adjustment-button">-</button>
            <input type="number" id="apAdjustAmount" class="adjustment-input" placeholder="Amount" min="0">
            <button id="regenAPButton" class="adjustment-button">+</button>
        </div>
    `;

    healthManaSection.appendChild(apContainer);

    // Add event listeners only if they don't already exist
    const useAPButton = document.getElementById('useAPButton');
    const regenAPButton = document.getElementById('regenAPButton');

    if (useAPButton && !useAPButton.hasListener) {
        useAPButton.addEventListener('click', () => {
            const amount = parseInt(document.getElementById('apAdjustAmount').value);
            if (!isNaN(amount) && amount > 0) {
                const playerToken = document.querySelector('.token.player-token');
                if (playerToken) {
                    useAP(amount, playerToken);
                    document.getElementById('apAdjustAmount').value = '';
                }
            }
        });
        useAPButton.hasListener = true;
    }

    if (regenAPButton && !regenAPButton.hasListener) {
        regenAPButton.addEventListener('click', () => {
            const amount = parseInt(document.getElementById('apAdjustAmount').value);
            if (!isNaN(amount) && amount > 0) {
                const playerToken = document.querySelector('.token.player-token');
                if (playerToken) {
                    regenerateAP(amount, playerToken);
                    document.getElementById('apAdjustAmount').value = '';
                }
            }
        });
        regenAPButton.hasListener = true;
    }
}

function ensureAPBar() {
    const apBar = document.getElementById('apBar');
    if (!apBar) {
        const apContainer = document.querySelector('.bar-container.ap-container');
        if (!apContainer) {
            console.log('AP container not found, initializing AP bar');
            initializeAPBar();
        }
    }
}

function updateAPBar(ap) {
    console.log('updateAPBar called with AP:', ap);
    
    ensureAPBar();
    
    const apBar = document.getElementById('apBar');
    const apValue = document.getElementById('apValue');
    
    if (!apBar || !apValue) {
        console.error('AP bar elements not found even after initialization');
        return;
    }

    const maxAp = 10;
    const currentAp = typeof ap === 'number' ? ap : 0;
    const apPercent = (currentAp / maxAp) * 100;

    // Update the visual bar
    apBar.style.width = `${Math.max(0, Math.min(100, apPercent))}%`;
    apValue.textContent = `${currentAp}/${maxAp}`;

    // Update opacity for water effect
    apBar.style.opacity = 0.7 + (apPercent / 300);

    // Update character state
    if (!characterState.combat) {
        characterState.combat = {};
    }
    characterState.combat.actionPoints = currentAp;
}

function useAP(amount, target) {
    if (!target) {
        console.error('No target specified for AP use');
        return false;
    }
    
    const isPlayer = target.classList.contains('player-token');
    const name = isPlayer ? characterState.name : target.dataset.name;
    
    if (isPlayer) {
        if (!characterState.combat) {
            characterState.combat = {};
        }

        const currentAP = characterState.combat.actionPoints || 0;
        if (currentAP < amount) {
            console.warn('Not enough AP');
            if (typeof window.addCombatMessage === 'function') {
                window.addCombatMessage(`${name} doesn't have enough AP`);
            }
            return false;
        }

        const newAP = Math.max(0, currentAP - amount);
        
        // Synchronize ALL AP states
        characterState.combat.actionPoints = newAP;
        target.dataset.actionPoints = newAP.toString();
        
        // Update HUD
        updateAPBar(newAP);
        animateLiquid('apBar', false);
        
        // Update token visuals
        updateTokenBars(target);
        
        if (typeof window.addCombatMessage === 'function') {
            window.addCombatMessage(`${name} uses ${amount} AP`);
        }
        
        const hudElement = document.querySelector('.character-info');
        if (hudElement) {
            showFloatingCombatText(hudElement.querySelector('.bar'), -amount, 'ap');
        }

        // If this is in combat, also update combat state
        if (window.combatState?.isInCombat) {
            const currentCombatant = window.combatState.currentRoundCombatants[window.combatState.currentTurnIndex];
            if (currentCombatant && currentCombatant.element === target) {
                currentCombatant.actionPoints = newAP;
            }
        }

        // Update target display if this token is targeted
        if (characterState.currentTarget === target) {
            updateTargetInfo(target);
        }
    } else {
        // For non-player tokens
        const tokenCurrentAP = parseInt(target.dataset.actionPoints) || 0;
        if (tokenCurrentAP < amount) {
            return false;
        }
        const newAP = Math.max(0, tokenCurrentAP - amount);
        target.dataset.actionPoints = newAP.toString();
        updateTokenBars(target);
    }
    
    showFloatingCombatText(target, -amount, 'ap');

    return true;
}

function regenerateAP(amount, target) {
    if (!target) return;
    
    const isPlayer = target.classList.contains('player-token');
    const name = isPlayer ? characterState.name : target.dataset.name;
    
    if (isPlayer) {
        if (!characterState.combat) characterState.combat = {};
        const currentAP = characterState.combat.actionPoints || 0;
        characterState.combat.actionPoints = Math.min(10, currentAP + amount);
        
        updateAPBar(characterState.combat.actionPoints);
        animateLiquid('apBar', true);
        
        // Update message style to match Yad's format
        if (typeof window.addCombatMessage === 'function') {
            window.addCombatMessage(`${characterState.name} regenerates ${amount} AP`);
        }
        
        const hudElement = document.querySelector('.character-info');
        if (hudElement) {
            showFloatingCombatText(hudElement.querySelector('.bar'), amount, 'ap');
        }
    }
    
    const currentAP = parseInt(target.dataset.actionPoints) || 0;
    target.dataset.actionPoints = Math.min(10, currentAP + amount);
    
    showFloatingCombatText(target, amount, 'ap');
    updateTokenBars(target);
}


function createTooltip(token) {
    const tooltip = document.createElement('div');
    tooltip.className = 'token-tooltip';
    
    const header = document.createElement('div');
    header.className = 'tooltip-header';
    header.textContent = token.dataset.name;
    
    const stats = document.createElement('div');
    stats.className = 'tooltip-stats';
    
    tooltip.appendChild(header);
    tooltip.appendChild(stats);
    
    return tooltip;
}



function synchronizeWithHUD(token) {
    console.log('Synchronizing HUD with token:', token);
    
    if (!token || !token.classList.contains('player-token')) {
        console.log('Not a player token, skipping sync');
        return;
    }

    // Extract current values from token
    const health = {
        current: parseInt(token.dataset.currentHealth) || 0,
        max: parseInt(token.dataset.maxHealth) || 100
    };
    
    const mana = {
        current: parseInt(token.dataset.currentMana) || 0,
        max: parseInt(token.dataset.maxMana) || 50
    };
    
    const ap = {
        current: parseInt(token.dataset.actionPoints) || 0,
        max: 10  // Using fixed max AP instead of MAX_AP constant
    };

    console.log('Extracted values:', { health, mana, ap });

    // Update character state
    if (!characterState.combat) {
        characterState.combat = {};
    }
    
    // Only update if values have changed
    let needsUpdate = false;
    
    if (characterState.combat.actionPoints !== ap.current) {
        characterState.combat.actionPoints = ap.current;
        needsUpdate = true;
    }
    
    if (characterState.derivedStats.currentHealth !== health.current) {
        characterState.derivedStats.currentHealth = health.current;
        needsUpdate = true;
    }
    
    if (characterState.derivedStats.currentMana !== mana.current) {
        characterState.derivedStats.currentMana = mana.current;
        needsUpdate = true;
    }

    // Only update HUD if values have changed
    if (needsUpdate) {
        console.log('Values changed, updating HUD');
        
        // Update AP bar first to ensure it exists
        const apBar = document.getElementById('apBar');
        if (!apBar) {
            console.log('AP bar not found, initializing');
            initializeAPBar();
        }
        updateAPBar(ap.current);
        
        // Update other bars
        updateHealthBar();
        updateManaBar();
        
        // Update token bars if they exist
        updateTokenBars(token);
        
        // If this token is targeted, update target display
        if (characterState.currentTarget === token) {
            updateTargetInfo(token);
        }
    } else {
        console.log('No value changes detected, skipping HUD update');
    }
}



function createTokenBars(token) {
    // Remove ALL existing UI elements first
    token.querySelectorAll('.token-bars-container, .token-tooltip, .token-name').forEach(el => el.remove());

    // Create container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'token-bars-container';

    // Create the three bars
    const healthBar = createBar('health');
    const manaBar = createBar('mana');
    const apBar = createBar('ap');
    
    barsContainer.appendChild(healthBar);
    barsContainer.appendChild(manaBar);
    barsContainer.appendChild(apBar);

    // Create separate tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'token-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header">${token.dataset.name || 'Unknown'}</div>
        <div class="tooltip-stats">
            HP: ${token.dataset.currentHealth || 0}/${token.dataset.maxHealth || 100}
            ${token.dataset.maxMana ? `<br>MP: ${token.dataset.currentMana || 0}/${token.dataset.maxMana}` : ''}
            <br>AP: ${token.dataset.actionPoints || 0}/10
        </div>
    `;

    // Create name label
    const nameLabel = document.createElement('div');
    nameLabel.className = 'token-name';
    nameLabel.textContent = token.dataset.name || 'Unknown';

    token.appendChild(barsContainer);
    token.appendChild(tooltip);
    token.appendChild(nameLabel);
}

// Create individual bar
function createBar(type) {
    const bar = document.createElement('div');
    bar.className = `token-bar token-${type}-bar`;
    
    const fill = document.createElement('div');
    fill.className = `bar-fill ${type}-fill`;
    bar.appendChild(fill);
    
    return bar;
}

function performAction(actionName) {
    const slot = document.querySelector(`.action-slot[data-name="${actionName}"]`);
    if (!slot) return;

    if (slot.dataset.actionType === 'consumable') {
        const itemElement = document.querySelector(
            `.inventory-item[data-instance-id="${slot.dataset.instanceId}"]`
        );
        if (itemElement) {
            useItem(JSON.parse(itemElement.dataset.itemData), itemElement);
        }
    } else if (slot.dataset.actionType === 'spell' && window.spellbook) {
        const playerToken = document.querySelector('.token.player-token');
        if (playerToken) {
            window.spellbook.castSpell(slot.dataset.spellId, playerToken);
        }
    }
}

// Update token bars and tooltips
function updateTokenBars(token) {
    if (!token) return;

    const healthFill = token.querySelector('.health-fill');
    const manaFill = token.querySelector('.mana-fill');
    const apFill = token.querySelector('.ap-fill');
    const tooltipStats = token.querySelector('.tooltip-stats');

    // Update health bar
    if (healthFill) {
        const currentHealth = parseInt(token.dataset.currentHealth) || 0;
        const maxHealth = parseInt(token.dataset.maxHealth) || 100;
        const healthPercent = (currentHealth / maxHealth) * 100;
        
        healthFill.style.width = `${healthPercent}%`;
        healthFill.className = `bar-fill health-fill${healthPercent <= 25 ? ' danger' : healthPercent <= 50 ? ' warning' : ''}`;
    }

    // Update mana bar
    if (manaFill) {
        const currentMana = parseInt(token.dataset.currentMana) || 0;
        const maxMana = parseInt(token.dataset.maxMana) || 50;
        const manaPercent = (currentMana / maxMana) * 100;
        manaFill.style.width = `${manaPercent}%`;
    }

    // Update AP bar
    if (apFill) {
        const currentAP = parseInt(token.dataset.actionPoints) || 0;
        const apPercent = (currentAP / 10) * 100;
        apFill.style.width = `${apPercent}%`;
    }

    // Update tooltip
    if (tooltipStats) {
        tooltipStats.innerHTML = `
            HP: ${token.dataset.currentHealth || 0}/${token.dataset.maxHealth || 100}
            ${token.dataset.maxMana ? `<br>MP: ${token.dataset.currentMana || 0}/${token.dataset.maxMana}` : ''}
            <br>AP: ${token.dataset.actionPoints || 0}/10
        `;
    }

    // Update target info if this is the current target
    if (characterState.currentTarget === token) {
        updateTargetInfo(token);
    }
}

// Add this to your existing token creation/initialization code
function initializeToken(token) {
    // Create token bars
    createTokenBars(token);
    
    // Set initial AP to 0
    token.dataset.actionPoints = "0";
    
    // Set up observers for changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName.startsWith('data-')) {
                updateTokenBars(token);
            }
        });
    });

    observer.observe(token, {
        attributes: true,
        attributeFilter: ['data-current-health', 'data-current-mana', 'data-action-points']
    });
}

// Add this initialization to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all existing tokens
    document.querySelectorAll('.token').forEach(token => {
        initializeToken(token);
    });

    // Set up observer for new tokens
    const gridObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.classList && node.classList.contains('token')) {
                    initializeToken(node);
                }
            });
        });
    });

    const gridOverlay = document.getElementById('grid-overlay');
    if (gridOverlay) {
        gridObserver.observe(gridOverlay, { childList: true, subtree: true });
    }
});

function updateTargetAP(token) {
    const targetDisplay = document.getElementById('targetDisplay');
    if (!targetDisplay) return;

    let apInfo = targetDisplay.querySelector('.target-ap-info');
    if (!apInfo) {
        apInfo = document.createElement('div');
        apInfo.className = 'target-ap-info';
        targetDisplay.querySelector('.target-content').appendChild(apInfo);
    }

    const currentAP = token.dataset.actionPoints || 0;
    apInfo.innerHTML = `
        <div class="target-ap-bar">
            <div class="ap-fill" style="width: ${(currentAP / 5) * 100}%"></div>
        </div>
        <div class="target-ap-text">AP: ${currentAP}</div>
    `;
}

// Create an event system
const eventEmitter = {
    events: {},
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    },
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }
};

// Function to handle taking damage
function takeDamage(amount, target) {
    console.log(`Taking Damage: ${amount}`);
    
    if (!target) {
        console.error('No target specified for damage');
        return;
    }

    const isPlayer = target.classList.contains('player-token');
    
    if (isPlayer) {
        characterState.derivedStats.currentHealth = Math.max(
            characterState.derivedStats.currentHealth - amount,
            0
        );
        
        updateHealthBar();
        animateLiquid('healthBar', false);
        
        // Update to use 'combat' type and null for system messages, matching social system
        if (typeof window.addCombatMessage === 'function') {
            window.addCombatMessage(`${characterState.name} takes ${amount} damage`);
        }
        
        // Show floating text on the HUD
        const hudElement = document.querySelector('.character-info');
        if (hudElement) {
            showFloatingCombatText(hudElement.querySelector('.bar'), -amount, 'damage');
        }
    }
    
    const currentHealth = parseInt(target.dataset.currentHealth) || 0;
    target.dataset.currentHealth = Math.max(0, currentHealth - amount);
    
    showFloatingCombatText(target, -amount, 'damage');
    
    updateTokenBars(target);
    
    if (characterState.currentTarget === target) {
        updateTargetInfo(target);
    }
    
    if (parseInt(target.dataset.currentHealth) <= 0) {
        handleTokenDeath(target);
    }
}



// Function to heal the character
function heal(amount, target) {
    console.log(`Healing: ${amount}`);
    
    if (!target) return;
    
    const isPlayer = target.classList.contains('player-token');
    
    if (isPlayer) {
        characterState.derivedStats.currentHealth = Math.min(
            characterState.derivedStats.currentHealth + amount,
            characterState.derivedStats.maxHealth
        );
        
        updateHealthBar();
        animateLiquid('healthBar', true);
        
        // Update to use combat messages
        if (typeof window.addCombatMessage === 'function') {
            window.addCombatMessage(`${characterState.name} is healed for ${amount} points`);
        }
        
        const hudElement = document.querySelector('.character-info');
        if (hudElement) {
            showFloatingCombatText(hudElement.querySelector('.bar'), amount, 'healing');
        }
    }
    
    const currentHealth = parseInt(target.dataset.currentHealth) || 0;
    const maxHealth = parseInt(target.dataset.maxHealth) || 100;
    target.dataset.currentHealth = Math.min(maxHealth, currentHealth + amount);
    
    showFloatingCombatText(target, amount, 'healing');
    
    updateTokenBars(target);
    
    if (characterState.currentTarget === target) {
        updateTargetInfo(target);
    }
}


// Function to use mana
function useMana(amount, target) {
    console.log(`Using Mana: ${amount}`);
    
    if (!target) return;
    
    const isPlayer = target.classList.contains('player-token');
    
    if (isPlayer) {
        characterState.derivedStats.currentMana = Math.max(
            characterState.derivedStats.currentMana - amount,
            0
        );
        
        updateManaBar();
        animateLiquid('manaBar', false);
        
        if (typeof window.addCombatMessage === 'function') {
            window.addCombatMessage(`${characterState.name} uses ${amount} mana`);
        }
        
        const hudElement = document.querySelector('.character-info');
        if (hudElement) {
            showFloatingCombatText(hudElement.querySelector('.bar'), -amount, 'mana');
        }
    }
    
    const currentMana = parseInt(target.dataset.currentMana) || 0;
    target.dataset.currentMana = Math.max(0, currentMana - amount);
    
    showFloatingCombatText(target, -amount, 'mana');
    
    updateTokenBars(target);
    
    if (characterState.currentTarget === target) {
        updateTargetInfo(target);
    }
}


// Function to regenerate mana
function regenerateMana(amount, target) {
    console.log(`Regenerating Mana: ${amount}`);
    
    if (!target) return;
    
    const isPlayer = target.classList.contains('player-token');
    
    if (isPlayer) {
        characterState.derivedStats.currentMana = Math.min(
            characterState.derivedStats.currentMana + amount,
            characterState.derivedStats.maxMana
        );
        
        updateManaBar();
        animateLiquid('manaBar', true);
        
        if (typeof window.addCombatMessage === 'function') {
            window.addCombatMessage(`${characterState.name} regenerates ${amount} mana`);
        }
        
        const hudElement = document.querySelector('.character-info');
        if (hudElement) {
            showFloatingCombatText(hudElement.querySelector('.bar'), amount, 'mana');
        }
    }
    
    const currentMana = parseInt(target.dataset.currentMana) || 0;
    const maxMana = parseInt(target.dataset.maxMana) || 100;
    target.dataset.currentMana = Math.min(maxMana, currentMana + amount);
    
    showFloatingCombatText(target, amount, 'mana');
    
    updateTokenBars(target);
    
    if (characterState.currentTarget === target) {
        updateTargetInfo(target);
    }
}


// Function to animate liquid bars
function animateLiquid(barId, isIncreasing) {
    const bar = document.getElementById(barId);
    const isHealthBar = barId === 'healthBar';

    bar.style.transition = 'all 1s ease-in-out';

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    bar.appendChild(ripple);

    // Animate the ripple
    ripple.style.animation = isIncreasing ? 'ripple-right 2s ease-out' : 'ripple-left 2s ease-out';

    // Animate the liquid level
    if (isHealthBar) {
        bar.style.transform = isIncreasing ? 'scaleY(1.05)' : 'scaleY(0.95)';
    } else {
        bar.style.transform = isIncreasing ? 'scaleX(1.05)' : 'scaleX(0.95)';
    }

    // Reset after animation
    setTimeout(() => {
        bar.style.transform = 'scale(1)';
        bar.removeChild(ripple);
    }, 2000);
}

document.getElementById('takeDamageButton').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('healthAdjustAmount').value);
    if (!isNaN(amount) && amount > 0) {
        const playerToken = document.querySelector('.token.player-token');
        if (playerToken) {
            takeDamage(amount, playerToken);
            document.getElementById('healthAdjustAmount').value = '';
        }
    }
});

document.getElementById('healButton').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('healthAdjustAmount').value);
    if (!isNaN(amount) && amount > 0) {
        const playerToken = document.querySelector('.token.player-token');
        if (playerToken) {
            heal(amount, playerToken);
            document.getElementById('healthAdjustAmount').value = '';
        }
    }
});

document.getElementById('useManaButton').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('manaAdjustAmount').value);
    if (!isNaN(amount) && amount > 0) {
        const playerToken = document.querySelector('.token.player-token');
        if (playerToken) {
            useMana(amount, playerToken);
            document.getElementById('manaAdjustAmount').value = '';
        }
    }
});

document.getElementById('regenManaButton').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('manaAdjustAmount').value);
    if (!isNaN(amount) && amount > 0) {
        const playerToken = document.querySelector('.token.player-token');
        if (playerToken) {
            regenerateMana(amount, playerToken);
            document.getElementById('manaAdjustAmount').value = '';
        }
    }
});



// Character Context Menu (Right-click) Event Listener
document.querySelector('.character-bouble').addEventListener("contextmenu", function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Show custom context menu with options
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="addToken">Add Player Token to Grid</div>
        <div class="context-menu-item" data-action="inspect">Inspect</div>
    `;
    contextMenu.style.display = "block";

    // Remove any previous event listeners to avoid duplicating them
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.replaceWith(item.cloneNode(true));  // Remove existing event listeners
    });

    // Add event listeners to the context menu items
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', handleContextMenuAction);
    });
});


// Update Hotkey Map
function updateHotkeyMap() {
    const hotkeyMap = {};
    const actionSlots = document.querySelectorAll('.action-slot[data-action-type]');
    
    actionSlots.forEach(slot => {
        if (slot && slot.dataset.keycode) {
            const actionName = slot.dataset.name || 'Unknown Action';
            hotkeyMap[slot.dataset.keycode] = actionName;
        }
    });

    return hotkeyMap;
}

// Change Keybind
function changeKeybind(slotIndex, newKey) {
    const slot = document.querySelectorAll('.action-slot')[slotIndex];
    slot.setAttribute('data-keycode', newKey.code);
    slot.querySelector('.hotkey').textContent = newKey.key.toUpperCase();
}

// Keybind Change Dialog
const keybindDialog = document.createElement('dialog');
keybindDialog.innerHTML = `
    <h2>Change Keybind</h2>
    <p>Press any key to bind to this slot</p>
    <button id="cancelKeybind">Cancel</button>
`;
document.body.appendChild(keybindDialog);

// Context Menu for Keybind Change
const keybindContextMenu = document.createElement('div');
keybindContextMenu.id = 'keybindContextMenu';
keybindContextMenu.style.cssText = `
    position: fixed;
    background-color: #261c1c;
    border: 1px solid #4a1c1c;
    padding: 5px;
    display: none;
    z-index: 1001;
`;
keybindContextMenu.innerHTML = `<button id="changeKeybindBtn">Change Keybind</button>`;
document.body.appendChild(keybindContextMenu);


// Hide Context Menu when Clicking Outside
document.addEventListener('click', (e) => {
    if (e.target.closest('#keybindContextMenu') === null) {
        keybindContextMenu.style.display = 'none';
    }
});

document.getElementById('cancelKeybind').addEventListener('click', () => {
    keybindDialog.close();
});



document.addEventListener('DOMContentLoaded', () => {
    // Function to check if interact instance is set
    const isInteractSet = (element) => {
        try {
            return interact(element)._iEvents !== undefined;
        } catch (e) {
            return false;
        }
    };

    // Function to prevent event propagation on popup-content
    const preventPopupPropagation = (popup) => {
        ['mousedown', 'touchstart', 'dragstart'].forEach(eventType => {
            popup.addEventListener(eventType, (e) => e.stopPropagation());
        });
    };

    // Remove any existing interact instances from popups and prevent event propagation
    document.querySelectorAll('.popup-content').forEach(popup => {
        if (popup.closest('.character-info')) return; // Skip character HUD

        // Remove interact instance if it exists
        if (typeof interact !== 'undefined' && isInteractSet(popup)) {
            interact(popup).unset();
        }

        // Prevent event propagation to avoid triggering HUD drag and resize
        preventPopupPropagation(popup);
    });

    // Initialize interact only for character HUD
    if (typeof interact !== 'undefined') {
        interact('.character-info')
            .draggable({
                inertia: false,
                autoScroll: true,
                ignoreFrom: '.popup-content', // Prevent drags from .popup-content
                listeners: {
                    start(event) {
                        const target = event.target;
                        const transform = window.getComputedStyle(target).transform;
                        const matrix = new DOMMatrix(transform);
                        const rect = target.getBoundingClientRect();

                        if (getComputedStyle(target).position !== 'absolute') {
                            target.style.position = 'absolute';
                            target.style.left = (rect.left + matrix.m41) + 'px';
                            target.style.top = (rect.top + matrix.m42) + 'px';
                            target.style.transform = 'none';
                        }
                    },
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.style.left) || 0) + event.dx;
                        const y = (parseFloat(target.style.top) || 0) + event.dy;

                        // Ensure we don't go too far off screen
                        const minX = -target.offsetWidth / 2;
                        const maxX = window.innerWidth - target.offsetWidth / 2;
                        const minY = 0;
                        const maxY = window.innerHeight - 50;

                        target.style.left = Math.min(Math.max(x, minX), maxX) + 'px';
                        target.style.top = Math.min(Math.max(y, minY), maxY) + 'px';
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true },
                ignoreFrom: '.popup-content', // Prevent resizes from .popup-content
                listeners: {
                    move(event) {
                        const target = event.target;

                        const minWidth = 280;
                        const maxWidth = 800;

                        let newWidth = Math.max(event.rect.width, minWidth);
                        newWidth = Math.min(newWidth, maxWidth);

                        let x = (parseFloat(target.style.left) || 0) + event.deltaRect.left;

                        // Prevent resizing from pushing the element too far off screen
                        const minX = -newWidth / 2;
                        const maxX = window.innerWidth - newWidth / 2;
                        x = Math.min(Math.max(x, minX), maxX);

                        Object.assign(target.style, {
                            width: `${newWidth}px`,
                            left: `${x}px`
                        });

                        // Scale bars properly
                        const bars = target.querySelectorAll('.bar');
                        bars.forEach(bar => {
                            const container = bar.closest('.bar-container');
                            if (container) {
                                const adjustmentControls = container.querySelector('.adjustment-controls');
                                const adjustmentWidth = adjustmentControls ? adjustmentControls.offsetWidth : 0;
                                const padding = 20;
                                bar.style.width = `calc(100% - ${adjustmentWidth + padding}px)`;
                            }
                        });
                    }
                },
                modifiers: [
                    interact.modifiers.restrictSize({
                        min: { width: 280 },
                        max: { width: 800 }
                    })
                ]
            });
    }

    // Add necessary styles
    const style = document.createElement('style');
    style.textContent = `
        .popup-content {
            pointer-events: auto;
            touch-action: auto;
            user-select: auto;
        }

        .popup-content .spell-icon,
        .popup-content .inventory-item {
            touch-action: none;
            user-drag: element;
            -webkit-user-drag: element;
        }

        .character-info {
            touch-action: none;
        }

        .popup:not(.character-info) {
            touch-action: auto;
        }

        .popup:not(.character-info) .popup-content {
            touch-action: auto !important;
            user-select: auto !important;
            -webkit-user-drag: none !important;
        }
    `;
    document.head.appendChild(style);

    // Optional: Handle dynamically added popups using MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('popup-content')) {
                    // Remove interact instance if necessary
                    if (typeof interact !== 'undefined' && isInteractSet(node)) {
                        interact(node).unset();
                    }

                    // Prevent event propagation
                    preventPopupPropagation(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    initializeAPBar();

    // Add event listeners for Health adjustment buttons
    const takeDamageButton = document.getElementById('takeDamageButton');
    if (takeDamageButton) {
        takeDamageButton.addEventListener('click', () => {
            const amount = parseInt(document.getElementById('healthAdjustAmount').value);
            if (!isNaN(amount) && amount > 0) {
                const playerToken = document.querySelector('.token.player-token');
                if (playerToken) {
                    takeDamage(amount, playerToken);
                    document.getElementById('healthAdjustAmount').value = '';
                }
            }
        });
    }

    const healButton = document.getElementById('healButton');
    if (healButton) {
        healButton.addEventListener('click', () => {
            const amount = parseInt(document.getElementById('healthAdjustAmount').value);
            if (!isNaN(amount) && amount > 0) {
                const playerToken = document.querySelector('.token.player-token');
                if (playerToken) {
                    heal(amount, playerToken);
                    document.getElementById('healthAdjustAmount').value = '';
                }
            }
        });
    }

    // Add event listeners for Mana adjustment buttons
    const useManaButton = document.getElementById('useManaButton');
    if (useManaButton) {
        useManaButton.addEventListener('click', () => {
            const amount = parseInt(document.getElementById('manaAdjustAmount').value);
            if (!isNaN(amount) && amount > 0) {
                const playerToken = document.querySelector('.token.player-token');
                if (playerToken) {
                    useMana(amount, playerToken);
                    document.getElementById('manaAdjustAmount').value = '';
                }
            }
        });
    }

    const regenManaButton = document.getElementById('regenManaButton');
    if (regenManaButton) {
        regenManaButton.addEventListener('click', () => {
            const amount = parseInt(document.getElementById('manaAdjustAmount').value);
            if (!isNaN(amount) && amount > 0) {
                const playerToken = document.querySelector('.token.player-token');
                if (playerToken) {
                    regenerateMana(amount, playerToken);
                    document.getElementById('manaAdjustAmount').value = '';
                }
            }
        });
    }

    // Update adjustment controls visibility
    updateAdjustmentControlsVisibility();
});

document.addEventListener('gmModeChange', (e) => {
    updateAdjustmentControlsVisibility();
});


// Run HUD initialization when the page loads or character is loaded
document.addEventListener('DOMContentLoaded', () => {

    // Event Listeners for Inventory and Context Menus
    const inventoryGrid = document.getElementById('inventoryGrid');
    inventoryGrid.addEventListener('dragover', dragOver);
    inventoryGrid.addEventListener('drop', drop);
    inventoryGrid.addEventListener('contextmenu', handleInventoryContextMenu);
    document.getElementById('contextMenu').addEventListener('click', handleContextMenuAction);
});


window.showTargetDisplay = showTargetDisplay;

window.combatUtils = {
    showFloatingCombatText,
};

if (window.gmTools) {
    window.gmTools.onGMModeChange = function() {
        updateAdjustmentControlsVisibility();
    };
}