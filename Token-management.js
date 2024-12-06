// Token-management.js

let draggedToken = null;
let originalPosition = null;
let isPlacingToken = false;
let tempToken = null;

window.targetingMode = false;
window.currentTargeting = null;

const creature = document.querySelector('.token[data-name="Eldritch Horror"]');
if (creature) {
    const abilitiesContainer = createAbilityButtons(creature);
    document.body.appendChild(abilitiesContainer);
}

// Creature Library
const creatureLibrary = [
    {
        name: "Eldritch Horror",
        maxHealth: 150,
        currentHealth: 150,
        maxMana: 200,
        currentMana: 200,
        portraitUrl: "https://i.ibb.co/mRrsdY6/eldritch-horror.webp",
        stats: {
            con: 18,
            str: 20,
            agi: 14,
            int: 16,
            spir: 12,
            cha: 8
        },
        derivedStats: {
            healthRegen: 9,       // con / 2
            manaRegen: 7,         // (int + spir) / 4
            damage: 10,           // str / 2
            spellDamage: 8,       // int / 2
            healing: 6,           // spir / 2
            armor: 7,             // agi / 2
            crit: 3,              // agi / 5
            moveSpeed: 33         // 30 + (agi / 4)
        }
    },
    {
        name: "Plague Bearer",
        maxHealth: 80,
        currentHealth: 80,
        maxMana: 50,
        currentMana: 50,
        portraitUrl: "https://i.ibb.co/Fwmb66F/plaguebearer.webp",
        stats: {
            con: 15,
            str: 10,
            agi: 10,
            int: 8,
            spir: 6,
            cha: 4
        },
        derivedStats: {
            healthRegen: 7,       // con / 2
            manaRegen: 3,         // (int + spir) / 4
            damage: 5,            // str / 2
            spellDamage: 4,       // int / 2
            healing: 3,           // spir / 2
            armor: 5,             // agi / 2
            crit: 2,              // agi / 5
            moveSpeed: 32         // 30 + (agi / 4)
        }
    },
    {
        name: "Shadowfiend",
        maxHealth: 60,
        currentHealth: 60,
        maxMana: 100,
        currentMana: 100,
        portraitUrl: "https://i.ibb.co/HtszFqw/shadowfiend.webp",
        stats: {
            con: 12,
            str: 14,
            agi: 16,
            int: 10,
            spir: 8,
            cha: 6
        },
        derivedStats: {
            healthRegen: 6,       // con / 2
            manaRegen: 4,         // (int + spir) / 4
            damage: 7,            // str / 2
            spellDamage: 5,       // int / 2
            healing: 4,           // spir / 2
            armor: 8,             // agi / 2
            crit: 3,              // agi / 5
            moveSpeed: 34         // 30 + (agi / 4)
        }
    },
    {
        name: "Corrupted Paladin",
        maxHealth: 120,
        currentHealth: 120,
        maxMana: 80,
        currentMana: 80,
        portraitUrl: "https://i.ibb.co/DgrDmHh/Corrupt-Paladin.webp",
        stats: {
            con: 16,
            str: 18,
            agi: 12,
            int: 10,
            spir: 10,
            cha: 8
        },
        derivedStats: {
            healthRegen: 8,       // con / 2
            manaRegen: 5,         // (int + spir) / 4
            damage: 9,            // str / 2
            spellDamage: 5,       // int / 2
            healing: 5,           // spir / 2
            armor: 6,             // agi / 2
            crit: 2,              // agi / 5
            moveSpeed: 33         // 30 + (agi / 4)
        }
    },
    {
        name: "Flesh Golem",
        maxHealth: 200,
        currentHealth: 200,
        maxMana: 0,
        currentMana: 0,
        portraitUrl: "https://i.ibb.co/r4J4Lsq/Flesh-Golem.webp",
        stats: {
            con: 20,
            str: 22,
            agi: 8,
            int: 6,
            spir: 4,
            cha: 2
        },
        derivedStats: {
            healthRegen: 10,      // con / 2
            manaRegen: 2,         // (int + spir) / 4
            damage: 11,           // str / 2
            spellDamage: 3,       // int / 2
            healing: 2,           // spir / 2
            armor: 4,             // agi / 2
            crit: 1,              // agi / 5
            moveSpeed: 32         // 30 + (agi / 4)
        }
    },
    {
        name: "Mindflayer",
        maxHealth: 100,
        currentHealth: 100,
        maxMana: 150,
        currentMana: 150,
        portraitUrl: "https://i.ibb.co/njtgcwy/Mind-Flayer.webp",
        stats: {
            con: 14,
            str: 12,
            agi: 10,
            int: 18,
            spir: 14,
            cha: 10
        },
        derivedStats: {
            healthRegen: 7,       // con / 2
            manaRegen: 8,         // (int + spir) / 4
            damage: 6,            // str / 2
            spellDamage: 9,       // int / 2
            healing: 7,           // spir / 2
            armor: 5,             // agi / 2
            crit: 2,              // agi / 5
            moveSpeed: 32         // 30 + (agi / 4)
        }
    },
    {
        name: "Banshee",
        maxHealth: 70,
        currentHealth: 70,
        maxMana: 120,
        currentMana: 120,
        portraitUrl: "https://i.ibb.co/47YQb2Q/Banshee.webp",
        stats: {
            con: 10,
            str: 8,
            agi: 12,
            int: 14,
            spir: 12,
            cha: 10
        },
        derivedStats: {
            healthRegen: 5,       // con / 2
            manaRegen: 6,         // (int + spir) / 4
            damage: 4,            // str / 2
            spellDamage: 7,       // int / 2
            healing: 6,           // spir / 2
            armor: 6,             // agi / 2
            crit: 2,              // agi / 5
            moveSpeed: 33         // 30 + (agi / 4)
        }
    },
    {
        name: "Necromancer",
        maxHealth: 90,
        currentHealth: 90,
        maxMana: 180,
        currentMana: 180,
        portraitUrl: "https://i.ibb.co/HXYgxqQ/Necromancer.webp",
        stats: {
            con: 12,
            str: 10,
            agi: 8,
            int: 20,
            spir: 14,
            cha: 12
        },
        derivedStats: {
            healthRegen: 6,       // con / 2
            manaRegen: 8,         // (int + spir) / 4
            damage: 5,            // str / 2
            spellDamage: 10,      // int / 2
            healing: 7,           // spir / 2
            armor: 4,             // agi / 2
            crit: 1,              // agi / 5
            moveSpeed: 32         // 30 + (agi / 4)
        }
    },
    {
        name: "Void Wraith",
        maxHealth: 110,
        currentHealth: 110,
        maxMana: 160,
        currentMana: 160,
        portraitUrl: "https://i.ibb.co/YQR0Gbs/Void-Wraith.webp",
        stats: {
            con: 14,
            str: 12,
            agi: 16,
            int: 16,
            spir: 10,
            cha: 8
        },
        derivedStats: {
            healthRegen: 7,       // con / 2
            manaRegen: 6,         // (int + spir) / 4
            damage: 6,            // str / 2
            spellDamage: 8,       // int / 2
            healing: 5,           // spir / 2
            armor: 8,             // agi / 2
            crit: 3,              // agi / 5
            moveSpeed: 34         // 30 + (agi / 4)
        }
    },
    {
        name: "Abyssal Demon",
        maxHealth: 180,
        currentHealth: 180,
        maxMana: 140,
        currentMana: 140,
        portraitUrl: "https://i.ibb.co/dPG4ygG/Abyssal-Demon.webp",
        stats: {
            con: 18,
            str: 20,
            agi: 12,
            int: 10,
            spir: 8,
            cha: 6
        },
        derivedStats: {
            healthRegen: 9,       // con / 2
            manaRegen: 4,         // (int + spir) / 4
            damage: 10,           // str / 2
            spellDamage: 5,       // int / 2
            healing: 4,           // spir / 2
            armor: 6,             // agi / 2
            crit: 2,              // agi / 5
            moveSpeed: 33         // 30 + (agi / 4)
        }
    }
];

// Open and update the character sheet popup
function openAndUpdateCharacterSheet(token) {
    console.log('openAndUpdateCharacterSheet called with token:', token);
    togglePopup('characterSheetPopup', true); // Force open the character sheet
    const characterSheetPopup = document.getElementById('characterSheetPopup');
    console.log('Character sheet popup display after toggle:', characterSheetPopup.style.display);
    if (characterSheetPopup.style.display === 'block') {
        console.log('Updating character sheet');
        updateCharacterStats(token);
        updateDerivedStatsUI(token);
        updateSkillModifiers(token);
    } else {
        console.error('Character sheet popup is not visible after toggle');
    }
}

// Update last mouse position and move temporary token if placing
document.addEventListener('mousemove', (e) => {
    characterState.lastMouseX = e.clientX;
    characterState.lastMouseY = e.clientY;
    if (tempToken) {
        moveTemporaryToken(e);
    }
}); 

