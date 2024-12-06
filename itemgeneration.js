const { createLootOrb } = window;

const ItemGenerator = {
    isDrawMode: false,
    isDrawing: false,
    drawStartTile: null,
    selectedTiles: new Set(),
    contextMenuActive: false,
    isImageMode: false,
    isEditMode: false,
    activeDialog: null,

    slotByType: {
        'weapon': ['main-hand'],
        'armor': {
            'head': ['head'],
            'chest': ['chest'],
            'legs': ['legs'],
            'feet': ['feet'],
            'hands': ['hands'],
            'shoulders': ['shoulders'],
            'waist': ['waist'],
            'wrists': ['wrists']
        },
        'accessory': ['ring1', 'ring2', 'neck'],
    },

    // Initialize Item Generator
    initialize() {
        this.initializeViewToggle();
        this.generatePreviewGrid();
        this.initializeItemGenerationControls();
        this.initializeItemCreation();
        this.setupDrawingHandlers();
        this.initializeDragAndDrop();
        this.initializeImageUpload();
        this.initializeGridDropHandling(); // Add this line
        this.handleItemImageClick = this.handleItemImageClick.bind(this);
        this.handleClickOutsideImage = this.handleClickOutsideImage.bind(this);
    },

    // Initialize View Toggle Buttons within Item Generation
    initializeViewToggle() {
        const libraryViewBtn = document.getElementById('libraryViewBtn');
        const generationViewBtn = document.getElementById('generationViewBtn');
        const libraryView = document.getElementById('itemLibraryView');
        const generationView = document.getElementById('itemGenerationView');
    
        if (!libraryViewBtn || !generationViewBtn || !libraryView || !generationView) {
            console.error('Missing required view elements');
            return;
        }
    
        // Set initial view state
        libraryView.style.display = 'block';
        generationView.style.display = 'none';
    
        libraryViewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            libraryViewBtn.classList.add('active');
            generationViewBtn.classList.remove('active');
            
            libraryView.style.display = 'block';
            generationView.style.display = 'none';
            
            // Ensure the popup stays open
            const popup = document.getElementById('itemLibrary');
            if (popup) {
                popup.style.display = 'block';
            }
        });
    
        generationViewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            generationViewBtn.classList.add('active');
            libraryViewBtn.classList.remove('active');
            
            generationView.style.display = 'block';
            libraryView.style.display = 'none';
            
            // Ensure the popup stays open
            const popup = document.getElementById('itemLibrary');
            if (popup) {
                popup.style.display = 'block';
            }
        });
    
        // Handle closing the popup
        const closeBtn = document.querySelector('#itemLibrary .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const popup = document.getElementById('itemLibrary');
                if (popup) {
                    popup.style.display = 'none';
                }
            });
        }
    },

    // Generate Preview Grid
    generatePreviewGrid() {
        const grid = document.getElementById('itemPreviewGrid');
        grid.innerHTML = ''; // Clear existing grid

        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 15; x++) {
                const tile = document.createElement('div');
                tile.className = 'preview-tile';
                tile.dataset.x = x;
                tile.dataset.y = y;
                grid.appendChild(tile);
            }
        }
    },

    // Initialize Item Generation Controls (Draw and Edit Buttons)
    initializeItemGenerationControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'item-gen-controls';
        
        // Draw Button
        const drawButton = document.createElement('button');
        drawButton.className = 'draw-button';
        drawButton.title = "Draw Item Shape";
        drawButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18"/>
                <line x1="8" y1="8" x2="16" y2="16"/>
            </svg>
        `;
    
        // Edit Button
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.title = "Edit Item Details";
        editButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        `;
    
        controlsContainer.appendChild(drawButton);
        controlsContainer.appendChild(editButton);
    
        const grid = document.getElementById('itemPreviewGrid');
        grid.parentNode.insertBefore(controlsContainer, grid);
    
        let activeMode = null; // 'draw' or 'edit'
    
        // Draw Button Functionality
        drawButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering document click
            const items = document.querySelectorAll('.preview-item');
    
            if (activeMode === 'draw') {
                // Turn off Draw Mode
                activeMode = null;
                drawButton.classList.remove('active');
                grid.classList.remove('draw-mode');
                this.isDrawMode = false;
    
                // Restore hover events
                items.forEach(item => {
                    if (item.showItemInfoHandler) {
                        item.addEventListener('mousemove', item.showItemInfoHandler);
                        item.addEventListener('mouseout', this.hideItemInfo);
                    }
                });
            } else {
                // Turn on Draw Mode
                activeMode = 'draw';
                this.isDrawMode = true;
                drawButton.classList.add('active');
                editButton.classList.remove('active');
                grid.classList.add('draw-mode');
    
                // Remove hover events and tooltips
                items.forEach(item => {
                    if (item.showItemInfoHandler) {
                        item.removeEventListener('mousemove', item.showItemInfoHandler);
                        item.removeEventListener('mouseout', this.hideItemInfo);
                    }
                    this.removeItemGenTooltip(item);
                });
            }
    
            this.clearSelection();
            this.hideItemInfo();
            this.updateItemGenEditableState();
        });
    
        // Edit Button Functionality
        editButton.addEventListener('click', () => {
            if (this.isEditMode) {
                this.exitEditMode();
            } else {
                this.enterEditMode();
            }
        });
    },

// Inside ItemGenerator
initializeDragAndDrop() {
    const grid = document.getElementById('itemPreviewGrid');
    if (!grid) return;

    const handleDragOver = (e) => {
        if (!this.draggedItem) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = grid.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 42);
        const y = Math.floor((e.clientY - rect.top) / 42);

        const width = parseInt(this.draggedItem.dataset.width);
        const height = parseInt(this.draggedItem.dataset.height);
        const instanceId = this.draggedItem.dataset.instanceId;

        this.removeHighlight();

        if (this.isSlotAvailable(x, y, { width, height }, instanceId)) {
            this.highlightDropZone(x, y, { width, height });
        }
    };

    const handleDrop = (e) => {
        if (!this.draggedItem) return;
    
        e.preventDefault();
        const rect = grid.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 42);
        const y = Math.floor((e.clientY - rect.top) / 42);
    
        const width = parseInt(this.draggedItem.dataset.width);
        const height = parseInt(this.draggedItem.dataset.height);
        const instanceId = this.draggedItem.dataset.instanceId;
    
        if (this.isSlotAvailable(x, y, { width, height }, instanceId)) {
            // Clear old position
            this.clearOccupiedTiles(
                parseInt(this.draggedItem.dataset.x), 
                parseInt(this.draggedItem.dataset.y), 
                width, 
                height, 
                instanceId
            );
    
            // Update position
            this.draggedItem.style.left = `${x * 42}px`;
            this.draggedItem.style.top = `${y * 42}px`;
            this.draggedItem.dataset.x = x;
            this.draggedItem.dataset.y = y;
    
            // Mark new position
            this.markGridTilesAsOccupied(x, y, width, height, instanceId);
    
            // Handle equipping logic if dragged to a slot
            const slot = this.getSlotUnderDrop(x, y);
            if (slot) {
                this.equipItemToSlot(this.draggedItem.dataset, this.draggedItem, slot.dataset.slot);
            }
        }
    
        this.removeHighlight();
        this.draggedItem.style.opacity = '';
        this.draggedItem = null;
    };
    

    const handleDragLeave = (e) => {
        if (!grid.contains(e.relatedTarget)) {
            this.removeHighlight();
        }
    };

    // Remove any existing listeners
    grid.removeEventListener('dragover', handleDragOver);
    grid.removeEventListener('drop', handleDrop);
    grid.removeEventListener('dragleave', handleDragLeave);

    // Add new listeners with proper binding
    grid.addEventListener('dragover', handleDragOver.bind(this));
    grid.addEventListener('drop', handleDrop.bind(this));
    grid.addEventListener('dragleave', handleDragLeave.bind(this));
},

initializeGridDropHandling() {
    const gridOverlay = document.getElementById('grid-overlay');
    if (!gridOverlay) return;
 
    // Initialize createLootOrb if not defined
    window.createLootOrb = function(item, sourceToken, dropEvent) {
        const lootOrb = document.createElement('div');
        lootOrb.classList.add('loot-orb', item.rarity?.toLowerCase() || 'common', 'spawning');
 
        // Clean up stats/effects
        const stats = typeof item.stats === 'string' ? JSON.parse(item.stats) : item.stats || {};
        const effects = typeof item.effects === 'string' ? JSON.parse(item.effects) : item.effects || {};
 
        // Clean and format properties
        Object.assign(lootOrb.dataset, {
            id: item.id?.toString() || '',
            instanceId: item.instanceId?.toString() || '',
            name: item.name || '',
            description: item.description || '',
            rarity: item.rarity || 'common',
            type: item.type || '',
            slot: Array.isArray(item.slot) ? item.slot.join(',') : item.slot || '',
            effects: JSON.stringify(stats),
            stats: JSON.stringify(stats),
            image: item.image || '/api/placeholder/400/320',
            valueGold: (item.valueGold || 0).toString(),
            valueSilver: (item.valueSilver || 0).toString(), 
            valueCopper: (item.valueCopper || 0).toString(),
            armorType: item.armorType || '',
            armorMaterial: item.armorMaterial || '',
            weaponType: item.weaponType || '',
            weaponSubtype: item.weaponSubtype || '',
            damageDice: item.damageDice || '',
            duration: (item.duration || 0).toString(),
            value: (item.value || 0).toString()  // Add total value
        });
 
        // Position
        const rect = gridOverlay.getBoundingClientRect();
        const scale = characterState.scale || 1;
        const gridScale = characterState.gridScale || 40;
        const gridX = dropEvent ? Math.floor((dropEvent.clientX - rect.left) / (gridScale * scale)) :
                     (sourceToken?.dataset.gridX || 0);
        const gridY = dropEvent ? Math.floor((dropEvent.clientY - rect.top) / (gridScale * scale)) :
                     (sourceToken?.dataset.gridY || 0);
 
        Object.assign(lootOrb.style, {
            left: `${gridX * gridScale}px`,
            top: `${gridY * gridScale}px`, 
            width: `${gridScale * 0.3}px`,
            height: `${gridScale * 0.3}px`,
            position: 'absolute'
        });
 
        // Event Listeners
        lootOrb.addEventListener('mousemove', (e) => {
            const itemData = {
                dataset: {
                    name: item.name,
                    description: item.description,
                    rarity: item.rarity,
                    type: item.type,
                    effects: JSON.stringify(item.stats),
                    slot: Array.isArray(item.slot) ? item.slot.join(',') : item.slot,
                    weaponType: item.weaponType,
                    armorType: item.armorType,
                    armorMaterial: item.armorMaterial,
                    damageDice: item.damageDice,
                    valueGold: (item.valueGold || 0).toString(),
                    valueSilver: (item.valueSilver || 0).toString(),
                    valueCopper: (item.valueCopper || 0).toString(),
                    value: (item.value || 0).toString(),
                    size: JSON.stringify(item.size || { width: 1, height: 1 }),
                    width: (item.size?.width || 1).toString(),
                    height: (item.size?.height || 1).toString()
                }
            };
            showItemInfo(itemData, e);
            lootOrb.style.transform = 'scale(1.2)';
        });
 
        lootOrb.addEventListener('mouseout', () => {
            hideItemInfo();
            lootOrb.style.transform = 'scale(1)';
        });
 
        lootOrb.addEventListener('click', () => collectLoot(item, lootOrb));
 
        gridOverlay.appendChild(lootOrb);
        return lootOrb;
    };
 
    // Original grid handlers here
    gridOverlay.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        const rect = gridOverlay.getBoundingClientRect();
        const scale = characterState.scale || 1;
        const gridScale = characterState.gridScale || 40;
        const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
        const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));
 
        const highlight = document.createElement('div');
        highlight.classList.add('tile-highlight');
        highlight.style.cssText = `
            position: absolute;
            left: ${gridX * gridScale}px;
            top: ${gridY * gridScale}px;
            width: ${gridScale}px;
            height: ${gridScale}px;
            border: 2px dashed #00ff00;
            pointer-events: none;
            z-index: 1000;
        `;
        gridOverlay.appendChild(highlight);
    });
 
    gridOverlay.addEventListener('dragleave', () => {
        document.querySelectorAll('.tile-highlight').forEach(h => h.remove());
    });
 
    gridOverlay.addEventListener('drop', async (e) => {
        e.preventDefault();
        document.querySelectorAll('.tile-highlight').forEach(h => h.remove());
 
        try {
            const transferData = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (!transferData.fromGenerator || !transferData.instanceId) return;
 
            const draggedItem = document.querySelector(`.preview-item[data-instance-id="${transferData.instanceId}"]`);
            if (!draggedItem) return;
 
            const confirmed = await this.showDropConfirmDialog(draggedItem.dataset.name);
            if (!confirmed) {
                draggedItem.style.opacity = '';
                return;
            }
 
            const itemData = {
                id: parseInt(draggedItem.dataset.instanceId),
                name: draggedItem.dataset.name,
                description: draggedItem.dataset.description,
                rarity: draggedItem.dataset.rarity || 'common',
                type: draggedItem.dataset.type || 'other',
                image: draggedItem.dataset.image,
                stats: JSON.parse(draggedItem.dataset.effects || '{}'),
                effects: JSON.parse(draggedItem.dataset.effects || '{}'),
                slot: draggedItem.dataset.slot?.split(',') || []
            };
 
            const fakeToken = document.createElement('div');
            const rect = gridOverlay.getBoundingClientRect();
            const scale = characterState.scale || 1;
            const gridScale = characterState.gridScale || 40;
            fakeToken.dataset.gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
            fakeToken.dataset.gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));
 
            window.createLootOrb(itemData, fakeToken, e);
            draggedItem.remove();
            addLootMessage('Item Generator', [itemData], 'create');
 
        } catch (error) {
            console.error('Error in grid drop handler:', error);
        }
 
        if (this.draggedItem) {
            this.draggedItem.style.opacity = '';
            this.draggedItem = null;
        }
    });
 },
 
