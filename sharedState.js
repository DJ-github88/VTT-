// sharedstate.js

// Make characterState globally accessible
window.characterState = {
    name: "Beadle", // Changed 'Name' to 'name' for consistency
    
    // Grid and VTT properties
    gridScale: 50, // Default grid tile size in pixels
    minGridScale: 10,
    maxGridScale: 100,
    currentX: 0, // Current X position of the VTT view (for panning)
    currentY: 0, // Current Y position of the VTT view (for panning)
    scale: 1, // Current zoom scale
    minScale: 0.1, // Minimum zoom scale
    maxScale: 5, // Maximum zoom scale

    // Flags for dragging the VTT view
    isDraggingVTT: false,
    dragStartX: 0,
    dragStartY: 0,

// Inventory Array
inventory: [],

// Currency
currency: {
    gold: 0,
    silver: 0,
    copper: 0
},

// Active Buffs
activeBuffs: [],

    // Mapping for Abbreviations to Full Stat Names
    statMap: {
        str: "strength",
        con: "constitution",
        agi: "agility",
        int: "intelligence",
        spir: "spirit",
        cha: "charisma"
    },

    // Base Stats
    baseStats: {
        str: 10,
        con: 10,
        agi: 10,
        int: 10,
        spir: 10,
        cha: 10,
    },

    // Total Stats (includes base, equipment, temporary, and talent bonuses)
    totalStats: {
        str: 10,
        con: 10,
        agi: 10,
        int: 10,
        spir: 10,
        cha: 10,
    },

    // Equipment
    equipment: {
        'main-hand': null,
        'off-hand': null,
        head: null,
        chest: null,
        legs: null,
        feet: null,
        neck: null,
        wrists: null,
        hands: null,
        ring1: null,
        ring2: null,
        cape: null,
        ranged: null,
        waist: null,
        shoulder: null,
    },

    // Equipment Bonuses
    equipmentBonuses: {
        str: 0,
        con: 0,
        agi: 0,
        int: 0,
        spir: 0,
        cha: 0,
        health: 0,
        maxHealth: 0,
        mana: 0,
        maxMana: 0,
        healthRegen: 0,
        manaRegen: 0,
        damage: 0,
        rangedDamage: 0,
        spellDamage: 0,
        healing: 0,
        armor: 0,
        crit: 0,
        moveSpeed: 0,
        carryingCapacity: 0,
    },

    // Temporary Bonuses (Buffs/Debuffs)
    temporaryBonuses: {
        str: 0,
        con: 0,
        agi: 0,
        int: 0,
        spir: 0,
        cha: 0,
        health: 0,
        maxHealth: 0,
        mana: 0,
        maxMana: 0,
        healthRegen: 0,
        manaRegen: 0,
        damage: 0,
        rangedDamage: 0,
        spellDamage: 0,
        healing: 0,
        armor: 0,
        crit: 0,
        moveSpeed: 0,
        carryingCapacity: 0,
    },

    // Talent Bonuses
    talentBonuses: {
        str: 0,
        con: 0,
        agi: 0,
        int: 0,
        spir: 0,
        cha: 0,
        health: 0,
        maxHealth: 0,
        mana: 0,
        maxMana: 0,
        healthRegen: 0,
        manaRegen: 0,
        damage: 0,
        rangedDamage: 0,
        spellDamage: 0,
        healing: 0,
        armor: 0,
        crit: 0,
        moveSpeed: 0,
        carryingCapacity: 0,
    },

    // Derived Stats
    derivedStats: {
        maxHealth: 50,
        currentHealth: 50,
        maxMana: 50,
        currentMana: 50,
        healthRegen: 5,
        manaRegen: 5,
        damage: 5,
        rangedDamage: 5,
        spellDamage: 5,
        healing: 5,
        armor: 5,
        crit: 0,
        moveSpeed: 30,
        carryingCapacity: 150,
    },

    // Encumbrance Status
    encumbranceStatus: 'normal',

    // Flags and References for Token Management
    currentToken: null,
    lastMouseX: 0,
    lastMouseY: 0,

    // Highlight positions (if applicable)
    highlightX: 0,
    highlightY: 0,

    // Map dimensions (to be set dynamically)
    mapWidth: 1000, // Placeholder value; will be updated based on background image
    mapHeight: 1000, // Placeholder value; will be updated based on background image

};