// Function to hold a token on the mouse for placement
function holdTokenOnMouse(backgroundImage, initialX, initialY, tokenData) {
    console.log('holdTokenOnMouse called');
    tempToken = document.createElement('div');
    tempToken.classList.add('token', 'temporary-token');
    tempToken.style.backgroundImage = `url('${backgroundImage}')`; // Ensure it's a URL
    tempToken.style.backgroundSize = 'cover';
    tempToken.style.width = `${characterState.gridScale}px`;
    tempToken.style.height = `${characterState.gridScale}px`;
    tempToken.style.position = 'absolute';
    tempToken.style.pointerEvents = 'none';
    
    // Set the data attributes on the temporary token
    tempToken.dataset.name = tokenData.name;
    tempToken.dataset.maxHealth = tokenData.maxHealth;
    tempToken.dataset.currentHealth = tokenData.currentHealth;
    tempToken.dataset.maxMana = tokenData.maxMana;
    tempToken.dataset.currentMana = tokenData.currentMana;
    tempToken.dataset.actionPoints = "0"; // Initialize AP
    tempToken.dataset.portraitUrl = tokenData.portraitUrl;
    tempToken.dataset.isPlayer = tokenData.isPlayer;
    // Add any additional data attributes as needed
    
    // Add the bars and tooltip just like in createTokenElement
    const tooltip = document.createElement('div');
    tooltip.className = 'token-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header">${tokenData.name}</div>
        <div class="tooltip-stats">
            HP: ${tokenData.currentHealth}/${tokenData.maxHealth}
            ${tokenData.isPlayer ? `<br>AP: 0/3` : `<br>AP: 0/10`}
        </div>
    `;
    tempToken.appendChild(tooltip);
    
    // Add health bar
    const healthBarContainer = document.createElement('div');
    healthBarContainer.className = 'token-health-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'token-health-fill';
    healthFill.style.width = `${(tokenData.currentHealth / tokenData.maxHealth) * 100}%`;
    healthBarContainer.appendChild(healthFill);
    tempToken.appendChild(healthBarContainer);
    
    // Store the token data for later use
    tempToken.tokenData = tokenData;

    document.getElementById('grid-overlay').appendChild(tempToken);
    isPlacingToken = true;

    document.addEventListener('mousemove', moveTemporaryToken);

    // Delay attaching the click event listener to avoid immediate invocation
    setTimeout(() => {
        document.addEventListener('click', placeToken, { once: true });
    }, 0);

    // Initial position
    moveTemporaryToken({ clientX: initialX, clientY: initialY });
}



function moveTemporaryToken(e) {
    if (!isPlacingToken) return;

    const container = document.getElementById('vtt-container');
    const rect = container.getBoundingClientRect();
    const gridOverlay = document.getElementById('grid-overlay');
    
    // Calculate the offset of the grid-overlay relative to the container
    const gridOffsetX = parseFloat(gridOverlay.style.left) || 0;
    const gridOffsetY = parseFloat(gridOverlay.style.top) || 0;

    // Adjust for container position, grid-overlay offset, and scale
    const adjustedMouseX = (e.clientX - rect.left - gridOffsetX) / characterState.scale;
    const adjustedMouseY = (e.clientY - rect.top - gridOffsetY) / characterState.scale;

    const gridX = Math.floor(adjustedMouseX / characterState.gridScale);
    const gridY = Math.floor(adjustedMouseY / characterState.gridScale);

    updateTokenHighlight(gridX, gridY);

    if (tempToken) {
        const pixelX = gridX * characterState.gridScale;
        const pixelY = gridY * characterState.gridScale;
        
        tempToken.style.left = `${pixelX}px`;
        tempToken.style.top = `${pixelY}px`;
        tempToken.style.width = `${characterState.gridScale}px`;
        tempToken.style.height = `${characterState.gridScale}px`;
    }
}


// Update the token highlight on the grid
function updateTokenHighlight(gridX, gridY) {
    let highlight = document.getElementById('token-highlight');
    if (!highlight) {
        highlight = document.createElement('div');
        highlight.id = 'token-highlight';
        document.getElementById('grid-overlay').appendChild(highlight);
    }

    const pixelX = gridX * characterState.gridScale;
    const pixelY = gridY * characterState.gridScale;

    highlight.style.left = `${pixelX}px`;
    highlight.style.top = `${pixelY}px`;
    highlight.style.width = `${characterState.gridScale}px`;
    highlight.style.height = `${characterState.gridScale}px`;
    highlight.style.display = 'block';
}

function updateTokenAP(token) {
    if (!token) return;
    
    const ap = parseInt(token.dataset.actionPoints) || 0;
    
    // Update AP bar if it exists
    const apBar = token.querySelector('.token-ap-bar');
    if (apBar) {
        const apFill = apBar.querySelector('.token-ap-fill');
        if (apFill) {
            apFill.style.width = `${(ap / 10) * 100}%`;
        }

        const apText = apBar.querySelector('.token-ap-text');
        if (apText) {
            apText.textContent = `AP: ${ap}/10`;
        }
    }

    // Update hover tooltip
    const tooltip = token.querySelector('.tooltip-stats');
    if (tooltip) {
        const apInfo = tooltip.innerHTML.match(/AP: \d+\/10/);
        if (apInfo) {
            tooltip.innerHTML = tooltip.innerHTML.replace(/AP: \d+\/10/, `AP: ${ap}/10`);
        }
    }

    // If this is the current target, update target display
    if (characterState.currentTarget === token) {
        updateTargetInfo(token);
    }
}

// Update movement arrow (optional feature)
function updateMovementArrow(startX, startY, endX, endY) {
    let arrow = document.getElementById('movement-arrow');
    if (!arrow) {
        arrow = document.createElement('div');
        arrow.id = 'movement-arrow';
        arrow.style.zIndex = '50'; // Set a lower z-index than context menus
        document.getElementById('grid-overlay').appendChild(arrow);
    }

    // Calculate the center of the start and end tiles
    const startCenterX = (startX + 0.5) * characterState.gridScale;
    const startCenterY = (startY + 0.5) * characterState.gridScale;
    const endCenterX = (endX + 0.5) * characterState.gridScale;
    const endCenterY = (endY + 0.5) * characterState.gridScale;

    // Calculate angle and length based on tile centers
    const angle = Math.atan2(endCenterY - startCenterY, endCenterX - startCenterX) * 180 / Math.PI;
    const length = Math.sqrt((endCenterX - startCenterX) ** 2 + (endCenterY - startCenterY) ** 2);

    arrow.style.width = `${length}px`;
    arrow.style.transform = `rotate(${angle}deg)`;
    arrow.style.left = `${startCenterX}px`;
    arrow.style.top = `${startCenterY}px`;
    arrow.style.display = 'block';
    arrow.style.opacity = '1';
    arrow.style.transition = 'none';
    arrow.style.pointerEvents = 'none'; // Ensure arrow doesn't block clicks

    // Position the distance display
    let distanceDisplay = document.getElementById('distance-display');
    if (!distanceDisplay) {
        distanceDisplay = document.createElement('div');
        distanceDisplay.id = 'distance-display';
        distanceDisplay.style.zIndex = '51'; // Set z-index slightly higher than arrow
        distanceDisplay.style.pointerEvents = 'none'; // Ensure display doesn't block clicks
        document.getElementById('grid-overlay').appendChild(distanceDisplay);
    }

    // Calculate distance in feet
    const distanceFeet = Math.round(length / characterState.gridScale * 5);

    // Update display based on movement data
    if (draggedToken && draggedToken.movement) {
        const moveSpeed = parseInt(draggedToken.dataset.moveSpeed) || 30;
        const currentUnlocked = draggedToken.movement.movementUsed === 0 ? 
            moveSpeed : 
            draggedToken.movement.paidMovement || moveSpeed;
        const movementCost = calculateMovementAPCost(draggedToken, distanceFeet, moveSpeed);

        distanceDisplay.innerHTML = `
            <span>${distanceFeet} ft</span>
            <br>
            <span>Used: ${draggedToken.movement.movementUsed}/${currentUnlocked} ft</span>
            <br>
            <span>AP Cost: ${movementCost.apCost}</span>
        `;
    } else {
        distanceDisplay.innerHTML = `${distanceFeet} ft`;
    }

    // Position the distance display
    distanceDisplay.style.left = `${(startCenterX + endCenterX) / 2}px`;
    distanceDisplay.style.top = `${((startCenterY + endCenterY) / 2) - 20}px`;
    distanceDisplay.style.display = 'block';
    distanceDisplay.style.color = '#ffffff';
}

function resetMovementForAllTokens() {
    const tokens = document.querySelectorAll('.token');
    tokens.forEach(token => {
        if (window.combatState?.isInCombat) {
            // Reset movementUsed at the start of the turn
            token.movement.movementUsed = 0;
            // Optionally, reset paidMovement if AP is refreshed each turn
            // token.movement.paidMovement = 0;
        }
    });
    console.log('Movement reset for all tokens.');
}


// Function to place the token on the grid
function placeToken(e) {
    console.log('placeToken called');
    if (!isPlacingToken || !tempToken) return;

    const container = document.getElementById('vtt-container');
    const rect = container.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / characterState.scale;
    const mouseY = (e.clientY - rect.top) / characterState.scale;

    const gridX = Math.floor(mouseX / characterState.gridScale);
    const gridY = Math.floor(mouseY / characterState.gridScale);

    let placedToken;
    // Use the tokenData stored in tempToken
    const tokenData = tempToken.tokenData || {
        name: "Unknown",
        maxHealth: 100,
        currentHealth: 100,
        maxMana: 100,
        currentMana: 100,
        portraitUrl: tempToken.style.backgroundImage.slice(5, -2), // Extract URL from style
        isPlayer: false
    };
    placedToken = createTokenElement(gridX, gridY, tokenData);

    placedToken.style.left = `${gridX * characterState.gridScale}px`;
    placedToken.style.top = `${gridY * characterState.gridScale}px`;
    placedToken.dataset.gridX = gridX;
    placedToken.dataset.gridY = gridY;
    placedToken.style.display = 'block'; // Ensure the token is visible
    placedToken.style.pointerEvents = 'auto'; // Make sure it's interactive

    if (tempToken && tempToken.parentNode) {
        tempToken.parentNode.removeChild(tempToken);
    }
    tempToken = null;
    isPlacingToken = false;
    draggedToken = null;

    // Re-add event listeners for token interactions
    placedToken.addEventListener('mousedown', startDraggingToken);
    placedToken.addEventListener('contextmenu', handleTokenContextMenu);

    document.removeEventListener('mousemove', moveTemporaryToken);
    document.removeEventListener('click', placeToken);

    clearTokenHighlight();
}





function createCreatureLibraryUI() {
    let libraryContainer = document.getElementById('creatureLibrary');
    if (!libraryContainer) {
        return; // Use existing HTML structure instead of creating new
    }

    // Get the content container
    const content = libraryContainer.querySelector('.popup-content');
    if (!content) {
        console.error('Could not find popup-content in creature library');
        return;
    }

    // Clear existing content
    content.innerHTML = '';

    // Add creatures from the creatureLibrary array
    creatureLibrary.forEach(creature => {
        const creatureElement = document.createElement('div');
        creatureElement.className = 'creature-item';
        creatureElement.innerHTML = `
            <img src="${creature.portraitUrl}" alt="${creature.name}">
            <span>${creature.name}</span>
        `;
        creatureElement.addEventListener('click', () => {
            placeCreatureToken(creature);
            toggleCreatureLibrary(); // Close library after selection
        });
        content.appendChild(creatureElement);
    });

    // Log for debugging
    console.log(`Populated creature library with ${creatureLibrary.length} creatures`);
}

function toggleCreatureLibrary() {
    console.log('Toggling creature library');
    
    const libraryContainer = document.getElementById('creatureLibrary');
    if (!libraryContainer) {
        console.error('Creature library container not found');
        return;
    }

    // Close other popups first
    document.querySelectorAll('.popup').forEach(popup => {
        if (popup !== libraryContainer) {
            popup.style.display = 'none';
            popup.classList.remove('visible'); // Ensure other popups are hidden
        }
    });

    // Toggle visibility
    const isVisible = libraryContainer.style.display === 'block' || libraryContainer.classList.contains('visible');
    if (isVisible) {
        libraryContainer.style.display = 'none';
        libraryContainer.classList.remove('visible');
    } else {
        libraryContainer.style.display = 'block';
        libraryContainer.classList.add('visible');

        // Ensure the creature library has position fixed
        const computedStyle = getComputedStyle(libraryContainer);
        if (computedStyle.position !== 'absolute' && computedStyle.position !== 'fixed') {
            libraryContainer.style.position = 'fixed';
        }

        // Recreate content when opening
        createCreatureLibraryUI();
    }

    // Toggle button state
    const libraryButton = document.getElementById('creatureLibraryButton');
    if (libraryButton) {
        libraryButton.classList.toggle('active-button', !isVisible);
    }

    console.log(`Creature library visibility: ${!isVisible}`);
}






// In the function where you create the player token
function placePlayerToken(x, y) {
    // Check if a player token already exists
    const existingPlayerToken = document.querySelector('.token.player-token');
    if (existingPlayerToken) {
        console.warn('Player token already exists');
        return null;
    }

    const playerTokenData = {
        name: characterState.name || "Player",
        maxHealth: characterState.derivedStats.maxHealth,
        currentHealth: characterState.derivedStats.currentHealth,
        maxMana: characterState.derivedStats.maxMana,
        currentMana: characterState.derivedStats.currentMana,
        portraitUrl: document.getElementById('characterBouble')?.src || "default-player.png",
        isPlayer: true,
        con: characterState.totalStats.con,
        str: characterState.totalStats.str,
        agi: characterState.totalStats.agi,
        int: characterState.totalStats.int,
        spir: characterState.totalStats.spir,
        cha: characterState.totalStats.cha
    };
    
    
    console.log("Creating player token with data:", playerTokenData);
    return createTokenElement(x, y, playerTokenData);
}






function placeCreatureToken(creature) {
    // Clean up existing temporary token if any
    if (tempToken && tempToken.parentNode) {
        tempToken.parentNode.removeChild(tempToken);
    }
    
    // Remove existing event listeners
    document.removeEventListener('mousemove', moveTemporaryToken);
    document.removeEventListener('click', placeToken);
    
    // Prepare token data
    const tokenData = {
        name: creature.name, // Must match exactly with creatureLibrary
        maxHealth: creature.maxHealth,
        currentHealth: creature.currentHealth,
        maxMana: creature.maxMana,
        currentMana: creature.currentMana,
        portraitUrl: creature.portraitUrl,
        isPlayer: false,
        con: creature.stats.con,
        str: creature.stats.str,
        agi: creature.stats.agi,
        int: creature.stats.int,
        spir: creature.stats.spir,
        cha: creature.stats.cha
    };
    
    // Close the creature library first
    createCreatureLibraryUI();
    
    // Use setTimeout to delay the token placement setup until after the current click event
    setTimeout(() => {
        holdTokenOnMouse(
            creature.portraitUrl, 
            characterState.lastMouseX || 0, 
            characterState.lastMouseY || 0, 
            tokenData
        );
    }, 0);
}




// Update createTokenElement to properly handle player tokens
function createTokenElement(gridX, gridY, tokenData) {
    const token = document.createElement('div');
    token.className = 'token';
    
    // Set up base token data
    if (tokenData.isPlayer) {
        token.classList.add('player-token');
    }

    // Generate unique ID if not provided
    token.id = tokenData.id || `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Set up all token data attributes with defaults
    const defaultStats = {
        name: 'Unknown',
        currentHealth: 100,
        maxHealth: 100,
        currentMana: 100,
        maxMana: 100,
        con: 10,
        str: 10,
        agi: 10,
        int: 10,
        spir: 10,
        cha: 10,
        actionPoints: tokenData.isPlayer ? (characterState?.combat?.actionPoints || 3) : 10, // Initialize AP
        armor: 10,
        initiative: 0,
        moveSpeed: tokenData.moveSpeed || 10 // Set to 10 ft as per your movement system
    };

    // Merge defaults with provided data
    Object.entries({ ...defaultStats, ...tokenData }).forEach(([key, value]) => {
        token.dataset[key] = value;
    });

    // Ensure 'name' is set correctly
    token.dataset.name = tokenData.name || 'Unknown';

    // Initialize movement data
    token.movement = {
        movementUsed: 0,
        paidMovement: 0,
        baseSpeed: parseInt(token.dataset.moveSpeed) || 10
    };

    // Ensure actionPoints are correctly set for player tokens
    if (tokenData.isPlayer) {
        // Overwrite actionPoints from characterState.combat if available
        token.dataset.actionPoints = (characterState?.combat?.actionPoints || 3).toString();
    } else {
        token.dataset.actionPoints = "10"; // Default AP for NPCs
    }

    // Set position and appearance
    token.style.backgroundImage = `url('${token.dataset.portraitUrl}')`;
    token.style.backgroundSize = 'cover';
    token.style.width = `${characterState.gridScale}px`;
    token.style.height = `${characterState.gridScale}px`;
    token.style.left = `${gridX * characterState.gridScale}px`;
    token.style.top = `${gridY * characterState.gridScale}px`;
    token.dataset.gridX = gridX;
    token.dataset.gridY = gridY;

    // Create AP bar container for player tokens
    if (tokenData.isPlayer) {
        const apBarContainer = document.createElement('div');
        apBarContainer.className = 'token-ap-bar';

        const apFill = document.createElement('div');
        apFill.className = 'token-ap-fill';
        apFill.style.width = `${(parseInt(token.dataset.actionPoints) / 3) * 100}%`; // Assuming max AP is 3

        const apText = document.createElement('div');
        apText.className = 'token-ap-text';
        apText.textContent = `AP: ${token.dataset.actionPoints}/3`;

        apBarContainer.appendChild(apFill);
        apBarContainer.appendChild(apText);
        token.appendChild(apBarContainer);
    }

    // Create health bar
    const healthBarContainer = document.createElement('div');
    healthBarContainer.className = 'token-health-bar';

    const healthFill = document.createElement('div');
    healthFill.className = 'token-health-fill';
    healthFill.style.width = `${(parseInt(token.dataset.currentHealth) / parseInt(token.dataset.maxHealth)) * 100}%`;

    healthBarContainer.appendChild(healthFill);
    token.appendChild(healthBarContainer);

    // Add event listeners
    token.addEventListener('mousedown', startDraggingToken);
    token.addEventListener('contextmenu', handleTokenContextMenu);

    // Add hover tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'token-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header">${token.dataset.name}</div>
        <div class="tooltip-stats">
            HP: ${token.dataset.currentHealth}/${token.dataset.maxHealth}
            ${tokenData.isPlayer ? `<br>AP: ${token.dataset.actionPoints}/3` : ''}
        </div>
    `;
    token.appendChild(tooltip);

    // Add to grid
    document.getElementById('grid-overlay').appendChild(token);
    console.log("Created token with dataset:", token.dataset);

    // Initialize stats from creatureLibrary
    updateTokenCombatStats(token);

    // Update AP display if needed
    if (tokenData.isPlayer) {
        updateTokenAP(token);
    }

    // Update token visuals immediately
    updateTokenVisuals(token);

    return token;
}


function calculateCreatureDerivedStats(stats) {
    return {
        maxHealth: stats.con * 5,
        maxMana: stats.int * 5,
        healthRegen: Math.floor(stats.con / 2),
        manaRegen: Math.floor((stats.int + stats.spir) / 4),
        damage: Math.floor(stats.str / 2),
        spellDamage: Math.floor(stats.int / 2),
        healing: Math.floor(stats.spir / 2),
        armor: Math.floor(stats.agi / 2),
        crit: Math.floor(stats.agi / 5),
        moveSpeed: 30 + Math.floor(stats.agi / 4),
        carryingCapacity: stats.str * 15
    };
}

function calculateMovementAPCost(token, distance, baseSpeed = 30) {
    if (!window.combatState?.isInCombat) {
        return { apCost: 0, wouldExceedMovement: false };
    }

    // Get correct movement speed - prioritize token stats, fall back to character state for player tokens
    let moveSpeed;
    if (token.classList.contains('player-token')) {
        moveSpeed = parseInt(characterState.derivedStats.moveSpeed) || baseSpeed;
    } else {
        moveSpeed = parseInt(token.dataset.moveSpeed) || baseSpeed;
    }

    // Ensure valid numbers and initialize
    distance = parseInt(distance) || 0;

    // Initialize movement if not exists
    if (!token.movement) {
        token.movement = {
            movementUsed: 0,
            paidMovement: 0,
            moveSpeed: moveSpeed
        };
    }

    const movementUsed = parseInt(token.movement.movementUsed) || 0;
    const paidMovement = parseInt(token.movement.paidMovement) || 0;
    let apCost = 0;
    let newTotalMovement = movementUsed + distance;

    console.log(`Initial movement state:
        Token name: ${token.dataset.name}
        Movement speed: ${moveSpeed} ft
        Currently used: ${movementUsed} ft
        Attempting to move: ${distance} ft
        Currently paid movement: ${paidMovement} ft
    `);

    // First movement of turn
    if (movementUsed === 0) {
        // First AP unlocks one movement speed worth
        apCost = 1;
        
        // If attempting to move further than one movement speed
        if (distance > moveSpeed) {
            const extraDistance = distance - moveSpeed;
            apCost += Math.ceil(extraDistance / moveSpeed);
        }
    } else {
        // Already moving - check if exceeding current unlocked movement
        const currentlyUnlocked = paidMovement > 0 ? paidMovement : moveSpeed;
        
        if (newTotalMovement > currentlyUnlocked) {
            // Need to unlock more movement
            const remainingNeeded = newTotalMovement - currentlyUnlocked;
            apCost = Math.ceil(remainingNeeded / moveSpeed);
        }
    }

    console.log(`Movement Cost Calculation:
        Movement Speed: ${moveSpeed} ft
        Current Movement Used: ${movementUsed} ft
        Attempting to Move: ${distance} ft
        New Total Movement: ${newTotalMovement} ft
        Currently Unlocked Movement: ${paidMovement || moveSpeed} ft
        AP Cost: ${apCost}
    `);

    return {
        apCost: apCost,
        totalDistance: distance,
        wouldExceedMovement: false,
        availableMovement: paidMovement || moveSpeed,
        newTotalMovement: newTotalMovement,
        moveSpeed: moveSpeed
    };
}

function applyMovementCost(token, movementCost, distance) {
    if (!token || !movementCost) return false;

    const currentAP = parseInt(token.dataset.actionPoints) || 0;
    const moveSpeed = movementCost.moveSpeed;
    
    if (currentAP < movementCost.apCost) {
        return false;
    }

    // Update AP
    token.dataset.actionPoints = (currentAP - movementCost.apCost).toString();

    // Update movement tracking
    if (!token.movement) {
        token.movement = {
            movementUsed: 0,
            paidMovement: 0,
            moveSpeed: moveSpeed
        };
    }

    // If this is first movement or we're paying additional AP
    if (movementCost.apCost > 0) {
        if (token.movement.movementUsed === 0) {
            // First AP of turn unlocks one movement speed
            token.movement.paidMovement = moveSpeed;
            // Additional APs unlock more movement
            if (movementCost.apCost > 1) {
                token.movement.paidMovement += (movementCost.apCost - 1) * moveSpeed;
            }
        } else {
            // Additional movement purchases
            token.movement.paidMovement += movementCost.apCost * moveSpeed;
        }
    }

    token.movement.movementUsed += distance;

    return true;
}

function updateDerivedStatsUI(token) {
    if (!token) return;

    const derivedStatsUI = document.querySelector('.derived-stats-container'); // Adjust selector as needed

    if (!derivedStatsUI) {
        console.error('Derived stats UI container not found.');
        return;
    }

    // Clear existing derived stats
    derivedStatsUI.innerHTML = '';

    // List of derived stats to display
    const derivedStatsList = [
        { label: 'Health Regen', key: 'healthRegen' },
        { label: 'Mana Regen', key: 'manaRegen' },
        { label: 'Damage', key: 'damage' },
        { label: 'Spell Damage', key: 'spellDamage' },
        { label: 'Healing', key: 'healing' },
        { label: 'Armor', key: 'armor' },
        { label: 'Crit', key: 'crit' },
        { label: 'Move Speed', key: 'moveSpeed' }
    ];

    derivedStatsList.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.className = 'derived-stat';
        statElement.textContent = `${stat.label}: ${token.dataset[stat.key] || 0}`;
        derivedStatsUI.appendChild(statElement);
    });

    console.log('Derived stats UI updated:', derivedStatsUI.innerHTML);
}


function startDraggingToken(e) {
    if (e.button !== 0 || e.detail === 2) return; 
    e.preventDefault();
    e.stopPropagation();

    if (this.classList.contains('stunned')) {
        addCombatMessage(`${this.dataset.name} is stunned and cannot move!`);
        return;
    }

    if (window.combatState?.isInCombat) {
        const currentTurn = window.combatState.currentRoundCombatants[window.combatState.currentTurnIndex];
        if (!currentTurn || currentTurn.element !== this) {
            addCombatMessage("Can only move on your turn!");
            return;
        }
    }

    draggedToken = this;
    originalPosition = {
        gridX: parseInt(draggedToken.dataset.gridX) || 0,
        gridY: parseInt(draggedToken.dataset.gridY) || 0,
        left: draggedToken.style.left,
        top: draggedToken.style.top
    };

    // Get base speed from token
    const baseSpeed = parseInt(draggedToken.dataset.moveSpeed) || 30;
    if (!draggedToken.movement || !window.combatState?.isInCombat) {
        draggedToken.movement = {
            movementUsed: 0,
            baseSpeed: baseSpeed,
            paidMovement: 0
        };
    }

    let isAwaitingConfirmation = false;

    const moveHandler = (moveEvent) => {
        if (isAwaitingConfirmation) return;
    
        const gridOverlay = document.getElementById('grid-overlay');
        const rect = gridOverlay.getBoundingClientRect();
        const x = (moveEvent.clientX - rect.left) / characterState.scale;
        const y = (moveEvent.clientY - rect.top) / characterState.scale;
    
        const currentGridX = Math.floor(x / characterState.gridScale);
        const currentGridY = Math.floor(y / characterState.gridScale);
    
        const dx = currentGridX - originalPosition.gridX;
        const dy = currentGridY - originalPosition.gridY;
        const distance = Math.round(Math.sqrt(dx * dx + dy * dy) * 5); // Assuming 5 feet per grid square
    
        if (window.combatState?.isInCombat) {
            const movementCost = calculateMovementAPCost(draggedToken, distance, baseSpeed);
            const currentAP = parseInt(draggedToken.dataset.actionPoints) || 0;
    
            let distanceDisplay = document.getElementById('distance-display');
            if (!distanceDisplay) {
                distanceDisplay = document.createElement('div');
                distanceDisplay.id = 'distance-display';
                gridOverlay.appendChild(distanceDisplay);
            }

            const currentUnlocked = draggedToken.movement.movementUsed === 0 ? 
                movementCost.moveSpeed : 
                draggedToken.movement.paidMovement || movementCost.moveSpeed;
    
            const canMoveWithinBudget = (draggedToken.movement.movementUsed + distance) <= currentUnlocked;
            const canMoveWithAP = currentAP >= movementCost.apCost;
    
            distanceDisplay.innerHTML = `
                <span>Move: ${distance} ft</span>
                <br>Movement Used: ${draggedToken.movement.movementUsed}/${currentUnlocked} ft
                <br>AP Cost: ${movementCost.apCost}
            `;
            distanceDisplay.style.color = (canMoveWithinBudget || canMoveWithAP) ? '#ffffff' : '#ff4444';
    
            console.log(`Can Move Within Budget: ${canMoveWithinBudget}, Can Move With AP: ${canMoveWithAP}`);
    
            if (canMoveWithinBudget || canMoveWithAP) {
                draggedToken.style.left = `${currentGridX * characterState.gridScale}px`;
                draggedToken.style.top = `${currentGridY * characterState.gridScale}px`;
                updateMovementArrow(originalPosition.gridX, originalPosition.gridY, currentGridX, currentGridY);
            }
        } else {
            // Non-combat movement
            draggedToken.style.left = `${currentGridX * characterState.gridScale}px`;
            draggedToken.style.top = `${currentGridY * characterState.gridScale}px`;
            updateMovementArrow(originalPosition.gridX, originalPosition.gridY, currentGridX, currentGridY);
    
            let distanceDisplay = document.getElementById('distance-display');
            if (!distanceDisplay) {
                distanceDisplay = document.createElement('div');
                distanceDisplay.id = 'distance-display';
                gridOverlay.appendChild(distanceDisplay);
            }
            distanceDisplay.innerHTML = `${distance} ft`;
            distanceDisplay.style.color = '#ffffff';
        }
    };

    const upHandler = async () => {
        if (!draggedToken || isAwaitingConfirmation) return;
    
        const tokenRef = draggedToken;
        const newGridX = Math.floor(parseFloat(tokenRef.style.left) / characterState.gridScale);
        const newGridY = Math.floor(parseFloat(tokenRef.style.top) / characterState.gridScale);
    
        if (!window.combatState?.isInCombat) {
            tokenRef.dataset.gridX = newGridX;
            tokenRef.dataset.gridY = newGridY;
            finishMove();
            return;
        }
    
        const dx = newGridX - originalPosition.gridX;
        const dy = newGridY - originalPosition.gridY;
        const distance = Math.round(Math.sqrt(dx * dx + dy * dy) * 5);
    
        console.log(`Finalizing Movement:
            New GridX: ${newGridX}, GridY: ${newGridY}
            Distance: ${distance} ft
        `);
    
        const movementCost = calculateMovementAPCost(tokenRef, distance, tokenRef.movement.baseSpeed);
        const currentAP = parseInt(tokenRef.dataset.actionPoints) || 0;
    
        if (movementCost.apCost > 0) {
            if (currentAP < movementCost.apCost) {
                revertPosition();
                addCombatMessage("Not enough AP for movement!");
                finishMove();
                return;
            }
    
            isAwaitingConfirmation = true;
            const confirmMove = await showConfirmationDialog(
                `Moving ${distance} ft will cost ${movementCost.apCost} AP. Confirm movement?`,
                'Confirm Movement'
            );
    
            if (confirmMove) {
                const newAP = currentAP - movementCost.apCost;
                
                // Update token AP
                tokenRef.dataset.actionPoints = newAP.toString();
    
                // Update movement tracking
                tokenRef.movement.paidMovement += movementCost.apCost * movementCost.moveSpeed;
                tokenRef.movement.movementUsed += distance;
    
                // Update combat and character states for player token
                if (tokenRef.classList.contains('player-token')) {
                    if (!characterState.combat) characterState.combat = {};
                    characterState.combat.actionPoints = newAP;
                    characterState.movement = tokenRef.movement;
                    
                    // Update HUD with new AP value
                    updateAPBar(newAP);
                }
    
                // Update position
                tokenRef.dataset.gridX = newGridX;
                tokenRef.dataset.gridY = newGridY;
    
                const currentUnlocked = tokenRef.movement.movementUsed === 0 ? 
                    movementCost.moveSpeed : 
                    tokenRef.movement.paidMovement;
    
                // Update token visuals
                updateTokenBars(tokenRef);
                
                addCombatMessage(
                    `${tokenRef.dataset.name} spent ${movementCost.apCost} AP for movement ` +
                    `(${tokenRef.movement.movementUsed}/${currentUnlocked} ft used)`
                );
            } else {
                revertPosition();
            }
        } else {
            tokenRef.movement.movementUsed += distance;
            tokenRef.dataset.gridX = newGridX;
            tokenRef.dataset.gridY = newGridY;
    
            const currentUnlocked = tokenRef.movement.paidMovement || movementCost.moveSpeed;
            addCombatMessage(
                `${tokenRef.dataset.name} moved ${distance} ft ` +
                `(${tokenRef.movement.movementUsed}/${currentUnlocked} ft used)`
            );
        }
    
        isAwaitingConfirmation = false;
        finishMove();
    };

    function revertPosition() {
        if (draggedToken) {
            draggedToken.style.left = originalPosition.left;
            draggedToken.style.top = originalPosition.top;
            draggedToken.dataset.gridX = originalPosition.gridX;
            draggedToken.dataset.gridY = originalPosition.gridY;
        }
    }

    function finishMove() {
        const arrow = document.getElementById('movement-arrow');
        const distanceDisplay = document.getElementById('distance-display');

        if (arrow || distanceDisplay) {
            setTimeout(() => {
                if (arrow) startFadeOut(arrow);
                if (distanceDisplay) startFadeOut(distanceDisplay);
            }, 0);

            setTimeout(() => {
                arrow?.remove();
                distanceDisplay?.remove();
            }, 2000);
        }

        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        draggedToken = null;
    }

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
}



// Add this helper function for the confirmation dialog
function showConfirmationDialog(message, title = 'Confirm') {
    return new Promise((resolve) => {
        // Remove any existing dialogs
        document.querySelectorAll('.confirmation-dialog').forEach(dialog => dialog.remove());

        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="dialog-buttons">
                    <button class="confirm-btn">Confirm</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);

        function removeDialog() {
            dialog.remove();
        }
        
        dialog.querySelector('.confirm-btn').onclick = () => {
            removeDialog();
            resolve(true);
        };
        
        dialog.querySelector('.cancel-btn').onclick = () => {
            removeDialog();
            resolve(false);
        };

        // Click outside to cancel
        dialog.onclick = (e) => {
            if (e.target === dialog) {
                removeDialog();
                resolve(false);
            }
        };
    });
}

// Snap the token to the nearest grid position
function snapTokenToGrid(token) {
    const gridX = Math.round(parseFloat(token.style.left) / characterState.gridScale);
    const gridY = Math.round(parseFloat(token.style.top) / characterState.gridScale);

    token.dataset.gridX = gridX;
    token.dataset.gridY = gridY;
    token.style.left = `${gridX * characterState.gridScale}px`;
    token.style.top = `${gridY * characterState.gridScale}px`;
}

function initializeTokenContextMenus() {
    console.log('Initializing token context menus');
    const tokens = document.querySelectorAll('.token');
    console.log('Found tokens:', tokens.length);
    
    tokens.forEach(token => {
        token.removeEventListener('contextmenu', handleTokenContextMenu);
        token.addEventListener('contextmenu', handleTokenContextMenu);
        console.log('Added context menu handler to token:', token);
    });
}

// Handle the context menu event on a token
function handleTokenContextMenu(e) {
    console.log('handleTokenContextMenu triggered');
    e.preventDefault();
    e.stopPropagation();
    
    const token = e.currentTarget;
    console.log('Token right-clicked:', token);
    
    if (!token) {
        console.error('No token found in event');
        return;
    }
    
    characterState.currentToken = token;
    showTokenContextMenu(e, token);
}



// Show the custom context menu for a token
function showTokenContextMenu(e, token) {
    console.log('showTokenContextMenu called');
    
    // Remove any existing menu
    const existingMenu = document.getElementById('contextMenu');
    if (existingMenu) existingMenu.remove();
    
    // Create new menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu';
    
    // Apply all styles directly in JavaScript
    contextMenu.style.cssText = `
        position: fixed;
        left: ${e.pageX}px;
        top: ${e.pageY}px;
        background-color: rgba(20, 12, 8, 0.95);
        border: 2px solid #8B0000;
        box-shadow: 0 0 10px #FF4500, inset 0 0 5px #FF4500;
        padding: 8px 0;
        border-radius: 8px;
        z-index: 9999; // Ensure it's above other elements
        display: block;
        min-width: 150px;
        pointer-events: auto; // Ensure clicks are captured
    `;
    
    const menuHTML = `
        <div style="
            padding: 8px 15px;
            cursor: pointer;
            color: #FFD700;
            font-family: 'Diablo', serif;
            text-shadow: 1px 1px 2px #000;
            transition: all 0.3s ease;
        " data-action="addNote">Add Note</div>
        <div style="
            padding: 8px 15px;
            cursor: pointer;
            color: #FFD700;
            font-family: 'Diablo', serif;
            text-shadow: 1px 1px 2px #000;
            transition: all 0.3s ease;
        " data-action="remove">Remove Token</div>
        <div style="
            padding: 8px 15px;
            cursor: pointer;
            color: #FFD700;
            font-family: 'Diablo', serif;
            text-shadow: 1px 1px 2px #000;
            transition: all 0.3s ease;
        " data-action="inspect">Inspect</div>
        <div style="
            padding: 8px 15px;
            cursor: pointer;
            color: #FFD700;
            font-family: 'Diablo', serif;
            text-shadow: 1px 1px 2px #000;
            transition: all 0.3s ease;
        " data-action="target">Target</div>
    `;
    
    contextMenu.innerHTML = menuHTML;
    document.body.appendChild(contextMenu);
    
    // Add hover effect listeners
    const menuItems = contextMenu.children;
    Array.from(menuItems).forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'rgba(255,69,0,0.2)';
            item.style.transform = 'scale(1.05)';
            item.style.textShadow = '0 0 8px #FFD700, 0 0 15px #FF4500';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
            item.style.transform = 'scale(1)';
            item.style.textShadow = '1px 1px 2px #000';
        });
        
        item.addEventListener('click', (event) => {
            event.stopPropagation();
            const action = item.dataset.action;
            switch(action) {
                case 'addNote':
                    showNotePopup(token);
                    break;
                case 'remove':
                    token.remove();
                    break;
                case 'inspect':
                    if (token.classList.contains('player-token')) {
                        openAndUpdateCharacterSheet(token);
                    } else {
                        openCreatureSheet(token);
                    }
                    break;
                case 'target':
                    targetToken(token);
                    break;
            }
            contextMenu.remove();
        });
    });

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

// Hide the custom context menu
function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

// Close context menu if clicked outside
function closeContextMenuOutside(e) {
    const contextMenu = document.getElementById('contextMenu');
    if (!contextMenu.contains(e.target)) {
        hideContextMenu();
    }
}

// Update showNotePopup to sync with creature sheet
function showNotePopup(token) {
    const notePopup = document.createElement('div');
    notePopup.className = 'note-popup';
    notePopup.style.position = 'absolute';
    const rect = token.getBoundingClientRect();
    notePopup.style.left = `${rect.left}px`;
    notePopup.style.top = `${rect.top - 120}px`;
    notePopup.style.zIndex = '1003';
    
    notePopup.innerHTML = `
        <textarea class="note-input" placeholder="Enter note...">${token.dataset.note || ''}</textarea>
        <div class="note-buttons">
            <button class="save-note">Save</button>
            <button class="cancel-note">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(notePopup);
    
    const textarea = notePopup.querySelector('.note-input');
    textarea.focus();
    
    notePopup.querySelector('.save-note').addEventListener('click', () => {
        const note = textarea.value.trim();
        if (note) {
            token.dataset.note = note;
            // Update note in creature sheet if it's open
            const creatureSheet = document.getElementById('creatureSheetPopup');
            if (creatureSheet && creatureSheet.style.display === 'block') {
                const notesArea = creatureSheet.querySelector('.notes-area');
                if (notesArea) notesArea.value = note;

                // Switch to notes tab
                const notesTab = creatureSheet.querySelector('[data-tab="notes"]');
                if (notesTab) notesTab.click();
            }
        }
        notePopup.remove();
    });
    
    notePopup.querySelector('.cancel-note').addEventListener('click', () => {
        notePopup.remove();
    });
}

