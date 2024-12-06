document.addEventListener('DOMContentLoaded', () => {
    // Initialize character name
    initializeCharacterName(); 

    // Initialize character stats
    updateCharacterStats();    

    // Initialize HUD
    initializeHUD();           
    
    console.log('Character Name:', characterState.name);
    console.log('Total Stats:', characterState.totalStats);
    console.log('Derived Stats:', characterState.derivedStats);
});