showDropConfirmDialog(itemName) {
    const dialog = document.createElement('div');
    dialog.className = 'custom-confirm-modal';
    dialog.innerHTML = `
        <div class="modal-content">
            <h3>Drop Item</h3>
            <p>Do you want to drop "${itemName}" into the world?</p>
            <div class="modal-buttons">
                <button id="confirm-yes">Yes</button>
                <button id="confirm-no">No</button>
            </div>
        </div>
    `;
 
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
 
    document.body.appendChild(dialog);
 
    return new Promise(resolve => {
        dialog.querySelector('#confirm-yes').onclick = () => {
            dialog.remove();
            resolve(true);
        };
        dialog.querySelector('#confirm-no').onclick = () => {
            dialog.remove();
            resolve(false);
        };
    });
 },




async handleGeneratedItemDrop(e) {
    e.preventDefault();
    this.removeHighlight();

    try {
        const transferData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const draggedItem = document.querySelector(`.preview-item[data-instance-id="${transferData.instanceId}"]`);
        if (!draggedItem) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const scale = characterState.scale || 1;
        const gridScale = characterState.gridScale || 40;
        const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
        const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));

        // Show custom confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'custom-confirm-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Drop Item</h3>
                </div>
                <div class="modal-body">
                    <p>Do you want to drop "${draggedItem.dataset.name}" into the world?</p>
                </div>
                <div class="modal-buttons">
                    <button id="confirm-yes" class="modal-button confirm">Yes</button>
                    <button id="confirm-no" class="modal-button cancel">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        const confirmed = await new Promise(resolve => {
            dialog.querySelector('#confirm-yes').onclick = () => {
                dialog.remove();
                resolve(true);
            };
            dialog.querySelector('#confirm-no').onclick = () => {
                dialog.remove();
                resolve(false);
            };
        });

        if (!confirmed) return;

        // Create fake token for position
        const fakeToken = document.createElement('div');
        fakeToken.dataset.gridX = gridX;
        fakeToken.dataset.gridY = gridY;

        // Use the new method to create the loot orb
        this.createLootOrbFromPreviewItem(draggedItem, fakeToken);

        // Add loot message
        addLootMessage('Item Generator', [{
            name: draggedItem.dataset.name,
            description: draggedItem.dataset.description,
            rarity: draggedItem.dataset.rarity
        }], 'create');

        // Remove the preview item 
        this.removeItem(draggedItem);

    } catch (error) {
        console.error('Error in handleGeneratedItemDrop:', error);
    }
},



showClassicConfirmDialog(message) {
    return new Promise((resolve) => {
        // Create the dialog container
        const dialog = document.createElement('div');
        dialog.className = 'classic-confirm-dialog';
        dialog.style.position = 'fixed';
        dialog.style.left = '50%';
        dialog.style.top = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = '#fff';
        dialog.style.padding = '20px';
        dialog.style.border = '1px solid #ccc';
        dialog.style.borderRadius = '8px';
        dialog.style.zIndex = '10000';
        dialog.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        dialog.innerHTML = `
            <p>${message}</p>
            <div style="text-align: right; margin-top: 20px;">
                <button id="confirm-ok">OK</button>
                <button id="confirm-cancel">Cancel</button>
            </div>
        `;

        document.body.appendChild(dialog);

        // Handle button clicks
        dialog.querySelector('#confirm-ok').addEventListener('click', () => {
            resolve(true);
            dialog.remove();
        });

        dialog.querySelector('#confirm-cancel').addEventListener('click', () => {
            resolve(false);
            dialog.remove();
        });
    });
},


addInventoryContextMenu(itemElement) {
    itemElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Remove any existing context menus
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        const item = {
            id: parseInt(itemElement.dataset.itemId),
            name: itemElement.dataset.name,
            type: itemElement.dataset.type,
            slot: itemElement.dataset.slot ? itemElement.dataset.slot.split(',') : [],
            stats: JSON.parse(itemElement.dataset.effects || '{}'),
            stackable: itemElement.dataset.stackable === 'true',
            rarity: itemElement.dataset.rarity,
            image: itemElement.dataset.image,
            description: itemElement.dataset.description,
            size: {
                width: parseInt(itemElement.dataset.width),
                height: parseInt(itemElement.dataset.height)
            }
        };

        // Build menu items based on item type
        const menuItems = [];

        // Equipment items (weapons, armor, accessories)
        if (item.slot && item.slot.length > 0) {
            menuItems.push({
                text: 'Equip',
                action: () => showEquipOptions(item, itemElement, e.clientX, e.clientY)
            });
        }

        // Consumable items
        if (item.type === 'consumable') {
            menuItems.push({
                text: 'Use',
                action: () => useItem(item, itemElement)
            });
        }

        // Stackable items
        if (item.stackable) {
            menuItems.push({
                text: 'Split Stack',
                action: () => splitItem(item, itemElement)
            });
        }

        // Add standard options
        menuItems.push(
            {
                text: 'Drop',
                action: () => {
                    if (confirm('Are you sure you want to drop this item?')) {
                        const gridX = Math.floor(Math.random() * 10); // Random position or calculate based on player
                        const gridY = Math.floor(Math.random() * 10);
                        
                        const fakeToken = document.createElement('div');
                        fakeToken.dataset.gridX = gridX;
                        fakeToken.dataset.gridY = gridY;
                        
                        createLootOrb(item, fakeToken);
                        removeItemFromInventory(itemElement);
                    }
                }
            }
        );

        // Build menu HTML
        menuItems.forEach(menuItem => {
            const option = document.createElement('div');
            option.className = 'menu-item';
            option.textContent = menuItem.text;
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                menuItem.action();
                contextMenu.remove();
            });
            contextMenu.appendChild(option);
        });

        // Position and show menu
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        document.body.appendChild(contextMenu);

        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    });
},

    enterEditMode() {
        this.isEditMode = true;
        this.isDrawMode = false;
        this.isImageMode = false;
        
        const editButton = document.querySelector('.edit-button');
        const drawButton = document.querySelector('.draw-button');
        const imageButton = document.querySelector('.image-button');
        
        editButton.classList.add('active');
        drawButton?.classList.remove('active');
        imageButton?.classList.remove('active');
        
        document.body.style.cursor = 'pointer';
        
        // Remove existing tooltips and event listeners
        const items = document.querySelectorAll('.preview-item');
        items.forEach(item => {
            this.removeItemGenTooltip(item);
            if (item.showItemInfoHandler) {
                item.removeEventListener('mousemove', item.showItemInfoHandler);
                item.removeEventListener('mouseout', this.hideItemInfo);
            }
            item.draggable = false;
            
            // Add click handler for edit mode
            item.addEventListener('click', this.handleItemEditClick);
        });
    
        // Add click outside handler
        document.addEventListener('click', this.handleClickOutside);
        // Add resize handler
        window.addEventListener('resize', this.handleResize);
    },

    exitEditMode() {
        this.isEditMode = false;
        
        const editButton = document.querySelector('.edit-button');
        editButton.classList.remove('active');
        
        document.body.style.cursor = '';
        
        // Restore default state for all items
        const items = document.querySelectorAll('.preview-item');
        items.forEach(item => {
            this.removeItemGenTooltip(item);
            item.draggable = true; // Restore draggable
            item.classList.add(item.dataset.rarity || 'common'); // Restore rarity class
            
            // Remove edit mode click handler
            item.removeEventListener('click', this.handleItemEditClick);
            
            // Restore hover events
            if (!item.showItemInfoHandler) {
                item.showItemInfoHandler = (e) => {
                    showItemInfo(item, e);
                };
            }
            item.addEventListener('mousemove', item.showItemInfoHandler);
            item.addEventListener('mouseout', hideItemInfo);
        });
    
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('resize', this.handleResize);
    },

    handleItemEditClick(e) {
        if (!ItemGenerator.isEditMode) return;
        
        e.stopPropagation();
        
        // Remove any existing tooltips
        const items = document.querySelectorAll('.preview-item');
        items.forEach(item => ItemGenerator.removeItemGenTooltip(item));
        
        // Create tooltip for clicked item
        ItemGenerator.createItemGenTooltip(this);
    },
    handleClickOutside(e) {
        if (!ItemGenerator.isEditMode) return;
    
        const clickedItem = e.target.closest('.preview-item');
        const clickedTooltip = e.target.closest('.item-tooltip');
        const clickedEditButton = e.target.closest('.edit-button');
    
        if (!clickedItem && !clickedTooltip && !clickedEditButton) {
            ItemGenerator.exitEditMode();
        }
    },
    handleResize() {
        if (!ItemGenerator.isEditMode) return;
        
        const items = document.querySelectorAll('.preview-item');
        items.forEach(item => {
            if (item.persistentTooltip && item.updateTooltipPosition) {
                item.updateTooltipPosition();
            }
        });
    },
    // Highlight Drop Zone
// Inside ItemGenerator
highlightDropZone(x, y, itemSize) {
    requestAnimationFrame(() => {
        // Remove previous highlights
        document.querySelectorAll('.tile-highlight').forEach(h => h.remove());

        const grid = document.getElementById('itemPreviewGrid');
        const highlight = document.createElement('div');
        highlight.className = 'tile-highlight';
        highlight.style.width = `${itemSize.width * 42 - 2}px`;
        highlight.style.height = `${itemSize.height * 42 - 2}px`;
        highlight.style.left = `${x * 42}px`;
        highlight.style.top = `${y * 42}px`;
        highlight.style.position = 'absolute';
        highlight.style.border = '2px dashed #00f'; // Customize highlight style
        highlight.style.pointerEvents = 'none'; // Ensure it doesn't block events

        grid.appendChild(highlight);
    });
},

removeHighlight() {
    document.querySelectorAll('.tile-highlight').forEach(highlight => highlight.remove());
},



// Utility function to validate URLs
isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
},
closeImageUploadModal(modal) {
    modal.style.animation = 'modalFadeOut 0.3s ease-out';
    setTimeout(() => {
        modal.style.display = 'none';
        this.exitImageMode();
    }, 300);
},

initializeItemCreation() {
    const createItemBtn = document.getElementById('createItemBtn');
    if (createItemBtn) {
        createItemBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Get form values
            const name = document.getElementById('itemNameInput').value.trim();
            const description = document.getElementById('itemDescInput').value.trim();
            const rarity = document.getElementById('itemRaritySelect').value;
            const imageUrl = document.getElementById('itemImageInput').value.trim();
            const width = parseInt(document.getElementById('itemWidthInput').value);
            const height = parseInt(document.getElementById('itemHeightInput').value);

            // Collect stats from form inputs
            const str = parseInt(document.getElementById('itemStrInput').value) || 0;
            const agi = parseInt(document.getElementById('itemAgiInput').value) || 0;
            const con = parseInt(document.getElementById('itemConInput').value) || 0;
            const intStat = parseInt(document.getElementById('itemIntInput').value) || 0;
            const spir = parseInt(document.getElementById('itemSpirInput').value) || 0;
            const cha = parseInt(document.getElementById('itemChaInput').value) || 0;
            const damage = parseInt(document.getElementById('itemDamageInput').value) || 0;
            const armor = parseInt(document.getElementById('itemArmorInput').value) || 0;

            // Create new item
            const newItem = {
                id: Date.now(), // Temporary ID
                name: name,
                description: description,
                rarity: rarity,
                image: imageUrl,
                size: { width, height },
                stats: {
                    str: str,
                    agi: agi,
                    con: con,
                    int: intStat,
                    spir: spir,
                    cha: cha,                  
                    damage: damage,
                    armor: armor
                    // Include other stats as needed
                }
            };

            // Add to the grid
            this.createPreviewItemFromData(newItem);

            alert('Item created successfully!');
        });
    }
},