function updatePlayerToken() {
    const playerToken = document.querySelector('.token.player-token');
    if (playerToken) {
        playerToken.dataset.maxHealth = characterState.derivedStats.maxHealth;
        playerToken.dataset.currentHealth = characterState.derivedStats.currentHealth;
        playerToken.dataset.maxMana = characterState.derivedStats.maxMana;
        playerToken.dataset.currentMana = characterState.derivedStats.currentMana;
        playerToken.dataset.name = "Player";  // Set the player's name
    }
}

// Call this function whenever the player's stats change
document.addEventListener('DOMContentLoaded', updatePlayerToken);

// Main target token function
function targetToken(token) {
    console.log('Targeting token:', token);
    
    // Remove targeting from all other tokens
    document.querySelectorAll('.token.targeted').forEach(t => {
        t.classList.remove('targeted');
    });
    
    // Add targeting to selected token
    token.classList.add('targeted');
    
    const targetDisplay = document.getElementById('targetDisplay');
    if (!targetDisplay) {
        console.error('Target display element not found');
        return;
    }

    // Show the target display
    targetDisplay.style.display = 'block';

    // Update target info
    updateTargetInfo(token);

    // Store current target
    characterState.currentTarget = token;

    // Add context menu event listener
    targetDisplay.removeEventListener('contextmenu', handleTargetContextMenu);
    targetDisplay.addEventListener('contextmenu', handleTargetContextMenu);

    // Make target display draggable (if not already)
    makeTargetDisplayDraggable(targetDisplay);
}



