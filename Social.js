console.log('Is addMessage accessible?', typeof window.addMessage);


const partySystem = {
    partyMembers: [],
    maxPartySize: 5,
    partyLeader: null,

    init() {
        const currentPlayer = {
            displayName: 'Beadle',
            health: 50,
            maxHealth: 100,
            mana: 50,
            maxMana: 100,
            ap: 10,
            maxAp: 10,
            isLeader: true,
            portraitUrl: 'path/to/beadle-portrait.jpg' // Update with actual path
        };
        this.partyLeader = currentPlayer.displayName;
        this.partyMembers.push(currentPlayer);
        this.createPartyFrame();
    },

// Update just this method in your existing partySystem
animateBar: function(memberName, barType, isIncreasing) {
    const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
    if (!memberContainer) return;
    
    const barFill = memberContainer.querySelector(`.${barType}`);
    if (!barFill) return;
    
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    barFill.appendChild(ripple);
    
    // Remove ripple after animation
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
},


useManaForPartyMember(memberName, amount) {
    const member = this.partyMembers.find(m => m.displayName === memberName);
    if (member) {
        member.mana = Math.max(0, member.mana - amount);
        
        const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
        if (memberContainer) {
            updateBarValues(memberContainer, 'mana', member.mana, member.maxMana);
            this.animateBar(memberName, 'mana', false);
        }

        window.addCombatMessage(`${memberName} uses ${amount} mana`);
        this.showFloatingCombatTextForPartyMember(memberName, -amount, 'mana');
        syncPartyMemberToken(memberName);

        // Show floating combat text on token
        const tokenElement = document.querySelector(`.token[data-name="${memberName}"]`);
        if (tokenElement) {
            showFloatingCombatTextOnToken(tokenElement, -amount, 'mana');
        }
    }
},


regenerateManaForPartyMember(memberName, amount) {
    const member = this.partyMembers.find(m => m.displayName === memberName);
    if (member) {
        member.mana = Math.min(member.maxMana, member.mana + amount);
        
        const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
        if (memberContainer) {
            updateBarValues(memberContainer, 'mana', member.mana, member.maxMana);
            this.animateBar(memberName, 'mana', true);
        }

        window.addCombatMessage(`${memberName} regenerates ${amount} mana`);
        this.showFloatingCombatTextForPartyMember(memberName, amount, 'mana');
        syncPartyMemberToken(memberName);

        // Show floating combat text on token
        const tokenElement = document.querySelector(`.token[data-name="${memberName}"]`);
        if (tokenElement) {
            showFloatingCombatTextOnToken(tokenElement, amount, 'mana');
        }
    }
},


useApForPartyMember(memberName, amount) {
    const member = this.partyMembers.find(m => m.displayName === memberName);
    if (member) {
        member.ap = Math.max(0, member.ap - amount);
        
        const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
        if (memberContainer) {
            updateBarValues(memberContainer, 'ap', member.ap, member.maxAp);
            this.animateBar(memberName, 'ap', false);
        }

        window.addCombatMessage(`${memberName} uses ${amount} AP`);
        this.showFloatingCombatTextForPartyMember(memberName, -amount, 'ap');
        syncPartyMemberToken(memberName);

        // Show floating combat text on token
        const tokenElement = document.querySelector(`.token[data-name="${memberName}"]`);
        if (tokenElement) {
            showFloatingCombatTextOnToken(tokenElement, -amount, 'ap');
        }
    }
},


regenerateApForPartyMember(memberName, amount) {
    const member = this.partyMembers.find(m => m.displayName === memberName);
    if (member) {
        member.ap = Math.min(member.maxAp, member.ap + amount);
        
        const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
        if (memberContainer) {
            updateBarValues(memberContainer, 'ap', member.ap, member.maxAp);
            this.animateBar(memberName, 'ap', true);
        }

        window.addCombatMessage(`${memberName} regenerates ${amount} AP`);
        this.showFloatingCombatTextForPartyMember(memberName, amount, 'ap');
        syncPartyMemberToken(memberName);

        // Show floating combat text on token
        const tokenElement = document.querySelector(`.token[data-name="${memberName}"]`);
        if (tokenElement) {
            showFloatingCombatTextOnToken(tokenElement, amount, 'ap');
        }
    }
},


applyDamageToPartyMember(memberName, amount) {
    const member = this.partyMembers.find(m => m.displayName === memberName);
    if (member) {
        member.health = Math.max(0, member.health - amount);
        
        const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
        if (memberContainer) {
            updateBarValues(memberContainer, 'health', member.health, member.maxHealth);
            this.animateBar(memberName, 'health', false);
        }

        window.addCombatMessage(`${memberName} takes ${amount} damage`);
        this.showFloatingCombatTextForPartyMember(memberName, -amount, 'damage');
        syncPartyMemberToken(memberName);

        // Show floating combat text on token
        const tokenElement = document.querySelector(`.token[data-name="${memberName}"]`);
        if (tokenElement) {
            showFloatingCombatTextOnToken(tokenElement, -amount, 'damage');
        }
    }
},


applyHealingToPartyMember(memberName, amount) {
    const member = this.partyMembers.find(m => m.displayName === memberName);
    if (member) {
        member.health = Math.min(member.maxHealth, member.health + amount);
        
        const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
        if (memberContainer) {
            updateBarValues(memberContainer, 'health', member.health, member.maxHealth);
            this.animateBar(memberName, 'health', true);
        }

        window.addCombatMessage(`${memberName} is healed for ${amount} points`);
        this.showFloatingCombatTextForPartyMember(memberName, amount, 'healing');
        syncPartyMemberToken(memberName);

        // Show floating combat text on token
        const tokenElement = document.querySelector(`.token[data-name="${memberName}"]`);
        if (tokenElement) {
            showFloatingCombatTextOnToken(tokenElement, amount, 'healing');
        }
    }
},


    createPartyFrame() {
        const partyFrame = document.createElement('div');
        partyFrame.id = 'partyFrame';
        partyFrame.className = 'party-frame';
        document.body.appendChild(partyFrame);
        this.updatePartyFrame();
    },

    updatePartyFrame() {
        // Find your existing player HUD element
        const playerHUD = document.querySelector('.character-info');
        if (!playerHUD) {
            console.error('Player HUD not found');
            return;
        }
    
        // Check if the party frame container exists
        let partyFrame = document.getElementById('partyFrame');
        if (!partyFrame) {
            partyFrame = document.createElement('div');
            partyFrame.id = 'partyFrame';
            partyFrame.className = 'party-frame';
            playerHUD.parentNode.insertBefore(partyFrame, playerHUD.nextSibling);
        }
    
        partyFrame.innerHTML = '';
    
        this.partyMembers.forEach(member => {
            if (member.displayName !== characterState.name) {
                const memberContainer = document.createElement('div');
                memberContainer.className = 'party-member';
                memberContainer.setAttribute('data-name', member.displayName);
    
                const nameElement = document.createElement('div');
                nameElement.className = 'member-name';
                nameElement.textContent = member.displayName;
                memberContainer.appendChild(nameElement);
    
                const characterContainer = document.createElement('div');
                characterContainer.className = 'character-container';
    
                const characterBubble = document.createElement('div');
                characterBubble.className = 'character-bouble';
                characterBubble.innerHTML = `<img src="${member.portraitUrl || 'https://via.placeholder.com/80'}" alt="${member.displayName}">`;
                characterContainer.appendChild(characterBubble);
    
                const healthManaBars = document.createElement('div');
                healthManaBars.className = 'health-mana-bars';
    
                /*** Health Bar ***/
                const healthBarContainer = document.createElement('div');
                healthBarContainer.className = 'bar-container health-bar';
    
                const healthBar = document.createElement('div');
                healthBar.className = 'bar';
    
                const healthFill = document.createElement('div');
                healthFill.className = 'health';
                healthFill.style.width = `${(member.health / member.maxHealth) * 100}%`;
                healthBar.appendChild(healthFill);
    
                const healthValue = document.createElement('div');
                healthValue.className = 'bar-text';
                healthValue.innerHTML = `Health: <span>${Math.round(member.health)} / ${Math.round(member.maxHealth)}</span>`;
                healthBar.appendChild(healthValue);
    
                healthBarContainer.appendChild(healthBar);
    
                // Show adjustment controls only in GM mode
                if (window.gmTools && window.gmTools.isGM) {
                    const healthAdjustmentControls = document.createElement('div');
                    healthAdjustmentControls.className = 'adjustment-controls';
    
                    const damageButton = document.createElement('button');
                    damageButton.className = 'adjustment-button';
                    damageButton.textContent = '-';
    
                    const healthAdjustInput = document.createElement('input');
                    healthAdjustInput.type = 'number';
                    healthAdjustInput.className = 'adjustment-input';
                    healthAdjustInput.placeholder = '0';
    
                    const healButton = document.createElement('button');
                    healButton.className = 'adjustment-button';
                    healButton.textContent = '+';
    
                    healButton.addEventListener('click', () => {
                        const amount = parseInt(healthAdjustInput.value);
                        if (!isNaN(amount) && amount > 0) {
                            this.applyHealingToPartyMember(member.displayName, amount);
                            healthAdjustInput.value = '';
                        }
                    });
    
                    damageButton.addEventListener('click', () => {
                        const amount = parseInt(healthAdjustInput.value);
                        if (!isNaN(amount) && amount > 0) {
                            this.applyDamageToPartyMember(member.displayName, amount);
                            healthAdjustInput.value = '';
                        }
                    });
    
                    healthAdjustmentControls.appendChild(damageButton);
                    healthAdjustmentControls.appendChild(healthAdjustInput);
                    healthAdjustmentControls.appendChild(healButton);
                    healthBarContainer.appendChild(healthAdjustmentControls);
                } else {
                    // Adjust the bar to fill the space when adjustment controls are not present
                    healthBar.style.width = '90%';
                }
    
                healthManaBars.appendChild(healthBarContainer);
    
                /*** Mana Bar ***/
                const manaBarContainer = document.createElement('div');
                manaBarContainer.className = 'bar-container mana-bar';
    
                const manaBar = document.createElement('div');
                manaBar.className = 'bar';
    
                const manaFill = document.createElement('div');
                manaFill.className = 'mana';
                manaFill.style.width = `${(member.mana / member.maxMana) * 100}%`;
                manaBar.appendChild(manaFill);
    
                const manaValue = document.createElement('div');
                manaValue.className = 'bar-text';
                manaValue.innerHTML = `Mana: <span>${Math.round(member.mana)} / ${Math.round(member.maxMana)}</span>`;
                manaBar.appendChild(manaValue);
    
                manaBarContainer.appendChild(manaBar);
    
                if (window.gmTools && window.gmTools.isGM) {
                    const manaAdjustmentControls = document.createElement('div');
                    manaAdjustmentControls.className = 'adjustment-controls';
    
                    const useManaButton = document.createElement('button');
                    useManaButton.className = 'adjustment-button';
                    useManaButton.textContent = '-';
    
                    const manaAdjustInput = document.createElement('input');
                    manaAdjustInput.type = 'number';
                    manaAdjustInput.className = 'adjustment-input';
                    manaAdjustInput.placeholder = '0';
    
                    const regenManaButton = document.createElement('button');
                    regenManaButton.className = 'adjustment-button';
                    regenManaButton.textContent = '+';
    
                    useManaButton.addEventListener('click', () => {
                        const amount = parseInt(manaAdjustInput.value);
                        if (!isNaN(amount) && amount > 0) {
                            this.useManaForPartyMember(member.displayName, amount);
                            manaAdjustInput.value = '';
                        }
                    });
    
                    regenManaButton.addEventListener('click', () => {
                        const amount = parseInt(manaAdjustInput.value);
                        if (!isNaN(amount) && amount > 0) {
                            this.regenerateManaForPartyMember(member.displayName, amount);
                            manaAdjustInput.value = '';
                        }
                    });
    
                    manaAdjustmentControls.appendChild(useManaButton);
                    manaAdjustmentControls.appendChild(manaAdjustInput);
                    manaAdjustmentControls.appendChild(regenManaButton);
                    manaBarContainer.appendChild(manaAdjustmentControls);
                } else {
                    // Adjust the bar to fill the space when adjustment controls are not present
                    manaBar.style.width = '90%';
                }
    
                healthManaBars.appendChild(manaBarContainer);
    
                /*** AP Bar ***/
                const apBarContainer = document.createElement('div');
                apBarContainer.className = 'bar-container ap-bar';
    
                const apBar = document.createElement('div');
                apBar.className = 'bar';
    
                const currentAp = (typeof member.ap === 'number') ? member.ap : 0;
                const maxAp = (typeof member.maxAp === 'number') ? member.maxAp : 10;
    
                const apFill = document.createElement('div');
                apFill.className = 'ap';
                apFill.style.width = `${(currentAp / maxAp) * 100}%`;
                apBar.appendChild(apFill);
    
                const apValue = document.createElement('div');
                apValue.className = 'bar-text';
                apValue.innerHTML = `AP: <span>${Math.round(currentAp)} / ${Math.round(maxAp)}</span>`;
                apBar.appendChild(apValue);
    
                apBarContainer.appendChild(apBar);
    
                if (window.gmTools && window.gmTools.isGM) {
                    const apAdjustmentControls = document.createElement('div');
                    apAdjustmentControls.className = 'adjustment-controls';
    
                    const useApButton = document.createElement('button');
                    useApButton.className = 'adjustment-button';
                    useApButton.textContent = '-';
    
                    const apAdjustInput = document.createElement('input');
                    apAdjustInput.type = 'number';
                    apAdjustInput.className = 'adjustment-input';
                    apAdjustInput.placeholder = '0';
    
                    const regenApButton = document.createElement('button');
                    regenApButton.className = 'adjustment-button';
                    regenApButton.textContent = '+';
    
                    useApButton.addEventListener('click', () => {
                        const amount = parseInt(apAdjustInput.value);
                        if (!isNaN(amount) && amount > 0) {
                            this.useApForPartyMember(member.displayName, amount);
                            apAdjustInput.value = '';
                        }
                    });
    
                    regenApButton.addEventListener('click', () => {
                        const amount = parseInt(apAdjustInput.value);
                        if (!isNaN(amount) && amount > 0) {
                            this.regenerateApForPartyMember(member.displayName, amount);
                            apAdjustInput.value = '';
                        }
                    });
    
                    apAdjustmentControls.appendChild(useApButton);
                    apAdjustmentControls.appendChild(apAdjustInput);
                    apAdjustmentControls.appendChild(regenApButton);
                    apBarContainer.appendChild(apAdjustmentControls);
                } else {
                    // Adjust the bar to fill the space when adjustment controls are not present
                    apBar.style.width = '90%';
                }
    
                healthManaBars.appendChild(apBarContainer);
                characterContainer.appendChild(healthManaBars);
                memberContainer.appendChild(characterContainer);
    
                memberContainer.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showPartyMemberContextMenu(e.pageX, e.pageY, member);
                });
    
                partyFrame.appendChild(memberContainer);
            }
        });
    },
    
    
    


    sendInvite(targetName) {
        // Check if the target is already in the party
        if (this.partyMembers.some(member => member.displayName === targetName)) {
            window.addMessage('chat', 'System', `${targetName} is already in your group.`);
            return;
        }
    
        if (this.partyMembers.length >= this.maxPartySize) {
            window.addMessage('chat', 'System', 'Party is full.');
            return;
        }
    
        window.addMessage('chat', 'System', `A group invite has been sent to ${targetName}.`);
        
        // Simulate acceptance or decline
        if (targetName === 'Yad') {
            setTimeout(() => {
                this.acceptInvite(targetName);
            }, 1000);
        } else if (targetName === 'TestUser') {
            setTimeout(() => {
                this.declineInvite(targetName);
            }, 1000);
        }
    },
    

    acceptInvite(memberName) {
        // Retrieve character data for the invited member
        const characterData = getCharacterDataForMember(memberName);

        if (!characterData) {
            console.error(`Character data not found for ${memberName}`);
            return;
        }

        const newMember = {
            displayName: characterData.displayName,
            health: characterData.health,
            maxHealth: characterData.maxHealth,
            mana: characterData.mana,
            maxMana: characterData.maxMana,
            ap: characterData.ap,
            maxAp: characterData.maxAp,
            isLeader: false,
            portraitUrl: characterData.portraitUrl
        };

        this.partyMembers.push(newMember);
        this.updatePartyFrame();
        window.addMessage('chat', null, `${memberName} has joined your party.`);
    },

    
    declineInvite(memberName) {
        window.addMessage('chat', 'System', `${memberName} has declined your group invite.`);
    },

    passLeader(newLeaderName) {
        const member = this.partyMembers.find(m => m.displayName === newLeaderName);
        if (member) {
            this.partyLeader = newLeaderName;
            window.addMessage('chat', null, `${newLeaderName} is now the party leader.`);
            this.updatePartyFrame();
        }
    },

    updatePartyMemberHealth(memberName, newHealth) {
        const member = this.partyMembers.find(m => m.displayName === memberName);
        if (member) {
            const healthChange = newHealth - member.health;
            member.health = newHealth;
            this.updatePartyFrame();
            
            // Find the party member's HUD element
            const memberElement = document.querySelector(`.party-member[data-name="${memberName}"]`);
            if (memberElement) {
                // Show floating combat text
                if (healthChange !== 0) {
                    const type = healthChange > 0 ? 'healing' : 'damage';
                    showFloatingCombatText(memberElement, healthChange, type);
                }
            }
        }
    },
    
    updatePartyMemberMana(memberName, newMana) {
        const member = this.partyMembers.find(m => m.displayName === memberName);
        if (member) {
            member.mana = newMana;
            this.updatePartyFrame();
    
            // Update token if it exists
            const token = document.querySelector(`.token[data-name="${memberName}"]`);
            if (token) {
                token.dataset.currentMana = newMana;
                updateTokenBars(token); // Function from your HUD.js
            }
        }
    },

    // Ensure showFloatingCombatTextForPartyMember is also a method
    showFloatingCombatTextForPartyMember(memberName, value, type) {
        const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
        if (!memberContainer) return;

        const floatingText = document.createElement('div');
        floatingText.className = 'floating-combat-text';

        // Set color and format based on type
        switch(type) {
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
                floatingText.textContent = (value > 0 ? '+' : '') + value + ' MP';
                break;
            case 'ap':
                floatingText.style.color = '#f1c40f';
                floatingText.textContent = (value > 0 ? '+' : '') + value + ' AP';
                break;
            // Add more cases as needed
        }

// Position the floating text over the member's HUD
floatingText.style.position = 'absolute';
floatingText.style.left = '50%';
floatingText.style.top = '0';
floatingText.style.transform = 'translateX(-50%)';
floatingText.style.opacity = '1';

memberContainer.appendChild(floatingText);

// Animate the floating text
requestAnimationFrame(() => {
    floatingText.style.transition = 'all 1s ease-out';
    floatingText.style.transform = 'translate(-50%, -30px)';
    floatingText.style.opacity = '0';
});

        setTimeout(() => floatingText.remove(), 1000);
    },

    
};

