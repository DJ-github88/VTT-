// combatState.js


window.combatState = window.combatState || {
   
    isInCombat: false,
    currentRound: 1,
    actionPoints: 0,
    initiativeRoll: 0,
    currentPhase: null,
    
    // Turn tracking
    hasActed: false,
    availableReactions: true,
    combatants: [],
    currentTurnIndex: 0,
    round: 1,
    turnTimer: 0,
    timerInterval: null,
    timelinePosition: { x: 0, y: 0 },
    totalCombatTime: 0,
    turnTimes: {},
    totalCombatInterval: null,

    // AP calculation from initiative
    spendAP(combatant, cost) {
        if (!combatant || !combatant.element) return false;
        
        const currentAP = parseInt(combatant.element.dataset.actionPoints) || 0;
        if (currentAP < cost) {
            addCombatMessage(`Not enough AP! (${currentAP}/${cost})`);
            return false;
        }

        // Update combatant state
        combatant.actionPoints = currentAP - cost;
        
        // Update token data
        combatant.element.dataset.actionPoints = combatant.actionPoints;
        
        // Show floating text
        showFloatingCombatText(combatant.element, -cost, 'ap');
        
        // Update visuals
        updateTokenVisuals(combatant.element);
        
        // If player, update HUD
        if (combatant.element.classList.contains('player-token')) {
            updateAPBar(combatant.actionPoints);
        }

        return true;
    },

    calculateAP(initiativeTotal) {
        if (initiativeTotal <= 1) return 0;
        if (initiativeTotal <= 7) return 1;
        if (initiativeTotal <= 13) return 2;
        if (initiativeTotal <= 19) return 3;
        if (initiativeTotal <= 24) return 4;
        return 5; // 25+
    },

    // Combat initialization
    startCombat(isAmbushed = false) {
        if (this.isInCombat) return;
        
        this.isInCombat = true;
        this.currentRound = 1;
        
        const combatTracker = document.getElementById('combat-tracker');
        if (combatTracker) {
            // Roll initiative for selected tokens
            const selectedTokens = document.querySelectorAll('.token.selected-for-combat');
            
            // Group initiative roll
            const playerInit = this.rollInitiative(isAmbushed);
            const opponentInit = Math.floor(Math.random() * 20) + 1;

            selectedTokens.forEach(token => {
                const initiativeResult = this.rollInitiativeForToken(token);
                this.addTokenToCombat(token, initiativeResult);
            });

            // Determine who goes first
            if (playerInit.total >= opponentInit || !isAmbushed) {
                this.currentPhase = 'player';
                addCombatMessage("Players act first!", 'initiative');
            } else {
                this.currentPhase = 'opponent';
                addCombatMessage("Opponents act first!", 'initiative');
            }
        }

        // Start combat timers
        this.startCombatTimer();
        this.startTurnTimer();
    },

    rollInitiativeForToken(token) {
        const agiMod = Math.floor((characterState.totalStats.agi - 10) / 2);
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + agiMod;
        const ap = this.calculateAP(total);
    
        // Store AP and initiative on the token
        token.dataset.actionPoints = ap;
        token.dataset.initiative = total;
    
        // Add detailed roll message to combat chat
        addCombatMessage(`${token.dataset.name} rolls for AP: [${roll}] + ${agiMod} (AGI) = ${total} → ${ap} AP`, 'initiative');
    
        // Update HUD if this is the player's token
        if (token.classList.contains('player-token')) {
            updateAPBar(ap);
        }
    
        return { roll, total, ap };
    },

    addTokenToCombat(token, initiativeResult) {
        const timeline = document.querySelector('.turn-order-track');
        if (!timeline) return;

        const tokenWrapper = document.createElement('div');
        tokenWrapper.className = 'token-wrapper';
        tokenWrapper.dataset.initiative = initiativeResult.total;
        tokenWrapper.dataset.actionPoints = initiativeResult.ap;
        tokenWrapper.innerHTML = `
            <div class="timeline-token" style="background-image: url('${token.style.backgroundImage}')">
                <div class="token-stats">
                    <span class="token-ap">AP: ${initiativeResult.ap}</span>
                </div>
            </div>
        `;

        // Initialize turn time tracking
        this.turnTimes[token.dataset.name] = 0;

        this.insertTokenInOrder(timeline, tokenWrapper);
    },

    insertTokenInOrder(timeline, tokenWrapper) {
        const initiative = parseInt(tokenWrapper.dataset.initiative);
        const tokens = Array.from(timeline.children);
        const insertIndex = tokens.findIndex(t => parseInt(t.dataset.initiative) < initiative);
        
        if (insertIndex === -1) {
            timeline.appendChild(tokenWrapper);
        } else {
            timeline.insertBefore(tokenWrapper, tokens[insertIndex]);
        }
    },
    

    updateTokenAPDisplay(token) {
        const timeline = document.querySelector('.turn-order-track');
        if (!timeline) return;

        const tokenWrapper = Array.from(timeline.children)
            .find(w => w.querySelector('.timeline-token')?.style.backgroundImage === token.style.backgroundImage);
        
        if (tokenWrapper) {
            const apDisplay = tokenWrapper.querySelector('.token-ap');
            if (apDisplay) {
                apDisplay.textContent = `AP: ${token.dataset.actionPoints}`;
            }
        }
    },

    canUseActionType(type) {
        return (
            (type === 'action' && this.isPlayerTurn()) ||
            (type === 'reaction' && !this.isPlayerTurn())
        );
    },

    // Turn Management
    isPlayerTurn() {
        return this.currentPhase === 'player';
    },

    endTurn() {
        const currentToken = this.getCurrentToken();
        if (currentToken) {
            this.turnTimes[currentToken.dataset.name] = 
                (this.turnTimes[currentToken.dataset.name] || 0) + this.turnTimer;
        }

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.endPhase();
    },

    endPhase() {
        if (this.currentPhase === 'player') {
            this.currentPhase = 'opponent';
            this.hasActed = false;
        } else {
            this.currentPhase = 'player';
            this.currentRound++;
            this.rollNewRoundInitiative();
            this.hasActed = false;
        }

        this.startTurnTimer();
        addCombatMessage(`${this.currentPhase.charAt(0).toUpperCase() + this.currentPhase.slice(1)} phase begins`, 'phase');
    },

    rollNewRoundInitiative() {
        document.querySelectorAll('.token.in-combat').forEach(token => {
            const initiativeResult = this.rollInitiativeForToken(token);
            token.dataset.actionPoints = initiativeResult.ap;
            this.updateTokenAPDisplay(token);
        });
    },

    // Timer Management
    startCombatTimer() {
        if (this.totalCombatInterval) {
            clearInterval(this.totalCombatInterval);
        }
        
        this.totalCombatTime = 0;
        this.totalCombatInterval = setInterval(() => {
            this.totalCombatTime++;
            this.updateTimerDisplay();
        }, 1000);
    },

    startTurnTimer() {
        this.turnTimer = 0;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.turnTimer++;
            this.updateTimerDisplay();
        }, 1000);
    },

    updateTimerDisplay() {
        // Update existing timer displays
        const totalTimer = document.querySelector('.total-timer');
        if (totalTimer) {
            totalTimer.textContent = `Total: ${this.formatTime(this.totalCombatTime)}`;
        }

        const turnTimers = document.querySelectorAll('.token-timer');
        turnTimers.forEach(timer => {
            const wrapper = timer.closest('.token-wrapper');
            if (wrapper) {
                const tokenName = wrapper.querySelector('.timeline-token').dataset.name;
                if (tokenName) {
                    const timeSpent = this.turnTimes[tokenName] || 0;
                    timer.textContent = this.formatTime(timeSpent);
                }
            }
        });
    },

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    endCombat() {
        this.isInCombat = false;
        this.currentPhase = null;
        this.currentRound = 1;
        this.actionPoints = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.totalCombatInterval) {
            clearInterval(this.totalCombatInterval);
            this.totalCombatInterval = null;
        }

        document.querySelectorAll('.token').forEach(token => {
            delete token.dataset.actionPoints;
            delete token.dataset.initiative;
        });

        addCombatMessage('Combat ended', 'system');
    }
};

window.combatState.targeting = {
    isTargeting: false,
    currentAbility: null,
    currentSource: null,
    allowedTargets: new Set()
};

{ addCombatMessage, ACTION_COSTS, combatUtils, enhanceTargetSystem };