function clearTargeting() {
    document.querySelectorAll('.token.targeted').forEach(t => {
        t.classList.remove('targeted');
    });
    const targetDisplay = document.getElementById('targetDisplay');
    if (targetDisplay) {
        targetDisplay.style.display = 'none';
    }
    characterState.currentTarget = null;
}

// Update updateTargetInfo to properly handle player tokens
function updateTargetInfo(token) {
    if (!token) {
        console.log("No token provided to updateTargetInfo");
        return;
    }

    const targetDisplay = document.getElementById('targetDisplay');
    if (!targetDisplay) {
        console.log("Target display element not found");
        return;
    }

    const isPlayerToken = token.classList.contains('player-token');
    let tokenData;

    try {
        // Get token data based on type
        if (isPlayerToken) {
            tokenData = {
                name: characterState.name || "Player",
                currentHealth: characterState.derivedStats.currentHealth,
                maxHealth: characterState.derivedStats.maxHealth,
                currentMana: characterState.derivedStats.currentMana,
                maxMana: characterState.derivedStats.maxMana,
                actionPoints: characterState.combat?.actionPoints || 0,
                stats: characterState.totalStats,
                derivedStats: characterState.derivedStats,
                portraitUrl: document.getElementById('characterBouble')?.src
            };
        } else {
            tokenData = {
                name: token.dataset.name || "Unknown",
                currentHealth: parseInt(token.dataset.currentHealth) || 0,
                maxHealth: parseInt(token.dataset.maxHealth) || 100,
                currentMana: parseInt(token.dataset.currentMana) || 0,
                maxMana: parseInt(token.dataset.maxMana) || 100,
                actionPoints: parseInt(token.dataset.actionPoints) || 0,
                stats: {
                    con: parseInt(token.dataset.constitution) || 10,
                    str: parseInt(token.dataset.strength) || 10,
                    agi: parseInt(token.dataset.agility) || 10,
                    int: parseInt(token.dataset.intelligence) || 10,
                    spir: parseInt(token.dataset.spirit) || 10,
                    cha: parseInt(token.dataset.charisma) || 10
                },
                portraitUrl: token.dataset.portraitUrl
            };
            tokenData.derivedStats = calculateDerivedStats(tokenData.stats);
        }

        // Update display elements
        const nameElement = targetDisplay.querySelector('.target-name');
        if (nameElement) nameElement.textContent = tokenData.name;

        // Update health bar
        const healthBar = document.getElementById('targetHealthBar');
        const healthPercent = (tokenData.currentHealth / tokenData.maxHealth) * 100;
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
            healthBar.style.backgroundColor = healthPercent <= 25 ? '#ff4444' : 
                                            healthPercent <= 50 ? '#ffaa00' : '#44ff44';
        }

        // Update health value
        const healthValue = document.getElementById('targetHealthValue');
        if (healthValue) {
            healthValue.textContent = `${tokenData.currentHealth}/${tokenData.maxHealth}`;
        }

        // Update mana bar
        const manaBar = document.getElementById('targetManaBar');
        if (manaBar) {
            const manaPercent = (tokenData.currentMana / tokenData.maxMana) * 100;
            manaBar.style.width = `${manaPercent}%`;
        }

        // Update mana value
        const manaValue = document.getElementById('targetManaValue');
        if (manaValue) {
            manaValue.textContent = `${tokenData.currentMana}/${tokenData.maxMana}`;
        }

        // Update AP bar and value
        let apContainer = targetDisplay.querySelector('.target-ap-container');
        if (!apContainer) {
            apContainer = document.createElement('div');
            apContainer.className = 'target-ap-container';
            targetDisplay.querySelector('.target-content').appendChild(apContainer);
        }

        apContainer.innerHTML = `
            <div class="ap-bar">
                <div class="ap-fill" style="width: ${(tokenData.actionPoints / 10) * 100}%"></div>
                <div class="ap-text">AP: ${tokenData.actionPoints}/10</div>
            </div>
        `;

        // Update portrait
        const portrait = document.getElementById('targetPortrait');
        if (portrait && tokenData.portraitUrl) {
            portrait.src = tokenData.portraitUrl;
        }

        // Update stats displays
        Object.entries(tokenData.stats).forEach(([stat, value]) => {
            updateStatsDisplay(targetDisplay, `.stat-${stat}`, value);
        });

        // Update derived stats
        if (tokenData.derivedStats) {
            const derivedStatsList = ['healthRegen', 'manaRegen', 'damage', 'spellDamage', 'armor'];
            derivedStatsList.forEach(stat => {
                updateStatsDisplay(targetDisplay, `.stat-${stat}`, tokenData.derivedStats[stat]);
            });
        }

        // Update debuffs display
        let debuffsContainer = targetDisplay.querySelector('.target-debuffs');
        if (!debuffsContainer) {
            debuffsContainer = document.createElement('div');
            debuffsContainer.className = 'target-debuffs';
            targetDisplay.querySelector('.target-content').appendChild(debuffsContainer);
        }

        debuffsContainer.innerHTML = ''; // Clear existing debuffs

        if (token.activeDebuffs && token.activeDebuffs.length > 0) {
            token.activeDebuffs.forEach(debuff => {
                const debuffIcon = document.createElement('div');
                debuffIcon.className = 'debuff-icon';
                debuffIcon.title = `${debuff.name} (${debuff.duration} turns remaining)`;

                // Optionally, set icon image based on debuff type or name
                // Replace 'path_to_debuff_icon.png' with actual icon paths
                debuffIcon.innerHTML = `<img src="path_to_debuff_icon.png" alt="${debuff.name}">`;

                debuffsContainer.appendChild(debuffIcon);
            });
        }

        // Show the target display
        targetDisplay.style.display = 'block';

    } catch (error) {
        console.error("Error updating target info:", error);
    }
}



