var items = [
    { 
        id: 1, 
        name: "Sword of the Valiant", 
        type: "weapon", 
        rarity: "uncommon",
        slot: ["main-hand", "off-hand"], 
        size: { width: 1, height: 3 }, 
        stats: { damage: 3, str: 2 }, 
        value: 500, // Added value
        description: "A well-worn sword once wielded by a brave knight.",
        image: "https://i.ibb.co/88L3M05/Sword.jpg" 
    },
    { 
        id: 2, 
        name: "Shield of Protection", 
        type: "armor", 
        rarity: "uncommon",
        slot: "off-hand", 
        size: { width: 2, height: 2 }, 
        stats: { armor: 4, con: 1 }, 
        value: 450, // Added value
        description: "A sturdy shield that has seen countless battles.",
        image: "https://i.ibb.co/JyhT8ZP/Shield.jpg" 
    },
    { 
        id: 3, 
        name: "Potion of Healing", 
        type: "consumable", 
        rarity: "common",
        size: { width: 1, height: 1 }, 
        stats: { currentHealth: 15 }, 
        value: 50, // Added value
        description: "A crimson potion that mends wounds swiftly.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://i.ibb.co/zbw8v4K/Healing-Potion.jpg" 
    },
    { 
        id: 4, 
        name: "Bow of Precision", 
        type: "weapon", 
        rarity: "uncommon",
        slot: "ranged", 
        size: { width: 1, height: 3 }, 
        stats: { rangedDamage: 2, agi: 2 }, 
        value: 550, // Added value
        description: "A reliable bow that seldom misses its target.", 
        image: "https://i.ibb.co/S6b45yh/Bow.jpg" 
    },
    { 
        id: 5, 
        name: "Amulet of Wisdom", 
        type: "accessory", 
        rarity: "rare",
        slot: "neck", 
        size: { width: 1, height: 1 }, 
        stats: { int: 2, spir: 1 }, 
        value: 800, // Added value
        description: "An ancient amulet that subtly sharpens the mind.", 
        image: "https://i.ibb.co/QPFQnfL/Amulet.jpg" 
    },
    { 
        id: 6, 
        name: "Boots of Swiftness", 
        type: "armor", 
        rarity: "uncommon",
        slot: "feet", 
        size: { width: 2, height: 1 }, 
        stats: { moveSpeed: 3, agi: 1 }, 
        value: 400, // Added value
        description: "Boots that slightly increase the wearer's speed.", 
        image: "https://i.ibb.co/KsjWq9t/Boots.jpg" 
    },
    { 
        id: 7, 
        name: "Ring of Power", 
        type: "accessory", 
        rarity: "rare",
        slot: ["ring1", "ring2"], 
        size: { width: 1, height: 1 }, 
        stats: { spellDamage: 2, int: 1 }, 
        value: 750, // Added value
        description: "A ring imbued with faint magical energies.", 
        image: "https://i.ibb.co/vxgygFm/Ring-1.jpg" 
    },
    { 
        id: 8, 
        name: "Cloak of Shadows", 
        type: "armor", 
        rarity: "rare",
        slot: "cape", 
        size: { width: 2, height: 3 }, 
        stats: { agi: 1 }, 
        value: 600, // Added value
        description: "A dark cloak that aids in remaining unseen.", 
        image: "https://i.ibb.co/6Y56KNz/Cloak-Shadow.jpg" 
    },
    { 
        id: 9, 
        name: "Staff of the Elements", 
        type: "weapon", 
        rarity: "epic",
        slot: "main-hand", 
        size: { width: 1, height: 4 }, 
        stats: { spellDamage: 4, int: 2, spir: 1 }, 
        value: 1200, // Added value
        description: "A staff that channels elemental magic with ease.", 
        twoHanded: true, 
        image: "https://i.ibb.co/mBRWsGG/Staff-of.jpg" 
    },
    { 
        id: 10, 
        name: "Gauntlets of Might", 
        type: "armor", 
        rarity: "uncommon",
        slot: "hands", 
        size: { width: 2, height: 1 }, 
        stats: { str: 2, damage: 1 }, 
        value: 500, // Added value
        description: "Gauntlets that enhance the wearer's strength.", 
        image: "https://i.ibb.co/x21zR2w/Gauntles.jpg" 
    },
    { 
        id: 11, 
        name: "Helm of Insight", 
        type: "armor", 
        rarity: "rare",
        slot: "head", 
        size: { width: 2, height: 2 }, 
        stats: { int: 3, spir: 1 }, 
        value: 700, // Added value
        description: "A helm that grants better perception and insight.", 
        image: "https://i.ibb.co/2Y3qHCV/Helm-Ins.jpg" 
    },
    { 
        id: 12, 
        name: "Dagger of Venom", 
        type: "weapon", 
        rarity: "rare",
        slot: ["main-hand", "off-hand"], 
        size: { width: 1, height: 2 }, 
        stats: { damage: 2, agi: 2 }, 
        value: 550, // Added value
        description: "A dagger with a poisonous edge.", 
        image: "https://i.ibb.co/MgBtBJ2/dAGGER.jpg" 
    },
    { 
        id: 13, 
        name: "Tome of Knowledge", 
        type: "accessory", 
        rarity: "rare",
        slot: "off-hand", 
        size: { width: 2, height: 2 }, 
        stats: { int: 4, spellDamage: 3 }, 
        value: 900, // Added value
        description: "A tome that enhances the reader's magical abilities.", 
        image: "https://i.ibb.co/D8M3bp4/Tome.jpg" 
    },
    { 
        id: 14, 
        name: "Elixir of Mana", 
        type: "consumable", 
        rarity: "common",
        size: { width: 1, height: 1 }, 
        stats: { currentMana: 20 }, 
        value: 100, // Added value
        description: "A blue elixir that replenishes magical energy.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://i.ibb.co/GQCQVzr/Elixir-mana.jpg" 
    },
    { 
        id: 15, 
        name: "Plate Armor of the Guardian", 
        type: "armor", 
        rarity: "rare",
        slot: "chest", 
        size: { width: 2, height: 3 }, 
        stats: { armor: 6, con: 2 }, 
        value: 1000, // Added value
        description: "Heavy armor that provides substantial protection.", 
        image: "https://i.ibb.co/Kq3vk3q/DALL-E-2024-10-17-19-43-46-A-hand-drawn-black-and-white-sketch-of-a-heavy-plate-armor-set-designed-w.webp" 
    },
    { 
        id: 16, 
        name: "Wand of Fireballs", 
        type: "weapon", 
        rarity: "rare",
        slot: "main-hand", 
        size: { width: 1, height: 2 }, 
        stats: { spellDamage: 5, int: 1 }, 
        value: 800, // Added value
        description: "A wand that casts small fireball spells.", 
        image: "https://i.ibb.co/6B8TWpg/DALL-E-2024-10-17-19-52-39-A-hand-drawn-black-and-white-sketch-of-a-magical-wand-The-wand-is-sleek-a.webp" 
    },
    { 
        id: 17, 
        name: "Bracers of Archery", 
        type: "armor", 
        rarity: "uncommon",
        slot: "wrists", 
        size: { width: 2, height: 1 }, 
        stats: { agi: 2, damage: 1 }, 
        value: 400, // Added value
        description: "Bracers that improve archery skills.", 
        image: "https://i.ibb.co/6bK4Bbk/DALL-E-2024-10-17-19-52-37-A-hand-drawn-black-and-white-sketch-of-enchanted-bracers-The-bracers-are.webp" 
    },
    { 
        id: 18, 
        name: "Necklace of Life", 
        type: "accessory", 
        rarity: "rare",
        slot: "neck", 
        size: { width: 1, height: 1 }, 
        stats: { healthRegen: 3, con: 1 }, 
        value: 850, // Added value
        description: "A necklace that slowly regenerates health.", 
        image: "https://example.com/necklace-of-life.png" 
    },
    { 
        id: 19, 
        name: "Greaves of the Giant", 
        type: "armor", 
        rarity: "rare",
        slot: "legs", 
        size: { width: 2, height: 2 }, 
        stats: { str: 3, moveSpeed: -2 }, 
        value: 950, // Added value
        description: "Heavy greaves that increase strength but reduce speed.", 
        image: "https://i.ibb.co/8jVpBqt/DALL-E-2024-10-17-19-52-32-A-hand-drawn-black-and-white-sketch-of-massive-leg-armor-The-armor-is-lar.webp" 
    },
    { 
        id: 20, 
        name: "Ring of the Magi", 
        type: "accessory", 
        rarity: "rare",
        slot: ["ring1", "ring2"], 
        size: { width: 1, height: 1 }, 
        stats: { manaRegen: 2, int: 2 }, 
        value: 700, // Added value
        description: "A ring that slightly regenerates mana over time.", 
        image: "https://i.ibb.co/nn4CV8m/DALL-E-2024-10-17-20-37-35-A-hand-drawn-black-and-white-sketch-of-an-enchanted-ring-The-ring-has-a-s.webp" 
    },
    { 
        id: 21, 
        name: "Skull of Agility", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { agi: 3, currentHealth: -15 }, 
        value: 300, // Added value
        duration: 1800, 
        description: "A cursed skull that temporarily enhances agility but drains health.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://example.com/skull-of-agility.png", 
        buff: { 
            name: "Agility Boost", 
            description: "Increases Agility by 3 for 30 minutes.", 
            icon: "https://example.com/skull-of-agility.png", 
            statChanges: { agi: 3 } 
        } 
    },
    { 
        id: 22, 
        name: "Elixir of Fortitude", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { con: 2, healthRegen: 5, currentHealth: -5 }, 
        value: 350, // Added value
        duration: 1200, 
        description: "An elixir that strengthens constitution and heals over time, but inflicts minor damage.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://i.ibb.co/yY9JFhy/DALL-E-2024-10-17-21-16-57-A-hand-drawn-black-and-white-sketch-of-an-elixir-bottle-The-bottle-is-sma.webp", 
        buff: { 
            name: "Fortitude Boost", 
            description: "Increases Constitution by 2 and Health Regeneration by 5 for 20 minutes.", 
            icon: "https://i.ibb.co/yY9JFhy/DALL-E-2024-10-17-21-16-57-A-hand-drawn-black-and-white-sketch-of-an-elixir-bottle-The-bottle-is-sma.webp", 
            statChanges: { con: 2, healthRegen: 5 } 
        } 
    },
    { 
        id: 23, 
        name: "Toxic Brew", 
        type: "consumable", 
        rarity: "uncommon",
        size: { width: 1, height: 1 }, 
        stats: { currentMana: 5, currentHealth: -10 }, 
        value: 200, // Added value
        description: "A foul brew that restores mana but at the cost of health.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://i.ibb.co/yn2djbz/DALL-E-2024-10-17-21-16-56-A-hand-drawn-black-and-white-sketch-of-a-foul-brew-in-a-crude-rough-looki.webp", 
        buff: { 
            name: "Mana Surge", 
            description: "Instantly restores 5 Mana.", 
            icon: "https://i.ibb.co/yn2djbz/DALL-E-2024-10-17-21-16-56-A-hand-drawn-black-and-white-sketch-of-a-foul-brew-in-a-crude-rough-looki.webp", 
            statChanges: { currentMana: 5 } 
        } 
    },
    { 
        id: 24, 
        name: "Potion of Berserk", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { damage: 2, str: 3, con: -5 }, 
        value: 400, // Added value
        duration: 900, 
        description: "A volatile potion that increases strength and damage but weakens constitution temporarily.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://example.com/potion-of-berserk.png", 
        buff: { 
            name: "Berserker Rage", 
            description: "Increases Damage by 2 and Strength by 3, but decreases Constitution by 5 for 15 minutes.", 
            icon: "https://example.com/potion-of-berserk.png", 
            statChanges: { damage: 2, str: 3, con: -5 } 
        } 
    },
    { 
        id: 25, 
        name: "Vial of Dark Energy", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { spellDamage: 3, int: 1, healthRegen: -3 }, 
        value: 450, // Added value
        duration: 1500, 
        description: "A vial that enhances spell damage and intelligence while reducing health regeneration.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://example.com/vial-of-dark-energy.png", 
        buff: { 
            name: "Dark Empowerment", 
            description: "Increases Spell Damage by 3 and Intelligence by 1, but decreases Health Regeneration by 3 for 25 minutes.", 
            icon: "https://example.com/vial-of-dark-energy.png", 
            statChanges: { spellDamage: 3, int: 1, healthRegen: -3 } 
        } 
    },
    { 
        id: 26, 
        name: "Cursed Tonic", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { moveSpeed: 3, agi: 2, con: -2 }, 
        value: 300, // Added value
        duration: 1800, 
        description: "A tonic that increases speed and agility but diminishes constitution.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://example.com/cursed-tonic.png", 
        buff: { 
            name: "Swift Curse", 
            description: "Increases Move Speed by 3 and Agility by 2, but decreases Constitution by 2 for 30 minutes.", 
            icon: "https://example.com/cursed-tonic.png", 
            statChanges: { moveSpeed: 3, agi: 2, con: -2 } 
        } 
    },
    { 
        id: 27, 
        name: "Shadow Elixir", 
        type: "consumable", 
        rarity: "uncommon",
        size: { width: 1, height: 1 }, 
        stats: { damage: 1, agi: 2, con: 0 }, 
        value: 250, // Added value
        duration: 1200, 
        description: "An elixir that enhances agility while slightly increasing damage output.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://example.com/shadow-elixir.png", 
        buff: { 
            name: "Shadow Enhancement", 
            description: "Increases Damage by 1 and Agility by 2 for 20 minutes.", 
            icon: "https://i.ibb.co/ysKzHx0/Shadow-Elixir.webp", 
            statChanges: { damage: 1, agi: 2 } 
        } 
    },
    { 
        id: 28, 
        name: "Doom Draught", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { spellDamage: 4, int: 2, healthRegen: -5 }, 
        value: 500, // Added value
        duration: 1800, 
        description: "A draught that significantly boosts spell damage and intelligence but hinders health regeneration.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://example.com/doom-draught.png", 
        buff: { 
            name: "Doom Empowerment", 
            description: "Increases Spell Damage by 4 and Intelligence by 2, but decreases Health Regeneration by 5 for 30 minutes.", 
            icon: "https://example.com/doom-draught.png", 
            statChanges: { spellDamage: 4, int: 2, healthRegen: -5 } 
        } 
    },
    { 
        id: 29, 
        name: "Reaper's Brew", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { damage: 2, str: 4, con: -7 }, 
        value: 600, // Added value
        duration: 900, 
        description: "A dark brew that grants immense strength and damage but severely reduces constitution.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://i.ibb.co/cYZk1j5/Reapers-Brew.webp", 
        buff: { 
            name: "Reaper's Might", 
            description: "Increases Damage by 2 and Strength by 4, but decreases Constitution by 7 for 15 minutes.", 
            icon: "https://example.com/reapers-brew.png", 
            statChanges: { damage: 2, str: 4, con: -7 } 
        } 
    },
    { 
        id: 30, 
        name: "Spirit Vial", 
        type: "consumable", 
        rarity: "rare",
        size: { width: 1, height: 1 }, 
        stats: { manaRegen: 10, spir: 2, healthRegen: -10 }, 
        value: 700, // Added value
        duration: 1500, 
        description: "A vial that restores mana and increases spirit but drastically lowers health regeneration.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://i.ibb.co/8xzMmzQ/Spirit-Vial.webp", 
        buff: { 
            name: "Spirit Surge", 
            description: "Increases Mana Regeneration by 10 and Spirit by 2, but decreases Health Regeneration by 10 for 25 minutes.", 
            icon: "https://example.com/spirit-vial.png", 
            statChanges: { manaRegen: 10, spir: 2, healthRegen: -10 } 
        } 
    },
    { 
        id: 31, 
        name: "Blade of the Phoenix", 
        type: "weapon", 
        rarity: "epic",
        slot: "main-hand", 
        size: { width: 1, height: 3 }, 
        stats: { damage: 3, str: 2 }, 
        value: 1500, // Added value
        description: "A fiery blade that burns enemies weak against fire.", 
        twoHanded: true, 
        image: "https://i.ibb.co/cQZ5Hbv/Blade-of-the-Phoenix.webp" 
    },
    { 
        id: 32, 
        name: "Guardian Helm", 
        type: "armor", 
        rarity: "uncommon",
        slot: "head", 
        size: { width: 2, height: 2 }, 
        stats: { armor: 5, con: 1 }, 
        value: 650, // Added value
        description: "A sturdy helm that provides excellent protection.", 
        image: "https://i.ibb.co/fGhRstL/Guardian-Helm.webp" 
    },
    { 
        id: 33, 
        name: "Sash of the Serpent", 
        type: "accessory", 
        rarity: "uncommon",
        slot: "waist", 
        size: { width: 1, height: 1 }, 
        stats: { agi: 2, cha: 1 }, 
        value: 500, // Added value
        description: "A sleek sash that enhances agility and charisma.", 
        image: "https://i.ibb.co/MBwLbt7/Sash-of-the-Serpent.webp" 
    },
    { 
        id: 34, 
        name: "Hammer of Titans", 
        type: "weapon", 
        rarity: "epic",
        slot: "main-hand", 
        size: { width: 2, height: 4 }, 
        stats: { damage: 5, str: 4 }, 
        value: 2000, // Added value
        description: "A massive hammer capable of crushing even the toughest foes.", 
        twoHanded: true, 
        image: "https://i.ibb.co/d6Bj7Pg/Hammer-of-Titans.webp" 
    },
    { 
        id: 35, 
        name: "Pendant of Fortitude", 
        type: "accessory", 
        rarity: "uncommon",
        slot: "neck", 
        size: { width: 1, height: 1 }, 
        stats: { con: 3, healthRegen: 3 }, 
        value: 550, // Added value
        description: "A pendant that bolsters constitution and accelerates health regeneration.", 
        image: "https://i.ibb.co/7krtnJw/Pendant-of-FOrtitude.webp" 
    },
    { 
        id: 36, 
        name: "Legplates of Speed", 
        type: "armor", 
        rarity: "uncommon",
        slot: "legs", 
        size: { width: 2, height: 2 }, 
        stats: { moveSpeed: 5, agi: 2 }, 
        value: 600, // Added value
        description: "Lightweight leg armor that increases movement speed and agility.", 
        image: "https://i.ibb.co/C6Mxvck/Legplates-of-Speed.webp" 
    },
    { 
        id: 37, 
        name: "Scepter of the Archmage", 
        type: "weapon", 
        rarity: "epic",
        slot: "main-hand", 
        size: { width: 1, height: 3 }, 
        stats: { spellDamage: 6, int: 3 }, 
        value: 18000, // Added value
        description: "A regal scepter that amplifies spellcasting abilities.", 
        twoHanded: true, 
        image: "https://i.ibb.co/nC2KvHM/Scepter-of-the-Archmage.webp" 
    },
    { 
        id: 38, 
        name: "Gloves of Dexterity", 
        type: "armor", 
        rarity: "uncommon",
        slot: "hands", 
        size: { width: 2, height: 1 }, 
        stats: { agi: 3, damage: 1 }, 
        value: 400, // Added value
        description: "Flexible gloves that enhance dexterity and slightly boost damage.", 
        image: "https://i.ibb.co/B4q2TQM/Gloves-of-Dexterity.webp" 
    },
    { 
        id: 39, 
        name: "Charm of the Forest", 
        type: "accessory", 
        rarity: "uncommon",
        slot: "waist", 
        size: { width: 1, height: 1 }, 
        stats: { spir: 2, cha: 1 }, 
        value: 450, // Added value
        description: "A trinket that harmonizes with nature, enhancing spirit and charisma.", 
        image: "https://i.ibb.co/4477qht/Charm-of-the-Forest.webp" 
    },
    { 
        id: 40, 
        name: "Boots of the Wanderer", 
        type: "armor", 
        rarity: "uncommon",
        slot: "feet", 
        size: { width: 2, height: 1 }, 
        stats: { moveSpeed: 7, agi: 1 }, 
        value: 700, // Added value
        description: "Comfortable boots designed for long journeys, increasing movement speed.", 
        image: "https://i.ibb.co/HzNCrFF/Boots-of-the-Wanderer.webp" 
    },
    { 
        id: 41, 
        name: "Agility Elixir", 
        type: "consumable", 
        rarity: "uncommon",
        size: { width: 1, height: 1 }, 
        stats: { agi: 5, healing: 15 }, 
        value: 1500, // Already has value
        duration: 10, 
        description: "Temporarily increases Agility by 5 for 10 seconds.", 
        stackable: true, 
        stackCap: 5, 
        image: "https://example.com/agility-elixir.png", 
        buff: { 
            name: "Agility Boost", 
            description: "Increases Agility by 5 for 10 seconds.", 
            icon: "https://example.com/buff-icons/agility-boost.png", 
            statChanges: { agi: 5, healing: 15 } 
        } 
    }
];