createPreviewItemFromData(itemData) {
    const grid = document.getElementById('itemPreviewGrid');
    const tileSize = 40;
    const gapSize = 2;
    const totalTileSize = tileSize + gapSize;
    
    // Set default armor properties based on type and slot
    if (itemData.type === 'armor') {
        if (!itemData.armorType) {
            itemData.armorType = 'armor';
        }
        if (!itemData.armorMaterial) {
            // Default material based on slot
            const slotMaterials = {
                head: 'Plate',
                chest: 'Plate',
                legs: 'Plate',
                feet: 'Plate',
                hands: 'Plate',
                shoulders: 'Plate',
                waist: 'Leather',
                wrists: 'Leather'
            };
            const slot = Array.isArray(itemData.slot) ? itemData.slot[0] : itemData.slot;
            itemData.armorMaterial = slotMaterials[slot?.toLowerCase()] || 'Leather';
        }
    }
    
    let placed = false;
    for (let y = 0; y <= 5 - itemData.size.height && !placed; y++) {
        for (let x = 0; x <= 15 - itemData.size.width && !placed; x++) {
            if (this.isSlotAvailable(x, y, itemData.size, itemData.id?.toString())) {
                const previewItem = document.createElement('div');
                previewItem.className = `preview-item inventory-item ${itemData.rarity?.toLowerCase() || 'common'}`;
 
                Object.assign(previewItem.style, {
                    left: `${x * totalTileSize}px`,
                    top: `${y * totalTileSize}px`,
                    width: `${itemData.size.width * totalTileSize - gapSize}px`,
                    height: `${itemData.size.height * totalTileSize - gapSize}px`,
                    position: 'absolute',
                    display: 'block'
                });
 
                const imgElement = document.createElement('img');
                imgElement.className = 'item-image';
                imgElement.src = this.isValidURL(itemData.image) ? itemData.image : '/api/placeholder/400/320';
                imgElement.alt = itemData.name;
                imgElement.draggable = false;
                imgElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
                previewItem.appendChild(imgElement);
 
                const valueGold = itemData.valueGold || Math.floor((itemData.value || 0) / 10000);
                const valueSilver = itemData.valueSilver || Math.floor(((itemData.value || 0) % 10000) / 100);
                const valueCopper = itemData.valueCopper || (itemData.value || 0) % 100;
 
                const slots = this.determineSlots(itemData);
                const itemId = itemData.id || Date.now().toString();
 
                const datasetValues = {
                    x: x.toString(),
                    y: y.toString(),
                    width: itemData.size?.width?.toString() || '1',
                    height: itemData.size?.height?.toString() || '1',
                    instanceId: itemId,
                    itemId: itemId,
                    name: itemData.name || 'Unnamed Item',
                    description: itemData.description || 'No description provided.',
                    rarity: itemData.rarity?.toLowerCase() || 'common',
                    image: imgElement.src,
                    type: itemData.type || 'misc',
                    slot: Array.isArray(slots) ? slots.join(',') : 'unspecified',
                    effects: JSON.stringify(itemData.stats || {}),
                    valueGold: valueGold.toString(),
                    valueSilver: valueSilver.toString(),
                    valueCopper: valueCopper.toString(),
                    duration: itemData.duration?.toString() || '0',
                    // Get weapon/armor properties from either stats or root level
                    weaponType: itemData.stats?.weaponType || itemData.weaponType || '',
                    weaponCategory: itemData.stats?.weaponCategory || itemData.weaponCategory || '',
                    damageDice: itemData.stats?.damageDice || itemData.damageDice || '',
                    armorMaterial: itemData.stats?.armorMaterial || itemData.armorMaterial || '',
                    armorType: itemData.stats?.armorType || itemData.armorType || '',
                    accessoryType: itemData.stats?.accessoryType || itemData.accessoryType || '',
                    stats: JSON.stringify(itemData.stats || {})
                };
 
                Object.assign(previewItem.dataset, datasetValues);
 
                previewItem.addEventListener('mouseenter', (e) => {
                    const tooltipData = {
                        dataset: { ...datasetValues }
                    };
                    showItemInfo(tooltipData, e);
                });
                
                previewItem.addEventListener('mousemove', updateTooltipPosition);
                previewItem.addEventListener('mouseleave', hideItemInfo);
 
                grid.appendChild(previewItem);
                this.markGridTilesAsOccupied(x, y, itemData.size.width, itemData.size.height, previewItem.dataset.instanceId);
                this.makePreviewItemDraggable(previewItem);
                this.addContextMenuToItem(previewItem);
 
                placed = true;
                break;
            }
        }
        if (placed) break;
    }
 
    if (!placed) {
        alert('No available space to place the item.');
    }
 },
 
 determineSlots(itemData) {
    if (itemData.slot) {
        return Array.isArray(itemData.slot) ? itemData.slot : [itemData.slot];
    }
    
    if (itemData.type === 'weapon') {
        return this.slotByType.weapon;
    } else if (itemData.type === 'armor') {
        return itemData.armorType === 'shield' ? ['off-hand'] : 
            (this.slotByType.armor[itemData.armorType?.toLowerCase()] || ['chest']);
    } else if (itemData.type === 'accessory') {
        return [this.slotByType.accessory[0]];
    }
    return [];
},




    // Create Preview Item Directly (Used in Draw Mode)
    createPreviewItem() {
        // Calculate dimensions from selection
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.selectedTiles.forEach(coord => {
            const [x, y] = coord.split(',').map(Number);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const tileSize = 40;
        const gapSize = 2;
        const totalTileSize = tileSize + gapSize;

        // Find first available position
        let placed = false;
        let posX = 0, posY = 0;
        for (let y = 0; y <= 5 - height && !placed; y++) {
            for (let x = 0; x <= 15 - width && !placed; x++) {
                if (this.isSlotAvailable(x, y, { width, height }, Date.now().toString())) {
                    posX = x;
                    posY = y;
                    placed = true;
                }
            }
        }

        if (!placed) {
            alert('No available space to place the item.');
            return;
        }

        // Create preview item
        const previewItem = document.createElement('div');
        previewItem.className = `preview-item ${itemData.rarity || 'common'}`;
        
        // Calculate exact position
        previewItem.style.left = `${posX * totalTileSize}px`;
        previewItem.style.top = `${posY * totalTileSize}px`;
        previewItem.style.width = `${width * totalTileSize - gapSize}px`;
        previewItem.style.height = `${height * totalTileSize - gapSize}px`;

        // Set data attributes
        previewItem.dataset.x = posX;
        previewItem.dataset.y = posY;
        previewItem.dataset.width = width;
        previewItem.dataset.height = height;
        previewItem.dataset.rarity = 'common';
        previewItem.dataset.name = 'New Item';
        previewItem.dataset.description = 'A new item awaiting description.';
        previewItem.dataset.instanceId = Date.now().toString();
        previewItem.dataset.rotation = '0';

        // Create placeholder image
        const imgElement = document.createElement('img');
        imgElement.className = 'item-image';
        imgElement.src = 'path/to/placeholder.png'; // Update with actual path
        imgElement.alt = 'New Item';
        imgElement.style.width = '100%';
        imgElement.style.height = '100%';
        imgElement.style.objectFit = 'cover';
        imgElement.draggable = false;
        previewItem.appendChild(imgElement);

        // Create editable overlays
        const titleOverlay = document.createElement('div');
        titleOverlay.className = 'item-title-overlay';
        titleOverlay.contentEditable = true;
        titleOverlay.textContent = previewItem.dataset.name;
        titleOverlay.style.display = 'none';
        
        const descOverlay = document.createElement('div');
        descOverlay.className = 'item-description-overlay';
        descOverlay.contentEditable = true;
        descOverlay.textContent = previewItem.dataset.description;
        descOverlay.style.display = 'none';
        
        previewItem.appendChild(titleOverlay);
        previewItem.appendChild(descOverlay);

        // Save changes when editing
        titleOverlay.addEventListener('input', () => {
            previewItem.dataset.name = titleOverlay.textContent;
        });

        descOverlay.addEventListener('input', () => {
            previewItem.dataset.description = descOverlay.textContent;
        });

        // Prevent event bubbling from overlays
        [titleOverlay, descOverlay].forEach(overlay => {
            overlay.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Store hover handler for later removal/addition
        previewItem.showItemInfoHandler = (e) => {
            this.showItemInfo({
                name: previewItem.dataset.name,
                description: previewItem.dataset.description,
                rarity: previewItem.dataset.rarity
            }, e);
        };

        // Add hover events only if not in edit mode
        const isEditMode = document.querySelector('.edit-button.active');
        if (!isEditMode) {
            previewItem.addEventListener('mousemove', previewItem.showItemInfoHandler);
            previewItem.addEventListener('mouseout', this.hideItemInfo);
        }

        // Make item draggable
        this.makePreviewItemDraggable(previewItem);

        // Add context menu
        this.addContextMenuToItem(previewItem);

        // Add to grid
        const gridElement = document.getElementById('itemPreviewGrid');
        gridElement.appendChild(previewItem);
        this.markGridTilesAsOccupied(posX, posY, width, height, previewItem.dataset.instanceId);

        // Clear Selection and Hide Selection Box
        this.clearSelection();
        this.hideSelectionBox(); // Ensure selection visuals are removed

        // Update form inputs
        this.updateFormWithItemData(width, height);
    },

// Inside ItemGenerator object
addContextMenuToItem(itemElement) {
    itemElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Remove any existing context menus
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';

        // Reconstruct itemData from dataset
        const itemData = {
            id: itemElement.dataset.itemId || itemElement.dataset.instanceId,
            name: itemElement.dataset.name,
            description: itemElement.dataset.description,
            rarity: itemElement.dataset.rarity || 'common',
            type: itemElement.dataset.type || 'other',
            slot: itemElement.dataset.slot ? itemElement.dataset.slot.split(',') : [],
            stats: JSON.parse(itemElement.dataset.effects || '{}'),
            stackable: itemElement.dataset.stackable === 'true',
            image: itemElement.dataset.image,
            size: {
                width: parseInt(itemElement.dataset.width),
                height: parseInt(itemElement.dataset.height)
            },
            twoHanded: itemElement.dataset.twoHanded === 'true',
            weaponType: itemElement.dataset.weaponType || '',
            armorType: itemElement.dataset.armorType || '',
            consumableEffect: itemElement.dataset.consumableEffect || '',
            duration: parseInt(itemElement.dataset.duration) || 0,
            value: parseInt(itemElement.dataset.value) || 0,
            damageDice: itemElement.dataset.damageDice || '',
            offHanded: itemElement.dataset.offHanded === 'true',
            armorMaterial: itemElement.dataset.armorMaterial || '',
            armorSlot: itemElement.dataset.armorSlot || ''
        };

        console.log('Context menu initialized for item:', itemData);

        if (!itemData.id) {
            console.error('Item ID is missing in dataset:', itemElement.dataset);
            return; // Prevent context menu creation for invalid items
        }

        // Build menu items based on item type
        const menuItems = [];

        // Equipment items (weapons, armor, accessories)
        if (['weapon', 'armor', 'accessory', 'shield'].includes(itemData.type)) {
            menuItems.push({ text: 'Equip', action: 'equip' });
        }

        // Consumable items
        if (itemData.type === 'consumable') {
            menuItems.push({ text: 'Use', action: 'use' });
            if (itemData.stackable && itemData.quantity > 1) {
                menuItems.push({ text: 'Split Stack', action: 'split' });
            }
        }

        // Standard options for all items
        menuItems.push(
            { text: 'Rotate', action: 'rotate' },
            { text: 'Edit', action: 'edit' },
            { text: 'Remove', action: 'delete' }
        );

        // Build menu HTML
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.dataset.action = item.action;
            menuItem.textContent = item.text;
            contextMenu.appendChild(menuItem);
        });

        // Style the context menu
        contextMenu.style.cssText = `
            position: fixed;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 4px 0;
            min-width: 150px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            display: block;
        `;

        // Style each menu item
        const menuItemStyles = `
            padding: 8px 16px;
            cursor: pointer;
            color: #fff;
            font-size: 14px;
        `;

        contextMenu.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.style.cssText = menuItemStyles;
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = '#333';
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
            });
        });

        // Position and show menu
        let x = e.clientX;
        let y = e.clientY;
        document.body.appendChild(contextMenu);

        const menuRect = contextMenu.getBoundingClientRect();
        if (x + menuRect.width > window.innerWidth) {
            x = window.innerWidth - menuRect.width - 10; // Add some padding from the edge
        }
        if (y + menuRect.height > window.innerHeight) {
            y = window.innerHeight - menuRect.height - 10; // Add some padding from the edge
        }

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // Handle menu actions
        const handleAction = (action) => {
            contextMenu.remove();

            switch(action) {
                case 'equip':
                    // Implement equip logic here
                    alert(`Equip ${itemData.name}`);
                    break;
                case 'use':
                    // Implement use logic here
                    alert(`Use ${itemData.name}`);
                    break;
                case 'split':
                    // Implement split stack logic here
                    alert(`Split stack of ${itemData.name}`);
                    break;
                case 'rotate':
                    this.rotateItem(itemElement);
                    break;
                case 'edit':
                    this.enterEditMode();
                    this.createItemGenTooltip(itemElement);
                    break;
                case 'delete':
                    if (confirm('Are you sure you want to delete this item?')) {
                        this.removeItem(itemElement);
                    }
                    break;
            }
        };

        // Add click handlers
        contextMenu.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAction(menuItem.dataset.action);
            });
        });

        // Close menu when clicking outside or on another context menu
        const closeMenu = (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('contextmenu', closeMenu);
            }
        };

        // Add event listeners to close the menu
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            document.addEventListener('contextmenu', closeMenu);
        }, 0);
    });
},


    buildContextMenu(menuElement, items, x, y, isSubMenu = false) {
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.textContent = item.text;
    
            if (item.subMenu) {
                menuItem.classList.add('has-submenu');
                const subMenu = document.createElement('div');
                subMenu.className = 'sub-menu';
                this.buildContextMenu(subMenu, item.subMenu, x, y, true);
                menuItem.appendChild(subMenu);
    
                menuItem.addEventListener('mouseenter', () => {
                    const rect = menuItem.getBoundingClientRect();
                    subMenu.style.left = `${rect.width}px`;
                    subMenu.style.top = '0';
                    subMenu.style.display = 'block';
                });
    
                menuItem.addEventListener('mouseleave', () => {
                    subMenu.style.display = 'none';
                });
            } else {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.action();
                    let menu = menuItem;
                    while (menu.classList.contains('context-menu') || menu.classList.contains('sub-menu')) {
                        menu = menu.parentElement;
                    }
                    menu.closest('.context-menu').remove();
                });
            }
    
            menuElement.appendChild(menuItem);
        });
    
        if (!isSubMenu) {
            menuElement.style.left = `${x}px`;
            menuElement.style.top = `${y}px`;
        }
    },
    rotateItem(itemElement) {
        const isRotated = itemElement.dataset.isRotated === 'true';
        const width = parseInt(itemElement.dataset.width);
        const height = parseInt(itemElement.dataset.height);
        const tileSize = 42;
        
        // Clear current tiles before rotating
        const x = parseInt(itemElement.dataset.x);
        const y = parseInt(itemElement.dataset.y);
        this.clearOccupiedTiles(x, y, width, height, itemElement.dataset.instanceId);
        
        // Toggle rotation
        itemElement.dataset.isRotated = (!isRotated).toString();
        
        if (!isRotated) {
            itemElement.style.transform = 'rotate(180deg)';
            itemElement.style.width = `${height * tileSize - 2}px`;
            itemElement.style.height = `${width * tileSize - 2}px`;
            
            const temp = itemElement.dataset.width;
            itemElement.dataset.width = itemElement.dataset.height;
            itemElement.dataset.height = temp;
            
            const img = itemElement.querySelector('.item-image');
            if (img) {
                img.style.transform = 'rotate(180deg)';
            }
        } else {
            itemElement.style.transform = 'rotate(0deg)';
            itemElement.style.width = `${height * tileSize - 2}px`;
            itemElement.style.height = `${width * tileSize - 2}px`;
            
            const temp = itemElement.dataset.width;
            itemElement.dataset.width = itemElement.dataset.height;
            itemElement.dataset.height = temp;
            
            const img = itemElement.querySelector('.item-image');
            if (img) {
                img.style.transform = 'rotate(0deg)';
            }
        }
        
        // Mark new tiles as occupied
        this.markGridTilesAsOccupied(x, y, parseInt(itemElement.dataset.width), parseInt(itemElement.dataset.height), itemElement.dataset.instanceId);
        
        // Clear any highlights
        this.removeHighlight();
    },

    // Inside ItemGenerator
    makePreviewItemDraggable(itemElement) {
        if (!itemElement) return;
    
        const instanceId = itemElement.dataset.instanceId || Date.now().toString();
        itemElement.dataset.instanceId = instanceId;
    
        itemElement.draggable = true;
    
        const handleDragStart = (e) => {
            if (this.isDrawMode || this.isEditMode) {
                e.preventDefault();
                return;
            }
    
            this.draggedItem = itemElement;
            itemElement.style.opacity = '0.5';
    
            // Get item data from dataset
            const itemData = {
                instanceId: instanceId,
                fromGenerator: true,
                itemData: JSON.stringify({
                    id: itemElement.dataset.itemId,
                    instanceId: instanceId,
                    name: itemElement.dataset.name,
                    description: itemElement.dataset.description,
                    rarity: itemElement.dataset.rarity,
                    type: itemElement.dataset.type,
                    slot: itemElement.dataset.slot,
                    effects: JSON.parse(itemElement.dataset.effects || '{}'),
                    stats: JSON.parse(itemElement.dataset.stats || '{}'),
                    valueGold: parseInt(itemElement.dataset.valueGold) || 0,
                    valueSilver: parseInt(itemElement.dataset.valueSilver) || 0,
                    valueCopper: parseInt(itemElement.dataset.valueCopper) || 0,
                    armorType: itemElement.dataset.armorType,
                    armorMaterial: itemElement.dataset.armorMaterial,
                    weaponType: itemElement.dataset.weaponType,
                    weaponCategory: itemElement.dataset.weaponCategory,
                    damageDice: itemElement.dataset.damageDice,
                    accessoryType: itemElement.dataset.accessoryType,
                    duration: parseInt(itemElement.dataset.duration) || 0,
                    image: itemElement.querySelector('img')?.src || '/api/placeholder/400/320',
                    size: {
                        width: parseInt(itemElement.dataset.width) || 1,
                        height: parseInt(itemElement.dataset.height) || 1
                    }
                })
            };
    
            e.dataTransfer.setData('text/plain', JSON.stringify(itemData));
            console.log('Drag Start: Transfer Data', itemData);
    
            e.dataTransfer.effectAllowed = 'copyMove';
    
            // Create drag image
            const dragImage = itemElement.cloneNode(true);
            dragImage.style.width = '40px';
            dragImage.style.height = '40px';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.opacity = '0.7';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 20, 20);
            setTimeout(() => dragImage.remove(), 0);
        };
    
        const handleDragEnd = () => {
            itemElement.style.opacity = '';
            this.draggedItem = null;
        };
    
        itemElement.addEventListener('dragstart', handleDragStart);
        itemElement.addEventListener('dragend', handleDragEnd);
    },
    
    
    

    

    
    removeItem(itemElement) {
        const instanceId = itemElement.dataset.instanceId;
        
        // Clear occupied tiles
        this.clearOccupiedTiles(
            parseInt(itemElement.dataset.x),
            parseInt(itemElement.dataset.y),
            parseInt(itemElement.dataset.width),
            parseInt(itemElement.dataset.height),
            instanceId
        );
    
        // Remove tooltips and context menus
        const tooltip = document.querySelector(`.item-tooltip[data-instance-id="${instanceId}"]`);
        if (tooltip) tooltip.remove();
    
        const contextMenu = document.querySelector('.context-menu');
        if (contextMenu) contextMenu.remove();
    
        // Remove the item element
        itemElement.remove();
    },
    