// Make target display draggable
function makeTargetDisplayDraggable(targetDisplay) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    targetDisplay.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.button === 0) { // Left click only
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            // Only start dragging if clicking the background, not interactive elements
            if (e.target === targetDisplay || e.target.classList.contains('target-content')) {
                isDragging = true;
            }
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, targetDisplay);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

function handleTargetContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    // Remove any existing context menus
    const existingMenu = document.getElementById('targetContextMenu');
    if (existingMenu) {
        existingMenu.remove();
    }

    // Create new context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'targetContextMenu';
    contextMenu.className = 'context-menu';
    contextMenu.style.cssText = `
        position: fixed;
        left: ${e.pageX}px;
        top: ${e.pageY}px;
        background-color: rgba(20, 12, 8, 0.95);
        border: 2px solid #8B0000;
        box-shadow: 0 0 10px #FF4500, inset 0 0 5px #FF4500;
        padding: 8px 0;
        border-radius: 8px;
        z-index: 10000;
        display: block;
        min-width: 150px;
        pointer-events: auto;
    `;

    // Create menu items
    const menuItems = [
        { action: 'closeTarget', text: 'Close Target' },
        { action: 'inspectTarget', text: 'Inspect' }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.dataset.action = item.action;
        menuItem.textContent = item.text;
        menuItem.style.cssText = `
            padding: 8px 15px;
            cursor: pointer;
            color: #FFD700;
            font-family: 'Diablo', serif;
            text-shadow: 1px 1px 2px #000;
            transition: all 0.3s ease;
        `;

        // Add hover effects
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = 'rgba(255,69,0,0.2)';
            menuItem.style.transform = 'scale(1.05)';
            menuItem.style.textShadow = '0 0 8px #FFD700, 0 0 15px #FF4500';
        });

        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = 'transparent';
            menuItem.style.transform = 'scale(1)';
            menuItem.style.textShadow = '1px 1px 2px #000';
        });

        // Add click handler
        menuItem.addEventListener('click', () => {
            handleTargetContextMenuAction(item.action);
            contextMenu.remove();
        });

        contextMenu.appendChild(menuItem);
    });

    document.body.appendChild(contextMenu);

    // Close menu when clicking outside
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 0);
}



