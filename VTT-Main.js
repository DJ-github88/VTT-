// VTT-Main.js
let zoom = 1;
let isResizing = false; // Add this line

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



// DOM elements
const vttContainer = document.getElementById('vtt-container');
const vttBackground = document.getElementById('vtt-background');
const backgroundImage = document.getElementById('background-image');
const characterBouble = document.getElementById('characterBouble');
const gridOverlay = document.getElementById('grid-overlay');
const settingsButton = document.getElementById('settingsButton');
const settingsMenu = document.getElementById('settingsMenu');
const closeSettingsMenu = document.getElementById('closeSettingsMenu');
const setBackgroundButton = document.getElementById('setBackgroundButton');
const setGridScaleButton = document.getElementById('setGridScaleButton');

// Toggle the visibility of the settings menu
function toggleSettingsMenu() {
    settingsMenu.classList.toggle('visible');
} 

// Setup all necessary event listeners
function setupEventListeners() {
    // Right-click on character bubble to show context menu
    characterBouble.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showContextMenu(e);
    });

    // Add token to grid from context menu
    document.getElementById("addToken").addEventListener("click", (e) => {
        console.log("Add Player Token option clicked.");
        holdTokenOnMouse(characterBouble.src, characterState.lastMouseX, characterState.lastMouseY);
        hideContextMenu();
    });

    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#contextMenu') && !e.target.closest('#characterBouble')) {
            hideContextMenu();
        }
    });

    // Zoom handling with Ctrl + wheel
    vttContainer.addEventListener('wheel', handleZoom, { passive: false });

    // Mouse events for dragging the map
    vttContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Settings menu toggle
    settingsButton.addEventListener('click', toggleSettingsMenu);
    closeSettingsMenu.addEventListener('click', toggleSettingsMenu);
}

// Handle zooming with Ctrl + mouse wheel
function handleZoom(e) {
    if (!e.ctrlKey) {
        e.preventDefault();
        return; // Exit if Ctrl is not pressed
    }

    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    let newScale = characterState.scale * delta;

    if (newScale >= characterState.minScale && newScale <= characterState.maxScale) {
        const rect = vttContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate the percentage of the mouse position within the container
        const originX = (mouseX / rect.width) * 100;
        const originY = (mouseY / rect.height) * 100;

        // Set the transform origin to the mouse position
        vttContainer.style.transformOrigin = `${originX}% ${originY}%`;

        // Update the scale
        characterState.scale = newScale;

        // Apply the new transform
        vttContainer.style.transform = `scale(${characterState.scale})`;

        updateGridAndTokens();
    }
}

// Handle mouse down for dragging the map
function handleMouseDown(e) {
    if (e.button === 0 && e.ctrlKey) { // Left mouse button and Ctrl key
        e.preventDefault();
        characterState.isDragging = true;
        characterState.startX = e.clientX - characterState.currentX;
        characterState.startY = e.clientY - characterState.currentY;
        vttContainer.style.cursor = 'grabbing';
    }
}

// Handle mouse move for dragging the map
function handleMouseMove(e) {
    if (characterState.isDragging && e.buttons === 1 && e.ctrlKey) {
        e.preventDefault();
        characterState.currentX = e.clientX - characterState.startX;
        characterState.currentY = e.clientY - characterState.startY;
        updateGridAndTokens();
    }
}

// Handle mouse up to stop dragging the map
function handleMouseUp() {
    if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        navigation.classList.remove('dragging', 'resizing');
        
        // If horizontal, reset button sizes to be even
        if (!navigation.classList.contains('nav-diagonal')) {
            const buttons = navigation.querySelectorAll('.nav-button');
            const navWidth = navigation.offsetWidth;
            const buttonWidth = Math.floor(navWidth / buttons.length);
            buttons.forEach(button => {
                button.style.width = `${buttonWidth}px`;
            });
        }
        
        saveNavSettings();
    }
}

