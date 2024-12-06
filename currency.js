// currency.js

// Ensure that characterState is available
if (!window.characterState) {
    window.characterState = {};
}

// Initialize characterState.currency if it doesn't exist
if (!characterState.currency) {
    characterState.currency = {
        gold: 0,
        silver: 0,
        copper: 0
    };
}

// Conversion rates
const copperToSilver = 100;
const silverToGold = 100;

// Normalize currency amounts (convert copper to silver and silver to gold)
function normalizeCurrency() {
    // Convert copper to silver
    if (characterState.currency.copper >= copperToSilver) {
        characterState.currency.silver += Math.floor(characterState.currency.copper / copperToSilver);
        characterState.currency.copper = characterState.currency.copper % copperToSilver;
    }

    // Convert silver to gold
    if (characterState.currency.silver >= silverToGold) {
        characterState.currency.gold += Math.floor(characterState.currency.silver / silverToGold);
        characterState.currency.silver = characterState.currency.silver % silverToGold;
    }

    // Handle negative currency
    if (characterState.currency.copper < 0) {
        const neededSilver = Math.ceil(Math.abs(characterState.currency.copper) / copperToSilver);
        characterState.currency.silver -= neededSilver;
        characterState.currency.copper += neededSilver * copperToSilver;
    }

    if (characterState.currency.silver < 0) {
        const neededGold = Math.ceil(Math.abs(characterState.currency.silver) / silverToGold);
        characterState.currency.gold -= neededGold;
        characterState.currency.silver += neededGold * silverToGold;
    }

    // Prevent negative totals
    characterState.currency.gold = Math.max(0, characterState.currency.gold);
    characterState.currency.silver = Math.max(0, characterState.currency.silver);
    characterState.currency.copper = Math.max(0, characterState.currency.copper);
}

// Function to add currency
function addCurrency(type, amount) {
    if (characterState.currency.hasOwnProperty(type)) {
        characterState.currency[type] += amount;
        normalizeCurrency();
        renderCurrency();
    } else {
        console.error(`Currency type ${type} does not exist.`);
    }
}

// Function to spend currency
function spendCurrency(type, amount) {
    if (characterState.currency.hasOwnProperty(type)) {
        characterState.currency[type] -= amount;
        normalizeCurrency();
        renderCurrency();
    } else {
        console.error(`Currency type ${type} does not exist.`);
    }
}

// Function to render currency in the inventory window
function renderCurrency() {
    // Get the inventory popup or container
    const inventoryPopup = document.getElementById('inventoryPopup');
    if (!inventoryPopup) {
        console.error('Inventory Popup not found.');
        return;
    }

    // Check if currencyContainer exists, if not, create it
    let currencyContainer = document.getElementById('currencyContainer');
    if (!currencyContainer) {
        currencyContainer = document.createElement('div');
        currencyContainer.id = 'currencyContainer';
        currencyContainer.classList.add('currency-container');

        // Insert the currency container at the top of the inventory popup
        const popupContent = inventoryPopup.querySelector('.popup-content');
        if (popupContent) {
            popupContent.insertBefore(currencyContainer, popupContent.firstChild);
        } else {
            console.error('Popup content not found.');
            return;
        }
    }

    // Clear existing content
    currencyContainer.innerHTML = '';
    
    // Create currency elements
    const currencies = ['gold', 'silver', 'copper'];
    currencies.forEach(currency => {
        const currencyElement = document.createElement('div');
        currencyElement.classList.add('currency-item');

        // Icon
        const iconElement = document.createElement('img');
        iconElement.src = `images/icons/${currency}-icon.png`; // Replace with actual paths to your icons
        iconElement.alt = currency.charAt(0).toUpperCase() + currency.slice(1);

        // Amount
        const amountElement = document.createElement('span');
        amountElement.innerHTML = formatCurrencyAmount({ [currency]: characterState.currency[currency] });

        // Assemble
        currencyElement.appendChild(iconElement);
        currencyElement.appendChild(amountElement);

        // Make the currency element clickable to open modal
        currencyElement.addEventListener('click', () => {
            openCurrencyModal();
        });

        // Add to container
        currencyContainer.appendChild(currencyElement);
    });
}