// JavaScript Function to Create Tooltip
createItemGenTooltip(item) {
    console.log('Creating Item Generation Tooltip for item:', item);

    // Remove existing tooltip if any
    this.removeItemGenTooltip(item);
    console.log('Existing tooltip removed if any.');

    // Create tooltip container
    const tooltip = document.createElement('div');
    tooltip.id = `itemGen-tooltip-edit-${item.dataset.instanceId}`;
    tooltip.className = `item-edit-tooltip ${item.dataset.rarity || 'common'}`;
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '1000';
    tooltip.style.width = '500px'; // Adjust as needed
    tooltip.style.maxHeight = '90vh';
    tooltip.style.overflowY = 'auto';
    tooltip.style.transform = 'scale(0.95)';
    tooltip.style.opacity = '0';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    tooltip.style.border = '2px solid #4a1c1c';
    tooltip.style.borderRadius = '8px';
    tooltip.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.7)';
    tooltip.style.pointerEvents = 'auto'; // Ensure tooltip can be interacted with
    tooltip.style.padding = '20px'; // Add padding for better layout
    tooltip.style.boxSizing = 'border-box'; // Ensure padding doesn't affect width
    console.log('Tooltip container created.');

    // Helper functions
    const createLabel = (text) => {
        const label = document.createElement('label');
        label.textContent = text;
        label.style.display = 'block';
        label.style.marginTop = '10px';
        label.style.color = '#fff';
        return label;
    };

    const createInput = (type, className, value = '', placeholder = '') => {
        const input = document.createElement('input');
        input.type = type;
        input.className = className;
        input.value = value;
        input.placeholder = placeholder;
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.marginTop = '5px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';
        return input;
    };

    const createSelect = (className, options, selectedValue = '') => {
        const select = document.createElement('select');
        select.className = className;
        select.style.width = '100%';
        select.style.padding = '8px';
        select.style.marginTop = '5px';
        select.style.border = '1px solid #ccc';
        select.style.borderRadius = '4px';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select --';
        select.appendChild(defaultOption);

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === selectedValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        return select;
    };

    const createTextarea = (className, value = '', placeholder = '') => {
        const textarea = document.createElement('textarea');
        textarea.className = className;
        textarea.value = value;
        textarea.placeholder = placeholder;
        textarea.style.width = '100%';
        textarea.style.padding = '8px';
        textarea.style.marginTop = '5px';
        textarea.style.border = '1px solid #ccc';
        textarea.style.borderRadius = '4px';
        textarea.style.resize = 'vertical';
        return textarea;
    };

    const createButton = (className, innerHTML, title = '') => {
        const button = document.createElement('button');
        button.className = className;
        button.innerHTML = innerHTML;
        button.title = title;
        button.style.padding = '10px 20px';
        button.style.margin = '10px 5px 0 0';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = '#fff';
        return button;
    };

    // Define stat options
    const statOptions = [
        // Physical Damage Section
        { key: 'damage', label: 'Physical Melee Damage' },
        { key: 'rangedDamage', label: 'Physical Ranged Damage' },
        
        // Magical Damage Section
        { key: 'spellDamage', label: 'Spell Damage' },
        { key: 'healingPower', label: 'Healing Power' },
        
        // Regeneration Section
        { key: 'healthRegen', label: 'Health Regeneration' },
        { key: 'manaRegen', label: 'Mana Regeneration' },
        
        // Maximum Stats Section
        { key: 'increaseMaxHealth', label: 'Increase Max Health' },
        { key: 'increaseMaxMana', label: 'Increase Max Mana' },
        
        // Restore Section
        { key: 'restoreHealth', label: 'Health Restore' },
        { key: 'restoreMana', label: 'Mana Restore' },
        
        // Defense and Utility Section
        { key: 'moveSpeed', label: 'Movement Speed' },
        { key: 'armor', label: 'Armor' },
        { key: 'critChance', label: 'Crit Chance' },
        { key: 'carryingCapacity', label: 'Increased Encumbrance' }
    ];

    // Parse existing stats
    let currentStats = {};
    try {
        currentStats = JSON.parse(item.dataset.effects || '{}');
        console.log('Parsed current stats:', currentStats);
    } catch (e) {
        console.error('Error parsing item stats:', e);
    }

    // Create tooltip content container
    const content = document.createElement('div');
    content.className = 'item-edit-content';
    tooltip.appendChild(content);
    console.log('Tooltip content container appended.');

    // =========================
    // Step 1: Basic Information
    // =========================
    const step1 = document.createElement('div');
    step1.className = 'tooltip-step step-1 active';
    content.appendChild(step1);
    console.log('Step 1 container created and appended.');

    // Item Name
    const nameLabel = createLabel('Item Name');
    step1.appendChild(nameLabel);
    const nameInput = createInput('text', 'item-edit-name', item.dataset.name || '', 'Enter item name');
    step1.appendChild(nameInput);
    console.log('Item Name input created.');

    // Rarity Selection
    const rarityLabel = createLabel('Rarity');
    step1.appendChild(rarityLabel);
    const raritySelect = createSelect('rarity-select', [
        { value: 'common', label: 'Common' },
        { value: 'uncommon', label: 'Uncommon' },
        { value: 'rare', label: 'Rare' },
        { value: 'epic', label: 'Epic' },
        { value: 'legendary', label: 'Legendary' },
        // Add more rarities as needed
    ], item.dataset.rarity || 'common');
    step1.appendChild(raritySelect);
    console.log('Rarity select created.');

    // Description
    const descriptionLabel = createLabel('Description');
    step1.appendChild(descriptionLabel);
    const descriptionTextarea = createTextarea('tooltip-description', item.dataset.description || '', 'Enter item description');
    step1.appendChild(descriptionTextarea);
    console.log('Description textarea created.');

    // Type Selection
    const typeLabel = createLabel('Type');
    step1.appendChild(typeLabel);
    const typeSelect = createSelect('type-select', [
        { value: 'weapon', label: 'Weapon' },
        { value: 'armor', label: 'Armor' },
        { value: 'accessory', label: 'Accessory' },
        { value: 'consumable', label: 'Consumable' },
        { value: 'reagent', label: 'Reagent' },
        { value: 'other', label: 'Other' }
    ], item.dataset.type || '');
    step1.appendChild(typeSelect);
    console.log('Type select created.');

    // Navigation Buttons for Step 1
    const navigationButtons1 = document.createElement('div');
    navigationButtons1.className = 'navigation-buttons';
    navigationButtons1.style.marginTop = '10px'; // Add margin for spacing
    const nextButton1 = createButton('navigation-arrow', '&#8594;', 'Next Step');
    nextButton1.style.display = 'none'; // Initially hidden
    navigationButtons1.appendChild(nextButton1);
    step1.appendChild(navigationButtons1);
    console.log('Navigation buttons for Step 1 created.');

    // =========================
    // Step 2: Dynamic Type-Specific Options
    // =========================
    const step2 = document.createElement('div');
    step2.className = 'tooltip-step step-2';
    content.appendChild(step2);
    console.log('Step 2 container created and appended.');

    // Dynamic Sections Container
    const dynamicSections = document.createElement('div');
    dynamicSections.className = 'dynamic-sections';
    step2.appendChild(dynamicSections);
    console.log('Dynamic sections container for Step 2 created.');

    // Navigation Buttons for Step 2
    const navigationButtons2 = document.createElement('div');
    navigationButtons2.className = 'navigation-buttons';
    navigationButtons2.style.marginTop = '10px'; // Add margin for spacing
    const backButton2 = createButton('navigation-arrow', '&#8592;', 'Previous Step');
    const nextButton2 = createButton('navigation-arrow', '&#8594;', 'Next Step');
    navigationButtons2.appendChild(backButton2);
    navigationButtons2.appendChild(nextButton2);
    step2.appendChild(navigationButtons2);
    console.log('Navigation buttons for Step 2 created.');

// =========================
// Step 3: Base Stats
// =========================
const step3 = document.createElement('div');
step3.className = 'tooltip-step step-3';
content.appendChild(step3);

// Base Stats Section
const baseStatsLabel = createLabel('Base Stats');
step3.appendChild(baseStatsLabel);
const baseStatsContainer = document.createElement('div');
baseStatsContainer.className = 'stats-container';
baseStatsContainer.style.display = 'grid';
baseStatsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
baseStatsContainer.style.gap = '10px';
step3.appendChild(baseStatsContainer);

// Create Base Stats Inputs
[
    { key: 'str', label: 'Strength' },
    { key: 'agi', label: 'Agility' },
    { key: 'con', label: 'Constitution' },
    { key: 'int', label: 'Intellect' },
    { key: 'spir', label: 'Spirit' },
    { key: 'cha', label: 'Charisma' }
].forEach(stat => {
    const statRow = document.createElement('div');
    statRow.className = 'stat-row';
    statRow.style.display = 'flex';
    statRow.style.alignItems = 'center';
    statRow.style.marginTop = '5px';

    const statLabel = createLabel(stat.label);
    statLabel.style.flex = '1';
    statLabel.style.margin = '0';

    const statInput = createInput('number', 'stat-input', currentStats[stat.key] || '0', '0');
    statInput.min = '0';
    statInput.dataset.stat = stat.key;
    statInput.style.flex = '1';
    statInput.style.marginLeft = '10px';

    statRow.appendChild(statLabel);
    statRow.appendChild(statInput);
    baseStatsContainer.appendChild(statRow);

    // Event Listener
    statInput.addEventListener('input', () => {
        console.log(`Base stat ${stat.key} updated to: ${statInput.value}`);
        this.updateItemData(item, tooltip);
    });
});

// Navigation Buttons for Step 3
const navigationButtons3 = document.createElement('div');
navigationButtons3.className = 'navigation-buttons';
navigationButtons3.style.marginTop = '10px';
const backButton3 = createButton('navigation-arrow', '&#8592;', 'Previous Step');
const nextButton3 = createButton('navigation-arrow', '&#8594;', 'Next Step');
navigationButtons3.appendChild(backButton3);
navigationButtons3.appendChild(nextButton3);
step3.appendChild(navigationButtons3);