// Handle target context menu actions
function handleTargetContextMenuAction(action) {
    switch(action) {
        case 'closeTarget':
            clearTargeting();
            break;
        case 'inspectTarget':
            if (characterState.currentTarget) {
                if (characterState.currentTarget.classList.contains('player-token')) {
                    openAndUpdateCharacterSheet(characterState.currentTarget);
                } else {
                    openCreatureSheet(characterState.currentTarget);
                }
            }
            break;
    }
}

function updateCombatantStats(combatant) {
    if (!combatant || !combatant.element) return;
    
    const token = combatant.element;
    
    // Update token dataset
    token.dataset.currentHealth = combatant.currentHealth;
    token.dataset.actionPoints = combatant.actionPoints;
    
    // Update visuals
    updateTokenVisuals(token);
    
    // Update HUD if player
    if (token.classList.contains('player-token')) {
        updateHUD(token);
    }
    
    // Update target display if targeted
    if (characterState.currentTarget === token) {
        updateTargetInfo(token);
    }
}

function handleTargetSelection(e) {
    if (!window.currentTargeting) return;

    const gridOverlay = document.getElementById('grid-overlay');
    const rect = gridOverlay.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / characterState.scale;
    const mouseY = (e.clientY - rect.top) / characterState.scale;
    
    const x = Math.floor(mouseX / characterState.gridScale);
    const y = Math.floor(mouseY / characterState.gridScale);

    const target = getTokenAtPosition(x, y);
    if (!target) {
        addCombatMessage("No target at selected location!");
        return;
    }

    // Get source and ability info
    const source = window.currentTargeting.source;
    const ability = window.currentTargeting.ability;

    // Check range
    const sourceX = parseInt(source.dataset.gridX);
    const sourceY = parseInt(source.dataset.gridY);
    const targetX = parseInt(target.dataset.gridX);
    const targetY = parseInt(target.dataset.gridY);
    
    const distance = Math.sqrt(
        Math.pow(targetX - sourceX, 2) + 
        Math.pow(targetY - sourceY, 2)
    );

    if (distance > ability.range) {
        addCombatMessage("Target out of range!");
        return;
    }

    // Execute the ability
    const success = ability.execute(source, target);
    if (success) {
        cleanupTargeting();
    }
}