// Call renderCurrency() when the page loads
document.addEventListener('DOMContentLoaded', function() {
    renderCurrency();
});

// Function to prompt the user to input the amount of currency to drop
function promptCurrencyAmountToDrop(currencyType) {
    const totalGold = characterState.currency.gold;
    const totalSilver = characterState.currency.silver;
    const totalCopper = characterState.currency.copper;

    const promptText = `Enter the amount of currency to drop (e.g., "2g 20s 15c"). You have ${totalGold}g ${totalSilver}s ${totalCopper}c.`;
    const input = prompt(promptText);

    if (input) {
        const amountToDrop = parseCurrencyInput(input);
        if (amountToDrop) {
            const canDrop = checkIfCanDropCurrency(amountToDrop);
            if (canDrop) {
                spendCurrency('gold', amountToDrop.gold || 0);
                spendCurrency('silver', amountToDrop.silver || 0);
                spendCurrency('copper', amountToDrop.copper || 0);
                createCurrencyItemOnGrid(amountToDrop);
            } else {
                alert('You do not have enough currency to drop that amount.');
            }
        } else {
            alert('Invalid input. Please enter the amount in the format "2g 20s 15c".');
        }
    }
}

// Function to parse currency input from the user
function parseCurrencyInput(input) {
    const regex = /(\d+)\s*g|\d+\s*s|\d+\s*c/g;
    const matches = input.match(regex);

    if (!matches) return null;

    const amount = {
        gold: 0,
        silver: 0,
        copper: 0
    };

    matches.forEach(match => {
        const value = parseInt(match);
        if (match.includes('g')) {
            amount.gold = value;
        } else if (match.includes('s')) {
            amount.silver = value;
        } else if (match.includes('c')) {
            amount.copper = value;
        }
    });

    return amount;
}

// Function to check if the player has enough currency to drop
function checkIfCanDropCurrency(amount) {
    const totalGold = characterState.currency.gold;
    const totalSilver = characterState.currency.silver;
    const totalCopper = characterState.currency.copper;

    const requiredGold = amount.gold || 0;
    const requiredSilver = amount.silver || 0;
    const requiredCopper = amount.copper || 0;

    // Convert all to copper for easy comparison
    const totalCopperAvailable = totalGold * silverToGold * copperToSilver + totalSilver * copperToSilver + totalCopper;
    const totalCopperRequired = requiredGold * silverToGold * copperToSilver + requiredSilver * copperToSilver + requiredCopper;

    return totalCopperAvailable >= totalCopperRequired;
}

// Function to create a currency item on the grid
function createCurrencyItemOnGrid(amount) {
    // Create a temporary item representing the currency
    const currencyItem = {
        id: `currency-${Date.now()}`,
        name: 'Currency',
        type: 'currency',
        amount: amount,
        image: 'images/icons/currency-bag.png', // Replace with your currency bag icon
        rarity: 'common',
        size: { width: 1, height: 1 }
    };

    // Simulate drag and drop
    const transferData = {
        itemData: JSON.stringify(currencyItem),
        isCurrencyItem: true
    };

    document.addEventListener('mousemove', followMouseWithCurrencyItem);

    function followMouseWithCurrencyItem(e) {
        // Create a draggable element under the mouse
        const dragImage = document.createElement('div');
        dragImage.id = 'dragImage';
        dragImage.style.position = 'absolute';
        dragImage.style.pointerEvents = 'none';
        dragImage.style.width = '40px';
        dragImage.style.height = '40px';
        dragImage.style.backgroundImage = `url(${currencyItem.image})`;
        dragImage.style.backgroundSize = 'contain';
        dragImage.style.zIndex = '1000';

        document.body.appendChild(dragImage);

        const updateDragImagePosition = (e) => {
            dragImage.style.left = `${e.pageX - 20}px`;
            dragImage.style.top = `${e.pageY - 20}px`;
        };

        updateDragImagePosition(e);

        document.addEventListener('mousemove', updateDragImagePosition);

        // Handle drop
        const handleDrop = (e) => {
            e.preventDefault();
            document.removeEventListener('mousemove', updateDragImagePosition);
            document.removeEventListener('mousemove', followMouseWithCurrencyItem);
            document.removeEventListener('mouseup', handleDrop);
            if (dragImage.parentNode) {
                dragImage.parentNode.removeChild(dragImage);
            }

            // Determine drop location
            const gridOverlay = document.getElementById('grid-overlay');
            const rect = gridOverlay.getBoundingClientRect();
            const scale = characterState.scale || 1;
            const gridScale = characterState.gridScale || 40;
            const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
            const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));

            const fakeToken = document.createElement('div');
            fakeToken.dataset.gridX = gridX;
            fakeToken.dataset.gridY = gridY;

            // Create loot orb
            createLootOrb(
                {
                    ...currencyItem
                },
                fakeToken
            );

            addLootMessage('Player', [currencyItem], 'create');
        };

        document.addEventListener('mouseup', handleDrop);
    }
}