// =========================
// Step 4: Derived Stats (Keep your new version)
// =========================
const step4 = document.createElement('div');
step4.className = 'tooltip-step step-4';
content.appendChild(step4);

// Derived Stats Section
const derivedStatsLabel = createLabel('Derived Stats');
step4.appendChild(derivedStatsLabel);

// Create derived stats container with grid layout
const derivedStatsContainer = document.createElement('div');
derivedStatsContainer.className = 'stats-container';
derivedStatsContainer.style.display = 'grid';
derivedStatsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
derivedStatsContainer.style.gap = '10px';
step4.appendChild(derivedStatsContainer);

// Create Derived Stats Inputs in the specified order
[
    // Physical Damage Section
    { key: 'damage', label: 'Physical Melee Damage' },
    { key: 'rangedDamage', label: 'Physical Ranged Damage' },
    
    // Magical Damage Section
    { key: 'spellDamage', label: 'Spell Damage' },
    { key: 'healingPower', label: 'Healing Power' },
    
    // Regeneration Section
    { key: 'healthRegen', label: 'Health Regeneration' },
    { key: 'manaRegen', label: 'Mana Regeneration' },
    
    // Maximum Stats Section
    { key: 'increaseMaxHealth', label: 'Increase Max Health' },
    { key: 'increaseMaxMana', label: 'Increase Max Mana' },
    
    // Restore Section
    { key: 'restoreHealth', label: 'Health Restore' },
    { key: 'restoreMana', label: 'Mana Restore' },
    
    // Defense and Utility Section
    { key: 'moveSpeed', label: 'Movement Speed' },
    { key: 'armor', label: 'Armor' },
    { key: 'critChance', label: 'Crit Chance' },
    { key: 'carryingCapacity', label: 'Increased Encumbrance' }
].forEach(stat => {
    const statRow = document.createElement('div');
    statRow.className = 'stat-row';
    statRow.style.display = 'flex';
    statRow.style.alignItems = 'center';
    statRow.style.marginTop = '5px';

    const statLabel = createLabel(stat.label);
    statLabel.style.flex = '1';
    statLabel.style.margin = '0';

    const statInput = createInput('number', 'stat-input', currentStats[stat.key] || '0', '0');
    statInput.min = '0';
    statInput.dataset.stat = stat.key;
    statInput.style.flex = '1';
    statInput.style.marginLeft = '10px';

    statRow.appendChild(statLabel);
    statRow.appendChild(statInput);
    derivedStatsContainer.appendChild(statRow);

    // Event Listener
    statInput.addEventListener('input', () => {
        console.log(`Derived stat ${stat.key} updated to: ${statInput.value}`);
        this.updateItemData(item, tooltip);
    });
});