// Update the background and grid position based on current state
function updateBackgroundPosition() {
    const transform = `translate(${characterState.currentX}px, ${characterState.currentY}px) scale(${characterState.scale})`;
    vttBackground.style.transform = transform;
    gridOverlay.style.transform = transform;
}

// Setup the custom context menu
function setupContextMenu() {
    let contextMenu = document.getElementById("contextMenu");
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.classList.add('context-menu');
        document.body.appendChild(contextMenu);
    }
    contextMenu.innerHTML = `
        <div class="context-menu-item" id="addToken">Add Player Token to Grid</div>
    `;
}

// Show the custom context menu at the cursor position
function showContextMenu(e) {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = "block";
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.left = `${e.pageX}px`;
}

// Hide the custom context menu
function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = "none";
}

// Show a temporary message (e.g., notifications)
function showTemporaryMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
        }, 500);
    }, 3000);
}

// Define an initialization flag
const eventListenersInitialized = {
    settings: false,
    dragAndZoom: false,
    tokenManagement: false,
    // Add other flags as needed
};

// Initialize settings for background and grid scale
function initializeSettings() {
    if (eventListenersInitialized.settings) return; // Prevent re-initialization

    // Set background image
    setBackgroundButton.addEventListener('click', handleSetBackground);

    // Set grid scale
    setGridScaleButton.addEventListener('click', handleSetGridScale);

    // Hide settings menu when clicking outside
    document.addEventListener('click', handleOutsideSettingsClick);

    eventListenersInitialized.settings = true; // Update flag
}

function handleSetBackground() {
    const fileInput = document.getElementById('backgroundImageInput');
    const setBackgroundButton = document.getElementById('setBackgroundButton');

    if (!fileInput || !setBackgroundButton) {
        console.error('Background image input or button not found');
        return;
    }

    // Remove any existing event listeners to prevent duplicates
    setBackgroundButton.removeEventListener('click', handleSetBackgroundClick);
    setBackgroundButton.addEventListener('click', handleSetBackgroundClick);

    function handleSetBackgroundClick() {
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const backgroundImage = document.getElementById('background-image');
                    if (backgroundImage) {
                        backgroundImage.src = event.target.result;
                        backgroundImage.onload = () => {
                            if (typeof createGrid === 'function') {
                                createGrid();
                            }
                            if (typeof updateGridAndTokens === 'function') {
                                updateGridAndTokens();
                            }
                            // Reapply highlight functionality
                            if (typeof setupGridHighlight === 'function') {
                                setupGridHighlight();
                            }
                            console.log('Background image updated and highlight reapplied');
                        };
                    } else {
                        console.error('Background image element not found');
                    }
                };
                reader.readAsDataURL(file);
            } else {
                console.log('Please select a valid image file.');
            }
        } else {
            console.log('No file selected');
        }
    }
}


function handleSetGridScale() {
    const gridScaleInput = document.getElementById('gridScaleInput');
    const newScale = parseInt(gridScaleInput.value);
    if (!isNaN(newScale) && newScale >= characterState.minGridScale && newScale <= characterState.maxGridScale) {
        // Only update if the scale has actually changed
        if (newScale !== characterState.gridScale) {
            characterState.gridScale = newScale;
            
            // Debounce the grid creation and update
            debounce(() => {
                createGrid();
                updateGridAndTokens();
                // Reapply highlight functionality
                if (typeof setupGridHighlight === 'function') {
                    setupGridHighlight();
                }
                console.log('Grid scale updated and highlight reapplied');
            }, 100)();
        }
    } else {
        alert(`Please enter a grid scale between ${characterState.minGridScale} and ${characterState.maxGridScale}.`);
    }
}

// Debounce function to limit the frequency of expensive operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function handleOutsideSettingsClick(e) {
    if (!settingsMenu.contains(e.target) && !settingsButton.contains(e.target)) {
        settingsMenu.classList.remove('visible');
    }
}