// Function to add a loot message (assumed to exist in your code)
function addLootMessage(playerName, items, action) {
    // Implement adding a message to your game's chat or log
    // This should be similar to how you handle other loot messages
}

// Function to handle looting a currency item
function lootCurrencyItem(currencyItem) {
    const amount = currencyItem.amount;
    addCurrency('gold', amount.gold || 0);
    addCurrency('silver', amount.silver || 0);
    addCurrency('copper', amount.copper || 0);
}

function formatCurrencyAmount(amountObj) {
    const { gold = 0, silver = 0, copper = 0 } = amountObj;

    const parts = [];
    if (gold > 0) parts.push(`<span class="coin gold">${gold}g</span>`);
    if (silver > 0) parts.push(`<span class="coin silver">${silver}s</span>`);
    if (copper > 0 || parts.length === 0) parts.push(`<span class="coin copper">${copper}c</span>`);

    return parts.join(' ');
}

// Open the modal
function openCurrencyModal() {
    const modal = document.getElementById('currencyModal');
    modal.style.display = 'block';
    document.getElementById('currencyInput').value = '';
}

// Function to close the modal
function closeCurrencyModal() {
    const modal = document.getElementById('currencyModal');
    modal.style.display = 'none';
}

// Handle modal interactions
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('currencyModal');
    const closeButton = document.querySelector('.close-button');
    const submitButton = document.getElementById('submitCurrency');

    closeButton.onclick = closeCurrencyModal;
    window.onclick = function(event) {
        if (event.target == modal) {
            closeCurrencyModal();
        }
    };

    submitButton.addEventListener('click', () => {
        const input = document.getElementById('currencyInput').value.trim();
        const amountToDrop = parseCurrencyInput(input);
        
        if (amountToDrop) {
            const canDrop = checkIfCanDropCurrency(amountToDrop);
            if (canDrop) {
                // Spend the currency
                spendCurrency('gold', amountToDrop.gold || 0);
                spendCurrency('silver', amountToDrop.silver || 0);
                spendCurrency('copper', amountToDrop.copper || 0);
                renderCurrency();

                // Create currency item
                const currencyItem = {
                    id: `currency-${Date.now()}`,
                    name: 'Coins',
                    type: 'currency',
                    amount: {
                        gold: amountToDrop.gold || 0,
                        silver: amountToDrop.silver || 0,
                        copper: amountToDrop.copper || 0
                    },
                    description: 'A pile of coins.',
                    image: 'images/icons/currency-bag.png',
                    rarity: 'common',
                    size: { width: 1, height: 1 }
                };

                // Start drag operation
                startCurrencyDrag(currencyItem);
                closeCurrencyModal();
            } else {
                alert('You do not have enough currency to drop that amount.');
            }
        } else {
            alert('Invalid input. Please enter the amount in the format "24s 33c".');
        }
    });

    // Attach the modal to your drag-out action, e.g., a button
    const dropCurrencyButton = document.getElementById('dropCurrencyButton'); // Ensure you have this button
    if (dropCurrencyButton) {
        dropCurrencyButton.addEventListener('click', openCurrencyModal);
    }
});
