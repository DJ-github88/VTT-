// combat.js
const MAX_AP = 10;

function initializeCombatSystem() {
    console.log('Initializing combat system...'); // Debug log

    // 1. Initialize combat tracker and UI
    ensureCombatInit();
    createCombatTracker();

    // 2. Clean up any existing states
    document.querySelectorAll('.token').forEach(token => {
        token.classList.remove('selectable-for-combat', 'selected-for-combat');
        const highlight = token.querySelector('.selection-highlight');
        if (highlight) highlight.remove();
    });

    // 3. Setup targeting system
    document.addEventListener('click', (e) => {
        if (!window.combatState?.targeting.isTargeting) return;
        
        const token = e.target.closest('.token');
        if (!token) return;

        if (window.combatState.targeting.allowedTargets.has(token)) {
            handleTargetSelection(token);
        } else {
            addCombatMessage("Invalid target!");
        }
    });

    // 4. Setup timeline and controls
    const turnTrack = document.querySelector('.turn-order-track');
    if (turnTrack) {
        makeTimelineDraggable(turnTrack);
        updateTurnDisplay();
    }

    // 5. Setup end combat button
    const endCombatBtn = document.querySelector('.end-combat-btn');
    if (endCombatBtn) {
        endCombatBtn.addEventListener('click', cleanupCombat);
    }

    // 6. Initialize player token synchronization
    const playerToken = document.querySelector('.token.player-token');
    if (playerToken) {
        synchronizePlayerToken(playerToken);
    }

    console.log('Combat system initialization complete'); // Debug log
}

// Update the timeline's position without resetting it
function updateTimelinePosition() {
    const timeline = document.querySelector('.turn-order-track');
    if (timeline && timelineOffset.x !== 0 || timelineOffset.y !== 0) {
        timeline.style.transform = `translate(${timelineOffset.x}px, ${timelineOffset.y}px)`;
    }
}