function checkRange(caster, target, range) {
    const dx = Math.abs(caster.dataset.gridX - target.dataset.gridX);
    const dy = Math.abs(caster.dataset.gridY - target.dataset.gridY);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= range;
}



function getTokensInRadius(centerX, centerY, radius) {
    const tokens = document.querySelectorAll('.token');
    return Array.from(tokens).filter(token => {
        const dx = Math.abs(token.dataset.gridX - centerX);
        const dy = Math.abs(token.dataset.gridY - centerY);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= radius;
    });
}

function getTokenAtPosition(gridX, gridY) {
    const tokens = document.querySelectorAll('.token');
    return Array.from(tokens).find(token => 
        parseInt(token.dataset.gridX) === gridX && 
        parseInt(token.dataset.gridY) === gridY
    );
}

function showRangeIndicator(caster, range) {
    let indicator = document.getElementById('range-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'range-indicator';
        document.getElementById('grid-overlay').appendChild(indicator);
    }

    const size = range * 2 * characterState.gridScale;
    indicator.style.width = `${size}px`;
    indicator.style.height = `${size}px`;
    
    const casterX = parseInt(caster.dataset.gridX) * characterState.gridScale;
    const casterY = parseInt(caster.dataset.gridY) * characterState.gridScale;
    
    indicator.style.left = `${casterX - (size/2 - characterState.gridScale/2)}px`;
    indicator.style.top = `${casterY - (size/2 - characterState.gridScale/2)}px`;
    indicator.style.display = 'block';
}

function cleanupTargeting() {
    // Clear targeting mode
    window.targetingMode = false;
    window.currentTargeting = null;

    // Reset cursor
    document.body.style.cursor = 'default';
    
    // Remove any range indicators
    const rangeIndicator = document.getElementById('range-indicator');
    if (rangeIndicator) {
        rangeIndicator.remove();
    }

    // Remove any AOE indicators
    const aoeIndicator = document.getElementById('aoe-indicator');
    if (aoeIndicator) {
        aoeIndicator.remove();
    }

    // Remove targeting preview
    document.removeEventListener('mousemove', updateTargetingPreview);
    document.removeEventListener('click', handleTargetSelection);

    // Remove targeting classes from tokens
    document.querySelectorAll('.token').forEach(token => {
        token.classList.remove('out-of-range');
        token.classList.remove('valid-target');
    });
}

