
// Clear any existing combat messages when initializing
function initializeCombatLog() {
    const combatContent = document.querySelector('.chat-content[data-content="combat"]');
    if (combatContent) {
        combatContent.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCombatLog();
});
// Create the chat window
function createChatWindow() {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.innerHTML = `
        <div class="chat-header">
            <div class="chat-tabs">
                <div class="chat-tab active" data-tab="chat">Chat</div>
                <div class="chat-tab" data-tab="combat">Combat</div>
                <div class="chat-tab" data-tab="loot">Loot</div>
            </div>
        </div>
        <div class="chat-content active" data-content="chat"></div>
        <div class="chat-content" data-content="combat"></div>
        <div class="chat-content" data-content="loot"></div>
        <div class="chat-input-container">
            <textarea class="chat-input" placeholder="Type your message..."></textarea>
        </div>
    `;
    document.body.appendChild(chatContainer);
    
    setupChatFunctionality(chatContainer);
}

// Setup all chat functionality
function setupChatFunctionality(chatContainer) {
    makeDraggable(chatContainer);
    setupTabs(chatContainer);
    setupMessageInput(chatContainer);
}

// Make the window draggable
function makeDraggable(element) {
    const header = element.querySelector('.chat-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.addEventListener('mousedown', startDragging);

    function startDragging(e) {
        if (e.target.classList.contains('chat-tab')) return;
        
        isDragging = true;
        initialX = e.clientX - element.offsetLeft;
        initialY = e.clientY - element.offsetTop;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        element.style.left = `${currentX}px`;
        element.style.top = `${currentY}px`;
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
    }
}

// Setup tab functionality
function setupTabs(chatContainer) {
    const tabs = chatContainer.querySelectorAll('.chat-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            chatContainer.querySelectorAll('.chat-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.remove('unread');
            tab.classList.add('active');
            const content = chatContainer.querySelector(`.chat-content[data-content="${tab.dataset.tab}"]`);
            if (content) content.classList.add('active');
        });
    });
}

// Add a new message (keep this as your primary message adding function)
function addMessage(type, source, message) {
    const container = document.querySelector(`.chat-content[data-content="${type}"]`);
    if (!container) {
        console.error(`Chat container for type "${type}" not found`);
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';

    // Modify this part
    if (source === 'System' || !source) {
        messageElement.innerHTML = `${message}`;
    } else {
        messageElement.innerHTML = `<span class="source">${source}:</span> ${message}`;
    }
    
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;

    // Highlight tab if not active
    const tab = document.querySelector(`.chat-tab[data-tab="${type}"]`);
    if (tab && !tab.classList.contains('active')) {
        tab.classList.add('unread');
    }
}


function addChatTab(tabName) {
    const tabsContainer = document.querySelector('.chat-tabs');
    const chatContainer = document.querySelector('.chat-container');

    // Check if the tab already exists
    if (document.querySelector(`.chat-tab[data-tab="${tabName}"]`)) {
        return;
    }

    // Create the new tab
    const tab = document.createElement('div');
    tab.className = 'chat-tab';
    tab.dataset.tab = tabName;
    tab.textContent = tabName;

    // Add click event to the tab
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.chat-content').forEach(c => c.classList.remove('active'));
        
        // Activate the clicked tab and corresponding content
        tab.classList.remove('unread');
        tab.classList.add('active');
        const content = document.querySelector(`.chat-content[data-content="${tabName}"]`);
        if (content) content.classList.add('active');
    });

    tabsContainer.appendChild(tab);

    // Create the content area
    const content = document.createElement('div');
    content.className = 'chat-content';
    content.dataset.content = tabName;

    // Insert the content area before the input container
    const chatInputContainer = chatContainer.querySelector('.chat-input-container');
    chatContainer.insertBefore(content, chatInputContainer);
}


function openWhisperTab(friendName) {
    // Check if the tab already exists
    let tab = document.querySelector(`.chat-tab[data-tab="${friendName}"]`);
    if (!tab) {
        // Create a new tab
        addChatTab(friendName);
    }

    // Activate the tab
    tab = document.querySelector(`.chat-tab[data-tab="${friendName}"]`);
    tab.click();
}