document.addEventListener('DOMContentLoaded', () => {
    partySystem.init();
});


const socialData = {
    friends: [
        {
            displayName: 'Yad',
            tag: 'Yad#1234',
            status: 'online',
            level: 60,
            lastSeen: 'Now',
            portraitUrl: 'https://i.ibb.co/Y0V2tRS/spiked-shoulder-armor.png' // Update with actual path
        },
        {
            displayName: 'TestUser',
            tag: 'Test#5678',
            status: 'offline',
            level: 45,
            lastSeen: '2 hours ago',
            portraitUrl: 'https://via.placeholder.com/80' // Placeholder if offline
        }
    ],
    ignored: []
};

let selectedFriend = null;

document.addEventListener('DOMContentLoaded', () => {
    
    const socialPopup = document.getElementById('socialPopup');
    const socialButton = document.getElementById('socialButton');
    const closeButton = socialPopup.querySelector('.close-button');
    const tabButtons = socialPopup.querySelectorAll('.tab-button');
    const footerButtons = document.querySelector('.popup-footer');
    
    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'friend-context-menu';
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="whisper">Whisper</div>
        <div class="context-menu-item" data-action="invite">Invite to Group</div>
        <div class="context-menu-item" data-action="remove">Remove Friend</div>
    `;
    document.body.appendChild(contextMenu);
    
    // Ensure footer buttons exist
    if (!footerButtons) {
        const footer = document.createElement('div');
        footer.className = 'popup-footer';
        footer.innerHTML = `
            <div class="footer-button-container">
                <button class="social-button" id="addFriend">Add Friend</button>
                <button class="social-button" id="removeFriend">Remove Friend</button>
            </div>
        `;
        socialPopup.appendChild(footer);
    }

    // Initialize the friends list
    updateSocialList('friends');
    
    // Close button functionality
    closeButton.addEventListener('click', () => {
        togglePopup('socialPopup');
    });

    // Social button toggle functionality
    socialButton.addEventListener('click', () => {
        togglePopup('socialPopup');
    });
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const listType = button.textContent.toLowerCase();
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateSocialList(listType);
            selectedFriend = null;
            updateActionButtons();
        });
    });

    // Context menu item functionality
    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action || !selectedFriend) return;

        switch(action) {
            case 'whisper':
                window.openWhisperTab(selectedFriend.displayName);
                window.addMessage(selectedFriend.displayName, null, `Whisper conversation started with ${selectedFriend.displayName}.`);
                break;
            case 'invite':
                partySystem.sendInvite(selectedFriend.displayName);
                break;
            case 'remove':
                const index = socialData.friends.findIndex(f => f.tag === selectedFriend.tag);
                if (index !== -1) {
                    socialData.friends.splice(index, 1);
                    updateSocialList('friends');
                    selectedFriend = null;
                    updateActionButtons();
                }
                break;
        }
        contextMenu.style.display = 'none';
    });

    // Close context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });
    
    // Button functionality
    document.getElementById('addFriend')?.addEventListener('click', () => {
        const tag = prompt('Enter friend\'s tag (e.g., Username#1234):');
        if (tag) {
            const displayName = tag.split('#')[0];
            socialData.friends.push({
                displayName: displayName,
                tag: tag,
                status: 'online',
                level: 1,
                lastSeen: 'Now'
            });
            updateSocialList('friends');
            window.addMessage('chat', 'System', `${displayName} has been added to your friend list.`);
        }
    });

    
    document.getElementById('removeFriend')?.addEventListener('click', () => {
        if (selectedFriend) {
            window.addMessage('chat', 'System', `${selectedFriend.displayName} has been removed from your friend list.`);
            const index = socialData.friends.findIndex(f => f.tag === selectedFriend.tag);
            if (index !== -1) {
                socialData.friends.splice(index, 1);
                updateSocialList('friends');
                selectedFriend = null;
                updateActionButtons();
            }
        }
    });;

    // Make the popup draggable using interact.js
    if (typeof interact !== 'undefined') {
        interact('#socialPopup')
        .draggable({
            allowFrom: '.popup-header',
            inertia: false,
            onmove: (event) => {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                
                target.style.left = `${x}px`;
                target.style.top = `${y}px`;
                
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move: function(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0);
                    const y = (parseFloat(target.getAttribute('data-y')) || 0);
    
                    Object.assign(target.style, {
                        width: `${event.rect.width}px`,
                        height: `${event.rect.height}px`
                    });
    
                    // Update the element's position
                    Object.assign(target.style, {
                        left: `${x + event.deltaRect.left}px`,
                        top: `${y + event.deltaRect.top}px`
                    });
    
                    target.setAttribute('data-x', x + event.deltaRect.left);
                    target.setAttribute('data-y', y + event.deltaRect.top);
                }
            },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 320, height: 300 }
                })
            ]
        });
    
    // Fix for button container
    const socialPopup = document.getElementById('socialPopup');
    const footerButtonContainer = socialPopup.querySelector('.footer-button-container');
    if (!footerButtonContainer) {
        const footer = document.createElement('div');
        footer.className = 'popup-footer';
        footer.innerHTML = `
            <div class="footer-button-container">
                <button class="social-button" id="addFriend">Add Friend</button>
                <button class="social-button" id="removeFriend">Remove Friend</button>
            </div>
        `;
        socialPopup.appendChild(footer);
    }
    
        // Updated Party Frame configuration
        interact('#partyFrame')
            .draggable({
                inertia: false,
                allowFrom: '#partyFrame',
                onstart: (event) => {
                    const target = event.target;
                    if (getComputedStyle(target).position !== 'absolute' && 
                        getComputedStyle(target).position !== 'fixed') {
                        target.style.position = 'absolute';
                    }
                    
                    const rect = target.getBoundingClientRect();
                    target.dataset.offsetX = event.clientX - rect.left;
                    target.dataset.offsetY = event.clientY - rect.top;
                },
                onmove: dragMoveListener
            })
            .resizable({
                edges: { left: true, right: true },
                listeners: {
                    move: function(event) {
                        const target = event.target;
                        
                        // Set minimum width for party frame
                        const minWidth = 280;
                        const defaultWidth = 320; // Match the player HUD width
                        
                        // Calculate new width
                        let newWidth = Math.max(event.rect.width, minWidth);
                        
                        // Update target dimensions
                        Object.assign(target.style, {
                            width: `${newWidth}px`,
                            display: 'flex',
                            flexDirection: 'column'
                        });
                        
                        // Update position
                        const x = (parseFloat(target.dataset.x) || 0) + event.deltaRect.left;
                        
                        Object.assign(target.style, {
                            left: `${x}px`
                        });
                        
                        // Store position
                        target.dataset.x = x;

                    }
                },
                modifiers: [
                    interact.modifiers.restrictEdges({
                        outer: 'parent'
                    }),
                    interact.modifiers.restrictSize({
                        min: { width: 280 },
                        max: { width: 800 } // Optional: add a maximum width if desired
                    })
                ]
            });
    }
    partySystem.init();
});

function showFloatingCombatTextOnToken(tokenElement, value, type) {
    if (!tokenElement) return;

    const floatingText = document.createElement('div');
    floatingText.className = 'floating-combat-text';

    // Set color and format based on type
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
            floatingText.textContent = (value > 0 ? '+' : '') + value + ' MP';
            break;
        case 'ap':
            floatingText.style.color = '#f1c40f';
            floatingText.textContent = (value > 0 ? '+' : '') + value + ' AP';
            break;
        // Add more cases as needed
    }

    // Position the floating text over the token
    floatingText.style.position = 'absolute';
    floatingText.style.left = '50%';
    floatingText.style.top = '0';
    floatingText.style.transform = 'translateX(-50%)';
    floatingText.style.opacity = '1';
    floatingText.style.pointerEvents = 'none';

    tokenElement.appendChild(floatingText);

    // Animate the floating text
    requestAnimationFrame(() => {
        floatingText.style.transition = 'all 1s ease-out';
        floatingText.style.transform = 'translate(-50%, -30px)';
        floatingText.style.opacity = '0';
    });

    setTimeout(() => floatingText.remove(), 1000);
}


function updateBarValues(container, type, current, max) {
    // First find the specific bar container
    const barContainer = container.querySelector(`.${type}-bar`);
    if (!barContainer) return;
    
    // Find the bar element within the container
    const bar = barContainer.querySelector('.bar');
    if (!bar) return;
    
    // Find the fill element and bar text
    const barFill = bar.querySelector(`.${type}`);
    const barText = bar.querySelector('.bar-text');
    
    // Update fill width if it exists
    if (barFill) {
        barFill.style.width = `${(current / max) * 100}%`;
    }
    
    // Update text if it exists
    if (barText) {
        const label = type === 'ap' ? 'AP' : type.charAt(0).toUpperCase() + type.slice(1);
        barText.innerHTML = `${label}: <span>${Math.round(current)} / ${Math.round(max)}</span>`;
    }
}

function getCharacterDataForMember(memberName) {
    // Simulate fetching character data
    // Replace this with actual data retrieval from your backend or database
    if (memberName === 'Yad') {
        return {
            displayName: 'Yad',
            health: 80,
            maxHealth: 100,
            mana: 50,
            maxMana: 100,
            portraitUrl: 'path/to/yad-portrait.jpg'
        };
    }
    // Add more simulated data as needed
    return null;
}

function updateSocialList(listType) {
    const list = document.querySelector('.friends-list');
    list.innerHTML = '';
    
    const data = socialData[listType] || [];
    
    data.forEach(entry => {
        const element = document.createElement('div');
        element.className = 'friend-entry';
        element.dataset.tag = entry.tag;
        element.dataset.displayName = entry.displayName; // Add this line
        element.innerHTML = `
            <div class="friend-info">
                <span class="friend-name">${entry.displayName}</span>
                <span class="friend-status ${entry.status}">${entry.status}</span>
                <span class="friend-level">Level ${entry.level}</span>
                ${entry.status === 'offline' ? `<span class="last-online">Last online: ${entry.lastSeen}</span>` : ''}
            </div>
        `;
        
// Click handler for selecting friends
element.addEventListener('click', (e) => {
    document.querySelectorAll('.friend-entry').forEach(entry => {
        entry.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedFriend = {
        displayName: element.dataset.displayName,
        tag: element.dataset.tag
    };
    updateActionButtons();
});
        
        // Context menu handler
    element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const contextMenu = document.querySelector('.friend-context-menu');
        if (contextMenu) {
            document.querySelectorAll('.friend-entry').forEach(entry => {
                entry.classList.remove('selected');
            });
            element.classList.add('selected');
            selectedFriend = {
                displayName: element.dataset.displayName,
                tag: element.dataset.tag
            };
            updateActionButtons();
            
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
        }
    });

    list.appendChild(element);
    });
}

function updateActionButtons() {
    const buttons = document.querySelectorAll('.social-button');
    buttons.forEach(button => {
        if (button.id === 'addFriend') {
            button.disabled = false;
            button.classList.remove('disabled');
        } else {
            button.disabled = !selectedFriend;
            button.classList.toggle('disabled', !selectedFriend);
        }
    });
}

function updateBarValues(container, type, current, max) {
    const barContainer = container.querySelector(`.${type}-bar`);
    const barFill = container.querySelector(`.${type}`);
    const bar = barContainer?.querySelector('.bar');
    const barText = bar?.querySelector('.bar-text');
    
    if (barFill) {
        barFill.style.width = `${(current / max) * 100}%`;
    }
    
    if (barText) {
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        barText.textContent = `${label}: ${Math.round(current)} / ${Math.round(max)}`;
    }
}

function showFloatingCombatTextForPartyMember(memberName, value, type) {
    const memberContainer = document.querySelector(`.party-member[data-name="${memberName}"]`);
    if (!memberContainer) return;

    const floatingText = document.createElement('div');
    floatingText.className = 'floating-combat-text';

    // Set color and format based on type
    switch(type) {
        case 'healing':
            floatingText.style.color = '#2ecc71';
            floatingText.textContent = '+' + Math.abs(value);
            break;
        case 'damage':
            floatingText.style.color = '#e74c3c';
            floatingText.textContent = '-' + Math.abs(value);
            break;
        // Add more cases as needed
    }

    // Position the floating text over the member's HUD
    floatingText.style.position = 'absolute';
    floatingText.style.left = '50%';
    floatingText.style.top = '0';
    floatingText.style.transform = 'translateX(-50%)';
    floatingText.style.opacity = '1';

    memberContainer.appendChild(floatingText);

    // Animate the floating text
    requestAnimationFrame(() => {
        floatingText.style.transition = 'all 1s ease-out';
        floatingText.style.transform = 'translate(-50%, -30px)';
        floatingText.style.opacity = '0';
    });

    setTimeout(() => floatingText.remove(), 1000);
}



if (typeof window.addCombatMessage !== 'function') {
    window.addCombatMessage = function(message) {
        // Implement the function or log an error
        console.error('addCombatMessage function is not defined.');
    };
}

function openPartyMemberSheet(member) {
    let sheet = document.getElementById(`${member.displayName}-sheet`);
    if (!sheet) {
        sheet = document.createElement('div');
        sheet.id = `${member.displayName}-sheet`;
        sheet.className = 'character-sheet-popup popup';
        sheet.innerHTML = `
            <div class="popup-header sheet-header">
                <h2>${member.displayName}'s Character Sheet</h2>
                <button class="close-button">×</button>
            </div>
            <div class="popup-content">
                <div class="character-info">
                    <div class="character-portrait">
                        <img src="${member.portraitUrl}" alt="${member.displayName}" class="character-image">
                    </div>
                    <div class="resource-bars">
                        <div class="resource-bar health-bar">
                            <div class="bar-label">Health</div>
                            <div class="bar-container">
                                <div class="bar-fill health-fill" style="width: ${(member.health / member.maxHealth) * 100}%"></div>
                                <div class="bar-text">${member.health}/${member.maxHealth}</div>
                            </div>
                        </div>
                        <div class="resource-bar mana-bar">
                            <div class="bar-label">Mana</div>
                            <div class="bar-container">
                                <div class="bar-fill mana-fill" style="width: ${(member.mana / member.maxMana) * 100}%"></div>
                                <div class="bar-text">${member.mana}/${member.maxMana}</div>
                            </div>
                        </div>
                        <div class="resource-bar ap-bar">
                            <div class="bar-label">Action Points</div>
                            <div class="bar-container">
                                <div class="bar-fill ap-fill" style="width: ${(member.ap / member.maxAp) * 100}%"></div>
                                <div class="bar-text">${member.ap}/${member.maxAp}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stats-container">
                    <div class="stats-section">
                        <h3>Base Stats</h3>
                        <div class="base-stats">
                            <div class="stat-item">
                                <span class="stat-label">Constitution:</span>
                                <span class="stat-value">${member.stats?.con || 10}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Strength:</span>
                                <span class="stat-value">${member.stats?.str || 10}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Agility:</span>
                                <span class="stat-value">${member.stats?.agi || 10}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Intelligence:</span>
                                <span class="stat-value">${member.stats?.int || 10}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Spirit:</span>
                                <span class="stat-value">${member.stats?.spir || 10}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Charisma:</span>
                                <span class="stat-value">${member.stats?.cha || 10}</span>
                            </div>
                        </div>
                    </div>

                    <div class="stats-section">
                        <h3>Derived Stats</h3>
                        <div class="derived-stats">
                            <div class="stat-item">
                                <span class="stat-label">Health Regen:</span>
                                <span class="stat-value">${member.derivedStats?.healthRegen || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Mana Regen:</span>
                                <span class="stat-value">${member.derivedStats?.manaRegen || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Damage:</span>
                                <span class="stat-value">${member.derivedStats?.damage || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Spell Damage:</span>
                                <span class="stat-value">${member.derivedStats?.spellDamage || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Healing:</span>
                                <span class="stat-value">${member.derivedStats?.healing || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Armor:</span>
                                <span class="stat-value">${member.derivedStats?.armor || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Critical Chance:</span>
                                <span class="stat-value">${member.derivedStats?.crit || 0}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Movement Speed:</span>
                                <span class="stat-value">${member.derivedStats?.moveSpeed || 30} ft</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(sheet);

        // Make sheet draggable
        makeSheetDraggable(sheet);

        // Add close button functionality
        const closeButton = sheet.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            sheet.style.display = 'none';
        });
    }

    sheet.style.display = 'block';
}


function addPartyMemberToken(member) {
    // Create token data from party member
    const tokenData = {
        name: member.displayName,
        maxHealth: member.maxHealth,
        currentHealth: member.health,
        maxMana: member.maxMana,
        currentMana: member.mana,
        portraitUrl: member.portraitUrl,
        isPlayer: false,
        actionPoints: member.ap,
        maxActionPoints: member.maxAp,
        stats: {
            con: member.stats?.con || 10,
            str: member.stats?.str || 10,
            agi: member.stats?.agi || 10,
            int: member.stats?.int || 10,
            spir: member.stats?.spir || 10,
            cha: member.stats?.cha || 10
        },
        derivedStats: member.derivedStats || {
            healthRegen: Math.floor((member.stats?.con || 10) / 2),
            manaRegen: Math.floor((member.stats?.int || 10) / 2),
            damage: Math.floor((member.stats?.str || 10) / 2),
            spellDamage: Math.floor((member.stats?.int || 10) / 2),
            healing: Math.floor((member.stats?.spir || 10) / 2),
            armor: Math.floor((member.stats?.agi || 10) / 2),
            crit: Math.floor((member.stats?.agi || 10) / 5),
            moveSpeed: 30 + Math.floor((member.stats?.agi || 10) / 4)
        }
    };

    // Hold token on mouse for placement
    holdTokenOnMouse(
        tokenData.portraitUrl,
        characterState.lastMouseX || 0,
        characterState.lastMouseY || 0,
        tokenData
    );
}


function syncPartyMemberToken(memberName) {
    const token = document.querySelector(`.token[data-name="${memberName}"]`);
    const member = partySystem.partyMembers.find(m => m.displayName === memberName);
    
    if (!token || !member) return;

    // Update token dataset with current values
    token.dataset.currentHealth = member.health;
    token.dataset.maxHealth = member.maxHealth;
    token.dataset.currentMana = member.mana;
    token.dataset.maxMana = member.maxMana;
    token.dataset.actionPoints = member.ap;
    token.dataset.maxActionPoints = member.maxAp;

    // Update token bars
    const healthBar = token.querySelector('.token-health-fill');
    if (healthBar) {
        const healthPercent = (member.health / member.maxHealth) * 100;
        healthBar.style.width = `${healthPercent}%`;
        healthBar.style.backgroundColor = healthPercent <= 25 ? '#ff4444' : 
                                        healthPercent <= 50 ? '#ffaa00' : '#44ff44';
    }

    // Update tooltip if it exists
    const tooltip = token.querySelector('.token-tooltip');
    if (tooltip) {
        tooltip.innerHTML = `
            <div class="tooltip-header">${memberName}</div>
            <div class="tooltip-stats">
                HP: ${Math.round(member.health)}/${Math.round(member.maxHealth)}
                <br>MP: ${Math.round(member.mana)}/${Math.round(member.maxMana)}
                <br>AP: ${Math.round(member.ap)}/${Math.round(member.maxAp)}
            </div>
        `;
    }

    // Update target display if this token is targeted
    if (characterState.currentTarget === token) {
        updateTargetInfo(token);
    }
}

function showPartyMemberContextMenu(x, y, member) {
    let contextMenu = document.getElementById('partyMemberContextMenu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'partyMemberContextMenu';
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }

    // Clear existing content
    contextMenu.innerHTML = '';

    // Menu items
    const menuItems = [
        { action: 'inspect', text: 'Inspect Character', handler: () => openPartyMemberSheet(member) },
        { action: 'addToken', text: 'Add Token to Grid', handler: () => addPartyMemberToken(member) },
        { action: 'whisper', text: 'Whisper', handler: () => openWhisperTab(member.displayName) },
        { action: 'passLeader', text: 'Pass Leadership', handler: () => partySystem.passLeader(member.displayName) }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.text;
        menuItem.addEventListener('click', () => {
            item.handler();
            contextMenu.remove();
        });
        contextMenu.appendChild(menuItem);
    });

    // Position and display menu
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 0);
}



function getCharacterDataForMember(memberName) {
    // Simulate fetching character data
    // Replace this with actual data retrieval from your backend or database
    if (memberName === 'Yad') {
        return {
            displayName: 'Yad',
            health: 80,
            maxHealth: 100,
            mana: 50,
            maxMana: 100,
            ap: 10,
            maxAp: 10,
            portraitUrl: 'path/to/yad-portrait.jpg'
        };
    }
    // Add more simulated data as needed
    return null;
}




// Hide context menu when clicking elsewhere
document.addEventListener('click', (e) => {
    const contextMenu = document.getElementById('partyMemberContextMenu');
    if (contextMenu && !contextMenu.contains(e.target)) {
        contextMenu.style.display = 'none';
    }
});

window.partySystem = partySystem;

// Initialize partySystem when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.gmTools && window.partySystem) {
        window.partySystem.init();
    }
});