function cleanupTooltips() {
    hideItemInfo();
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

function cleanupAllTemporaryTokens() {
    // Remove all temporary tokens
    document.querySelectorAll('.temporary-token, .token-preview, #token-highlight').forEach(el => el.remove());
    
    // Reset all flags and states
    tempToken = null;
    isPlacingToken = false;
    window.currentPlacingToken = null;
    
    // Remove event listeners
    document.removeEventListener('mousemove', moveTemporaryToken);
    document.removeEventListener('click', placeToken);
}

document.addEventListener('click', (e) => {
    // Only clean up tooltips if we're not clicking on a loot orb or item
    if (!e.target.closest('.loot-orb') && !e.target.closest('.item-link')) {
        cleanupTooltips();
    }
});

function updateTokenVisuals(token) {
    if (!token) return;

    const currentHealth = parseInt(token.dataset.currentHealth) || 0;
    const maxHealth = parseInt(token.dataset.maxHealth) || 100;
    const currentMana = parseInt(token.dataset.currentMana) || 0;
    const maxMana = parseInt(token.dataset.maxMana) || 100;

    // Update health bar
    const healthBar = token.querySelector('.token-health-fill');
    if (healthBar) {
        const healthPercent = (currentHealth / maxHealth) * 100;
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

    // Update hover tooltip
    const tooltip = token.querySelector('.token-tooltip');
    if (tooltip) {
        tooltip.innerHTML = `
            <div class="tooltip-header">${token.dataset.name}</div>
            <div class="tooltip-stats">
                HP: ${currentHealth}/${maxHealth}
                ${token.dataset.maxMana ? `<br>MP: ${currentMana}/${maxMana}` : ''}
                ${!token.classList.contains('player-token') ? `<br>AP: ${token.dataset.actionPoints || 0}/10` : ''}
            </div>
        `;
    }

    // Update target display if this is the current target
    if (characterState.currentTarget === token) {
        updateTargetInfo(token);
    }
}

function openCreatureSheet(token) {
    if (!token) return;

    const sheet = document.getElementById('creatureSheetPopup');
    if (!sheet) return;

    // Initialize/update token stats
    initializeTokenStats(token);
    updateCreatureSheetStats(token);
    
    // Store reference
    characterState.currentToken = token;

    // Show the sheet
    sheet.style.display = 'block';

    // Activate first tab
    const firstTab = sheet.querySelector('.tab-buttons > *');
    if (firstTab) firstTab.click();

    // Use your original makeSheetDraggable implementation
    makeSheetDraggable(sheet);
}





// Helper function to update notes in creature sheet
function updateCreatureSheetNotes(token) {
    const sheet = document.getElementById('creatureSheetPopup');
    if (sheet && sheet.style.display === 'block') {
        const notesArea = sheet.querySelector('.notes-area');
        if (notesArea) {
            notesArea.value = token.dataset.note || '';
        }
        
        // Switch to notes tab
        const notesTab = sheet.querySelector('[data-tab="notes"]');
        if (notesTab) notesTab.click();
    }
}

function updateCreatureSheetStats(token) {
    const sheet = document.getElementById('creatureSheetPopup');
    if (!sheet) return;

    const creature = creatureLibrary.find(c => c.name === token.dataset.name);
    if (!creature) return;

    // Core stats
    updateStatValue(sheet, 'health', `${creature.currentHealth}/${creature.maxHealth}`);
    updateStatValue(sheet, 'mana', `${creature.currentMana}/${creature.maxMana}`);

    // Base stats
    updateStatValue(sheet, 'constitution', creature.stats.con);
    updateStatValue(sheet, 'strength', creature.stats.str);
    updateStatValue(sheet, 'agility', creature.stats.agi);
    updateStatValue(sheet, 'intelligence', creature.stats.int);
    updateStatValue(sheet, 'spirit', creature.stats.spir);
    updateStatValue(sheet, 'charisma', creature.stats.cha);

    // Derived stats
    updateStatValue(sheet, 'healthRegen', creature.derivedStats.healthRegen);
    updateStatValue(sheet, 'manaRegen', creature.derivedStats.manaRegen);
    updateStatValue(sheet, 'damage', creature.derivedStats.damage);
    updateStatValue(sheet, 'rangedDamage', creature.derivedStats.damage);
    updateStatValue(sheet, 'spellDamage', creature.derivedStats.spellDamage);
    updateStatValue(sheet, 'healing', creature.derivedStats.healing);
    updateStatValue(sheet, 'armor', creature.derivedStats.armor);
    updateStatValue(sheet, 'criticalChance', creature.derivedStats.crit);
    updateStatValue(sheet, 'movementSpeed', creature.derivedStats.moveSpeed);
}



function initializeTokenStats(token) {
    if (!token || !token.dataset) return;

    const creature = creatureLibrary.find(c => c.name === token.dataset.name);
    if (!creature) return;

    // Core stats
    token.dataset.maxHealth = creature.maxHealth;
    token.dataset.currentHealth = creature.currentHealth;
    token.dataset.maxMana = creature.maxMana;
    token.dataset.currentMana = creature.currentMana;

    // Base stats
    token.dataset.constitution = creature.stats.con;
    token.dataset.strength = creature.stats.str;
    token.dataset.agility = creature.stats.agi;
    token.dataset.intelligence = creature.stats.int;
    token.dataset.spirit = creature.stats.spir;
    token.dataset.charisma = creature.stats.cha;

    // Derived stats
    Object.entries(creature.derivedStats).forEach(([key, value]) => {
        token.dataset[key] = value;
    });

    // Add ranged damage if not present
    if (!token.dataset.rangedDamage) {
        token.dataset.rangedDamage = creature.derivedStats.damage;
    }
}

// Update makeSheetDraggable to work with new header structure
function makeSheetDraggable(sheet) {
    if (!sheet) return;
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    
    const header = sheet.querySelector('.sheet-header');
    if (!header) return;

    function handleMouseDown(e) {
        // Don't drag if clicking buttons or tabs
        if (e.target.closest('.close-button') || e.target.closest('.tab-button')) {
            return;
        }

        isDragging = true;
        initialX = e.clientX - sheet.offsetLeft;
        initialY = e.clientY - sheet.offsetTop;
    }

    function handleMouseMove(e) {
        if (!isDragging) return;

        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        sheet.style.left = `${currentX}px`;
        sheet.style.top = `${currentY}px`;
    }

    function handleMouseUp() {
        isDragging = false;
    }

    // Clean up old event listeners if they exist
    header.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Add new event listeners
    header.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}


// Animate movement arrow (optional feature)
function animateMovementArrow() {
    const arrow = document.getElementById('movement-arrow');
    const distanceDisplay = document.getElementById('distance-display');
    if (arrow) {
        arrow.style.opacity = '1';
        setTimeout(() => {
            arrow.style.opacity = '0';
            setTimeout(() => {
                arrow.style.display = 'none';
            }, 2000);
        }, 100);
    }
    if (distanceDisplay) {
        distanceDisplay.style.opacity = '1';
        setTimeout(() => {
            distanceDisplay.style.opacity = '0';
            setTimeout(() => {
                distanceDisplay.style.display = 'none';
            }, 2000);
        }, 100);
    }
}

// Update all tokens (e.g., after grid or zoom changes)
function updateTokens() {
    console.log('Updating tokens');
    const tokens = document.querySelectorAll('.token:not(.temporary-token)');
    tokens.forEach(token => {
        const gridX = parseFloat(token.dataset.gridX);
        const gridY = parseFloat(token.dataset.gridY);
        token.style.left = `${gridX * characterState.gridScale}px`;
        token.style.top = `${gridY * characterState.gridScale}px`;
        token.style.width = `${characterState.gridScale}px`;
        token.style.height = `${characterState.gridScale}px`;
    });
}

function updateStatValue(sheet, statName, value) {
    const element = sheet.querySelector(`.${statName}-value`);
    if (element) {
        element.textContent = value;
    }
}

function updateTokenCombatStats(token) {
    if (!token || !token.dataset) {
        console.error('updateTokenCombatStats: Invalid token provided');
        return;
    }

    const creatureName = token.dataset.name;
    const creature = creatureLibrary.find(c => c.name === creatureName);

    if (!creature) {
        console.error(`Creature "${creatureName}" not found in library`);
        return;
    }

    // Update core stats
    const coreStats = {
        maxHealth: creature.maxHealth,
        currentHealth: creature.currentHealth,
        maxMana: creature.maxMana,
        currentMana: creature.currentMana,
        actionPoints: token.dataset.actionPoints || "10"
    };

    // Update base stats (stats object from library)
    const baseStats = {
        constitution: creature.stats.con,
        strength: creature.stats.str,
        agility: creature.stats.agi,
        intelligence: creature.stats.int,
        spirit: creature.stats.spir,
        charisma: creature.stats.cha
    };

    // Update derived stats from library
    const derivedStats = {
        healthRegen: creature.derivedStats.healthRegen,
        manaRegen: creature.derivedStats.manaRegen,
        damage: creature.derivedStats.damage,
        spellDamage: creature.derivedStats.spellDamage,
        healing: creature.derivedStats.healing,
        armor: creature.derivedStats.armor,
        crit: creature.derivedStats.crit,
        moveSpeed: creature.derivedStats.moveSpeed
    };

    // Apply all stats to token dataset
    Object.entries({...coreStats, ...baseStats, ...derivedStats}).forEach(([key, value]) => {
        token.dataset[key] = value;
        console.log(`Setting ${key} to ${value}`);
    });

    // Update visual elements
    updateTokenVisuals(token);

    // If this token is currently being inspected in creature sheet, update the display
    const creatureSheet = document.getElementById('creatureSheetPopup');
    if (creatureSheet && creatureSheet.style.display === 'block' && 
        characterState.currentToken === token) {
        updateCreatureSheetStats(token);
    }

    console.log(`Stats updated for ${creatureName}:`, {
        core: coreStats,
        base: baseStats,
        derived: derivedStats
    });
}




function syncTokenDisplays(token) {
    const isPlayerToken = token.classList.contains('player-token');
    
    // Get current values
    let currentHealth, maxHealth, currentAP;
    if (isPlayerToken) {
        currentHealth = characterState.derivedStats.currentHealth;
        maxHealth = characterState.derivedStats.maxHealth;
        currentAP = characterState.combat?.actionPoints || 0;
    } else {
        currentHealth = parseInt(token.dataset.currentHealth);
        maxHealth = parseInt(token.dataset.maxHealth);
        currentAP = parseInt(token.dataset.actionPoints);
    }

    // Update hover tooltip
    const tooltip = token.querySelector('.token-tooltip');
    if (tooltip) {
        tooltip.innerHTML = `
            <div class="tooltip-header">${token.dataset.name}</div>
            <div class="tooltip-stats">
                HP: ${currentHealth}/${maxHealth}
                ${!isPlayerToken ? `<br>AP: ${currentAP}/10` : ''}
            </div>
        `;
    }

    // Update health bar below token
    const healthBar = token.querySelector('.token-health-fill');
    if (healthBar) {
        healthBar.style.width = `${(currentHealth / maxHealth) * 100}%`;
    }

    // Update target display if this is the current target
    if (characterState.currentTarget === token) {
        updateTargetInfo(token);
    }

    // Add floating combat text for health changes
    const previousHealth = parseInt(token.dataset.previousHealth) || currentHealth;
    if (previousHealth !== currentHealth) {
        showFloatingCombatText(token, currentHealth - previousHealth);
        token.dataset.previousHealth = currentHealth;
    }
}


// Select a token (highlighting)
function selectToken(tokenElement) {
    if (characterState.currentToken) {
        characterState.currentToken.classList.remove('selected');
    }
    characterState.currentToken = tokenElement;
    characterState.currentToken.classList.add('selected');
    console.log(`Token selected: ${characterState.currentToken.id}`);
}

// Animate arrow movement (optional feature)
function animateArrow(startX, startY, endX, endY, token, callback) {
    const arrow = document.getElementById('movement-arrow');
    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        updateMovementPreview(startX, startY, currentX, currentY);

        // Move the token along with the arrow
        token.style.left = `${currentX * characterState.gridScale * characterState.scale}px`;
        token.style.top = `${currentY * characterState.gridScale * characterState.scale}px`;
        token.style.transform = `scale(${characterState.scale})`;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            // Animation complete
            callback();
            // Keep the arrow visible for 3 seconds after animation
            setTimeout(() => {
                arrow.style.display = 'none';
            }, 3000);
        }
    }

    requestAnimationFrame(step);
}

// Update tokens on zoom (ensure tokens scale correctly)
function updateTokensOnZoom() {
    const tokens = document.querySelectorAll('.token');
    tokens.forEach(token => {
        const gridX = parseInt(token.dataset.gridX);
        const gridY = parseInt(token.dataset.gridY);
        const pixelSize = characterState.gridScale / characterState.scale;
        token.style.left = `${gridX * characterState.gridScale / characterState.scale}px`;
        token.style.top = `${gridY * characterState.gridScale / characterState.scale}px`;
        token.style.width = `${pixelSize}px`;
        token.style.height = `${pixelSize}px`;
    });

    updateTokenHighlight();
    updateMovementPreview();
}

// Setup map dragging functionality (if not already handled in vtt-main.js)
function setupMapDragging() {
    const container = document.getElementById('vtt-container');
    let isDragging = false;
    let startX, startY;

    container.addEventListener('mousedown', (e) => {
        if (e.ctrlKey && e.button === 0) {  // Check for Ctrl key and left mouse button
            isDragging = true;
            startX = e.clientX - container.offsetLeft;
            startY = e.clientY - container.offsetTop;
            e.preventDefault();
            e.stopPropagation();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && e.ctrlKey) {
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            container.style.left = `${x}px`;
            container.style.top = `${y}px`;
            e.preventDefault();
            e.stopPropagation();
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            e.preventDefault();
            e.stopPropagation();
        }
    });

    // Prevent default drag behavior
    container.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // Stop dragging if Ctrl key is released
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Control') {
            isDragging = false;
        }
    });
}

// Initialize map dragging after DOM is loaded
document.addEventListener('DOMContentLoaded', setupMapDragging);

// Clear token highlight
function clearTokenHighlight() {
    const highlight = document.getElementById('token-highlight');
    if (highlight) {
        highlight.style.display = 'none';
    }
}

// Clear highlight when mouse leaves the container
document.getElementById('vtt-container').addEventListener('mouseleave', clearTokenHighlight);

// Ensure all existing tokens have the correct event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.token').forEach(token => {
        token.removeEventListener('contextmenu', pickUpToken); // Remove old handlers
        token.addEventListener('contextmenu', handleTokenContextMenu); // Add new handler
// Initialize the roll loot button
initializeRollLootButton();
    })
    })


    document.addEventListener('DOMContentLoaded', () => {
        initializeCreatureSheet();
        
    });

// Fade out elements smoothly
function startFadeOut(element) {
    element.style.transition = 'opacity 2s linear';
    element.style.opacity = '0';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing creature library...');
    
    // Create initial UI
    createCreatureLibraryUI();

    // Handle button clicks
    const libraryButton = document.getElementById('creatureLibraryButton');
    if (libraryButton) {
        libraryButton.addEventListener('click', toggleCreatureLibrary);
    }

    // Handle hotkeys
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyL' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            // Don't trigger if typing in an input
            if (!document.activeElement.matches('input, textarea, [contenteditable]')) {
                e.preventDefault();
                toggleCreatureLibrary();
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing token context menus');
    initializeTokenContextMenus();
    
    // Also watch for new tokens being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('token')) {
                        console.log('New token added, adding context menu handler:', node);
                        node.addEventListener('contextmenu', handleTokenContextMenu);
                    }
                });
            }
        });
    });

    const gridOverlay = document.getElementById('grid-overlay');
    if (gridOverlay) {
        observer.observe(gridOverlay, { childList: true });
        console.log('Observing grid overlay for new tokens');
    }
});


 