function generateUniqueId() {
    // Simple unique ID generator using current timestamp and a random number
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function ensureCombatInit() {
    console.log('Ensuring combat initialization...');
    
    if (!window.combatState) {
        window.combatState = {
            isInCombat: false,
            combatants: [],
            currentRoundCombatants: [],
            nextRoundCombatants: [],
            round: 1,
            currentTurnIndex: 0,
            turnTimer: 0,
            turnTimes: {},
            calculateAP: function(initiative) {
                return Math.max(1, Math.floor(initiative / 5));
            }
        };
    }

    // Clear any existing combat UI first
    const existingTracker = document.getElementById('combat-tracker');
    if (existingTracker) existingTracker.remove();

    let trackerContainer = document.createElement('div');
    trackerContainer.id = 'combat-tracker';
    trackerContainer.style.position = 'fixed';
    trackerContainer.style.top = '20px';
    trackerContainer.style.left = '50%';
    trackerContainer.style.transform = 'translateX(-50%)';
    trackerContainer.style.zIndex = '1000';
    trackerContainer.style.display = 'none'; // Hide by default
    document.body.appendChild(trackerContainer);

    trackerContainer.innerHTML = `
    <div class="combat-tracker">
        <div class="combat-selection-message" style="display: none;">
            <div class="selection-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                </svg>
                <span>SELECT TOKENS TO PARTICIPATE IN COMBAT</span>
            </div>
            <div class="selection-controls">
                <button class="battle-btn confirm-combat-btn" aria-label="Begin Combat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <div class="combat-tooltip">BEGIN COMBAT</div>
                </button>
                <button class="battle-btn cancel-combat-btn" aria-label="Cancel">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <div class="combat-tooltip">CANCEL</div>
                </button>
            </div>
        </div>
        <div class="turn-order-track" style="display: none;">
            <div class="total-timer">Total: 0:00</div>
            <div class="round-display">ROUND 1</div>
            <div class="turn-order-line"></div>
            <div class="token-container"></div>
        </div>
    </div>
`;

    // Add styles for the tooltip
    const style = document.createElement('style');
    style.textContent = `
        .battle-btn {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
        }

        .combat-tooltip {
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            font-family: 'Cinzel', serif;
        }

        .battle-btn:hover .combat-tooltip {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Make combat tracker draggable once initialized
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    trackerContainer.addEventListener('mousedown', function(e) {
        if (e.target.closest('.battle-btn, .token-wrapper, .timeline-token')) {
            return;
        }

        isDragging = true;
        const rect = trackerContainer.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
        this.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        const maxX = window.innerWidth - trackerContainer.offsetWidth;
        const maxY = window.innerHeight - trackerContainer.offsetHeight;
        
        currentX = Math.min(Math.max(0, currentX), maxX);
        currentY = Math.min(Math.max(0, currentY), maxY);

        trackerContainer.style.left = `${currentX}px`;
        trackerContainer.style.top = `${currentY}px`;
        trackerContainer.style.transform = 'none';
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        if (trackerContainer) trackerContainer.style.cursor = '';
    });

    // Initialize cancel button
    const cancelBtn = trackerContainer.querySelector('.cancel-combat-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            document.body.classList.remove('combat-selection-active');
            document.querySelectorAll('.token').forEach(token => {
                token.classList.remove('selectable-for-combat', 'selected-for-combat');
                token.removeEventListener('click', handleTokenSelect);
                token.querySelector('.selection-highlight')?.remove();
            });
            
            // Hide the combat tracker
            trackerContainer.style.display = 'none';
        });
    }

    const confirmBtn = trackerContainer.querySelector('.confirm-combat-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            initializeCombat();
            document.querySelector('.combat-selection-message').style.display = 'none';
        });
    }

    // Add combat button to navigation if it doesn't exist
    if (!document.getElementById('initiateCombatButton')) {
        const navBar = document.querySelector('.navigation');
        if (navBar) {
            const combatButton = document.createElement('button');
            combatButton.id = 'initiateCombatButton';
            combatButton.className = 'nav-button';
            combatButton.title = 'Combat';
            combatButton.innerHTML = `
                <svg viewBox="0 0 24 24" class="nav-icon" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="hotkey">F</span>
            `;
            // Set initial visibility based on current GM state
            combatButton.style.display = window.isGM ? 'flex' : 'none';
            navBar.appendChild(combatButton);

            // Add click handler
            combatButton.addEventListener('click', (e) => {
                e.preventDefault();
                const tracker = document.getElementById('combat-tracker');
                if (tracker && !window.combatState.isInCombat) {
                    tracker.style.display = 'block';
                    if (typeof startCombatSelection === 'function') {
                        startCombatSelection();
                        const selectionMessage = document.querySelector('.combat-selection-message');
                        if (selectionMessage) {
                            selectionMessage.style.display = 'block';
                        }
                    }
                }
            });
        }
    }

    // Listen for GM mode changes
    document.addEventListener('gmModeChange', (e) => {
        const combatButton = document.getElementById('initiateCombatButton');
        if (combatButton) {
            combatButton.style.display = e.detail.isGM ? 'flex' : 'none';
        }
    });
}

function createCombatTracker() {
    ensureCombatInit();
}

function initializeCombatEventListeners() {
    const startBtn = document.querySelector('.start-combat-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startCombatSelection);
    }
}

function startCombatSelection() {
    document.body.classList.add('combat-selection-active');
    
    document.querySelectorAll('.token').forEach(token => {
        token.addEventListener('click', handleTokenSelect);
        token.classList.add('selectable-for-combat');
    });
    
    // Show the selection message and controls
    const selectionMessage = document.querySelector('.combat-selection-message');
    if (selectionMessage) {
        selectionMessage.style.display = 'block';
    }
}

function handleTokenSelect(e) {
    e.stopPropagation();
    
    const token = e.target.classList.contains('token') ? e.target : e.target.closest('.token');
    if (!token) return;
    
    if (token.classList.contains('selected-for-combat')) {
        token.classList.remove('selected-for-combat');
        token.querySelector('.selection-highlight')?.remove();
    } else {
        token.classList.add('selected-for-combat');
        if (!token.querySelector('.selection-highlight')) {
            const highlight = document.createElement('div');
            highlight.className = 'selection-highlight';
            token.appendChild(highlight);
        }
    }
}

// Event handler functions
function handleTokenContainerDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const dragging = document.querySelector('.token-wrapper.dragging');
    if (!dragging) return;

    // Don't allow dropping if this would affect the active token
    const tokenContainer = e.currentTarget;
    const afterElement = getDragAfterElement(tokenContainer, e.clientX);
    
    // Remove any existing previews
    document.querySelectorAll('.token-preview').forEach(el => el.remove());
    
    // Create preview element
    const preview = dragging.cloneNode(true);
    preview.classList.remove('dragging');
    preview.classList.add('token-preview');
    preview.style.opacity = '0.5';
    preview.style.pointerEvents = 'none';
    
    if (afterElement) {
        tokenContainer.insertBefore(preview, afterElement);
    } else {
        tokenContainer.appendChild(preview);
    }
}




function handleTokenContainerDrop(e) {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    const tokenContainer = e.currentTarget;
    const afterElement = getDragAfterElement(tokenContainer, e.clientX);
    
    // Remove previews
    document.querySelectorAll('.token-preview').forEach(el => el.remove());
    
    // Get all non-separator elements for index calculation
    const allTokens = [...tokenContainer.querySelectorAll('.token-wrapper:not(.round-separator)')];
    const newIndex = afterElement ? allTokens.indexOf(afterElement) : allTokens.length;

    // Find source and destination arrays
    let fromArray, draggedCombatant;
    let fromIndex = combatState.currentRoundCombatants.findIndex(c => c.id === draggedId);
    
    if (fromIndex !== -1) {
        fromArray = combatState.currentRoundCombatants;
    } else {
        fromIndex = combatState.nextRoundCombatants.findIndex(c => c.id === draggedId);
        if (fromIndex !== -1) {
            fromArray = combatState.nextRoundCombatants;
        }
    }

    if (!fromArray || fromIndex === -1) return;

    // Remove from original array
    [draggedCombatant] = fromArray.splice(fromIndex, 1);

    // Insert into appropriate array
    if (newIndex <= combatState.currentRoundCombatants.length) {
        // Moving to current round
        combatState.currentRoundCombatants.splice(newIndex, 0, draggedCombatant);
        
        // Adjust currentTurnIndex if insertion was before it
        if (newIndex <= combatState.currentTurnIndex) {
            combatState.currentTurnIndex++;
        }
    } else {
        // Moving to next round
        const nextRoundIndex = newIndex - combatState.currentRoundCombatants.length;
        combatState.nextRoundCombatants.splice(nextRoundIndex, 0, draggedCombatant);
    }

    // Clean up and update display
    document.querySelector('.token-wrapper.dragging')?.classList.remove('dragging');
    updateTurnDisplay();
}

function getDropPosition(elements, mouseX) {
    let closestElement = null;
    let closestOffset = Number.POSITIVE_INFINITY;

    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.left + rect.width / 2;
        const offset = mouseX - elementCenter;

        if (offset > 0 && offset < closestOffset) {
            closestOffset = offset;
            closestElement = element;
        }
    });

    return closestElement;
}

// Add helper function to get mouse position relative to container
function getRelativeMousePosition(e, container) {
    const rect = container.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startNewRound() {
    combatState.currentRoundCombatants = combatState.nextRoundCombatants;
    combatState.nextRoundCombatants = [];
    combatState.currentTurnIndex = 0;
    combatState.round++;
    
    if (combatState.currentRoundCombatants.length > 0) {
        startTurn(combatState.currentRoundCombatants[0]);
    }
    resetMovementForAllTokens();
}




function getBackgroundImage(token) {
    const style = window.getComputedStyle(token);
    const url = style.backgroundImage;
    return url.includes('url(') ? url : `url('${url}')`;
}

function calculateInitiative(token) {
    if (!token) {
        console.error('No token provided to calculateInitiative');
        return { roll: 0, total: 0, ap: 0, agiMod: 0 };
    }

    // Get agility modifier from characterState for player token, or token dataset for NPCs
    let agiMod;
    if (token.classList.contains('player-token')) {
        agiMod = Math.floor((characterState.totalStats.agi - 10) / 2);
    } else {
        agiMod = Math.floor((parseInt(token.dataset.agility || 10) - 10) / 2);
    }

    // Roll initiative
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + agiMod;

    // Calculate AP using combatState's method
    const ap = combatState.calculateAP(total);

    return { roll, total, ap, agiMod };
}




// Combat.js
function initializeCombat() {
    const selectedTokens = document.querySelectorAll('.token.selected-for-combat');
    if (selectedTokens.length === 0) {
        alert('Please select at least one token to begin combat.');
        return;
    }

    // Initialize combat state
    combatState.isInCombat = true;
    combatState.currentTurnIndex = 0;
    combatState.round = 1;
    combatState.totalCombatTime = 0;
    combatState.turnTimer = 0;
    combatState.turnTimes = {};
    combatState.nextRoundCombatants = [];
    combatState.currentRoundCombatants = [];

    // Remove existing timeline and controls if they exist
    document.querySelector('.turn-order-track')?.remove();
    document.querySelector('.battle-controls')?.remove();

    // Create timeline with initial position at mid-top
    const timelineHTML = `
        <div class="turn-order-track" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%);">
            <div class="total-timer">Total: 0:00</div>
            <div class="round-display">ROUND ${combatState.round}</div>
            <div class="token-container"></div>
        </div>
    `;

    // Create controls separate from timeline
    const controlsHTML = `
        <div class="battle-controls" style="position: fixed; top: 20px; right: 20px;">
            <button class="battle-btn end-turn-btn">END TURN</button>
            <button class="battle-btn add-token-btn">ADD TOKEN</button>
            <button class="battle-btn end-combat-btn">END COMBAT</button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', timelineHTML);
    document.body.insertAdjacentHTML('beforeend', controlsHTML);

    // Setup event listeners for controls
    const controls = document.querySelector('.battle-controls');
    controls.querySelector('.end-turn-btn').addEventListener('click', endTurn);
    controls.querySelector('.add-token-btn').addEventListener('click', addTokenToCombat);
    controls.querySelector('.end-combat-btn').addEventListener('click', endCombat);

    // Hide start button and selection message
    const startBtn = document.querySelector('.start-combat-btn');
    if (startBtn) startBtn.style.display = 'none';
    document.querySelector('.combat-selection-message')?.remove();

    // Create combatants without rolling initiative
    Array.from(selectedTokens).forEach((token, index) => {
        if (!token.id) token.id = generateUniqueId();
        
        const combatant = {
            id: token.id,
            element: token,
            name: token.dataset.name || 'Unknown',
            initiative: 0, // Initialize to 0; will be rolled in startTurn
            actionPoints: 0, // Initialize to 0
            currentHealth: parseInt(token.dataset.currentHealth) || 100,
            maxHealth: parseInt(token.dataset.maxHealth) || 100,
            selectionOrder: index,
            portraitUrl: token.style.backgroundImage,
            isPlayer: token.classList.contains('player-token')
        };

        combatState.currentRoundCombatants.push(combatant);
    });

    // Make both containers draggable
    const timeline = document.querySelector('.turn-order-track');
    makeElementDraggable(timeline);
    makeElementDraggable(controls);

    // Start timers and update display
    startCombatTimer();
    startTurnTimer();
    updateTurnDisplay();

    // Remove selection mode visuals
    document.body.classList.remove('combat-selection-active');
    document.querySelectorAll('.token').forEach(token => {
        token.classList.remove('selectable-for-combat', 'selected-for-combat');
        token.removeEventListener('click', handleTokenSelect);
        token.querySelector('.selection-highlight')?.remove();
    });

    // Start first turn without rolling initiative
    const firstCombatant = combatState.currentRoundCombatants[0];
    if (firstCombatant) {
        combatState.currentTurnIndex = 0;
        startTurn(firstCombatant); // This will roll initiative
    }
}