// Setup message input
function setupMessageInput(chatContainer) {
    const input = chatContainer.querySelector('.chat-input');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = input.value.trim();
            if (message) {
                // Determine the active tab
                const activeTab = chatContainer.querySelector('.chat-tab.active');
                const tabName = activeTab ? activeTab.dataset.tab : 'chat';

                addMessage(tabName, characterState.name, message);
                input.value = '';

                // Simulate a response if it's a whisper tab
                if (tabName !== 'chat' && tabName !== 'combat' && tabName !== 'loot') {
                    setTimeout(() => {
                        addMessage(tabName, tabName, `Reply to: ${message}`);
                    }, 1000);
                }
            }
        }
    });
}


function ensureMessageContainer(type) {
    let container = document.querySelector(`.chat-content[data-content="${type}"]`);
    if (!container) {
        container = document.createElement('div');
        container.className = `chat-content${type === 'loot' ? ' active' : ''}`;
        container.setAttribute('data-content', type);
        document.querySelector('.chat-container').appendChild(container);
    }
    return container;
}

// Setup all chat functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.chat-container');
    if (!chatContainer) {
        console.error('Chat container not found');
        return;
    }

    makeDraggable(chatContainer);
    setupTabs(chatContainer);
    setupMessageInput(chatContainer);
});

