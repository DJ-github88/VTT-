// popup.js

 

function dragMoveListener(event) {
  const target = event.target;

  // Ensure the popup has position absolute or fixed
  if (getComputedStyle(target).position !== 'absolute' && getComputedStyle(target).position !== 'fixed') {
    target.style.position = 'absolute';
  }

  // Get the initial mouse position
  const clientX = event.clientX;
  const clientY = event.clientY;

  // Get the offset between the mouse and the element's top-left corner
  let offsetX = parseFloat(target.dataset.offsetX) || 0;
  let offsetY = parseFloat(target.dataset.offsetY) || 0;

  // Calculate the new position
  const x = clientX - offsetX;
  const y = clientY - offsetY;

  // Set the new position
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  // Save the position data
  target.dataset.x = x;
  target.dataset.y = y;
}

function switchTab(tabName) {
  // Get all tab buttons and remove active class
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
      tab.classList.remove('active');
  });

  // Add active class to the clicked tab button
  const clickedTab = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
  clickedTab.classList.add('active');

  // Get all tab contents and hide them
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
      content.style.display = 'none';
  });

  // Show the clicked tab's content
  const activeContent = document.getElementById(`${tabName}Tab`);
  if (activeContent) {
      activeContent.style.display = 'block';
  }
}

// Toggle Popup Function
function togglePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const currentDisplay = window.getComputedStyle(popup).display;
    const newDisplay = currentDisplay === 'none' ? 'block' : 'none';
    
    // Hide all other popups first
    document.querySelectorAll('.popup').forEach(p => {
        if (p.id !== popupId) {
            p.style.display = 'none';
        }
    });

    // Show/hide the target popup
    popup.style.display = newDisplay;

    // Center the popup if it's being shown and doesn't have a position set
    if (newDisplay === 'block' && (!popup.dataset.x || !popup.dataset.y)) {
        const rect = popup.getBoundingClientRect();
        const x = (window.innerWidth - rect.width) / 2;
        const y = (window.innerHeight - rect.height) / 2;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        popup.dataset.x = x;
        popup.dataset.y = y;
    }

    // If this is the item library, initialize its view
    if (popupId === 'itemLibrary' && newDisplay === 'block') {
        const ItemGenerator = window.ItemGenerator;
        if (ItemGenerator && typeof ItemGenerator.switchToLibraryView === 'function') {
            ItemGenerator.switchToLibraryView();
        }
    }
}

// Make togglePopup available globally
window.togglePopup = togglePopup;

['#characterSheetPopup', '#inventoryPopup', '#talentsPopup', '#spellsPopup', '#questLogPopup', '#itemLibrary', '#creatureLibrary', '#chatPopup'].forEach(popupSelector => {
  interact(popupSelector)
    .draggable({
      allowFrom: '.popup-header', // Restrict dragging to the header of the popup
      inertia: false, // Disable inertia for more precise movement
      onstart: (event) => {
        if (isDraggingItem) {
          event.interaction.stop(); // Prevent the window from moving if an item is being dragged
        } else {
          const target = event.target;

          // Ensure the popup has position absolute or fixed
          if (getComputedStyle(target).position !== 'absolute' && getComputedStyle(target).position !== 'fixed') {
            target.style.position = 'absolute';
          }

          // Get the initial mouse position
          const clientX = event.clientX;
          const clientY = event.clientY;

          // Get the element's current position
          const rect = target.getBoundingClientRect();
          const elementX = rect.left;
          const elementY = rect.top;

          // Calculate the offset between mouse and element's top-left corner
          const offsetX = clientX - elementX;
          const offsetY = clientY - elementY;

          // Store the offsets in data attributes
          target.dataset.offsetX = offsetX;
          target.dataset.offsetY = offsetY;
        }
      },
      onmove: dragMoveListener
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          const target = event.target;

          // Ensure the popup has position absolute or fixed
          if (getComputedStyle(target).position !== 'absolute' && getComputedStyle(target).position !== 'fixed') {
            target.style.position = 'absolute';
          }

          // Update the element's style
          target.style.width = `${event.rect.width}px`;
          target.style.height = `${event.rect.height}px`;

          // Update the position
          const x = (parseFloat(target.dataset.x) || 0) + event.deltaRect.left;
          const y = (parseFloat(target.dataset.y) || 0) + event.deltaRect.top;

          target.style.left = `${x}px`;
          target.style.top = `${y}px`;

          // Save the position data
          target.dataset.x = x;
          target.dataset.y = y;
        }
      }
    });
});

// Initialize Popups on Load
document.addEventListener('DOMContentLoaded', () => {
  // Hide all popups initially
  document.querySelectorAll('.popup').forEach(popup => {
    popup.style.display = 'none';

    // Remove any existing transform styles
    popup.style.transform = '';

    // Initialize positions if necessary
    popup.style.left = '0px';
    popup.style.top = '0px';
    popup.dataset.x = 0;
    popup.dataset.y = 0;
  });
});