// Navigation Buttons for Step 4
const navigationButtons4 = document.createElement('div');
navigationButtons4.className = 'navigation-buttons';
navigationButtons4.style.marginTop = '10px';
const backButton4 = createButton('navigation-arrow', '&#8592;', 'Previous Step');
const nextButton4 = createButton('navigation-arrow', '&#8594;', 'Next Step');
navigationButtons4.appendChild(backButton4);
navigationButtons4.appendChild(nextButton4);
step4.appendChild(navigationButtons4);
    // =========================
    // Step 5: Value
    // =========================
    const step5 = document.createElement('div');
    step5.className = 'tooltip-step step-5';
    content.appendChild(step5);
    console.log('Step 5 container created and appended.');

    // Value Section
    const valueLabel = createLabel('Value');
    step5.appendChild(valueLabel);
    const valueContainer = document.createElement('div');
    valueContainer.className = 'value-container';
    valueContainer.style.display = 'flex';
    valueContainer.style.justifyContent = 'space-between';
    step5.appendChild(valueContainer);
    console.log('Value container created.');

    const goldInput = createInput('number', 'value-gold-input', item.dataset.valueGold || '0', 'Gold');
    const silverInput = createInput('number', 'value-silver-input', item.dataset.valueSilver || '0', 'Silver');
    const copperInput = createInput('number', 'value-copper-input', item.dataset.valueCopper || '0', 'Copper');
    goldInput.min = '0';
    silverInput.min = '0';
    copperInput.min = '0';
    goldInput.style.marginRight = '5px';
    silverInput.style.marginRight = '5px';
    valueContainer.appendChild(goldInput);
    valueContainer.appendChild(silverInput);
    valueContainer.appendChild(copperInput);
    console.log('Value inputs created.');

    // Event Listeners for Value Inputs
    [goldInput, silverInput, copperInput].forEach(input => {
        input.addEventListener('input', () => {
            console.log(`Value updated: Gold=${goldInput.value}, Silver=${silverInput.value}, Copper=${copperInput.value}`);
            this.updateItemData(item, tooltip);
        });
    });

    // =========================
    // Save Button (Always Visible)
    // =========================
    const saveButtonContainer = document.createElement('div');
    saveButtonContainer.style.textAlign = 'right';
    saveButtonContainer.style.marginTop = '20px';

    const saveButton = createButton('save-item-btn', 'Save Item');
    saveButtonContainer.appendChild(saveButton);
    tooltip.appendChild(saveButtonContainer);
    console.log('Save button created and appended outside steps.');

    // =========================
    // Navigation Buttons for Step 5
    // =========================
    const navigationButtons5 = document.createElement('div');
    navigationButtons5.className = 'navigation-buttons';
    navigationButtons5.style.marginTop = '10px'; // Add margin for spacing
    const backButton5 = createButton('navigation-arrow', '&#8592;', 'Previous Step');
    navigationButtons5.appendChild(backButton5);
    step5.appendChild(navigationButtons5);
    console.log('Navigation buttons for Step 5 created.');

    // =========================
    // Remove Drag Handle
    // =========================
    // Removed the separate drag handle to avoid conflicts

    // =========================
    // Append Tooltip to Body
    // =========================
    document.body.appendChild(tooltip);
    console.log('Tooltip appended to body.');

    // Trigger the Transition to Make the Tooltip Visible
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'scale(1)';
    });
    console.log('Tooltip visibility transition triggered.');

    // =========================
    // Tooltip Positioning
    // =========================
    const updateTooltipPosition = () => {
        const rect = item.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = rect.right + 10;
        let top = rect.top;

        // Adjust position if tooltip goes beyond the viewport
        if (left + tooltipRect.width > window.innerWidth) {
            left = rect.left - tooltipRect.width - 10;
        }

        if (top + tooltipRect.height > window.innerHeight) {
            top = Math.max(10, window.innerHeight - tooltipRect.height - 10);
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        console.log(`Tooltip positioned at left: ${left}px, top: ${top}px.`);
    };

    updateTooltipPosition();
    window.addEventListener('scroll', updateTooltipPosition);
    window.addEventListener('resize', updateTooltipPosition);
    console.log('Tooltip positioning event listeners added.');

    // Prevent tooltip from closing when interacting with it
    tooltip.addEventListener('mousedown', (e) => e.stopPropagation());
    tooltip.addEventListener('click', (e) => e.stopPropagation());
    console.log('Tooltip interaction event listeners added.');

    // Click outside to close tooltip
    const handleClickOutside = (e) => {
        if (!tooltip.contains(e.target)) {
            this.removeItemGenTooltip(item);
            console.log('Clicked outside tooltip. Tooltip removed.');
            document.removeEventListener('click', handleClickOutside);
        }
    };

    document.addEventListener('click', handleClickOutside);
    console.log('Click outside event listener added.');

    // Store references for future updates
    item.persistentTooltip = tooltip;
    item.updateTooltipPosition = updateTooltipPosition;
    console.log('Tooltip references stored on item.');

    // =========================
    // Navigation and Event Handlers
    // =========================

    // Function to navigate to a specific step
    const navigateToStep = (stepNumber) => {
        const steps = tooltip.querySelectorAll('.tooltip-step');
        steps.forEach(step => step.classList.remove('active'));
        const targetStep = tooltip.querySelector(`.step-${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
            console.log(`Navigated to Step ${stepNumber}.`);
        }
    };

    // Function to validate Step 2 (Dynamic Content)
    const validateStep2 = () => {
        // Implement specific validations based on the selected type
        // For now, assume it's always valid
        return true;
    };

    // Function to validate all inputs before saving
    const validateAllInputs = () => {
        if (!nameInput.value.trim()) {
            alert('Item Name is required.');
            return false;
        }
        if (!typeSelect.value) {
            alert('Item Type is required.');
            return false;
        }
        // Additional validations can be added here
        return true;
    };

    // Event Listener: Show Next button in Step 1 when Type is selected
    typeSelect.addEventListener('change', () => {
        if (typeSelect.value) {
            nextButton1.style.display = 'inline';
        } else {
            nextButton1.style.display = 'none';
        }
    });

    // Event Listener: Next Button Click - Navigate to Step 2
    nextButton1.addEventListener('click', () => {
        if (validateStep2()) {
            navigateToStep(2);
        }
    });

    // Event Listener: Back Button Click - Navigate to Step 1
    backButton2.addEventListener('click', () => {
        navigateToStep(1);
    });

    // Event Listener: Next Button Click in Step 2 - Navigate to Step 3
    nextButton2.addEventListener('click', () => {
        if (validateStep2()) {
            navigateToStep(3);
        }
    });

    // Event Listener: Back Button Click in Step 3 - Navigate to Step 2
    backButton3.addEventListener('click', () => {
        navigateToStep(2);
    });

    // Event Listener: Next Button Click in Step 3 - Navigate to Step 4
    nextButton3.addEventListener('click', () => {
        navigateToStep(4);
    });

    // Event Listener: Back Button Click in Step 4 - Navigate to Step 3
    backButton4.addEventListener('click', () => {
        navigateToStep(3);
    });

    // Event Listener: Next Button Click in Step 4 - Navigate to Step 5
    nextButton4.addEventListener('click', () => {
        navigateToStep(5);
    });

    // Event Listener: Back Button Click in Step 5 - Navigate to Step 4
    backButton5.addEventListener('click', () => {
        navigateToStep(4);
    });

    // Event Listener: Save Button Click - Validate and Save
    saveButton.addEventListener('click', () => {
        if (validateAllInputs()) {
            this.updateItemData(item, tooltip);
            this.removeItemGenTooltip(item);
            this.exitEditMode(); // Add this line to properly exit edit mode
            const editButton = document.querySelector('.edit-button');
            if (editButton) {
                editButton.classList.remove('active');
            }
        }
    });

    // =========================
    // Step 2: Dynamic Content Rendering Based on Type
    // =========================
    typeSelect.addEventListener('change', () => {
        renderDynamicContent(typeSelect.value);
    });

    const renderDynamicContent = (type) => {
        dynamicSections.innerHTML = ''; // Clear previous content
        console.log(`Rendering dynamic content for type: ${type}`);

        switch (type) {
            case 'weapon':
                this.createWeaponSection(dynamicSections, item, tooltip);
                break;
            case 'armor':
                this.createArmorSection(dynamicSections, item, tooltip);
                break;
            case 'accessory':
                this.createAccessorySection(dynamicSections, item, tooltip);
                break;
            case 'consumable':
                this.createConsumableSection(dynamicSections, item, tooltip);
                break;
            case 'reagent':
                this.createReagentSection(dynamicSections, item, tooltip);
                break;
            case 'other':
                this.createOtherSection(dynamicSections, item, tooltip);
                break;
            default:
                dynamicSections.innerHTML = '<p style="color: #fff;">No additional options available for this type.</p>';
        }
    };

    // Initialize dynamic content based on existing type
    renderDynamicContent(typeSelect.value);
    console.log('Dynamic content initialized based on existing type.');
},


removeItemGenTooltip(item) {
    if (item.persistentTooltip) {
        if (item.updateTooltipPosition) {
            window.removeEventListener('scroll', item.updateTooltipPosition);
            window.removeEventListener('resize', item.updateTooltipPosition);
        }

        item.persistentTooltip.remove();
        item.persistentTooltip = null;
        item.updateTooltipPosition = null;
        console.log('Tooltip removed from item.');
    }
},


createWeaponSection(container, item, tooltip) {
    console.log('Creating Weapon-specific sections.');

    // Weapon Category
    const weaponCategoryLabel = document.createElement('label');
    weaponCategoryLabel.textContent = 'Weapon Category';
    container.appendChild(weaponCategoryLabel);

    const weaponCategorySelect = document.createElement('select');
    weaponCategorySelect.className = 'weapon-category-select';
    weaponCategorySelect.innerHTML = `
        <option value="">-- Select --</option>
        <option value="melee">Melee</option>
        <option value="ranged">Ranged</option>
    `;
    container.appendChild(weaponCategorySelect);

    // Weapon Type
    const weaponTypeLabel = document.createElement('label');
    weaponTypeLabel.textContent = 'Weapon Type';
    container.appendChild(weaponTypeLabel);

    const weaponTypeSelect = document.createElement('select');
    weaponTypeSelect.className = 'weapon-type-select';
    weaponTypeSelect.innerHTML = '<option value="">-- Select --</option>';
    weaponTypeSelect.style.display = 'none'; // Initially hidden
    container.appendChild(weaponTypeSelect);

    // Weapon Slot
    const weaponSlotLabel = document.createElement('label');
    weaponSlotLabel.textContent = 'Weapon Slot';
    container.appendChild(weaponSlotLabel);

    const weaponSlotSelect = document.createElement('select');
    weaponSlotSelect.className = 'weapon-slot-select';
    weaponSlotSelect.innerHTML = `
        <option value="">-- Select --</option>
        <option value="Main Hand">Main Hand</option>
        <option value="Off-Hand">Off-Hand</option>
        <option value="One-Handed">One-Handed</option>
        <option value="Two-Handed">Two-Handed</option>
    `;
    weaponSlotSelect.style.display = 'none'; // Initially hidden
    container.appendChild(weaponSlotSelect);

    // Damage Dice
    const damageDiceLabel = document.createElement('label');
    damageDiceLabel.textContent = 'Damage Dice';
    container.appendChild(damageDiceLabel);

    const damageDiceSelect = document.createElement('select');
    damageDiceSelect.className = 'damage-dice-select';
    damageDiceSelect.innerHTML = `
        <option value="">-- Select --</option>
        <option value="1d4">1d4</option>
        <option value="1d6">1d6</option>
        <option value="1d8">1d8</option>
        <option value="1d10">1d10</option>
        <option value="1d12">1d12</option>
        <option value="2d6">2d6</option>
        <option value="2d8">2d8</option>
    `;
    container.appendChild(damageDiceSelect);

    // Event Listeners
    weaponCategorySelect.addEventListener('change', () => {
        const selectedCategory = weaponCategorySelect.value;

        // Populate Weapon Types based on category
        weaponTypeSelect.innerHTML = '<option value="">-- Select --</option>';
        if (selectedCategory === 'melee') {
            weaponTypeSelect.innerHTML += `
                <option value="Sword">Sword</option>
                <option value="Axe">Axe</option>
                <option value="Dagger">Dagger</option>
                <option value="Mace">Mace</option>
                <option value="Spear">Spear</option>
            `;
        } else if (selectedCategory === 'ranged') {
            weaponTypeSelect.innerHTML += `
                <option value="Bow">Bow</option>
                <option value="Crossbow">Crossbow</option>
                <option value="Gun">Gun</option>
                <option value="Throwing">Throwing</option>
            `;
        }

        weaponTypeSelect.style.display = selectedCategory ? 'block' : 'none';
        weaponSlotSelect.style.display = selectedCategory ? 'block' : 'none';

        // Reset subsequent fields
        weaponTypeSelect.value = '';
        weaponSlotSelect.value = '';
        this.updateItemData(item, tooltip);
    });

    weaponTypeSelect.addEventListener('change', () => {
        this.updateItemData(item, tooltip);
    });

    weaponSlotSelect.addEventListener('change', () => {
        this.updateItemData(item, tooltip);
    });

    damageDiceSelect.addEventListener('change', () => {
        this.updateItemData(item, tooltip);
    });

    // Initialize the fields based on existing item data
    initializeWeaponSection();

    function initializeWeaponSection() {
        // Set the weapon category
        if (item.dataset.weaponCategory) {
            weaponCategorySelect.value = item.dataset.weaponCategory;
            weaponCategorySelect.dispatchEvent(new Event('change'));
        }

        // Set the weapon type
        if (item.dataset.weaponType) {
            weaponTypeSelect.value = item.dataset.weaponType;
            weaponTypeSelect.style.display = 'block';
        }

        // Set the weapon slot
        if (item.dataset.slot) {
            weaponSlotSelect.value = item.dataset.slot;
            weaponSlotSelect.style.display = 'block';
        }

        // Set the damage dice
        if (item.dataset.damageDice) {
            damageDiceSelect.value = item.dataset.damageDice;
        }
    }
},




// itemgen.js

updateItemData(item, tooltip) {
    console.log('Updating item data based on tooltip inputs.');

    try {
        // Retrieve inputs from Step 1
        const nameInput = tooltip.querySelector('.item-edit-name');
        const raritySelect = tooltip.querySelector('.rarity-select');
        const descriptionTextarea = tooltip.querySelector('.tooltip-description');
        const typeSelect = tooltip.querySelector('.type-select');

        // Update Name
        if (nameInput) {
            item.dataset.name = nameInput.value.trim() || '';
            console.log(`Item name updated to: ${item.dataset.name}`);
        }

        // Update Rarity
        if (raritySelect) {
            item.dataset.rarity = raritySelect.value || 'common';
            tooltip.className = `item-edit-tooltip ${item.dataset.rarity}`;
            console.log(`Item rarity updated to: ${item.dataset.rarity}`);
        }

        // Update Description
        if (descriptionTextarea) {
            item.dataset.description = descriptionTextarea.value.trim() || '';
            console.log(`Item description updated.`);
        }

        // Update Type
        if (typeSelect) {
            item.dataset.type = typeSelect.value.toLowerCase() || '';
            console.log(`Item type updated to: ${item.dataset.type}`);
        }

        // Initialize stats object to store all stats
        const newStats = {};

        // Update Base Stats (Step 3)
        const baseStats = ['str', 'agi', 'con', 'int', 'spir', 'cha'];
        baseStats.forEach(statKey => {
            const input = tooltip.querySelector(`.stat-input[data-stat="${statKey}"]`);
            if (input) {
                const value = parseInt(input.value, 10) || 0;
                if (value !== 0) {
                    newStats[statKey] = value;
                }
            }
        });

        // Update Derived Stats (Step 4)
        const derivedStats = [
            'damage', 'rangedDamage', // Physical Damage
            'spellDamage', 'healingPower', // Magical Damage
            'healthRegen', 'manaRegen', // Regeneration
            'increaseMaxHealth', 'increaseMaxMana', // Maximum Stats
            'restoreHealth', 'restoreMana', // Restore
            'moveSpeed', 'armor', 'critChance', 'carryingCapacity' // Defense and Utility
        ];

        derivedStats.forEach(statKey => {
            const input = tooltip.querySelector(`.stat-input[data-stat="${statKey}"]`);
            if (input) {
                const value = parseInt(input.value, 10) || 0;
                if (value !== 0) {
                    newStats[statKey] = value;
                }
            }
        });

        // Update Type-Specific Fields
        switch (item.dataset.type) {
            case 'weapon':
                const weaponCategory = tooltip.querySelector('.weapon-category-select')?.value || '';
                const weaponType = tooltip.querySelector('.weapon-type-select')?.value || '';
                const weaponSlot = tooltip.querySelector('.weapon-slot-select')?.value || '';
                const damageDice = tooltip.querySelector('.damage-dice-select')?.value || '';

                item.dataset.weaponCategory = weaponCategory;
                item.dataset.weaponType = weaponType;
                item.dataset.slot = weaponSlot;
                item.dataset.damageDice = damageDice;

                console.log('Weapon data updated:', {
                    weaponCategory,
                    weaponType,
                    weaponSlot,
                    damageDice,
                });

                // Optionally, set 'damage' stat based on damageDice
                if (damageDice) {
                    // Example: Convert damageDice (e.g., '1d6') to a numerical value
                    const diceMatch = damageDice.match(/(\d+)d(\d+)/);
                    if (diceMatch) {
                        const numDice = parseInt(diceMatch[1], 10);
                        const diceSides = parseInt(diceMatch[2], 10);
                        // Average damage: numDice * (diceSides + 1) / 2
                        const averageDamage = Math.round(numDice * (diceSides + 1) / 2);
                        newStats.damage = averageDamage;
                        console.log(`Damage stat set to: ${averageDamage}`);
                    }
                }
                break;

            case 'armor':
                const armorType = tooltip.querySelector('.armor-type-select')?.value || '';
                item.dataset.armorType = armorType;

                if (armorType === 'armor') {
                    const armorMaterial = tooltip.querySelector('.armor-material-select')?.value || '';
                    const armorSlot = tooltip.querySelector('.armor-slot-select')?.value || '';

                    item.dataset.armorMaterial = armorMaterial;
                    item.dataset.slot = armorSlot;

                    console.log('Armor data updated:', {
                        armorMaterial,
                        armorSlot,
                    });

                    // Set 'armor' stat based on armor material
                    switch (armorMaterial) {
                        case 'Cloth':
                            newStats.armor = 5;
                            break;
                        case 'Leather':
                            newStats.armor = 10;
                            break;
                        case 'Mail':
                            newStats.armor = 15;
                            break;
                        case 'Plate':
                            newStats.armor = 20;
                            break;
                        default:
                            newStats.armor = 0;
                    }
                    console.log(`Armor stat set to: ${newStats.armor}`);
                } else if (armorType === 'shield') {
                    item.dataset.slot = 'Off-Hand';
                    item.dataset.type = 'shield';

                    // Set 'armor' stat for shield
                    newStats.armor = 8; // Example value
                    console.log(`Shield armor stat set to: ${newStats.armor}`);
                }
                break;

            case 'accessory':
                const accessoryType = tooltip.querySelector('.accessory-type-select')?.value || '';
                item.dataset.accessoryType = accessoryType;

                // Set slot based on accessory type
                if (accessoryType === 'Off-Hand Item') {
                    item.dataset.slot = 'Off-Hand';
                } else if (accessoryType === 'Ring') {
                    item.dataset.slot = 'Finger';
                } else if (accessoryType === 'Necklace') {
                    item.dataset.slot = 'Neck';
                } else {
                    item.dataset.slot = '';
                }

                console.log('Accessory data updated:', {
                    accessoryType,
                    slot: item.dataset.slot,
                });
                break;

            case 'consumable':
                // Handle consumable-specific fields if any
                break;

            case 'reagent':
                // Handle reagent-specific fields if any
                break;

            case 'other':
                // Handle other-type-specific fields if any
                break;

            default:
                // Handle unknown types
                break;
        }

        // Update effects dataset with all stats
        item.dataset.effects = JSON.stringify(newStats);
        console.log('Item stats updated:', newStats);

        // Update Value
        const goldInput = tooltip.querySelector('.value-gold-input');
        const silverInput = tooltip.querySelector('.value-silver-input');
        const copperInput = tooltip.querySelector('.value-copper-input');

        if (goldInput && silverInput && copperInput) {
            const gold = parseInt(goldInput.value, 10) || 0;
            const silver = parseInt(silverInput.value, 10) || 0;
            const copper = parseInt(copperInput.value, 10) || 0;

            const totalValue = (gold * 10000) + (silver * 100) + copper;

            item.dataset.value = totalValue.toString();
            item.dataset.valueGold = gold.toString();
            item.dataset.valueSilver = silver.toString();
            item.dataset.valueCopper = copper.toString();

            console.log(`Item value updated: Gold=${gold}, Silver=${silver}, Copper=${copper}, Total=${totalValue}`);
        } else {
            delete item.dataset.value;
            delete item.dataset.valueGold;
            delete item.dataset.valueSilver;
            delete item.dataset.valueCopper;
        }

        // Construct the itemData object
        const itemData = {
            itemId: item.dataset.itemId || '',
            instanceId: item.dataset.instanceId || '',
            name: item.dataset.name,
            description: item.dataset.description,
            rarity: item.dataset.rarity,
            type: item.dataset.type,
            image: item.dataset.image || '',
            value: parseInt(item.dataset.value, 10) || 0,
            valueGold: parseInt(item.dataset.valueGold, 10) || 0,
            valueSilver: parseInt(item.dataset.valueSilver, 10) || 0,
            valueCopper: parseInt(item.dataset.valueCopper, 10) || 0,
            effects: newStats,
            slot: item.dataset.slot || '',
            damageDice: item.dataset.damageDice || '',
            weaponType: item.dataset.weaponType || '',
            weaponCategory: item.dataset.weaponCategory || '',
            armorMaterial: item.dataset.armorMaterial || '',
            armorType: item.dataset.armorType || '',
            accessoryType: item.dataset.accessoryType || '',
            // Include any other properties you need
        };

        // Update item.dataset.itemData
        item.dataset.itemData = JSON.stringify(itemData);
        console.log('item.dataset.itemData updated:', item.dataset.itemData);

        // Update Item Classes
        item.className = `preview-item inventory-item ${item.dataset.rarity || 'common'}`;
        console.log(`Item classes updated to: ${item.className}`);

    } catch (error) {
        console.error('Error updating item data:', error);
    }
},







updateItemGenEditableState() {
    const items = document.querySelectorAll('.preview-item');
    const isEditModeActive = document.querySelector('.edit-button.active');

    items.forEach(item => {
        if (isEditModeActive) {
            // Remove hover events (assuming they exist)
            if (item.showItemInfoHandler) {
                item.removeEventListener('mousemove', item.showItemInfoHandler);
                item.removeEventListener('mouseout', this.hideItemInfo);
            }
            // Create persistent tooltip
            this.createItemGenTooltip(item);
        } else {
            // Remove persistent tooltip
            this.removeItemGenTooltip(item);

            // Restore hover events (assuming you have showItemInfo defined elsewhere)
            if (!item.showItemInfoHandler) {
                item.showItemInfoHandler = (e) => {
                    this.showItemInfo({
                        name: item.dataset.name,
                        description: item.dataset.description,
                        rarity: item.dataset.rarity
                    }, e);
                };
            }
            item.addEventListener('mousemove', item.showItemInfoHandler);
            item.addEventListener('mouseout', this.hideItemInfo);
        }
    });
},


createArmorSection(container, item, tooltip) {
    console.log('Creating Armor-specific sections.');

    // Armor Type
    const armorTypeLabel = document.createElement('label');
    armorTypeLabel.textContent = 'Armor Type';
    container.appendChild(armorTypeLabel);

    const armorTypeSelect = document.createElement('select');
    armorTypeSelect.className = 'armor-type-select';
    armorTypeSelect.innerHTML = `
        <option value="">-- Select --</option>
        <option value="armor">Body Armor</option>
        <option value="shield">Shield</option>
    `;
    container.appendChild(armorTypeSelect);

    // Armor Material (for body armor)
    const armorMaterialContainer = document.createElement('div');
    armorMaterialContainer.className = 'armor-material-container';
    const armorMaterialLabel = document.createElement('label');
    armorMaterialLabel.textContent = 'Armor Material';
    const armorMaterialSelect = document.createElement('select');
    armorMaterialSelect.className = 'armor-material-select';
    armorMaterialSelect.innerHTML = `
        <option value="">-- Select --</option>
        <option value="Cloth">Cloth</option>
        <option value="Leather">Leather</option>
        <option value="Mail">Mail</option>
        <option value="Plate">Plate</option>
    `;
    armorMaterialContainer.appendChild(armorMaterialLabel);
    armorMaterialContainer.appendChild(armorMaterialSelect);
    container.appendChild(armorMaterialContainer);

    // Armor Slot Container
    const armorSlotContainer = document.createElement('div');
    armorSlotContainer.className = 'armor-slot-container';
    const armorSlotLabel = document.createElement('label');
    armorSlotLabel.textContent = 'Armor Slot';
    const armorSlotSelect = document.createElement('select');
    armorSlotSelect.className = 'armor-slot-select';
    armorSlotContainer.appendChild(armorSlotLabel);
    armorSlotContainer.appendChild(armorSlotSelect);
    container.appendChild(armorSlotContainer);

    // Function to update slot options based on armor type
    const updateSlotOptions = () => {
        const armorType = armorTypeSelect.value;
        armorSlotSelect.innerHTML = '<option value="">-- Select --</option>';

        if (armorType === 'armor') {
            armorSlotSelect.innerHTML += `
                <option value="Head">Head</option>
                <option value="Chest">Chest</option>
                <option value="Legs">Legs</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Hands">Hands</option>
                <option value="Feet">Feet</option>
                <option value="Waist">Waist</option>
                <option value="Wrists">Wrists</option>
            `;
            armorMaterialContainer.style.display = 'block';
            armorSlotContainer.style.display = 'block';
        } else if (armorType === 'shield') {
            armorMaterialContainer.style.display = 'none';
            armorSlotContainer.style.display = 'none';
        } else {
            armorMaterialContainer.style.display = 'none';
            armorSlotContainer.style.display = 'none';
        }

        // Reset selects when armor type changes
        armorMaterialSelect.value = '';
        armorSlotSelect.value = '';
        this.updateItemData(item, tooltip);
    };

    // Event Listeners
    armorTypeSelect.addEventListener('change', () => {
        updateSlotOptions();
        this.updateItemData(item, tooltip);
    });

    armorMaterialSelect.addEventListener('change', () => {
        this.updateItemData(item, tooltip);
    });

    armorSlotSelect.addEventListener('change', () => {
        this.updateItemData(item, tooltip);
    });

    // Initialize the fields based on existing item data
    initializeArmorSection();

    function initializeArmorSection() {
        // Set the armor type
        if (item.dataset.armorType) {
            armorTypeSelect.value = item.dataset.armorType;
            updateSlotOptions();
        }

        // Set the armor material
        if (item.dataset.armorMaterial) {
            armorMaterialSelect.value = item.dataset.armorMaterial;
        }

        // Set the armor slot
        if (item.dataset.slot) {
            armorSlotSelect.value = item.dataset.slot;
        }
    }
},



createAccessorySection(container, item, tooltip) {
    console.log('Creating Accessory-specific sections.');

    // Accessory Type
    const accessoryTypeLabel = document.createElement('label');
    accessoryTypeLabel.textContent = 'Accessory Type';
    container.appendChild(accessoryTypeLabel);

    const accessoryTypeSelect = document.createElement('select');
    accessoryTypeSelect.className = 'accessory-type-select';
    accessoryTypeSelect.innerHTML = `
        <option value="">-- Select --</option>
        <option value="Ring">Ring</option>
        <option value="Necklace">Necklace</option>
        <option value="Trinket">Trinket</option>
        <option value="Off-Hand Item">Off-Hand Item</option>
    `;
    accessoryTypeSelect.value = item.dataset.accessoryType || '';
    container.appendChild(accessoryTypeSelect);

    accessoryTypeSelect.addEventListener('change', () => {
        this.updateItemData(item, tooltip);
    });
},



createConsumableSection(container, item) {
    const durationContainer = document.createElement('div');
    durationContainer.className = 'duration-fields';

    const durationInputs = [
        { label: 'Hours', key: 'hours', value: Math.floor((item.dataset.consumableDuration || 0) / 3600) },
        { label: 'Minutes', key: 'minutes', value: Math.floor(((item.dataset.consumableDuration || 0) % 3600) / 60) },
        { label: 'Seconds', key: 'seconds', value: (item.dataset.consumableDuration || 0) % 60 }
    ];

    durationInputs.forEach(({ label, key, value }) => {
        const fieldContainer = document.createElement('div');
        fieldContainer.style.marginBottom = '10px';
        
        const durationLabel = document.createElement('label');
        durationLabel.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.className = `duration-${key}-input`;
        input.value = value;
        input.min = '0';
        input.addEventListener('input', () => {
            const hours = parseInt(durationContainer.querySelector('.duration-hours-input').value || 0);
            const minutes = parseInt(durationContainer.querySelector('.duration-minutes-input').value || 0);
            const seconds = parseInt(durationContainer.querySelector('.duration-seconds-input').value || 0);
            const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
            item.dataset.consumableDuration = totalSeconds;
            this.updateItemData(item, container.closest('.item-edit-tooltip'));
        });

        fieldContainer.appendChild(durationLabel);
        fieldContainer.appendChild(input);
        durationContainer.appendChild(fieldContainer);
    });

    container.appendChild(durationContainer);

    // Consumable Effect
    const consumableEffectLabel = document.createElement('label');
    consumableEffectLabel.textContent = 'Consumable Effect';
    container.appendChild(consumableEffectLabel);

    const consumableEffectTextarea = createTextarea('consumable-effect-textarea', item.dataset.consumableEffect || '', 'Describe the effect');
    container.appendChild(consumableEffectTextarea);

    consumableEffectTextarea.addEventListener('input', () => {
        this.updateItemData(item, container.closest('.tooltip-step'));
    });
},


createReagentSection(container, item) {
    console.log('Creating Reagent-specific sections.');

    // Reagent Effect
    const reagentEffectLabel = document.createElement('label');
    reagentEffectLabel.textContent = 'Reagent Effect';
    container.appendChild(reagentEffectLabel);

    const reagentEffectInput = createInput('text', 'reagent-effect-input', item.dataset.reagentEffect || '', 'Describe the effect');
    container.appendChild(reagentEffectInput);
    console.log('Reagent Effect input created.');

    // Reagent Quantity
    const reagentQuantityLabel = document.createElement('label');
    reagentQuantityLabel.textContent = 'Quantity';
    container.appendChild(reagentQuantityLabel);

    const reagentQuantityInput = createInput('number', 'reagent-quantity-input', item.dataset.reagentQuantity || '0', 'Quantity');
    reagentQuantityInput.min = '0';
    container.appendChild(reagentQuantityInput);
    console.log('Reagent Quantity input created.');

    // Event Listeners for Reagent Sections
    reagentEffectInput.addEventListener('input', () => {
        console.log(`Reagent Effect updated to: ${reagentEffectInput.value}`);
        this.updateItemData(item, container.closest('.tooltip-step'));
    });

    reagentQuantityInput.addEventListener('input', () => {
        console.log(`Reagent Quantity updated to: ${reagentQuantityInput.value}`);
        this.updateItemData(item, container.closest('.tooltip-step'));
    });
},


createOtherSection(container, item) {
    console.log('Creating Other-type-specific sections.');

    // Other Detail
    const otherDetailLabel = document.createElement('label');
    otherDetailLabel.textContent = 'Detail';
    container.appendChild(otherDetailLabel);

    const otherDetailInput = createInput('text', 'other-detail-input', item.dataset.otherDetail || '', 'Enter details');
    container.appendChild(otherDetailInput);
    console.log('Other Detail input created.');

    // Other Additional Information
    const otherAdditionalLabel = document.createElement('label');
    otherAdditionalLabel.textContent = 'Additional Information';
    container.appendChild(otherAdditionalLabel);

    const otherAdditionalTextarea = createTextarea('other-additional-textarea', item.dataset.otherAdditional || '', 'Provide additional information');
    container.appendChild(otherAdditionalTextarea);
    console.log('Other Additional Information textarea created.');

    // Event Listeners for Other Sections
    otherDetailInput.addEventListener('input', () => {
        console.log(`Other Detail updated to: ${otherDetailInput.value}`);
        this.updateItemData(item, container.closest('.tooltip-step'));
    });

    otherAdditionalTextarea.addEventListener('input', () => {
        console.log(`Other Additional Information updated to: ${otherAdditionalTextarea.value}`);
        this.updateItemData(item, container.closest('.tooltip-step'));
    });
},





    initializeImageUpload() {
        const controlsContainer = document.querySelector('.item-gen-controls');
        if (!controlsContainer) return;
    
        // Create Image Upload Button
        const imageButton = document.createElement('button');
        imageButton.className = 'image-button';
        imageButton.title = "Change Item Image";
        imageButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
        `;
    
        controlsContainer.appendChild(imageButton);
    
        // Image Button Click Handler
        imageButton.addEventListener('click', () => {
            console.log('Image button clicked, current mode:', this.isImageMode); // Debug log
            if (this.isImageMode) {
                this.exitImageMode();
            } else {
                this.enterImageMode();
            }
        });
    
        // Create and initialize modal
        const modalTemplate = document.createElement('div');
        modalTemplate.className = 'image-upload-modal';
        modalTemplate.style.display = 'none';
        modalTemplate.innerHTML = `
            <div class="modal-header">
                <span class="modal-title">Change Item Image</span>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-content">
                <div class="upload-section">
                    <input type="file" accept="image/*" class="file-input" style="display: none;">
                    <div class="file-drop-zone">
                        Drop image here or click to upload
                    </div>
                </div>
                <div class="url-section">
                    <input type="text" placeholder="Or enter image URL" class="url-input">
                </div>
                <div class="preview-section">
                    <img class="image-preview" src="" alt="" style="display: none;">
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-cancel">Cancel</button>
                <button class="modal-confirm">Confirm</button>
            </div>
        `;
    
        document.body.appendChild(modalTemplate);
        this.initializeModalDrag(modalTemplate);
        this.initializeImageUploadHandlers(modalTemplate);
    },

    // Add these new methods
    enterImageMode() {
        console.log('Entering image mode'); // Debug log
        this.isImageMode = true;
        this.isDrawMode = false;
        this.isEditMode = false;
        
        const imageButton = document.querySelector('.image-button');
        const drawButton = document.querySelector('.draw-button');
        const editButton = document.querySelector('.edit-button');
        
        imageButton?.classList.add('active');
        drawButton?.classList.remove('active');
        editButton?.classList.remove('active');
        
        document.body.style.cursor = 'pointer';
        
        // Add click handlers to items
        const items = document.querySelectorAll('.preview-item');
        items.forEach(item => {
            // Remove existing listeners first to prevent duplicates
            item.removeEventListener('click', this.handleItemImageClick);
            item.addEventListener('click', this.handleItemImageClick);
            console.log('Added click handler to item:', item); // Debug log
        });
    
        // Add click outside handler
        document.addEventListener('click', this.handleClickOutsideImage);
    },

    exitImageMode() {
        this.isImageMode = false;
        
        const imageButton = document.querySelector('.image-button');
        imageButton.classList.remove('active');
        
        document.body.style.cursor = '';
        
        // Restore default state for all items
        const items = document.querySelectorAll('.preview-item');
        items.forEach(item => {
            // Remove image click handler
            item.removeEventListener('click', this.handleItemImageClick);
            
            // Restore hover events
            if (!item.showItemInfoHandler) {
                item.showItemInfoHandler = (e) => {
                    this.showItemInfo({
                        name: item.dataset.name,
                        description: item.dataset.description,
                        rarity: item.dataset.rarity
                    }, e);
                };
            }
            item.addEventListener('mousemove', item.showItemInfoHandler);
            item.addEventListener('mouseout', this.hideItemInfo);
        });
    
        // Remove click outside handler
        document.removeEventListener('click', this.handleClickOutsideImage);
    },

    handleItemImageClick(e) {
        if (!ItemGenerator.isImageMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const item = e.currentTarget;
        const modal = document.querySelector('.image-upload-modal');
        if (!modal) {
            console.error('Modal not found');
            return;
        }
        
        // Set display to block and reset opacity
        modal.style.display = 'block';
        modal.style.opacity = '1';
        modal.dataset.targetItem = item.dataset.instanceId;
        
        // Reset modal position
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.left = '50%';
        modal.style.top = '50%';
        
        // Show current image if exists
        const preview = modal.querySelector('.image-preview');
        const currentImage = item.querySelector('.item-image');
        if (currentImage && currentImage.src) {
            preview.src = currentImage.src;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
            preview.src = '';
        }
    
        // Enable drop zone clicking
        const dropZone = modal.querySelector('.file-drop-zone');
        const fileInput = modal.querySelector('.file-input');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => {
                fileInput.click();
            });
        }
    },
    initializeModalDrag(modal) {
        const header = modal.querySelector('.modal-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            modal.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            modal.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            modal.style.cursor = '';
        });
    },
    handleClickOutsideImage(e) {
        if (!ItemGenerator.isImageMode) return;
    
        const clickedItem = e.target.closest('.preview-item');
        const clickedModal = e.target.closest('.image-upload-modal');
        const clickedImageButton = e.target.closest('.image-button');
    
        if (!clickedItem && !clickedModal && !clickedImageButton) {
            ItemGenerator.exitImageMode();
        }
    },