function createTokenWrapper(combatant, isActive) {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = `token-wrapper${isActive ? ' active' : ''}`;
    wrapperDiv.dataset.combatantId = combatant.id;
    
    // Only make non-active tokens draggable
    if (!isActive) {
        wrapperDiv.draggable = true;
        
        // Only add drag handlers to non-active tokens
        wrapperDiv.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            wrapperDiv.classList.add('dragging');
            e.dataTransfer.setData('text/plain', combatant.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        wrapperDiv.addEventListener('dragend', () => {
            wrapperDiv.classList.remove('dragging');
            document.querySelectorAll('.token-preview').forEach(el => el.remove());
        });
    }

    const tokenDiv = document.createElement('div');
    tokenDiv.className = 'timeline-token';
    tokenDiv.style.backgroundImage = combatant.portraitUrl;

    const tooltip = document.createElement('div');
    tooltip.className = 'name-tooltip';
    tooltip.textContent = combatant.name;
    tokenDiv.appendChild(tooltip);

    const timerDiv = document.createElement('div');
    timerDiv.className = 'token-timer';
    timerDiv.textContent = formatTime(combatState.turnTimes[combatant.id] || 0);

    wrapperDiv.appendChild(tokenDiv);
    wrapperDiv.appendChild(timerDiv);

    return wrapperDiv;
}





// Add this function to track total combat time
function startCombatTimer() {
    if (combatState.totalCombatInterval) {
        clearInterval(combatState.totalCombatInterval);
    }

    combatState.totalCombatInterval = setInterval(() => {
        combatState.totalCombatTime++;
        updateTimerDisplay();
    }, 1000);
}



let timelineOffset = { x: 0, y: 0 };

function updateTurnDisplay() {
    const turnTrack = document.querySelector('.turn-order-track');
    if (!turnTrack) return;

    let tokenContainer = turnTrack.querySelector('.token-container');
    if (!tokenContainer) {
        tokenContainer = document.createElement('div');
        tokenContainer.className = 'token-container';
        turnTrack.appendChild(tokenContainer);
    }

    // Clear existing tokens
    tokenContainer.innerHTML = '';

    // Build display list with round separators
    const displayList = [];

    // Add current round separator and tokens
    if (combatState.currentRoundCombatants.length > 0) {
        const roundSeparator1 = document.createElement('div');
        roundSeparator1.className = 'round-separator';
        roundSeparator1.dataset.round = 'ROUND ' + combatState.round;
        displayList.push(roundSeparator1);

        combatState.currentRoundCombatants.forEach((combatant, index) => {
            const isActive = index === combatState.currentTurnIndex;
            const wrapperDiv = createTokenWrapper(combatant, isActive);
            displayList.push(wrapperDiv);
        });
    }

    // Add next round separator and tokens
    if (combatState.nextRoundCombatants.length > 0) {
        const roundSeparator2 = document.createElement('div');
        roundSeparator2.className = 'round-separator';
        roundSeparator2.dataset.round = 'ROUND ' + (combatState.round + 1);
        displayList.push(roundSeparator2);

        combatState.nextRoundCombatants.forEach((combatant) => {
            const wrapperDiv = createTokenWrapper(combatant, false);
            displayList.push(wrapperDiv);
        });
    }

    // Append all elements
    displayList.forEach(element => tokenContainer.appendChild(element));

    // Update round display
    const roundDisplay = document.querySelector('.round-display');
    if (roundDisplay) {
        roundDisplay.textContent = 'ROUND ' + combatState.round;
    }

    // Add drag-drop handlers
    tokenContainer.addEventListener('dragover', handleTokenContainerDragOver);
    tokenContainer.addEventListener('drop', handleTokenContainerDrop);
}














// Add draggable functionality for both containers
function makeElementDraggable(element) {
    if (!element) return;

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    // Clear right positioning and transform
    element.style.right = 'auto';
    element.style.transform = 'none';
    element.style.cursor = 'grab';

    function handleDragStart(e) {
        if (e.target.closest('.battle-btn, .token-wrapper, .timeline-token')) {
            return;
        }

        isDragging = true;
        element.style.cursor = 'grabbing';
        
        const rect = element.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;

        e.preventDefault();
    }

    function handleDrag(e) {
        if (!isDragging) return;

        e.preventDefault();

        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        // Keep element within viewport bounds
        const rect = element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        currentX = Math.min(Math.max(0, currentX), maxX);
        currentY = Math.min(Math.max(0, currentY), maxY);

        element.style.left = `${currentX}px`;
        element.style.top = `${currentY}px`;
    }

    function handleDragEnd() {
        isDragging = false;
        element.style.cursor = 'grab';
    }

    element.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
}

function addTokenToCombat() {
    // Ensure combatState.combatants is defined
    if (!combatState.combatants) {
        combatState.combatants = [];
    }

    const existingTokens = new Set(
        [...combatState.combatants].map(c => c.element)
    );

    document.querySelectorAll('.token').forEach(token => {
        token.classList.remove('selectable-for-combat', 'selected-for-combat');
        token.removeEventListener('click', handleTokenSelect);

        // Only make selectable if not already in combat
        if (!existingTokens.has(token)) {
            token.addEventListener('click', handleTokenSelect);
            token.classList.add('selectable-for-combat');
        }
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'battle-btn confirm-add-btn';
    confirmBtn.textContent = 'Confirm New Tokens';
    confirmBtn.onclick = () => {
        const selectedTokens = document.querySelectorAll('.token.selected-for-combat');

        const allCombatants = combatState.combatants || [];
        const newCombatants = Array.from(selectedTokens)
            .filter(token => !allCombatants.some(c => c.element === token))
            .map((token, selectionOrder) => {
                // Ensure token has an ID
                if (!token.id) {
                    token.id = generateUniqueId();
                }

                // Calculate initiative and AP
                const initiativeResult = calculateInitiative(token);
                const ap = combatState.calculateAP(initiativeResult.total);

                // Store AP and initiative on token
                token.dataset.actionPoints = ap;
                token.dataset.initiative = initiativeResult.total;

                // Get the token's background image
                const computedStyle = window.getComputedStyle(token);
                const backgroundImage = computedStyle.backgroundImage;

                return {
                    id: token.id,
                    element: token,
                    name: token.dataset.name || 'Unknown',
                    initiative: initiativeResult.total,
                    actionPoints: ap,
                    currentHealth: parseInt(token.dataset.currentHealth) || 100,
                    maxHealth: parseInt(token.dataset.maxHealth) || 100,
                    selectionOrder: selectionOrder, // For tie-breakers
                    portraitUrl: backgroundImage,
                    // Add other necessary properties here
                };
            });

        if (newCombatants.length > 0) {
            // Add new combatants to combatState.combatants
            combatState.combatants.push(...newCombatants);
            // Add new combatants to currentRoundCombatants
            combatState.currentRoundCombatants.push(...newCombatants);
            // Re-sort currentRoundCombatants
            combatState.currentRoundCombatants.sort((a, b) => b.initiative - a.initiative || a.selectionOrder - b.selectionOrder);

            newCombatants.forEach(combatant => {
                combatState.turnTimes[combatant.id] = 0;
            });
        }

        // Cleanup
        document.querySelectorAll('.token').forEach(token => {
            token.classList.remove('selectable-for-combat', 'selected-for-combat');
            token.removeEventListener('click', handleTokenSelect);
            token.querySelector('.selection-highlight')?.remove();
        });
        confirmBtn.remove();
        updateTurnDisplay();
    };

    document.querySelector('.battle-controls').appendChild(confirmBtn);
}


// Example: Initializing Combatants (Assuming this happens elsewhere in your code)
function initializeCombatants() {
    combatState.combatants = selectedTokens.map((token, index) => ({
        id: token.id,
        element: token,
        name: token.dataset.name || `Player ${index + 1}`,
        initiative: parseInt(token.dataset.initiative) || 10,
        actionPoints: parseInt(token.dataset.actionPoints) || 3,
        currentHealth: parseInt(token.dataset.currentHealth) || 100,
        maxHealth: parseInt(token.dataset.maxHealth) || 100,
        selectionOrder: index,
        portraitUrl: getBackgroundImage(token),
        isPlayer: token.dataset.isPlayer === 'true', // Add this line
        // Add other necessary properties here
    }));
}



function endCombat() {
    // Clear timers
    if (combatState.timerInterval) {
        clearInterval(combatState.timerInterval);
        combatState.timerInterval = null;
    }
    if (combatState.totalCombatInterval) {
        clearInterval(combatState.totalCombatInterval);
        combatState.totalCombatInterval = null;
    }

    // Reset combat state
    combatState.isInCombat = false;
    combatState.combatants = [];
    combatState.currentTurnIndex = 0;
    combatState.round = 1;
    combatState.turnTimer = 0;
    combatState.totalCombatTime = 0;
    combatState.turnTimes = {};

    // Reset player's Action Points (AP) to 0
    if (characterState.combat) {
        characterState.combat.actionPoints = 0;
    } else {
        characterState.combat = { actionPoints: 0 };
    }

    // Find and reset the player's token
    const playerToken = document.querySelector('.token.player-token');
    if (playerToken) {
        playerToken.dataset.actionPoints = 0;
    }

    // Update the HUD to reflect AP reset
    updateAPBar(0);

    // Remove UI elements
    document.querySelector('.turn-order-track')?.remove();
    document.querySelector('.battle-controls')?.remove();
    document.querySelector('.combat-selection-message')?.remove();

    // Reset all tokens
    document.querySelectorAll('.token').forEach(token => {
        token.classList.remove('active', 'selected-for-combat', 'selectable-for-combat');
        token.querySelector('.selection-highlight')?.remove();
        token.removeEventListener('click', handleTokenSelect);
    });

    // Clean up any remaining combat-related elements
    document.querySelectorAll('.timeline-context-menu').forEach(el => el.remove());

    // Update HUD
    updateHUD(playerToken);

    // Reset combat tracker and recreate initial state
    const trackerContainer = document.getElementById('combat-tracker');
    if (trackerContainer) {
        trackerContainer.innerHTML = '';
        ensureCombatInit(); // This will recreate the start combat button properly
    }
}



function applyRegeneration(combatant) {
    if (!combatant || !combatant.element) return;

    const token = combatant.element;
    const isPlayerToken = token.classList.contains('player-token');
    
    let healthRegen, manaRegen, currentHealth, maxHealth, currentMana, maxMana;
    
    // Get regeneration and current/max values based on token type
    if (isPlayerToken) {
        healthRegen = characterState.derivedStats.healthRegen || 0;
        manaRegen = characterState.derivedStats.manaRegen || 0;
        currentHealth = characterState.derivedStats.currentHealth;
        maxHealth = characterState.derivedStats.maxHealth;
        currentMana = characterState.derivedStats.currentMana;
        maxMana = characterState.derivedStats.maxMana;
    } else {
        const stats = {
            con: parseInt(token.dataset.constitution) || 10,
            str: parseInt(token.dataset.strength) || 10,
            agi: parseInt(token.dataset.agility) || 10,
            int: parseInt(token.dataset.intelligence) || 10,
            spir: parseInt(token.dataset.spirit) || 10,
            cha: parseInt(token.dataset.charisma) || 10
        };
        const derivedStats = calculateDerivedStats(stats);
        healthRegen = derivedStats.healthRegen || 0;
        manaRegen = derivedStats.manaRegen || 0;
        currentHealth = parseInt(token.dataset.currentHealth);
        maxHealth = parseInt(token.dataset.maxHealth);
        currentMana = parseInt(token.dataset.currentMana);
        maxMana = parseInt(token.dataset.maxMana);
    }

    // Apply health regeneration/drain
    if (healthRegen !== 0) {
        const newHealth = Math.min(Math.max(currentHealth + healthRegen, 0), maxHealth);
        const healthChange = newHealth - currentHealth;
        
        if (healthChange !== 0) {
            // Update values
            if (isPlayerToken) {
                characterState.derivedStats.currentHealth = newHealth;
                updateHealthBar();
            } 
            token.dataset.currentHealth = newHealth;
            
            // Queue floating combat text with appropriate type
            const textType = healthChange > 0 ? 'healing' : 'damage';
            floatingTextQueue.add(token, healthChange, textType);
            addCombatMessage(`${token.dataset.name} ${healthChange > 0 ? 'regenerates' : 'loses'} ${Math.abs(healthChange)} health`);
            
            // Update health bar on token
            const healthBar = token.querySelector('.token-health-fill');
            if (healthBar) {
                const healthPercent = (newHealth / maxHealth) * 100;
                healthBar.style.width = `${healthPercent}%`;
            }
        }
    }

    // Apply mana regeneration/drain
    if (manaRegen !== 0) {
        const newMana = Math.min(Math.max(currentMana + manaRegen, 0), maxMana);
        const manaChange = newMana - currentMana;
        
        if (manaChange !== 0) {
            // Update values
            if (isPlayerToken) {
                characterState.derivedStats.currentMana = newMana;
                updateManaBar();
            }
            token.dataset.currentMana = newMana;
            
            // Queue floating combat text with appropriate type
            const textType = manaChange > 0 ? 'mana' : 'manadrain';
            floatingTextQueue.add(token, manaChange, textType);
            addCombatMessage(`${token.dataset.name} ${manaChange > 0 ? 'regenerates' : 'loses'} ${Math.abs(manaChange)} mana`);
            
            // Update mana bar on token
            const manaBar = token.querySelector('.token-mana-fill');
            if (manaBar) {
                const manaPercent = (newMana / maxMana) * 100;
                manaBar.style.width = `${manaPercent}%`;
            }
        }
    }

    // Update all visuals
    updateTokenVisuals(token);
    if (isPlayerToken) updateHUD(token);
    if (characterState.currentTarget === token) updateTargetInfo(token);
}

function startTurn(combatant) {
    if (!combatant || !combatant.element) {
        console.error('Invalid combatant provided to startTurn');
        return;
    }

    // Apply regeneration effects at start of turn
    applyRegeneration(combatant);

    // Calculate new initiative
    const initiativeResult = calculateInitiative(combatant.element);
    
    // Update combatant with new values
    combatant.initiative = initiativeResult.total;
    
    // Add new AP to existing if not stunned
    const isStunned = combatant.element.classList.contains('stunned');
    if (!isStunned) {
        const existingAP = parseInt(combatant.element.dataset.actionPoints) || 0;
        combatant.actionPoints = existingAP + initiativeResult.ap;
    } else {
        combatant.actionPoints = 0; // No AP while stunned
    }
    
    // Update element dataset
    combatant.element.dataset.actionPoints = combatant.actionPoints;
    combatant.element.dataset.initiative = initiativeResult.total;

    // Reset movement state for this token if not stunned
    if (!isStunned) {
        combatant.element.movement = {
            movementUsed: 0,
            paidMovement: 0,
            apSpent: 0
        };

        if (combatant.element.classList.contains('player-token')) {
            characterState.movement = combatant.element.movement;
        }
    }

    // Update HUD for player token
    if (combatant.element.classList.contains('player-token')) {
        if (!characterState.combat) characterState.combat = {};
        characterState.combat.actionPoints = combatant.actionPoints;
        updateAPBar(combatant.actionPoints);
    }

    // Add initiative roll message
    addCombatMessage(`${combatant.name} rolls initiative: [${initiativeResult.roll}] + ${initiativeResult.agiMod} (AGI) = ${initiativeResult.total} (${initiativeResult.ap} AP)`);
    if (isStunned) {
        addCombatMessage(`${combatant.name} is stunned and cannot act!`);
    }

    // Reset and start turn timer
    combatState.turnTimer = 0;
    startTurnTimer();

    // Update display
    updateTurnDisplay();
    updateTokenVisuals(combatant.element);
}





function startTurnTimer() {
    if (combatState.timerInterval) {
        clearInterval(combatState.timerInterval);
    }

    combatState.turnTimer = 0;
    updateTimerDisplay();

    combatState.timerInterval = setInterval(() => {
        combatState.turnTimer++;
        updateTimerDisplay();
    }, 1000);
}


function updateHUD(entity) {
    console.log('updateHUD called with entity:', entity); // Debug log
    
    // Early return if no entity
    if (!entity) {
        console.error('No entity provided to updateHUD');
        return;
    }

    // Determine if the entity is a token or a combatant
    let combatant;
    if (entity.dataset) { // Assuming tokens have dataset properties
        combatant = combatState.combatants.find(c => c.id === entity.id);
        if (!combatant) {
            // If no combatant found, create a temporary one from token data
            combatant = {
                actionPoints: parseInt(entity.dataset.actionPoints) || 0,
                currentHealth: parseInt(entity.dataset.currentHealth) || 0,
                maxHealth: parseInt(entity.dataset.maxHealth) || 100,
                currentMana: parseInt(entity.dataset.currentMana) || 0,
                maxMana: parseInt(entity.dataset.maxMana) || 100
            };
        }
    } else { // Entity is already a combatant object
        combatant = entity;
    }

    // Update AP Display
    const ap = parseInt(combatant.actionPoints) || 0;
    console.log('Updating AP to:', ap); // Debug log
    
    const apBar = document.getElementById('apFill');
    const apValue = document.getElementById('apValue');
    
    if (apBar && apValue) {
        const maxAP = 10;
        const apPercent = (ap / maxAP) * 100;
        
        // Update AP bar width
        apBar.style.width = `${apPercent}%`;
        
        // Update AP text value
        apValue.textContent = ap;

        // Add visual feedback for the update
        const apBarContainer = document.getElementById('apBar');
        if (apBarContainer) {
            apBarContainer.classList.remove('ap-update');
            // Force reflow
            void apBarContainer.offsetWidth;
            apBarContainer.classList.add('ap-update');
            setTimeout(() => apBarContainer.classList.remove('ap-update'), 300);
        }
    } else {
        console.warn('AP bar elements not found, trying to initialize...');
        initializeAPBar();
        // Try updating again after initialization
        const newApBar = document.getElementById('apFill');
        const newApValue = document.getElementById('apValue');
        if (newApBar && newApValue) {
            const maxAP = 10;
            const apPercent = (ap / maxAP) * 100;
            newApBar.style.width = `${apPercent}%`;
            newApValue.textContent = ap;
        }
    }

    // Update Health Display
    if (combatant.currentHealth !== undefined && combatant.maxHealth !== undefined) {
        const healthElement = document.getElementById('healthValue');
        const healthBar = document.getElementById('healthBar');
        
        if (healthElement) {
            healthElement.textContent = `${combatant.currentHealth}/${combatant.maxHealth}`;
        }
        
        if (healthBar) {
            const healthPercent = (combatant.currentHealth / combatant.maxHealth) * 100;
            healthBar.style.width = `${healthPercent}%`;
            
            // Update health bar color based on percentage
            if (healthPercent <= 25) {
                healthBar.style.backgroundColor = '#ff4444';
            } else if (healthPercent <= 50) {
                healthBar.style.backgroundColor = '#ffaa00';
            } else {
                healthBar.style.backgroundColor = '#44ff44';
            }
        }
    }

    // Update Mana Display
    if (combatant.currentMana !== undefined && combatant.maxMana !== undefined) {
        const manaElement = document.getElementById('manaValue');
        const manaBar = document.getElementById('manaBar');
        
        if (manaElement) {
            manaElement.textContent = `${combatant.currentMana}/${combatant.maxMana}`;
        }
        
        if (manaBar) {
            const manaPercent = (combatant.currentMana / combatant.maxMana) * 100;
            manaBar.style.width = `${manaPercent}%`;
        }
    }

    // Update character state if this is a player entity
    if (combatant.isPlayer) {
        if (!characterState.combat) {
            characterState.combat = {};
        }
        characterState.combat.actionPoints = ap;
    }

    // If this entity is the current target, update target display
    if (characterState.currentTarget && 
        ((entity.dataset && entity.dataset.id === characterState.currentTarget.dataset.id) ||
         (entity.id && entity.id === characterState.currentTarget.dataset.id))) {
        updateTargetInfo(entity);
    }
}



// Enhance the timer display
function updateTimerDisplay() {
    const totalTimer = document.querySelector('.total-timer');
    const tokenTimers = document.querySelectorAll('.token-timer');

    if (totalTimer) {
        totalTimer.textContent = `Total: ${formatTime(combatState.totalCombatTime)}`;
    }

    // Update all token timers
    tokenTimers.forEach(timer => {
        const wrapper = timer.closest('.token-wrapper');
        if (wrapper) {
            const combatantId = wrapper.dataset.combatantId;
            let timeSpent = combatState.turnTimes[combatantId] || 0;

            // If this is the current combatant, add the ongoing turnTimer
            const currentCombatant = combatState.currentRoundCombatants[combatState.currentTurnIndex];
            if (currentCombatant && currentCombatant.id === combatantId) {
                timeSpent += combatState.turnTimer;
            }

            timer.textContent = formatTime(timeSpent);
        }
    });
}



function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}




function endTurn() {
    const currentCombatant = combatState.currentRoundCombatants[combatState.currentTurnIndex];
    if (!currentCombatant) return;

    // Process debuffs at end of turn
    if (currentCombatant.element.activeDebuffs && currentCombatant.element.activeDebuffs.length > 0) {
        currentCombatant.element.activeDebuffs = currentCombatant.element.activeDebuffs.filter(debuff => {
            // Apply effects before decrementing duration
            switch(debuff.type) {
                case 'dot':
                    const dotDamageResult = rollDice(debuff.damage);
                    const totalDotDamage = dotDamageResult.total;
                    applyDamage(currentCombatant.element, totalDotDamage);
                    addCombatMessage(`${currentCombatant.name} takes ${totalDotDamage} ${debuff.damageType} damage from ${debuff.name}`);
                    break;
            }

            // Decrement duration AFTER applying effect
            debuff.duration -= 1;

            if (debuff.duration > 0) {
                return true; // Keep debuff
            } else {
                // Remove expired debuffs and their effects
                switch(debuff.type) {
                    case 'debuff':
                        currentCombatant.element.dataset[debuff.stat] = 
                            parseInt(currentCombatant.element.dataset[debuff.stat] || 0) - debuff.amount;
                        addCombatMessage(`${debuff.name} on ${currentCombatant.name} has expired.`);
                        break;
                    case 'stun':
                        currentCombatant.element.classList.remove('stunned');
                        addCombatMessage(`${currentCombatant.name} is no longer stunned.`);
                        break;
                    case 'dot':
                        currentCombatant.element.classList.remove('poisoned');
                        addCombatMessage(`${debuff.name} on ${currentCombatant.name} has worn off.`);
                        break;
                }
                return false; // Remove debuff
            }
        });
    }

    // Reset movement state for current combatant
    if (currentCombatant.element) {
        currentCombatant.element.movement = {
            movementUsed: 0,
            paidMovement: 0
        };
    }

    // Reset character state movement if it's the player's turn
    if (currentCombatant.element.classList.contains('player-token')) {
        characterState.movement = {
            movementUsed: 0,
            paidMovement: 0,
            apSpent: 0
        };
    }

    // Store current turn time
    combatState.turnTimes[currentCombatant.id] = 
        (combatState.turnTimes[currentCombatant.id] || 0) + combatState.turnTimer;

    // Clear timer
    if (combatState.timerInterval) {
        clearInterval(combatState.timerInterval);
        combatState.timerInterval = null;
    }

    // Cache current stats for visual updates
    const previousHealth = parseInt(currentCombatant.element.dataset.currentHealth);
    const previousMana = parseInt(currentCombatant.element.dataset.currentMana);

    // Move current combatant to next round
    combatState.currentRoundCombatants.splice(combatState.currentTurnIndex, 1);
    combatState.nextRoundCombatants.push(currentCombatant);

    // Update visual state
    updateTokenVisuals(currentCombatant.element);
    
    // Show health/mana changes if any occurred during end of turn effects
    const currentHealth = parseInt(currentCombatant.element.dataset.currentHealth);
    const currentMana = parseInt(currentCombatant.element.dataset.currentMana);
    
    if (currentHealth !== previousHealth) {
        showFloatingCombatText(currentCombatant.element, currentHealth - previousHealth, 
            currentHealth < previousHealth ? 'damage' : 'healing');
    }
    
    if (currentMana !== previousMana) {
        showFloatingCombatText(currentCombatant.element, currentMana - previousMana, 
            currentMana < previousMana ? 'manadrain' : 'mana');
    }

    // Handle next turn
    if (combatState.currentRoundCombatants.length > 0) {
        if (combatState.currentTurnIndex >= combatState.currentRoundCombatants.length) {
            combatState.currentTurnIndex = 0;
        }
        startTurn(combatState.currentRoundCombatants[combatState.currentTurnIndex]);
    } else {
        startNewRound();
    }

    // Update combat UI
    updateTurnDisplay();

    // If the current token is targeted, update target display
    if (characterState.currentTarget === currentCombatant.element) {
        updateTargetInfo(currentCombatant.element);
    }

    // Cleanup any movement indicators
    const movementArrow = document.getElementById('movement-arrow');
    const distanceDisplay = document.getElementById('distance-display');
    if (movementArrow) movementArrow.remove();
    if (distanceDisplay) distanceDisplay.remove();
}

// Document ready handler for targeting system
document.addEventListener('DOMContentLoaded', () => {

    // Handle clicks during targeting
    document.addEventListener('click', (e) => {
        if (!window.combatState.targeting.isTargeting) return;
        
        const token = e.target.closest('.token');
        if (!token) {
            // Clicked outside a token during targeting
            return;
        }

        if (window.combatState.targeting.allowedTargets.has(token)) {
            handleTargetSelection(token);
        } else {
            addCombatMessage("Invalid target!");
        }
    });
});







function handleTimelineTokenDragStart(e) {
    e.stopPropagation(); // Prevent timeline drag
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

function handleTimelineTokenDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const tokenContainer = document.querySelector('.token-container');
    const afterElement = getDragAfterElement(tokenContainer, e.clientX);
    const draggable = document.querySelector('.dragging');
    
    if (afterElement) {
        tokenContainer.insertBefore(draggable, afterElement);
    } else {
        tokenContainer.appendChild(draggable);
    }
}

function handleTimelineTokenDrop(e) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
    
    // Update combatants array order
    const [removed] = combatState.combatants.splice(fromIndex, 1);
    combatState.combatants.splice(toIndex, 0, removed);
    
    document.querySelector('.dragging')?.classList.remove('dragging');
    updateTurnDisplay();
}

function handleDragStart(e) {
    e.dataTransfer.setData('combatantId', e.target.dataset.combatantId);
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const tokenContainer = document.querySelector('.token-container');
    const afterElement = getDragAfterElement(tokenContainer, e.clientX);
    
    if (afterElement) {
        tokenContainer.insertBefore(draggingElement, afterElement);
    } else {
        tokenContainer.appendChild(draggingElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('combatantId');
    const tokens = [...document.querySelectorAll('.timeline-token')];
    
    // Update combatants array to match new order
    combatState.combatants = tokens.map(token => 
        combatState.combatants.find(c => c.id === token.dataset.combatantId)
    );
    
    document.querySelector('.dragging')?.classList.remove('dragging');
    updateTurnDisplay();
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.token-wrapper:not(.dragging):not(.round-separator)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - (box.left + box.width / 2);
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}




function makeButtonsDraggable(element) {
    if (!element) return;

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    function handleDragStart(e) {
        // Only allow dragging from the panel background, not the buttons
        if (e.target.classList.contains('battle-btn')) {
            return;
        }

        const rect = element.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;

        isDragging = true;
        element.style.cursor = 'grabbing';
    }

    function handleDrag(e) {
        if (!isDragging) return;

        e.preventDefault();

        const x = e.clientX - initialX;
        const y = e.clientY - initialY;

        // Keep element within viewport bounds
        const rect = element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        currentX = Math.min(Math.max(0, x), maxX);
        currentY = Math.min(Math.max(0, y), maxY);

        element.style.left = `${currentX}px`;
        element.style.top = `${currentY}px`;
    }

    function handleDragEnd() {
        isDragging = false;
        element.style.cursor = 'grab';
    }

    element.style.position = 'fixed';
    element.style.cursor = 'grab';
    
    // Mouse events
    element.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
}



function removeFromCombat(id) {
    combatState.combatants = combatState.combatants.filter(c => c.id !== id);
    updateTurnDisplay();
}

function cleanupCombat() {
    // Reset all token combat states
    document.querySelectorAll('.token').forEach(token => {
        // Reset AP
        token.dataset.actionPoints = "0";
        
        // Remove combat-specific classes
        token.classList.remove('targeted', 'active');
        
        // Update bar display
        const healthFill = token.querySelector('.token-health-fill');
        const manaFill = token.querySelector('.token-mana-fill');
        const apFill = token.querySelector('.token-ap-fill');
        
        if (healthFill) {
            const healthPercent = (parseInt(token.dataset.currentHealth) / parseInt(token.dataset.maxHealth)) * 100;
            healthFill.style.width = `${healthPercent}%`;
        }
        
        if (manaFill) {
            const manaPercent = (parseInt(token.dataset.currentMana) / parseInt(token.dataset.maxMana)) * 100;
            manaFill.style.width = `${manaPercent}%`;
        }
        
        if (apFill) {
            apFill.style.width = '0%';
        }

        // Ensure tooltips are visible on hover
        token.addEventListener('mouseenter', () => {
            const tooltip = token.querySelector('.token-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
            }
        });

        token.addEventListener('mouseleave', () => {
            const tooltip = token.querySelector('.token-tooltip');
            if (tooltip && !token.classList.contains('targeted')) {
                tooltip.style.opacity = '0';
            }
        });

        // Update tooltip content
        const tooltip = token.querySelector('.token-tooltip');
        if (tooltip) {
            const statsDiv = tooltip.querySelector('.tooltip-stats');
            if (statsDiv) {
                statsDiv.innerHTML = `
                    HP: ${token.dataset.currentHealth}/${token.dataset.maxHealth}
                    ${token.dataset.maxMana ? `<br>MP: ${token.dataset.currentMana}/${token.dataset.maxMana}` : ''}
                    ${!token.classList.contains('player-token') ? `<br>AP: 0/10` : ''}
                `;
            }
        }
        setTimeout(() => {
            reinitializeCombatSystem();
        }, 100);
    });

    // Reset player combat state
    if (characterState.combat) {
        characterState.combat.actionPoints = 0;
        updateAPBar(0);
    }

    // Clear any floating combat text
    document.querySelectorAll('.floating-combat-text').forEach(el => el.remove());

    // Clear targeting
    const currentTarget = characterState.currentTarget;
    if (currentTarget) {
        currentTarget.classList.remove('targeted');
        characterState.currentTarget = null;
        
        const targetDisplay = document.getElementById('targetDisplay');
        if (targetDisplay) {
            targetDisplay.style.display = 'none';
        }
    }
}

function makeTimelineDraggable(element) {
    let isDragging = false;
    let currentTransform = { x: 0, y: 0 };
    let startPos = { x: 0, y: 0 };

    // Only allow dragging from the edges
    element.addEventListener('mousedown', (e) => {
        const rect = element.getBoundingClientRect();
        const isEdge = 
            e.clientX - rect.left < 20 || // Left edge
            rect.right - e.clientX < 20 || // Right edge
            e.clientY - rect.top < 20 || // Top edge
            rect.bottom - e.clientY < 20;  // Bottom edge

        if (isEdge && !e.target.closest('.timeline-token, .battle-btn')) {
            isDragging = true;
            startPos = {
                x: e.clientX - currentTransform.x,
                y: e.clientY - currentTransform.y
            };
            element.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        currentTransform = {
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        };

        element.style.transform = `translate(${currentTransform.x}px, ${currentTransform.y}px)`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        element.style.cursor = '';
    });
}

if (!characterState.movement) {
    characterState.movement = {
        movementUsed: 0,
        paidMovement: 0,
        apSpent: 0
    };
}




// Add helper function to ensure combat tracker is visible
function ensureCombatTrackerVisible() {
    let tracker = document.getElementById('combat-tracker');
    if (!tracker || !tracker.querySelector('.start-combat-btn')) {
        createCombatTracker();
    }
}




function resetCombatTracker() {
    const trackerContainer = document.getElementById('combat-tracker');
    if (trackerContainer) {
        ensureCombatInit(); // Recreate the initial state
    }
}



const synchronizePlayerToken = (token) => {
    if (!token || !token.classList.contains('player-token')) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
                // Update token health display
                const healthFill = token.querySelector('.token-health-fill');
                if (healthFill) {
                    const currentHealth = characterState.derivedStats.currentHealth;
                    const maxHealth = characterState.derivedStats.maxHealth;
                    const healthPercent = (currentHealth / maxHealth) * 100;
                    healthFill.style.width = `${healthPercent}%`;
                }

                // Update token mana display
                const manaFill = token.querySelector('.token-mana-fill');
                if (manaFill) {
                    const currentMana = characterState.derivedStats.currentMana;
                    const maxMana = characterState.derivedStats.maxMana;
                    const manaPercent = (currentMana / maxMana) * 100;
                    manaFill.style.width = `${manaPercent}%`;
                }

                // Update tooltip if it exists
                const tooltip = token.querySelector('.token-tooltip');
                if (tooltip) {
                    const statsDiv = tooltip.querySelector('.tooltip-stats');
                    if (statsDiv) {
                        statsDiv.innerHTML = `
                            HP: ${currentHealth}/${maxHealth}
                            <br>MP: ${currentMana}/${maxMana}
                        `;
                    }
                }
            }
        });
    });

    observer.observe(token, {
        attributes: true,
        attributeFilter: ['data-current-health', 'data-current-mana', 'data-action-points']
    });
};
function reinitializeCombatSystem() {
    console.log('Reinitializing combat system...');
    initializeCombatSystem();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting combat system initialization');
    initializeCombatSystem();
});