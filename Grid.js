// Grid.js

function createGrid() {
    const gridOverlay = document.getElementById('grid-overlay');
    const backgroundImage = document.getElementById('background-image');
    if (!gridOverlay || !backgroundImage) return;

    const tileSize = characterState.gridScale;
    const containerWidth = backgroundImage.width;
    const containerHeight = backgroundImage.height;

    const cols = Math.ceil(containerWidth / tileSize);
    const rows = Math.ceil(containerHeight / tileSize);

    // Only update if the grid size has changed
    if (gridOverlay.children.length !== rows * cols) {
        console.log(`Updating grid: ${rows} rows, ${cols} columns`);
        
        // Clear existing grid
        gridOverlay.innerHTML = '';

        // Create new grid tiles
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const tile = document.createElement('div');
                tile.className = 'grid-tile';
                tile.style.width = `${tileSize}px`;
                tile.style.height = `${tileSize}px`;
                tile.style.left = `${j * tileSize}px`;
                tile.style.top = `${i * tileSize}px`;
                fragment.appendChild(tile);
            }
        } 
        gridOverlay.appendChild(fragment);
    } else {
        console.log('Grid size unchanged, updating tile sizes');
        // Update existing tiles
        const tiles = gridOverlay.children;
        for (let tile of tiles) {
            tile.style.width = `${tileSize}px`;
            tile.style.height = `${tileSize}px`;
            const col = Math.floor(parseFloat(tile.style.left) / tileSize);
            const row = Math.floor(parseFloat(tile.style.top) / tileSize);
            tile.style.left = `${col * tileSize}px`;
            tile.style.top = `${row * tileSize}px`;
        }
    }

    // Update grid overlay size
    gridOverlay.style.width = `${containerWidth}px`;
    gridOverlay.style.height = `${containerHeight}px`;

    // Update map dimensions
    characterState.mapWidth = containerWidth;
    characterState.mapHeight = containerHeight;
}


function setupGridHighlight() {
    const vttContainer = document.getElementById('vtt-container');
    const gridOverlay = document.getElementById('grid-overlay');
    let highlight = document.getElementById('grid-highlight');
    
    if (!highlight) {
        highlight = document.createElement('div');
        highlight.id = 'grid-highlight';
        gridOverlay.appendChild(highlight);
    }

    vttContainer.addEventListener('mousemove', (e) => {
        const containerRect = vttContainer.getBoundingClientRect();
        const gridRect = gridOverlay.getBoundingClientRect();

        // Calculate mouse position relative to the grid
        const relativeX = e.clientX - gridRect.left;
        const relativeY = e.clientY - gridRect.top;

        // Calculate grid coordinates
        const gridX = Math.floor(relativeX / (characterState.gridScale * characterState.scale));
        const gridY = Math.floor(relativeY / (characterState.gridScale * characterState.scale));

        // Create subtle trail highlight
        const trailHighlight = highlight.cloneNode();
        trailHighlight.classList.add('grid-highlight-trail');
        trailHighlight.style.opacity = '0.1'; // Make the trail much less apparent
        gridOverlay.appendChild(trailHighlight);

        setTimeout(() => {
            gridOverlay.removeChild(trailHighlight);
        }, 200); // Reduce duration for a more subtle effect

        // Update highlights
        [highlight, trailHighlight].forEach(h => {
            h.style.left = `${gridX * characterState.gridScale}px`;
            h.style.top = `${gridY * characterState.gridScale}px`;
            h.style.width = `${characterState.gridScale}px`;
            h.style.height = `${characterState.gridScale}px`;
            h.style.display = 'block';
        });
    });

    vttContainer.addEventListener('mouseleave', () => {
        if (highlight) {
            highlight.style.display = 'none';
        }
    });
}

// Initialize grid highlight after grid is created
function initializeGridHighlight() {
    setupGridHighlight();
}





function handleResize() {
    createGrid();
    updateGridAndTokens();
}

function initializeGrid() {
    const backgroundImage = document.getElementById('background-image');
    if (backgroundImage.complete) {
        createGrid();
        initializeGridHighlight();
    } else {
        backgroundImage.addEventListener('load', () => {
            createGrid();
            initializeGridHighlight();
        });
    }
    window.addEventListener('resize', handleResize);
}

document.addEventListener('DOMContentLoaded', initializeGrid);