// Initialize Image Upload Handlers
initializeImageUploadHandlers(modal) {
    const fileInput = modal.querySelector('.file-input');
    const dropZone = modal.querySelector('.file-drop-zone');
    const urlInput = modal.querySelector('.url-input');
    const preview = modal.querySelector('.image-preview');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const confirmBtn = modal.querySelector('.modal-confirm');

    // File Input Handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            this.handleImageFile(file, preview);
        }
    });

    // Drop Zone Handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            this.handleImageFile(file, preview);
        }
    });

    // URL Input Handler
    urlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url && this.isValidURL(url)) {
            preview.src = url;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
            preview.src = '';
        }
    });

    // Close/Cancel Handlers
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.animation = 'modalFadeOut 0.3s ease-out';
            setTimeout(() => {
                modal.style.display = 'none';
                this.exitImageMode();
            }, 300);
        });
    });


const handleConfirmClick = function() {
    const targetItemId = modal.dataset.targetItem;
    const targetItem = document.querySelector(`.preview-item[data-instance-id="${targetItemId}"]`);
    const newImageSrc = preview.src.trim();

    if (targetItem && newImageSrc && this.isValidURL(newImageSrc)) {
        let img = targetItem.querySelector('.item-image');
        if (!img) {
            img = document.createElement('img');
            img.className = 'item-image';
            targetItem.appendChild(img);
        }
        img.src = newImageSrc;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = false;

        // Update the item's stored image URL in dataset
        targetItem.dataset.image = newImageSrc;

        // Update the general hover tooltip if it's visible
        const generalTooltip = document.getElementById('itemGen-tooltip');
        if (generalTooltip && generalTooltip.style.display === 'block') {
            const tooltipImage = generalTooltip.querySelector('.item-info-image img');
            if (tooltipImage) {
                tooltipImage.src = newImageSrc;
            }
        }

        // Update the persistent edit mode tooltip if it exists and is visible
        if (targetItem.persistentTooltip && targetItem.persistentTooltip.style.display === 'block') {
            const persistentTooltipImage = targetItem.persistentTooltip.querySelector('.item-info-image img');
            if (persistentTooltipImage) {
                persistentTooltipImage.src = newImageSrc;
            }
        }

        alert('Image updated successfully!');
    } else {
        alert('Invalid image URL. Please provide a valid URL.');
    }

    // Close the modal after confirmation
    this.closeImageUploadModal(modal);
}.bind(this); // Bind 'this' to maintain context


    // Remove existing event listeners to prevent multiple bindings
    confirmBtn.removeEventListener('click', handleConfirmClick);
    confirmBtn.addEventListener('click', handleConfirmClick);
},