let updateScheduled = false;

function updateGridAndTokens() {
    if (!updateScheduled) {
        updateScheduled = true;
        requestAnimationFrame(() => {
            const container = document.getElementById('vtt-container');
            const gridOverlay = document.getElementById('grid-overlay');
            const tokens = document.querySelectorAll('.token');

            if (container && gridOverlay) {
                const transform = `translate(${characterState.currentX}px, ${characterState.currentY}px) scale(${characterState.scale})`;
                container.style.transform = transform;

                // Only update grid overlay size if it has changed
                const newWidth = `${characterState.mapWidth}px`;
                const newHeight = `${characterState.mapHeight}px`;
                if (gridOverlay.style.width !== newWidth || gridOverlay.style.height !== newHeight) {
                    gridOverlay.style.width = newWidth;
                    gridOverlay.style.height = newHeight;
                }

                tokens.forEach(token => {
                    const gridX = parseInt(token.dataset.gridX);
                    const gridY = parseInt(token.dataset.gridY);
                    token.style.left = `${gridX * characterState.gridScale}px`;
                    token.style.top = `${gridY * characterState.gridScale}px`;
                    token.style.width = `${characterState.gridScale}px`;
                    token.style.height = `${characterState.gridScale}px`;
                });
            }
            updateScheduled = false;
        });
    }
}

// Update token highlights (if applicable)
function updateTokenHighlight() {
    const tokens = document.querySelectorAll('.token');
    tokens.forEach(token => {
        const gridX = parseInt(token.dataset.gridX);
        const gridY = parseInt(token.dataset.gridY);
        const highlightX = gridX + characterState.highlightX;
        const highlightY = gridY + characterState.highlightY;
        token.style.backgroundPosition = `${highlightX * characterState.gridScale}px ${highlightY * characterState.gridScale}px`;
    });
}

// Initialization when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    setupContextMenu();
    setupEventListeners();
    handleSetBackground();
    initializeSettings();
    initializeDragAndZoom();
    initializeGrid();
    initializeGridHighlight();
    updateBackgroundPosition();
    updateGridAndTokens();
    
    
    // Set up window resize handler
    window.addEventListener('resize', handleResize);
});

// Initialize drag and zoom functionalities
let isDragging = false;
let lastX, lastY;

function initializeDragAndZoom() {
    const container = document.getElementById('vtt-container');

    container.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    container.addEventListener('wheel', zoom, { passive: false });
}

// Start dragging the map
function startDrag(e) {
    if (e.ctrlKey && e.button === 0) { // Check for Ctrl key and left mouse button
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        e.preventDefault();
    }
}

// Drag the map
function drag(e) {
    if (!isDragging || !e.ctrlKey) return;
    e.preventDefault();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const container = document.getElementById('vtt-container');
    container.style.left = `${container.offsetLeft + dx}px`;
    container.style.top = `${container.offsetTop + dy}px`;
    lastX = e.clientX;
    lastY = e.clientY;
}

// Stop dragging the map
function stopDrag(e) {
    if (isDragging) {
        isDragging = false;
        e.preventDefault();
    }
}

// Prevent default drag behavior
vttContainer.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// Stop dragging if Ctrl key is released
document.addEventListener('keyup', (e) => {
    if (e.key === 'Control') {
        isDragging = false;
    }
});