function addCombatMessage(message) {
    const combatContent = document.querySelector('.chat-content[data-content="combat"]');
    if (!combatContent) return;

    // Skip "Select target" messages
    if (message.includes('Select target for')) {
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    // Remove any "System:" prefix
    const cleanMessage = message.replace(/^System:\s*/, '');

    // Handle ability use messages
    if (cleanMessage.includes('uses') && cleanMessage.includes('→')) {
        const [creature, rest] = cleanMessage.split(' uses ');
        const [ability, target] = rest.split(' → ');
        
        // Get ability details from creatureAbilities
        const creatureAbilities = window.creatureAbilities[creature] || {};
        const abilityDetails = creatureAbilities[ability] || {};
        
        messageDiv.innerHTML = `
            <span class="creature-name">${creature}</span> uses 
            <span class="ability-name ability-${abilityDetails.damageType || 'physical'}">
                ${ability}
                <div class="ability-tooltip">
                    <div class="tooltip-header">${ability}</div>
                    <div class="tooltip-body">
                        ${abilityDetails.description || ''}
                        <div class="tooltip-stats">
                            <div>Type: ${abilityDetails.damageType || 'physical'}</div>
                            <div>Damage: ${abilityDetails.damage || 'N/A'}</div>
                            <div>Range: ${abilityDetails.range || 'N/A'}</div>
                            ${abilityDetails.manaCost ? `<div>Mana: ${abilityDetails.manaCost}</div>` : ''}
                        </div>
                    </div>
                </div>
            </span>
            <span class="arrow">→</span>
            <span class="target-name">${target}</span>
        `;
    }
    // Handle attack rolls
    else if (cleanMessage.includes('Attack roll:')) {
        const rollMatch = cleanMessage.match(/Attack roll: (\d+)\s*\+?\s*(\d*)\s*=\s*(\d+)\s*vs\s*AC\s*(\d+)/);
        if (rollMatch) {
            const [, roll, modifier, total, ac] = rollMatch;
            const hit = cleanMessage.includes('Hit!');
            messageDiv.innerHTML = `
                <span class="roll">
                    Attack roll: <span class="roll-number">${roll}${modifier ? ` + ${modifier}` : ''} = ${total}</span> vs AC ${ac}
                    <span class="${hit ? 'hit' : 'miss'}">${hit ? 'Hit!' : 'Miss!'}</span>
                </span>
            `;
        }
    }
    // Handle damage rolls
    else if (cleanMessage.includes('Damage rolls:')) {
        const damageMatch = cleanMessage.match(/Damage rolls: \[(.*?)\]/);
        if (damageMatch) {
            const rolls = damageMatch[1];
            const totalMatch = cleanMessage.match(/=\s*(\d+)/);
            const total = totalMatch ? totalMatch[1] : '';
            messageDiv.innerHTML = `
                <span class="roll">
                    Damage rolls: [<span class="damage">${rolls}</span>]${total ? ` = <span class="damage">${total}</span>` : ''}
                </span>
            `;
        }
    }
    // Handle effect messages
    else if (cleanMessage.includes('Target is')) {
        messageDiv.innerHTML = `<span class="effect">${cleanMessage}</span>`;
    }
    // Handle other messages
    else {
        messageDiv.innerHTML = `<span class="status">${cleanMessage}</span>`;
    }

    combatContent.appendChild(messageDiv);
    combatContent.scrollTop = combatContent.scrollHeight;

    // Highlight combat tab if not active
    const combatTab = document.querySelector('.chat-tab[data-tab="combat"]');
    if (combatTab && !combatTab.classList.contains('active')) {
        combatTab.classList.add('unread');
    }
}

// And for ability use messages, use this simplified version:
function addCombatAbilityUse(creatureName, abilityName, targetName) {
    const message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = `${creatureName} uses [${abilityName}] → ${targetName}`;
    
    const combatContent = document.querySelector('.chat-content[data-content="combat"]');
    combatContent.appendChild(message);
    combatContent.scrollTop = combatContent.scrollHeight;
}

// Example usage:
const exampleAbility = {
    name: "Mind Blast",
    damage: "3d8",
    range: 6,
    description: "Unleashes a devastating psychic attack that deals damage and has a chance to stun.",
    damageType: "psychic"
};

addCombatMessage(
    "Eldritch Horror",
    exampleAbility,
    { total: 18 },
    { name: "Player", ac: 15 },
    "hit",
    14
);

// Helper function for ability use messages
function addAbilityUseMessage(creatureName, abilityName, targetName) {
    const message = `${creatureName} uses ${abilityName} → ${targetName}`;
    addCombatMessage(message);
}

// Helper function for roll messages
function addRollMessage(roll, modifier, total, ac, hit) {
    const message = `Attack roll: ${roll} ${modifier ? `+ ${modifier}` : ''} = ${total} vs AC ${ac} ${hit ? 'Hit!' : 'Miss!'}`;
    addCombatMessage(message);
}

// Helper function for damage messages
function addDamageMessage(rolls, total) {
    const message = `Damage rolls: [${rolls.join(', ')}] = ${total}`;
    addCombatMessage(message);
}

// Helper function for effect messages
function addEffectMessage(effect, duration) {
    const message = `Target is ${effect} for ${duration} turn${duration !== 1 ? 's' : ''}!`;
    addCombatMessage(message);
}

function addLootMessage(source, items, messageType = 'drop') {
    const contentContainer = document.querySelector('.chat-content[data-content="loot"]');
    const tab = document.querySelector('.chat-tab[data-tab="loot"]');
    
    if (!contentContainer || !tab) {
        console.error('Loot chat container or tab not found');
        return;
    }

    const message = document.createElement('div');
    message.className = 'message message-loot';
    
    // Create different message content based on type
    let messageHTML = `<span class="timestamp">${new Date().toLocaleTimeString()}</span><br>`;
    
    if (messageType === 'drop') {
        messageHTML += `<span class="creature-name">${source}</span> has dropped: `;
    } else if (messageType === 'collect') {
        messageHTML += `<span class="player-name">${characterState.name}</span> looted: `;
    }

    // Format items with proper styling
    const itemsHTML = items.map(item => 
        `<span class="item-link ${item.rarity.toLowerCase()}" data-item-id="${item.id}">[${item.name}]</span>`
    ).join(', ');

    message.innerHTML = messageHTML + itemsHTML;
    
    // Add hover events for item links
    message.querySelectorAll('.item-link').forEach(itemLink => {
        const itemId = itemLink.dataset.itemId;
        const item = window.items.find(i => i.id.toString() === itemId);
        
        if (item) {
            itemLink.addEventListener('mouseover', (e) => {
                showItemInfo(item, e);
            });
            
            itemLink.addEventListener('mouseout', () => {
                hideItemInfo();
            });
        }
    });
    
    contentContainer.appendChild(message);
    contentContainer.scrollTop = contentContainer.scrollHeight;
    
    // Add unread notification if tab is not active
    if (!tab.classList.contains('active')) {
        tab.classList.add('unread');
    }
}

window.addMessage = addMessage;
window.addChatTab = addChatTab;
window.openWhisperTab = openWhisperTab;