// Handle Image File Upload
handleImageFile(file, preview) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
},


    // Show Draw Item Confirmation Dialog
    showDrawItemConfirmation() {
        const existingDialog = document.querySelector('.draw-confirmation');
        if (existingDialog) existingDialog.remove();
    
        const dialog = document.createElement('div');
        dialog.className = 'draw-confirmation';
        dialog.innerHTML = `
            <h3>Create Item Shape</h3>
            <p>Do you want to create an item with these dimensions?</p>
            <div class="draw-confirmation-buttons">
                <button type="button" class="confirm-btn">Create</button>
                <button type="button" class="cancel-btn">Cancel</button>
            </div>
        `;
    
        document.body.appendChild(dialog);
    
        // Position the dialog
        dialog.style.position = 'fixed';
        dialog.style.left = '50%';
        dialog.style.top = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.zIndex = '1000'; // Ensure it's on top
    
        // Handle Confirm and Cancel buttons
        const confirmBtn = dialog.querySelector('.confirm-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
    
        confirmBtn.addEventListener('click', () => this.handleConfirm(dialog));
        cancelBtn.addEventListener('click', () => this.handleCancel(dialog));
    
        // Handle clicking outside the dialog to cancel
        const handleOutsideClick = (e) => {
            if (!dialog.contains(e.target)) {
                this.handleCancel(dialog);
                document.removeEventListener('mousedown', handleOutsideClick);
            }
        };
    
        setTimeout(() => {
            document.addEventListener('mousedown', handleOutsideClick);
        }, 100);
    },

    handleConfirm(dialog) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.selectedTiles.forEach(coord => {
            const [x, y] = coord.split(',').map(Number);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
    
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
    
        const newItem = {
            id: Date.now(),
            name: 'New Item',
            description: 'A new item awaiting description.',
            rarity: 'common',
            image: '/api/placeholder/400/320', // Update with actual placeholder path if needed
            size: { width, height },
            stats: {
                str: 0,
                agi: 0,
                con: 0,
                int: 0,
                spir: 0,
                cha: 0,
                // Add derived stats if needed
                damage: 0,
                armor: 0
                // Include other stats as needed
            }
        };
    
        // Create the item and add to the grid
        this.createPreviewItemFromData(newItem);
    
        // Clean up the dialog and reset draw mode
        dialog.remove();
        this.isDrawMode = false;
        const drawButton = document.querySelector('.draw-button');
        if (drawButton) {
            drawButton.classList.remove('active');
        }
        const grid = document.getElementById('itemPreviewGrid');
        if (grid) {
            grid.classList.remove('draw-mode');
        }
        this.clearSelection();
        this.hideSelectionBox();
    },
    
    
    

    handleCancel(dialog) {
        dialog.remove();
        this.clearSelection();
        this.hideSelectionBox();
    },

    // Hide Selection Box Visuals
    hideSelectionBox() {
        document.querySelectorAll('.preview-tile.selected').forEach(tile => {
            tile.classList.remove('selected');
        });
    },

    // Clear Selection on Grid
    clearSelection() {
        this.selectedTiles.clear();
        document.querySelectorAll('.preview-tile').forEach(tile => {
            tile.classList.remove('selected');
        });
    },

    // Update Selection Based on Drag
    updateSelection(startTile, currentTile) {
        this.clearSelection();

        const startX = parseInt(startTile.dataset.x);
        const startY = parseInt(startTile.dataset.y);
        const currentX = parseInt(currentTile.dataset.x);
        const currentY = parseInt(currentTile.dataset.y);

        const minX = Math.min(startX, currentX);
        const maxX = Math.max(startX, currentX);
        const minY = Math.min(startY, currentY);
        const maxY = Math.max(startY, currentY);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const tile = document.querySelector(`.preview-tile[data-x="${x}"][data-y="${y}"]`);
                if (tile) {
                    tile.classList.add('selected');
                    this.selectedTiles.add(`${x},${y}`);
                }
            }
        }
    },

    // Check if Slot is Available
    isSlotAvailable(x, y, size, currentItemId = null) {
        const cols = 15;
        const rows = 5;
    
        // Check bounds
        if (x < 0 || y < 0 || x + size.width > cols || y + size.height > rows) {
            console.log('Slot out of bounds');
            return false;
        }
    
        // Check each tile in the proposed area
        for (let dy = 0; dy < size.height; dy++) {
            for (let dx = 0; dx < size.width; dx++) {
                const tile = document.querySelector(`.preview-tile[data-x="${x + dx}"][data-y="${y + dy}"]`);
                if (tile && tile.dataset.occupied && tile.dataset.occupied !== currentItemId) {
                    console.log(`Tile at (${x + dx}, ${y + dy}) is occupied by ${tile.dataset.occupied}`);
                    return false;
                }
            }
        }
    
        console.log(`Slot available at (${x}, ${y}) for size (${size.width}x${size.height})`);
        return true;
    },
    

    // Mark Grid Tiles as Occupied by an Item
    markGridTilesAsOccupied(x, y, width, height, instanceId) {
        for (let dy = y; dy < y + height; dy++) {
            for (let dx = x; dx < x + width; dx++) {
                const tile = document.querySelector(`.preview-tile[data-x="${dx}"][data-y="${dy}"]`);
                if (tile) {
                    tile.dataset.occupied = instanceId;
                }
            }
        }
    },

    // Clear Occupied Tiles (Before Moving an Item)
    clearOccupiedTiles(x, y, width, height, instanceId) {
        for (let dy = y; dy < y + height; dy++) {
            for (let dx = x; dx < x + width; dx++) {
                const tile = document.querySelector(`.preview-tile[data-x="${dx}"][data-y="${dy}"]`);
                if (tile && tile.dataset.occupied === instanceId) {
                    delete tile.dataset.occupied;
                }
            }
        }
    },

    hideItemInfo() {
        // Hide the normal Item Generation tooltip
        const tooltip = document.getElementById('itemGen-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    
        // Hide any persistent Editable tooltips
        const persistentTooltips = document.querySelectorAll('.item-tooltip.persistent');
        persistentTooltips.forEach(pt => {
            pt.style.display = 'none';
        });
    },

    // Update Editable State Based on Mode
    updateItemGenEditableState() {
        const items = document.querySelectorAll('.preview-item');
        const isEditModeActive = document.querySelector('.edit-button.active');

        items.forEach(item => {
            if (isEditModeActive) {
                // Remove hover events
                if (item.showItemInfoHandler) {
                    item.removeEventListener('mousemove', item.showItemInfoHandler);
                    item.removeEventListener('mouseout', this.hideItemInfo);
                }
                // Create persistent tooltip
                this.createItemGenTooltip(item);
            } else {
                // Remove persistent tooltip
                this.removeItemGenTooltip(item);
                
                // Restore hover events
                if (!item.showItemInfoHandler) {
                    item.showItemInfoHandler = (e) => {
                        this.showItemInfo({
                            name: item.dataset.name,
                            description: item.dataset.description,
                            rarity: item.dataset.rarity
                        }, e);
                    };
                }
                item.addEventListener('mousemove', item.showItemInfoHandler);
                item.addEventListener('mouseout', this.hideItemInfo);
            }
        });
    },

    // Handle Drawing Selection
    setupDrawingHandlers() {
        const grid = document.getElementById('itemPreviewGrid');
        grid.addEventListener('mousedown', this.startDrawing.bind(this));
        grid.addEventListener('mousemove', this.updateDrawing.bind(this));
        document.addEventListener('mouseup', this.finishDrawing.bind(this));
    },

    // Start Drawing Selection
    startDrawing(e) {
        if (!this.isDrawMode) return;
        const tile = e.target.closest('.preview-tile');
        if (!tile) return;

        this.isDrawing = true;
        this.drawStartTile = tile;
        this.clearSelection();
        e.preventDefault();
    },

    // Update Drawing Selection
    updateDrawing(e) {
        if (!this.isDrawMode || !this.isDrawing) return;
        const currentTile = e.target.closest('.preview-tile');
        if (!currentTile) return;

        this.updateSelection(this.drawStartTile, currentTile);
    },

    // Finish Drawing Selection
    finishDrawing() {
        if (!this.isDrawMode || !this.isDrawing) return;
        this.isDrawing = false;

        if (this.selectedTiles.size > 0) {
            this.showDrawItemConfirmation();
        }
    },

    // Show Draw Item Confirmation Dialog
    showDrawItemConfirmation() {
        const existingDialog = document.querySelector('.draw-confirmation');
        if (existingDialog) existingDialog.remove();
    
        const dialog = document.createElement('div');
        dialog.className = 'draw-confirmation';
        dialog.innerHTML = `
            <h3>Create Item Shape</h3>
            <p>Do you want to create an item with these dimensions?</p>
            <div class="draw-confirmation-buttons">
                <button type="button" class="confirm-btn">Create</button>
                <button type="button" class="cancel-btn">Cancel</button>
            </div>
        `;
    
        document.body.appendChild(dialog);
    
        // Position the dialog
        dialog.style.position = 'fixed';
        dialog.style.left = '50%';
        dialog.style.top = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.zIndex = '1000'; // Ensure it's on top
    
        // Handle Confirm and Cancel buttons
        const confirmBtn = dialog.querySelector('.confirm-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
    
        confirmBtn.addEventListener('click', () => this.handleConfirm(dialog));
        cancelBtn.addEventListener('click', () => this.handleCancel(dialog));
    
        // Handle clicking outside the dialog to cancel
        const handleOutsideClick = (e) => {
            if (!dialog.contains(e.target)) {
                this.handleCancel(dialog);
                document.removeEventListener('mousedown', handleOutsideClick);
            }
        };
    
        setTimeout(() => {
            document.addEventListener('mousedown', handleOutsideClick);
        }, 100);
    },



    handleCancel(dialog) {
        dialog.remove();
        this.clearSelection();
        this.hideSelectionBox();
    },

    // Placeholder function to prevent errors
    updateFormWithItemData(width, height) {
        // Implement this function based on your form logic
        console.log(`Updating form with width: ${width}, height: ${height}`);
    },

    // Place Item in Grid (Drag and Drop)
    placeItemInGrid(itemElement, x, y) {
        if (!itemElement) return;
    
        const width = parseInt(itemElement.dataset.width);
        const height = parseInt(itemElement.dataset.height);
        const instanceId = itemElement.dataset.instanceId;
    
        // Clear previous position
        const oldX = parseInt(itemElement.dataset.x);
        const oldY = parseInt(itemElement.dataset.y);
        this.clearOccupiedTiles(oldX, oldY, width, height, instanceId);
    
        // Update position
        itemElement.style.left = `${x * 42}px`;
        itemElement.style.top = `${y * 42}px`;
        itemElement.dataset.x = x.toString();
        itemElement.dataset.y = y.toString();
    
        // Mark new position as occupied
        this.markGridTilesAsOccupied(x, y, width, height, instanceId);
    }
};

function showCustomDropConfirmDialog(itemName, callback) {
    const dialog = document.createElement('div');
    dialog.className = 'custom-confirm-modal';
    dialog.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Drop Item</h3>
            </div>
            <div class="modal-body">
                <p>Do you want to drop "${itemName}" into the world?</p>
            </div>
            <div class="modal-buttons">
                <button class="modal-button confirm">Yes</button>
                <button class="modal-button cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    return new Promise(resolve => {
        dialog.querySelector('.confirm').onclick = () => {
            dialog.remove();
            resolve(true);
        };
        dialog.querySelector('.cancel').onclick = () => {
            dialog.remove();
            resolve(false);
        };
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const itemGenView = document.getElementById('itemGenerationView');
    if (itemGenView) {
        ItemGenerator.initialize();
    }

    // Initialize Inventory Drag and Drop Separately
    initializeInventoryDragAndDrop();

    // Handle itemTypeSelect change event
    const itemTypeSelect = document.getElementById('itemTypeSelect');
    const durationInputContainer = document.getElementById('durationInputContainer');

    if (itemTypeSelect && durationInputContainer) {
        itemTypeSelect.addEventListener('change', function() {
            const selectedType = itemTypeSelect.value;
            if (selectedType === 'consumable') {
                durationInputContainer.style.display = 'block';
            } else {
                durationInputContainer.style.display = 'none';
            }
        });
    }
});