document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.code); // Log the key code

    // Check if we're typing in an input field
    const activeElement = document.activeElement;
    const isTyping = activeElement.tagName === 'INPUT' || 
                    activeElement.tagName === 'TEXTAREA' || 
                    activeElement.isContentEditable;

    if (isTyping) {
        console.log('User is typing, ignoring hotkey');
        return;
    }

    // Navigation hotkeys (B, I, etc.)
    const navigationHotkeys = {
        'KeyI': { 
            element: document.getElementById('itemLibrary'),
            button: document.getElementById('itemLibraryButton')
        },
        'KeyL': { 
            element: document.getElementById('creatureLibrary'),
            button: document.getElementById('creatureLibraryButton')
        },  
        'KeyB': { id: 'inventoryButton', popup: 'inventoryPopup' },
        'KeyC': { id: 'characterSheetButton', popup: 'characterSheetPopup' },
        'KeyS': { id: 'spellsButton', popup: 'spellsPopup' },
        'KeyT': { id: 'talentsButton', popup: 'talentsPopup' },
        'KeyQ': { id: 'questLogButton', popup: 'questLogPopup' },
        'KeyO': { id: 'socialButton', popup: 'socialPopup' },
        'Space': { id: 'chatButton', action: 'chat' },
        'KeyG': { id: 'settingsButton', popup: 'settingsMenu' },
        'KeyF': { 
            id: 'initiateCombatButton', 
            action: 'combat',
            handler: () => {
                if (window.gmTools?.isGM) {
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
                }
            }
        }
    };

    // Handle navigation hotkeys
    if (navigationHotkeys[e.code]) {
        console.log('Navigation hotkey detected:', e.code);
        e.preventDefault();
        const mapping = navigationHotkeys[e.code];
        console.log('Mapping:', mapping);
        
        if (mapping.handler) {
            mapping.handler();
        } else if (mapping.popup) {
            console.log('Handling popup:', mapping.popup);
            togglePopup(mapping.popup);
        } else if (mapping.action === 'itemLibrary') {
            console.log('Handling item library');
            const library = document.getElementById('itemLibrary');
            const button = document.getElementById('itemLibraryButton');
            console.log('Item library elements:', { library, button });
            if (library) {
                toggleLibrary(library, button);
            } else {
                console.log('Item library element not found');
            }
        } else if (mapping.action === 'creatureLibrary') {
            console.log('Handling creature library');
            const library = document.getElementById('creatureLibrary');
            const button = document.getElementById('creatureLibraryButton');
            console.log('Creature library elements:', { library, button });
            if (library) {
                toggleLibrary(library, button);
            } else {
                console.log('Creature library element not found');
            }
        } else if (mapping.action === 'chat') {
            console.log('Handling chat toggle');
            toggleChat();
        }
        return;
    }

    // Handle action bar hotkeys (1-0)
    if (!e.ctrlKey && !e.altKey && !e.shiftKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const slot = document.querySelector(`.action-slot[data-keycode="Digit${e.key}"]`);
        if (!slot) return;

        const actionType = slot.dataset.actionType;
        if (!actionType) return;

        const playerToken = document.querySelector('.token.player-token');
        if (!playerToken) return;

        if (actionType === 'spell') {
            const spellId = slot.dataset.spellId;
            if (window.spellbook && spellId) {
                window.spellbook.castSpell(spellId, playerToken);
            }
        } else if (actionType === 'consumable') {
            const instanceId = slot.dataset.instanceId;
            if (instanceId) {
                const itemElement = document.querySelector(
                    `.inventory-item[data-instance-id="${instanceId}"]`
                );
                if (itemElement) {
                    try {
                        const itemData = JSON.parse(itemElement.dataset.itemData);
                        if (window.combatState?.isInCombat) {
                            const currentAP = parseInt(playerToken.dataset.actionPoints) || 0;
                            if (currentAP < 1) {
                                addCombatMessage("Not enough AP to use item!");
                                return;
                            }
                        }
                        useItem(itemData, itemElement);
                    } catch (error) {
                        console.error('Error using consumable:', error);
                    }
                } else {
                    clearActionSlot(slot);
                    updateActionBarQuantities();
                }
            }
        }
    }
});

window.UIUtils = {
    // Toggle any popup by ID
    togglePopup(popupId, forceOpen = false) {
        console.log('togglePopup called with:', popupId, 'forceOpen:', forceOpen);
        
        const popup = document.getElementById(popupId);
        const buttonId = popupId.replace('Popup', 'Button');
        const button = document.getElementById(buttonId);

        if (!popup) {
            console.error(`Popup with ID ${popupId} not found.`);
            return;
        }

        const isCurrentlyVisible = popup.style.display === 'block';

        // If we're not forcing it open and it's already visible, just close it
        if (!forceOpen && isCurrentlyVisible) {
            popup.style.display = 'none';
            popup.classList.remove('visible');
            if (button) button.classList.remove('active-button');
        } else {

            document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active-button'));

            // Open the requested popup
            popup.style.display = 'block';
            popup.classList.add('visible');
            if (button) button.classList.add('active-button');
        }

        if (popupId === 'settingsMenu' && button) {
            button.classList.toggle('active-button', popup.classList.contains('visible'));
        }

        console.log(`Popup ${popupId} display set to:`, popup.style.display);

        // Update encumbrance status each time inventory visibility changes
        if (typeof updateEncumbranceStatus === 'function') {
            updateEncumbranceStatus();
        }
    },

    // Toggle library visibility
    toggleLibrary(library, button) {
        if (!library) return;
        
        const isCurrentlyVisible = library.style.display === 'block';
        

    

    
        // Toggle this library
        if (isCurrentlyVisible) {
            library.style.display = 'none';
            library.classList.remove('visible');
            if (button) button.classList.remove('active-button');
        } else {
            library.style.display = 'block';
            library.classList.add('visible');
            if (button) button.classList.add('active-button');
            
            // Focus search input if it's the item library
            if (library.id === 'itemLibrary') {
                const searchInput = library.querySelector('#itemSearch');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        }
    },

    // Toggle chat window
    toggleChat() {
        const chatContainer = document.querySelector('.chat-container');
        const chatButton = document.getElementById('chatButton');
        
        if (!chatContainer) return;
        
        const isVisible = chatContainer.classList.contains('visible');
        chatContainer.classList.toggle('visible', !isVisible);
        
        if (chatButton) {
            chatButton.classList.toggle('active-button', !isVisible);
        }

        // Focus chat input when opening
        if (!isVisible) {
            const chatInput = chatContainer.querySelector('.chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }
    }
};

function initializeNavigationControls() {
    const navigation = document.querySelector('.navigation');
    if (!navigation) return;

    // Declare these variables within the context of navigation controls
    let isDragging = false;
    let isResizing = false;
    let startX, startY;
    let initialLeft, initialTop;
    let initialWidth, initialHeight;

    // Create resize handle if it doesn't exist
    if (!navigation.querySelector('.nav-resize-handle')) {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'nav-resize-handle';
        navigation.appendChild(resizeHandle);
    }

    function handleMouseDown(e) {
        const resizeHandle = e.target.closest('.nav-resize-handle');

        if (resizeHandle) {
            isResizing = true;
            const rect = navigation.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            startX = e.clientX;
            startY = e.clientY;
            navigation.classList.add('resizing');
        } else if (e.target.closest('.navigation')) {
            isDragging = true;
            const rect = navigation.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            initialLeft = rect.left;
            initialTop = rect.top;
            navigation.classList.add('dragging');
        }
        e.preventDefault();
    }

    function handleMouseMove(e) {
        if (!isDragging && !isResizing) return;
        e.preventDefault();

        if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const newWidth = Math.max(50, initialWidth + dx);
            const newHeight = Math.max(50, initialHeight + dy);

            navigation.style.width = `${newWidth}px`;
            navigation.style.height = `${newHeight}px`;

            adjustButtonSizes();
        } else if (isDragging) {
            const newX = e.clientX - startX;
            const newY = e.clientY - startY;

            // Bound to window edges
            const maxX = window.innerWidth - navigation.offsetWidth;
            const maxY = window.innerHeight - navigation.offsetHeight;

            navigation.style.left = `${Math.max(0, Math.min(maxX, newX))}px`;
            navigation.style.top = `${Math.max(0, Math.min(maxY, newY))}px`;
            navigation.style.bottom = 'auto';
            navigation.style.right = 'auto';
        }
    }

    function handleMouseUp() {
        if (isDragging || isResizing) {
            isDragging = false;
            isResizing = false;
            navigation.classList.remove('dragging', 'resizing');
            saveNavSettings();
        }
    }

    navigation.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Context menu for layout switching
    navigation.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        const contextMenu = document.createElement('div');
        contextMenu.className = 'nav-context-menu';
        contextMenu.innerHTML = `
            <div class="nav-context-item" data-action="horizontal">Horizontal Layout</div>
            <div class="nav-context-item" data-action="vertical">Vertical Layout</div>
        `;

        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        document.body.appendChild(contextMenu);

        const closeMenu = () => {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        };

        contextMenu.addEventListener('click', (menuEvent) => {
            const action = menuEvent.target.dataset.action;
            if (action) {
                navigation.className = `navigation nav-${action}`;
                adjustButtonSizes();
                saveNavSettings();
            }
            closeMenu();
        });

        document.addEventListener('click', closeMenu);
    });

    // Observe changes in the number of visible buttons
    const observer = new MutationObserver(() => {
        adjustButtonSizes();
    });

    observer.observe(navigation, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    function adjustButtonSizes() {
        const buttons = navigation.querySelectorAll('.nav-button');
        const visibleButtons = Array.from(buttons).filter(btn => btn.style.display !== 'none');

        const totalButtons = visibleButtons.length;

        const navWidth = navigation.clientWidth;
        const navHeight = navigation.clientHeight;

        if (navigation.classList.contains('nav-vertical')) {
            // Vertical Layout

            navigation.style.display = 'flex';
            navigation.style.flexDirection = 'column';
            navigation.style.alignItems = 'stretch';

            const buttonHeight = navHeight / totalButtons;
            const buttonWidth = navWidth;

            visibleButtons.forEach(button => {
                button.style.width = `${buttonWidth}px`;
                button.style.height = `${buttonHeight}px`;
                button.style.position = 'relative';
                button.style.left = '';
                button.style.top = '';
            });
        } else {
            // Horizontal Layout

            navigation.style.display = 'flex';
            navigation.style.flexDirection = 'row';
            navigation.style.alignItems = 'stretch';

            const buttonWidth = navWidth / totalButtons;
            const buttonHeight = navHeight;

            visibleButtons.forEach(button => {
                button.style.width = `${buttonWidth}px`;
                button.style.height = `${buttonHeight}px`;
                button.style.position = 'relative';
                button.style.left = '';
                button.style.top = '';
            });
        }
    }

    function saveNavSettings() {
        const settings = {
            left: navigation.style.left,
            top: navigation.style.top,
            width: navigation.style.width,
            height: navigation.style.height,
            layout: navigation.className,
        };

        localStorage.setItem('navigationSettings', JSON.stringify(settings));
    }

    function loadNavSettings() {
        const savedSettings = localStorage.getItem('navigationSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            navigation.style.left = settings.left;
            navigation.style.top = settings.top;
            navigation.style.width = settings.width;
            navigation.style.height = settings.height;
            navigation.className = settings.layout;
        } else {
            // Set default dimensions
            navigation.style.width = '400px';
            navigation.style.height = '50px';
            navigation.className = 'navigation nav-horizontal';
        }

        adjustButtonSizes();
    }

    loadNavSettings();
}






document.addEventListener('DOMContentLoaded', initializeNavigationControls);




// Make functions globally available
window.togglePopup = window.UIUtils.togglePopup;
window.toggleLibrary = window.UIUtils.toggleLibrary;
window.toggleChat = window.UIUtils.toggleChat;
