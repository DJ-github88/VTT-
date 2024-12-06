

window.initializeAbilitiesTab = function(sheet, token) { 
    console.log('initializeAbilitiesTab called with token:', token);
    
    const abilitiesContent = sheet.querySelector('.abilities-content');
    if (!abilitiesContent) {
        console.error('Abilities tab content not found');
        return;
    }

    // Clear existing content
    abilitiesContent.innerHTML = '';

    let creatureName = token.dataset.name;
    console.log('Loading abilities for creature:', creatureName);

    // Normalize creature name and get abilities
    creatureName = creatureName.trim();
    const abilities = window.creatureAbilities[creatureName];
    
    if (!abilities) {
        console.log('No abilities found for:', creatureName);
        abilitiesContent.innerHTML = '<p>No abilities available for this creature.</p>';
        return;
    }

    console.log('Found abilities:', Object.keys(abilities));

    // Create abilities grid
    const abilitiesGrid = document.createElement('div');
    abilitiesGrid.className = 'abilities-grid';

    Object.entries(abilities).forEach(([name, ability]) => {
        const card = createAbilityCard(name, ability, token);
        abilitiesGrid.appendChild(card);
    });

    // Append grid and verify
    abilitiesContent.appendChild(abilitiesGrid);
    console.log('Abilities grid created with', abilitiesGrid.children.length, 'abilities');

    // Add grid loaded class for potential animations
    abilitiesGrid.classList.add('abilities-grid-loaded');
};



function createAbilityCard(name, ability, token) {
    const card = document.createElement('div');
    card.className = `ability-card ${ability.type}`;
    card.draggable = true;

    // Format effects description including proc chances
    const effectsDesc = ability.effects?.map(effect => {
        let desc = effect.name || effect.type;
        if (effect.procChance) {
            desc += ` (${effect.procChance}% chance`;
            if (effect.savingThrow) {
                desc += `, DC ${effect.savingThrow.dc} ${effect.savingThrow.stat} save`;
            }
            desc += ')';
        }
        return desc;
    }).join('<br>') || '';

    card.innerHTML = `
        <div class="ability-header">
            <span class="ability-icon">${ability.icon}</span>
            <span class="ability-name">${name}</span>
            <span class="ability-type">${ability.type}</span>
        </div>
        <div class="ability-description">
            ${ability.description}
            ${effectsDesc ? `<div class="ability-effects">${effectsDesc}</div>` : ''}
        </div>
        <div class="ability-stats">
            ${ability.damage ? `<span>Damage: ${ability.damage}</span>` : ''}
            ${ability.range ? `<span>Range: ${ability.range}</span>` : ''}
            <span>AP Cost: ${ability.apCost}</span>
            ${ability.manaCost ? `<span>Mana Cost: ${ability.manaCost}</span>` : ''}
        </div>
        <button class="use-ability-btn">Use Ability</button>
    `;

    card.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        const dragData = {
            type: 'cardAbility',
            name: name,
            ability: ability
        };
        draggedAbility = dragData;
        card.classList.add('dragging');
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedAbility = null;
    });

    const useButton = card.querySelector('.use-ability-btn');
    useButton.addEventListener('click', () => {
        if (!combatState || !combatState.isInCombat) {
            addCombatMessage("Must be in combat to use abilities!");
            return;
        }
        
        // Check if token is stunned
        if (token.classList.contains('stunned')) {
            addCombatMessage(`${token.dataset.name} is stunned and cannot use abilities!`);
            return;
        }

        useAbility(name, ability, token);
    });

    return card;
}

// Add a debug log to confirm it's defined
console.log('initializeAbilitiesTab is defined:', typeof initializeAbilitiesTab);

window.creatureAbilities = {
 
    'Eldritch Horror': {
        'Basic Attack': {
            name: 'Basic Attack',
            icon: '⚔️',
            type: 'physical',
            damageType: 'physical',
            damage: '1d8+3',
            range: 1,
            apCost: 2,
            description: 'A standard melee attack that deals physical damage.',
            statModifier: 'strength',
            bonusDamage: 'damage'
        },
        'Mind Blast': {
            name: 'Mind Blast',
            icon: '🧠',
            type: 'spell',
            damageType: 'psychic',
            damage: '3d8',
            manaCost: 30,
            apCost: 2,
            range: 6,
            description: 'Unleashes a devastating psychic attack that has a chance to stun.',
            statModifier: 'intelligence',
            bonusDamage: 'spellDamage',
            effects: [{
                type: 'stun',
                duration: 1,
                name: 'Stunned',
                procChance: 10, // 10% chance to proc
                savingThrow: {
                    stat: 'constitution',
                    dc: 15
                }
            }]
        },
        'Tentacle Whip': {
            name: 'Tentacle Whip',
            icon: '🦑',
            type: 'physical',
            damageType: 'physical',
            damage: '2d6',
            apCost: 1,
            range: 4,
            description: 'Lashes out with otherworldly tentacles, dealing physical damage and pulling the target closer.',
            statModifier: 'strength',
            bonusDamage: 'damage',
            effects: [{
                type: 'pull',
                distance: 2
            }]
        },
        'Void Gaze': {
            name: 'Void Gaze',
            icon: '👁️',
            type: 'spell',
            damageType: 'psychic',
            damage: '2d10',
            manaCost: 25,
            apCost: 2,
            range: 4,
            description: 'Channels the void to weaken the target, dealing damage and reducing their armor.',
            statModifier: 'intelligence',
            bonusDamage: 'spellDamage',
            effects: [{
                type: 'debuff',
                stat: 'armor',
                amount: -2,
                duration: 2,
                name: 'Weakened Armor'
            }]
        },
        'Loom': {
            name: 'Loom',
            icon: '🙄',
            type: 'spell',
            damageType: 'psychic',
            damage: '1d10',
            manaCost: 15,
            apCost: 1,
            range: 2,
            description: 'A freaky ability of inconceivability.',
            statModifier: 'intelligence',
            bonusDamage: 'spellDamage',
            effects: [{
                type: 'pull',
                distance: -2
            }]
        }
    },
    'Plague Bearer': {
        'Basic Attack': {
            name: 'Basic Attack',
            icon: '🗡️',
            type: 'physical',
            damageType: 'physical',
            damage: '1d6+2',
            range: 1,
            apCost: 2,
            description: 'A standard melee attack that deals physical damage.',
            statModifier: 'strength',
            bonusDamage: 'damage'
        },
       'Plague Strike': {
            name: 'Plague Strike',
            icon: '☠️',
            type: 'spell',
            damageType: 'poison',
            damage: '2d8',
            apCost: 2,
            range: 2,
            description: 'Inflicts a devastating plague that has a chance to deal poison damage over time.',
            statModifier: 'intelligence',
            bonusDamage: 'spellDamage',
            effects: [{
                type: 'dot',
                damage: '1d6',
                duration: 3,
                damageType: 'poison',
                name: 'Poisoned',
                procChance: 65, // 65% chance to proc
                savingThrow: {
                    stat: 'constitution',
                    dc: 13
                }
            }]
        },
        'Poison Strike': {
            name: 'Poison Strike',
            icon: '☠️',
            type: 'spell',
            damageType: 'poison',
            damage: '2d6',
            apCost: 2,
            range: 1,
            description: 'A poisonous strike with a chance to poison the target.',
            statModifier: 'intelligence',
            bonusDamage: 'spellDamage',
            effects: [{
                type: 'dot',
                damage: '1d6',
                duration: 3,
                damageType: 'poison',
                name: 'Poisoned',
                procChance: 45, // 45% chance to proc
                savingThrow: {
                    stat: 'constitution',
                    dc: 14
                }
            }]
        }
    },
    // Add more creatures here with their abilities
};
// Helper function for rolling dice and calculating damage
function rollDice(diceString) {
    if (!diceString) return { total: 0, rolls: [] };
    
    const [countStr, restStr] = diceString.split('d');
    const count = parseInt(countStr);
    
    // Handle modifiers like "2d6+3"
    let sides = restStr;
    let modifier = 0;
    if (restStr.includes('+')) {
        const [sidesStr, modStr] = restStr.split('+');
        sides = parseInt(sidesStr);
        modifier = parseInt(modStr);
    } else {
        sides = parseInt(restStr);
    }

    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    return {
        total: rolls.reduce((sum, roll) => sum + roll, 0) + modifier,
        rolls: rolls,
        modifier: modifier
    };
}

// Function to use an ability
function useAbility(name, ability, source) {
    console.log('Starting useAbility for:', name);
    
    if (!combatState || !combatState.isInCombat) {
        addCombatMessage("Must be in combat to use abilities!");
        return;
    }

    // Check if source is stunned
    if (source.classList.contains('stunned')) {
        addCombatMessage(`${source.dataset.name} is stunned and cannot use abilities!`);
        return;
    }

    startAbilityTargeting(name, {
        name: name,
        type: ability.type,
        apCost: ability.apCost,
        range: ability.range,
        execute: (source, target) => {
            // Validate AP and turn
            if (!validateActionUsage(source, ability.apCost)) return false;

            // Check mana if it's a spell
            if (ability.manaCost) {
                const currentMana = parseInt(source.dataset.currentMana);
                if (currentMana < ability.manaCost) {
                    addCombatMessage("Not enough mana!");
                    return false;
                }
                source.dataset.currentMana = currentMana - ability.manaCost;
            }

            // Calculate damage
            const damageResult = rollDice(ability.damage);
            const statMod = Math.floor((parseInt(source.dataset[ability.statModifier]) - 10) / 2);
            const bonusDamage = parseInt(source.dataset[ability.bonusDamage] || 0);
            const totalDamage = damageResult.total + statMod + bonusDamage;

            // Apply damage
            applyDamage(target, totalDamage);

            // Add combat message
            addCombatMessage(`${source.dataset.name} uses ${name} on ${target.dataset.name} for ${totalDamage} damage! (${damageResult.total} + ${statMod} ${ability.statModifier} + ${bonusDamage} bonus)`);

            // Apply any effects
            if (ability.effects) {
                ability.effects.forEach(effect => {
                    const effectMessage = applyEffect(effect, target, source);
                    if (effectMessage) addCombatMessage(effectMessage);
                });
            }

            // Spend AP
            const currentAP = parseInt(source.dataset.actionPoints);
            source.dataset.actionPoints = currentAP - ability.apCost;
            updateTokenVisuals(source);

            return true;
        }
    }, source);
}

function formatProcChance(effect) {
    if (!effect.procChance) return '';
    
    let text = `${effect.procChance}% chance`;
    if (effect.savingThrow) {
        text += ` (DC ${effect.savingThrow.dc} ${effect.savingThrow.stat} save)`;
    }
    return text;
}

// Function to apply status effects
function applyEffect(effect, target, source) {
    if (!target.activeDebuffs) target.activeDebuffs = [];

    // Handle proc chance
    if (effect.procChance && Math.random() * 100 > effect.procChance) {
        return `${source.dataset.name}'s ${effect.name || effect.type} failed to proc!`;
    }

    // Handle saving throw
    if (effect.savingThrow) {
        const saveRoll = Math.floor(Math.random() * 20) + 1;
        const saveMod = Math.floor((parseInt(target.dataset[effect.savingThrow.stat]) - 10) / 2);
        const totalSave = saveRoll + saveMod;

        addCombatMessage(`${target.dataset.name} rolls ${effect.savingThrow.stat} save: [${saveRoll}] + ${saveMod} = ${totalSave} vs DC ${effect.savingThrow.dc}`);

        if (totalSave >= effect.savingThrow.dc) {
            return `${target.dataset.name} resists the ${effect.name || effect.type}!`;
        }
    }

    let message = '';

    switch (effect.type) {
        case 'stun':
            target.dataset.stunned = effect.duration;
            target.classList.add('stunned');
            target.activeDebuffs.push({
                type: 'stun',
                duration: effect.duration,
                name: effect.name || 'Stunned',
                source: source.dataset.name
            });
            // If stunned during their turn, end it immediately
            if (window.combatState?.currentRoundCombatants[window.combatState.currentTurnIndex]?.element === target) {
                addCombatMessage(`${target.dataset.name} is stunned and their turn ends immediately!`);
                endTurn();
            }
            message = `${target.dataset.name} is stunned for ${effect.duration} turns!`;
            break;

            case 'dot':
                target.classList.add('poisoned');
                target.activeDebuffs.push({
                    type: 'dot',
                    damage: effect.damage,
                    duration: effect.duration,
                    damageType: effect.damageType,
                    name: effect.name || 'Damage over Time',
                    source: source.dataset.name,
                    applyEffect: () => {
                        const dotDamageResult = rollDice(effect.damage);
                        const totalDotDamage = dotDamageResult.total;
                        applyDamage(target, totalDotDamage);
                        return `${target.dataset.name} takes ${totalDotDamage} ${effect.damageType} damage from ${effect.name}`;
                    }
                });
                message = `${target.dataset.name} is afflicted with ${effect.damageType} damage!`;
                break;

        case 'debuff':
            target.dataset[effect.stat] = parseInt(target.dataset[effect.stat] || 0) + effect.amount;
            target.activeDebuffs.push({
                type: 'debuff',
                stat: effect.stat,
                amount: effect.amount,
                duration: effect.duration,
                name: effect.name || 'Unknown Debuff',
                source: source.dataset.name
            });
            message = `${target.dataset.name}'s ${effect.stat} is reduced by ${-effect.amount}!`;
            break;

        case 'pull':
            const sourceX = parseInt(source.dataset.gridX);
            const sourceY = parseInt(source.dataset.gridY);
            const targetX = parseInt(target.dataset.gridX);
            const targetY = parseInt(target.dataset.gridY);
            
            const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
            const newX = targetX - Math.cos(angle) * effect.distance;
            const newY = targetY - Math.sin(angle) * effect.distance;
            
            target.style.left = `${newX * characterState.gridScale}px`;
            target.style.top = `${newY * characterState.gridScale}px`;
            target.dataset.gridX = newX;
            target.dataset.gridY = newY;
            
            message = `${target.dataset.name} is pulled ${effect.distance} spaces!`;
            break;
    }

    console.log(`Applying effect: ${effect.type} to ${target.dataset.name}`);
    return message;
}

function applyStunEffect(target, duration, source) {
    if (!target.activeDebuffs) target.activeDebuffs = [];
    
    // Add visual indicator
    target.classList.add('stunned');
    
    // Add to active debuffs
    target.activeDebuffs.push({
        type: 'stun',
        duration: duration,
        name: 'Stunned',
        source: source.dataset.name
    });

    // If stunned on their turn, immediately end their turn
    const currentCombatant = combatState.currentRoundCombatants[combatState.currentTurnIndex];
    if (currentCombatant && currentCombatant.element === target) {
        addCombatMessage(`${target.dataset.name} is stunned and their turn ends immediately!`);
        endTurn();
    }
    
    // Set AP to 0
    target.dataset.actionPoints = "0";
    updateTokenAP(target);
    
    return `${target.dataset.name} is stunned for ${duration} turns!`;
}

// New targeting system
window.currentTargeting = null; // Global targeting state
let currentAbility = null;
let currentCaster = null;


window.startAbilityTargeting = function(name, ability, source) {
    console.log('Starting targeting for:', name);
    
    // First clean up any existing targeting
    if (window.cleanupTargeting) {
        window.cleanupTargeting();
    }
    
    window.currentTargeting = {
        name: name,
        ability: ability,
        source: source
    };

    showRangeIndicator(source, ability.range);
    
    document.body.classList.add('targeting');
    document.body.style.cursor = 'crosshair';
    
    // Add click handlers
    document.addEventListener('mousemove', updateTargetingPreview);
    document.addEventListener('click', handleTargetSelection);
    
    // Add right-click to cancel
    const cancelHandler = (e) => {
        if (window.currentTargeting && e.button === 2) {
            e.preventDefault();
            if (window.cleanupTargeting) {
                window.cleanupTargeting();
            }
            addCombatMessage("Spell targeting cancelled");
            document.removeEventListener('contextmenu', cancelHandler);
        }
    };
    document.addEventListener('contextmenu', cancelHandler);

    addCombatMessage(`Select target for ${name} (Range: ${ability.range})`);
}

function calculateDistance(source, target) {
    const sourceX = parseInt(source.dataset.gridX);
    const sourceY = parseInt(source.dataset.gridY);
    const targetX = parseInt(target.dataset.gridX);
    const targetY = parseInt(target.dataset.gridY);

    return Math.sqrt(
        Math.pow(targetX - sourceX, 2) + 
        Math.pow(targetY - sourceY, 2)
    );
}

function createRangeIndicator(source, range) {
    const indicator = document.createElement('div');
    indicator.id = 'range-indicator';
    
    // Calculate size based on range and grid scale
    const size = range * 2 * characterState.gridScale;
    indicator.style.width = `${size}px`;
    indicator.style.height = `${size}px`;
    
    // Position centered on source
    const sourceRect = source.getBoundingClientRect();
    const gridOverlay = document.getElementById('grid-overlay');
    const gridRect = gridOverlay.getBoundingClientRect();
    
    const sourceX = parseInt(source.dataset.gridX) * characterState.gridScale;
    const sourceY = parseInt(source.dataset.gridY) * characterState.gridScale;
    
    indicator.style.left = `${sourceX - (size/2 - characterState.gridScale/2)}px`;
    indicator.style.top = `${sourceY - (size/2 - characterState.gridScale/2)}px`;
    
    return indicator;
}

function validateAbilityRange(source, target, ability) {
    if (!source || !target || !ability) return false;

    const sourceX = parseInt(source.dataset.gridX);
    const sourceY = parseInt(source.dataset.gridY);
    const targetX = parseInt(target.dataset.gridX);
    const targetY = parseInt(target.dataset.gridY);

    const distance = Math.sqrt(
        Math.pow(targetX - sourceX, 2) + 
        Math.pow(targetY - sourceY, 2)
    );

    return distance <= ability.range;
}

function executeAbility(name, ability, source, target) {
    if (!validatePrerequisites(source, target, ability)) return false;

    try {
        // Handle different ability types
        switch (ability.type) {
            case 'physical':
                return executePhysicalAttack(name, ability, source, target);
            case 'spell':
                return executeSpellAttack(name, ability, source, target);
            default:
                return executeGenericAbility(name, ability, source, target);
        }
    } catch (error) {
        console.error("Error executing ability:", error);
        return false;
    } finally {
        cleanupTargeting();
    }
}

function executePhysicalAttack(name, ability, source, target) {
    // Calculate hit modifiers based on the ability's statModifier
    const attackerMod = Math.floor((parseInt(source.dataset[ability.statModifier]) - 10) / 2);
    const defenderArmorMod = Math.floor((parseInt(target.dataset.armor) - 10) / 2);
    
    // Roll attack and defense
    const attackRoll = rollDice('1d20').total;
    const defenseRoll = rollDice('1d20').total;
    
    // Calculate total attack and defense values
    const totalAttack = attackRoll + attackerMod;
    const totalDefense = defenseRoll + defenderArmorMod;

    // Format attack roll message
    const attackMessage = `
        <div class="message message-combat">
            <span class="creature-name">${source.dataset.name}</span> 
            <span class="ability-name ability-${ability.type}">
                ${name}
                <div class="ability-tooltip">
                    <div class="tooltip-header">${name}</div>
                    <div class="tooltip-body">${ability.description}</div>
                    <div class="tooltip-stats">
                        <div>Damage: ${ability.damage}</div>
                        <div>Range: ${ability.range}</div>
                        <div>AP Cost: ${ability.apCost}</div>
                    </div>
                </div>
            </span>
            <div class="roll-container">
                <div class="roll-detail">
                    Attack Roll: 
                    <span class="roll">
                        [<span class="roll-number${attackRoll === 20 ? ' crit' : ''}">${attackRoll}</span>]
                    </span> 
                    + <span class="modifier">${attackerMod}</span> 
                    = <span class="total">${totalAttack}</span>
                </div>
                <div class="roll-detail">
                    Defense Roll:
                    <span class="roll">
                        [<span class="roll-number">${defenseRoll}</span>]
                    </span>
                    + <span class="modifier">${defenderArmorMod}</span>
                    = <span class="total">${totalDefense}</span>
                </div>
            </div>
        </div>
    `;
    addCombatMessage(attackMessage);

    // Check if attack hits
    const isHit = totalAttack > totalDefense;
    const isCrit = attackRoll === 20 || (parseInt(source.dataset.crit) > 0 && attackRoll >= (20 - parseInt(source.dataset.crit)));
    
    const hitMessage = `
        <div class="message message-combat">
            <span class="${isHit ? (isCrit ? 'crit' : 'hit') : 'miss'}">
                ${isCrit ? 'Critical Hit!' : isHit ? 'Hit!' : 'Miss!'}
            </span>
        </div>
    `;
    addCombatMessage(hitMessage);

    // If hit, roll for damage
    if (isHit) {
        const damageRoll = rollDice(ability.damage);
        const bonusDamage = parseInt(source.dataset[ability.bonusDamage] || 0);
        
        // Calculate final damage (double dice on crit)
        const totalDamage = (isCrit ? damageRoll.total * 2 : damageRoll.total) + 
            Math.floor((parseInt(source.dataset[ability.statModifier]) - 10) / 2) + 
            bonusDamage;

        const damageMessage = `
            <div class="message message-combat">
                <div class="damage-roll">
                    <span class="creature-name">${source.dataset.name}</span> deals
                    <span class="damage">${totalDamage}</span> ${ability.damageType} damage!
                    <div class="roll-detail">
                        ${isCrit ? '(Critical!) ' : ''}
                        [<span class="roll-number">${damageRoll.rolls.join(', ')}</span>]
                        ${isCrit ? '× 2' : ''} 
                        + <span class="modifier">${Math.floor((parseInt(source.dataset[ability.statModifier]) - 10) / 2)}</span>
                        ${bonusDamage ? ` + <span class="bonus">${bonusDamage}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        addCombatMessage(damageMessage);

        // Apply damage and effects
        applyDamage(target, totalDamage);
        applyAbilityEffects(ability, source, target);
        return true;
    }

    return false;
}

// Helper function for prerequisites
function validatePrerequisites(source, target, ability) {
    if (!source || !target) {
        console.log("Missing source or target");
        return false;
    }

    if (!validateActionUsage(source, ability.apCost)) return false;
    if (!validateAbilityRange(source, target, ability)) {
        addCombatMessage("Target is out of range!");
        return false;
    }

    if (ability.manaCost) {
        const currentMana = parseInt(source.dataset.currentMana);
        if (currentMana < ability.manaCost) {
            addCombatMessage("Not enough mana!");
            return false;
        }
    }

    return true;
}

function executeSpellAttack(name, ability, source, target) {
    // Spend mana first
    const currentMana = parseInt(source.dataset.currentMana);
    source.dataset.currentMana = currentMana - ability.manaCost;

    // Calculate spell attack modifiers
    const spellMod = Math.floor((parseInt(source.dataset[ability.statModifier]) - 10) / 2);
    const defenderSpellDefMod = Math.floor((parseInt(target.dataset.spellDefense || target.dataset.armor) - 10) / 2);
    
    // Roll spell attack and defense
    const spellRoll = rollDice('1d20').total;
    const defenseRoll = rollDice('1d20').total;
    
    // Calculate total attack and defense values
    const totalSpellAttack = spellRoll + spellMod;
    const totalDefense = defenseRoll + defenderSpellDefMod;

    // Format spell attack message
    const spellMessage = `
        <div class="message message-combat">
            <span class="creature-name">${source.dataset.name}</span> 
            <span class="ability-name ability-${ability.damageType}">
                ${name}
                <div class="ability-tooltip">
                    <div class="tooltip-header">${name}</div>
                    <div class="tooltip-body">${ability.description}</div>
                    <div class="tooltip-stats">
                        <div>Damage: ${ability.damage}</div>
                        <div>Range: ${ability.range}</div>
                        <div>AP Cost: ${ability.apCost}</div>
                        <div>Mana Cost: ${ability.manaCost}</div>
                    </div>
                </div>
            </span>
            <div class="roll-container">
                <div class="roll-detail">
                    Spell Attack: 
                    <span class="roll">
                        [<span class="roll-number${spellRoll === 20 ? ' crit' : ''}">${spellRoll}</span>]
                    </span> 
                    + <span class="modifier">${spellMod}</span> 
                    = <span class="total">${totalSpellAttack}</span>
                </div>
                <div class="roll-detail">
                    Spell Defense:
                    <span class="roll">
                        [<span class="roll-number">${defenseRoll}</span>]
                    </span>
                    + <span class="modifier">${defenderSpellDefMod}</span>
                    = <span class="total">${totalDefense}</span>
                </div>
            </div>
        </div>
    `;
    addCombatMessage(spellMessage);

    // Check if spell hits
    const isHit = totalSpellAttack > totalDefense;
    const isCrit = spellRoll === 20 || (parseInt(source.dataset.crit) > 0 && spellRoll >= (20 - parseInt(source.dataset.crit)));

    const hitMessage = `
        <div class="message message-combat">
            <span class="${isHit ? (isCrit ? 'crit' : 'hit') : 'miss'}">
                ${isCrit ? 'Critical Spell!' : isHit ? 'Spell Hits!' : 'Spell Misses!'}
            </span>
        </div>
    `;
    addCombatMessage(hitMessage);

    if (isHit) {
        // Calculate spell damage
        const damageRoll = rollDice(ability.damage);
        const spellBonus = parseInt(source.dataset[ability.bonusDamage] || 0);
        
        // Calculate final damage (double dice on crit)
        const totalDamage = (isCrit ? damageRoll.total * 2 : damageRoll.total) + 
            Math.floor((parseInt(source.dataset[ability.statModifier]) - 10) / 2) + 
            spellBonus;

        const damageMessage = `
            <div class="message message-combat">
                <div class="damage-roll">
                    <span class="creature-name">${source.dataset.name}'s</span>
                    <span class="ability-${ability.damageType}">${name}</span> hits
                    <span class="target-name">${target.dataset.name}</span> for
                    <span class="damage">${totalDamage}</span> ${ability.damageType} damage!
                    <div class="roll-detail">
                        ${isCrit ? '(Critical!) ' : ''}
                        [<span class="roll-number">${damageRoll.rolls.join(', ')}</span>]
                        ${isCrit ? '× 2' : ''} 
                        + <span class="modifier">${Math.floor((parseInt(source.dataset[ability.statModifier]) - 10) / 2)}</span>
                        ${spellBonus ? ` + <span class="bonus">${spellBonus}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        addCombatMessage(damageMessage);

        // Apply damage and effects
        applyDamage(target, totalDamage);
        applyAbilityEffects(ability, source, target);
        return true;
    }

    return false;
}

function executeGenericAbility(name, ability, source, target) {
    // For abilities that don't require attack rolls (buffs, heals, etc.)
    const abilityMessage = `
        <div class="message message-combat">
            <span class="creature-name">${source.dataset.name}</span> uses
            <span class="ability-name ability-${ability.type}">
                ${name}
                <div class="ability-tooltip">
                    <div class="tooltip-header">${name}</div>
                    <div class="tooltip-body">${ability.description}</div>
                    <div class="tooltip-stats">
                        <div>AP Cost: ${ability.apCost}</div>
                        ${ability.manaCost ? `<div>Mana Cost: ${ability.manaCost}</div>` : ''}
                    </div>
                </div>
            </span>
            on <span class="target-name">${target.dataset.name}</span>
        </div>
    `;
    addCombatMessage(abilityMessage);

    // Handle healing abilities
    if (ability.healing) {
        const healRoll = rollDice(ability.healing);
        const spiritMod = Math.floor((parseInt(source.dataset.spirit) - 10) / 2);
        const healingBonus = parseInt(source.dataset.healingBonus || 0);
        const totalHealing = healRoll.total + spiritMod + healingBonus;

        const healMessage = `
            <div class="message message-combat">
                <div class="heal-roll">
                    Restores <span class="healing">${totalHealing}</span> health!
                    <div class="roll-detail">
                        [<span class="roll-number">${healRoll.rolls.join(', ')}</span>]
                        + <span class="modifier">${spiritMod}</span>
                        ${healingBonus ? ` + <span class="bonus">${healingBonus}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        addCombatMessage(healMessage);
        window.heal(totalHealing, target);
    }

    // Apply any effects
    applyAbilityEffects(ability, source, target);
    return true;
}

// Helper function for applying effects
function applyAbilityEffects(ability, source, target) {
    if (ability.effects) {
        ability.effects.forEach(effect => {
            const effectMessage = applyEffect(effect, target, source);
            if (effectMessage) {
                const message = `
                    <div class="message message-combat">
                        <span class="effect-${effect.type}">${effectMessage}</span>
                    </div>
                `;
                addCombatMessage(message);
            }
        });
    }
}

function showAOEIndicator(radius) {
    let indicator = document.getElementById('aoe-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'aoe-indicator';
        document.getElementById('grid-overlay').appendChild(indicator);
    }
    
    indicator.style.width = `${radius * 2 * characterState.gridScale}px`;
    indicator.style.height = `${radius * 2 * characterState.gridScale}px`;
    indicator.style.display = 'block';
}

function applyDamage(target, amount) {
    const isPlayer = target.classList.contains('player-token');
    
    if (isPlayer) {
        // Update characterState
        characterState.derivedStats.currentHealth = Math.max(
            0,
            characterState.derivedStats.currentHealth - amount
        );
        
        // Update HUD
        updateHealthBar();
    }

    // Update token health
    const currentHealth = parseInt(target.dataset.currentHealth) || 0;
    target.dataset.currentHealth = Math.max(0, currentHealth - amount);

    // Show floating combat text
    showFloatingCombatText(target, -amount, 'damage');

    // Update visuals
    updateTokenBars(target);

    // Update target display if targeted
    if (characterState.currentTarget === target) {
        updateTargetInfo(target);
    }

    // Check for death
    if (parseInt(target.dataset.currentHealth) <= 0) {
        handleTokenDeath(target);
    }
}

function updateTargetingPreview(e) {
    if (!window.currentTargeting) return;
    
    const gridOverlay = document.getElementById('grid-overlay');
    const rect = gridOverlay.getBoundingClientRect();
    const x = (e.clientX - rect.left) / characterState.scale;
    const y = (e.clientY - rect.top) / characterState.scale;
    
    const gridX = Math.floor(x / characterState.gridScale);
    const gridY = Math.floor(y / characterState.gridScale);

    // Check if position is in range
    const distance = calculateDistance(
        window.currentTargeting.source,
        { dataset: { gridX, gridY } }
    );

    const inRange = distance <= window.currentTargeting.ability.range;
    document.body.style.cursor = inRange ? 'crosshair' : 'not-allowed';
}

function validateActionUsage(source, apCost) {
    if (!combatState.isInCombat) {
        addCombatMessage("Must be in combat to use abilities!");
        return false;
    }

    const currentTurnToken = combatState.currentRoundCombatants[combatState.currentTurnIndex];
    if (!currentTurnToken || currentTurnToken.element !== source) {
        addCombatMessage("Cannot use actions outside your turn!");
        return false;
    }

    const currentAP = parseInt(source.dataset.actionPoints) || 0;
    if (currentAP < apCost) {
        addCombatMessage("Not enough AP!");
        return false;
    }

    return true;
}

window.executeSpell = function(source, target, spell) {
    if (!validateActionUsage(source, spell.apCost)) return false;
    
    // Check mana cost
    const currentMana = parseInt(source.dataset.currentMana);
    if (currentMana < spell.manaCost) {
        addCombatMessage("Not enough mana!");
        return false;
    }

    // Spend mana
    source.dataset.currentMana = currentMana - spell.manaCost;

    // Execute spell effect
    const result = spell.execute(source, target);
    
    // Update visuals
    updateTokenVisuals(source);
    updateTokenVisuals(target);
    
    return result;
}

function handleTokenDeath(token) {
    if (parseInt(token.dataset.currentHealth) <= 0) {
        // Use handleCreatureLoot instead of the old implementation
        handleCreatureLoot(token.dataset.name, token);

        // Clear targeting if this was the target
        if (token.classList.contains('targeted')) {
            clearTargeting();
        }

        // Optional: Add death animation before removal
        token.style.animation = 'fadeOut 1s';
        setTimeout(() => token.remove(), 1000);
    }
}

// Store active fans in a map
const activeFans = new Map();
let draggedAbility = null;

// Add click-outside handler
document.addEventListener('click', (e) => {
    // Don't close if clicking on a token or ability bubble
    if (e.target.closest('.token') || e.target.closest('.ability-bubble')) {
        return;
    }

    // Close all open fans
    activeFans.forEach((fan, token) => {
        animateFanClose(fan);
        activeFans.delete(token);
    });
});

// Initialize ability fans for all tokens
function initializeAbilityFans() {
    console.log('Initializing ability fans');
    
    // Add double-click handlers to existing tokens
    const tokens = document.querySelectorAll('.token');
    tokens.forEach(attachAbilityFanHandler);
    
    // Set up observer for dynamically added tokens
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('token')) {
                    attachAbilityFanHandler(node);
                }
            });
        });
    });

    // Start observing the grid overlay for new tokens
    const gridOverlay = document.getElementById('grid-overlay');
    if (gridOverlay) {
        observer.observe(gridOverlay, { childList: true });
    }
}



function attachAbilityFanHandler(token) {
    // Remove any existing event listeners
    const existingListeners = token.fanEventListeners;
    if (existingListeners) {
        token.removeEventListener('mouseenter', existingListeners.enter);
        token.removeEventListener('mouseleave', existingListeners.leave);
    }

    // Create new event listeners
    const enterListener = () => {
        clearTimeout(fanTimeout);
        clearTimeout(showTimeout);
        
        // Only create fan after 2 second delay
        showTimeout = setTimeout(() => {
            if (!activeFans.has(token) && token.matches(':hover')) {
                createAbilityFan(token);
            }
        }, 2000);
    };

    const leaveListener = () => {
        clearTimeout(showTimeout); // Clear show timer if mouse leaves before fan appears
        clearTimeout(fanTimeout);
        
        fanTimeout = setTimeout(() => {
            const fan = activeFans.get(token);
            if (fan && !fan.matches(':hover')) {
                animateFanClose(fan);
                activeFans.delete(token);
            }
        }, 3000);
    };

    // Store listeners for future cleanup
    token.fanEventListeners = {
        enter: enterListener,
        leave: leaveListener
    };

    // Add new event listeners
    token.addEventListener('mouseenter', enterListener);
    token.addEventListener('mouseleave', leaveListener);
}

let fanTimeout = null;
let showTimeout = null;

function createAbilityFan(token) {
    const creatureName = token.dataset.name;
    const abilities = window.creatureAbilities[creatureName];
    
    if (!abilities || Object.keys(abilities).length === 0) {
        return;
    }

    const fanContainer = document.createElement('div');
    fanContainer.className = 'ability-fan-container';
    fanContainer.style.cssText = `
        position: absolute;
        pointer-events: auto;
        z-index: 1000;
        transform-origin: top left;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    `;

    // Create ability bubbles
    const abilityEntries = Object.entries(abilities);
    for (let i = 0; i < 4; i++) {
        if (i < abilityEntries.length) {
            const [name, ability] = abilityEntries[i];
            const bubble = createAbilityBubble(name, ability, token, i);
            if (bubble) {
                fanContainer.appendChild(bubble);
            }
        }
    }

    if (fanContainer.children.length > 0) {
        // Add hover handlers to fan container
        fanContainer.addEventListener('mouseenter', () => {
            clearTimeout(fanTimeout);
            clearTimeout(showTimeout);
        });

        fanContainer.addEventListener('mouseleave', () => {
            clearTimeout(fanTimeout);
            fanTimeout = setTimeout(() => {
                if (!token.matches(':hover')) {
                    animateFanClose(fanContainer);
                    activeFans.delete(token);
                }
            }, 3000);
        });

        // Add to grid overlay and initialize
        document.getElementById('grid-overlay').appendChild(fanContainer);
        activeFans.set(token, fanContainer);
        updateFanPosition(fanContainer, token);
        
        // Fade in the fan
        requestAnimationFrame(() => {
            fanContainer.style.opacity = '1';
            animateFanOpen(fanContainer);
        });
    }
}

// Create individual ability bubble
function createAbilityBubble(name, ability, token, index) {
    if (!ability) {
        console.error('Missing ability data for:', name);
        return null;
    }

    const bubble = document.createElement('div');
    bubble.className = 'ability-bubble';
    bubble.dataset.abilityName = name;
    bubble.dataset.index = index;
    bubble.draggable = true;

    bubble.style.cssText = `
        position: absolute;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #4a1c1c;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        transition: transform 0.2s, border-color 0.2s;
        transform: scale(0);
        pointer-events: auto;
        z-index: 1000;
    `;

    bubble.innerHTML = `
        <div class="ability-content">
            <span class="ability-icon">${ability.icon || '❓'}</span>
            <div class="ability-tooltip">
                <div class="tooltip-header">${name}</div>
                <div class="tooltip-body">${ability.description || 'No description available'}</div>
                <div class="tooltip-stats">
                    <div>AP Cost: ${ability.apCost || '?'}</div>
                    ${ability.manaCost ? `<div>Mana Cost: ${ability.manaCost}</div>` : ''}
                </div>
            </div>
        </div>
    `;

    // Drag handlers
    bubble.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        const dragData = {
            type: 'bubbleAbility',
            name: name,
            index: index
        };
        bubble.classList.add('dragging');
        draggedAbility = dragData;
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    });

    bubble.addEventListener('dragend', () => {
        bubble.classList.remove('dragging');
        draggedAbility = null;
    });

    bubble.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        bubble.classList.add('drag-over');
    });

    bubble.addEventListener('dragleave', () => {
        bubble.classList.remove('drag-over');
    });

    bubble.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        bubble.classList.remove('drag-over');
        
        try {
            const droppedData = JSON.parse(e.dataTransfer.getData('application/json'));
            
            if (droppedData.type === 'bubbleAbility') {
                // Handle bubble-to-bubble swap
                swapAbilities(token, droppedData.index, index);
            } else if (droppedData.type === 'cardAbility') {
                // Handle card-to-bubble replacement
                replaceAbility(token, droppedData.name, index);
            }
        } catch (err) {
            // If JSON parse fails, try handling as plain text for backward compatibility
            try {
                const plainData = e.dataTransfer.getData('text/plain');
                if (plainData && draggedAbility && draggedAbility.name) {
                    // Handle drag from ability card
                    replaceAbility(token, draggedAbility.name, index);
                }
            } catch (fallbackErr) {
                console.error('Error handling ability drop:', err);
                console.error('Fallback error:', fallbackErr);
            }
        }
    });

    // Click handler for using ability
    bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ability) {
            useAbility(name, ability, token);
            const fan = activeFans.get(token);
            if (fan) {
                animateFanClose(fan);
                activeFans.delete(token);
            }
        }
    });

    // Mouse grab handling
    bubble.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left click only
            bubble.style.cursor = 'grabbing';
        }
    });

    bubble.addEventListener('mouseup', () => {
        bubble.style.cursor = 'grab';
    });

    // Hover effects
    bubble.addEventListener('mouseenter', () => {
        bubble.style.borderColor = '#6b2929';
        bubble.style.transform = 'scale(1.1)';
    });

    bubble.addEventListener('mouseleave', () => {
        bubble.style.borderColor = '#4a1c1c';
        bubble.style.transform = 'scale(1)';
        bubble.style.cursor = 'grab'; // Reset cursor on leave
    });

    return bubble;
}

function initializeFanPositionUpdates() {
    const gridOverlay = document.getElementById('grid-overlay');
    if (!gridOverlay) return;

    const updateFans = () => {
        if (window.requestAnimationFrame) {
            requestAnimationFrame(updateAllFanPositions);
        } else {
            updateAllFanPositions();
        }
    };

    // Update on map movement
    gridOverlay.addEventListener('mousemove', (e) => {
        if (characterState.isDragging) {
            updateFans();
        }
    });

    // Update on zoom
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            updateFans();
        }
    });

    // Update after drag ends
    gridOverlay.addEventListener('mouseup', () => {
        if (characterState.isDragging) {
            updateFans();
        }
    });

    // Update when grid updates
    document.addEventListener('gridUpdate', updateFans);
}

function updateFanPosition(fanContainer, token) {
    if (!fanContainer || !token) return;

    const gridOverlay = document.getElementById('grid-overlay');
    if (!gridOverlay) return;

    // Get token's grid position
    const gridX = parseInt(token.dataset.gridX);
    const gridY = parseInt(token.dataset.gridY);
    
    // Calculate pixel position based on grid scale
    const pixelX = gridX * characterState.gridScale;
    const pixelY = gridY * characterState.gridScale;

    // Position fan absolute to match token positioning
    fanContainer.style.position = 'absolute';
    fanContainer.style.left = `${pixelX}px`;
    fanContainer.style.top = `${pixelY}px`;
    fanContainer.style.width = `${characterState.gridScale}px`;
    fanContainer.style.height = `${characterState.gridScale}px`;
    
    // Scale and transform fan container to match grid transform
    const transform = window.getComputedStyle(gridOverlay).transform;
    if (transform && transform !== 'none') {
        fanContainer.style.transform = transform;
    }

    // Update the bubbles within the fan
    const bubbles = fanContainer.querySelectorAll('.ability-bubble');
    const totalBubbles = bubbles.length;
    const radius = 110; // Distance from center
    const arcAngle = Math.PI / 2; // 90 degrees spread
    const startAngle = -Math.PI/2 - arcAngle/2; // Start from top-left

    bubbles.forEach((bubble, index) => {
        const angleStep = arcAngle / (totalBubbles - 1);
        const angle = startAngle + (index * angleStep);
        
        // Calculate bubble positions
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Position bubbles relative to token center
        bubble.style.position = 'absolute';
        bubble.style.left = `${characterState.gridScale/2 + x}px`;
        bubble.style.top = `${characterState.gridScale/2 + y}px`;
        bubble.style.width = `${48 / characterState.scale}px`;
        bubble.style.height = `${48 / characterState.scale}px`;
        bubble.style.transform = `scale(${characterState.scale})`;
    });
}

function updateAllFanPositions() {
    activeFans.forEach((fan, token) => {
        requestAnimationFrame(() => {
            updateFanPosition(fan, token);
        });
    });
}

function swapAbilities(token, sourceIndex, targetIndex) {
    const creatureName = token.dataset.name;
    const tokenAbilities = window.creatureAbilities[creatureName];
    if (!tokenAbilities) return;

    const abilityEntries = Object.entries(tokenAbilities);
    if (sourceIndex >= abilityEntries.length || targetIndex >= abilityEntries.length) return;

    // Swap entries
    [abilityEntries[sourceIndex], abilityEntries[targetIndex]] = 
    [abilityEntries[targetIndex], abilityEntries[sourceIndex]];

    // Rebuild abilities object
    const newAbilities = {};
    abilityEntries.forEach(([key, value]) => {
        newAbilities[key] = value;
    });

    // Update global abilities
    window.creatureAbilities[creatureName] = newAbilities;

    // Refresh fan display
    const existingFan = activeFans.get(token);
    if (existingFan) {
        existingFan.remove();
        activeFans.delete(token);
        createAbilityFan(token);
    }
}

function replaceAbility(token, newAbilityName, targetIndex) {
    const creatureName = token.dataset.name;
    const tokenAbilities = window.creatureAbilities[creatureName];
    if (!tokenAbilities) return;

    const abilityEntries = Object.entries(tokenAbilities);
    if (targetIndex >= abilityEntries.length) return;

    // Create new abilities object
    const newAbilities = {};
    
    // Iterate through existing abilities and maintain their order
    abilityEntries.forEach(([key, value], index) => {
        if (index === targetIndex) {
            // At the target index, place the new ability
            newAbilities[newAbilityName] = tokenAbilities[newAbilityName];
        } else {
            // Keep other abilities in their original positions
            newAbilities[key] = value;
        }
    });

    // If the new ability didn't exist in the original abilities,
    // we need to ensure it's added at the target position
    if (!tokenAbilities[newAbilityName]) {
        const orderedEntries = Object.entries(newAbilities);
        orderedEntries.splice(targetIndex, 0, [newAbilityName, tokenAbilities[Object.keys(tokenAbilities)[targetIndex]]]);
        // Rebuild object with correct order
        const reorderedAbilities = {};
        orderedEntries.forEach(([key, value], index) => {
            if (index < abilityEntries.length) { // Keep only the original number of abilities
                reorderedAbilities[key] = value;
            }
        });
        window.creatureAbilities[creatureName] = reorderedAbilities;
    } else {
        window.creatureAbilities[creatureName] = newAbilities;
    }

    // Refresh fan display
    const existingFan = activeFans.get(token);
    if (existingFan) {
        existingFan.remove();
        activeFans.delete(token);
        createAbilityFan(token);
    }
}

// Animate fan opening
function animateFanOpen(fanContainer) {
    const bubbles = fanContainer.querySelectorAll('.ability-bubble');
    const totalBubbles = bubbles.length;
    const radius = 110 / characterState.scale;
    const arcAngle = Math.PI / 2;
    const startAngle = -Math.PI/2 - arcAngle/2;

    bubbles.forEach((bubble, index) => {
        const angleStep = arcAngle / (totalBubbles - 1);
        const angle = startAngle + (index * angleStep);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        requestAnimationFrame(() => {
            bubble.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            bubble.style.transform = `scale(${characterState.scale})`;
            bubble.style.left = `${characterState.gridScale/2 + x}px`;
            bubble.style.top = `${characterState.gridScale/2 + y}px`;
        });
    });
}

function animateFanClose(fanContainer) {
    if (!fanContainer) return;
    
    fanContainer.style.opacity = '0';
    
    const bubbles = fanContainer.querySelectorAll('.ability-bubble');
    bubbles.forEach((bubble, index) => {
        setTimeout(() => {
            bubble.style.transform = 'scale(0)';
            bubble.style.left = '50%';
            bubble.style.top = '50%';
        }, index * 50);
    });

    // Remove container after animations complete
    setTimeout(() => {
        if (fanContainer.parentNode) {
            fanContainer.parentNode.removeChild(fanContainer);
        }
    }, bubbles.length * 50 + 300);
}



// Helper function to get abilities for a token
function getTokenAbilities(token) {
    const creatureName = token.dataset.name;
    if (!window.creatureAbilities || !window.creatureAbilities[creatureName]) {
        console.log('No abilities found for:', creatureName);
        return null;
    }
    return window.creatureAbilities[creatureName];
}

// Make sure to initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAbilityFans);

// Also reinitialize when new tokens are added
document.addEventListener('tokenAdded', initializeAbilityFans);

document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing creature sheet after DOM content is loaded.');
    initializeCreatureSheet();
});

console.log('creatureAbilities.js loaded, initializeAbilitiesTab is defined:', typeof window.initializeAbilitiesTab);

document.addEventListener('DOMContentLoaded', () => {
    initializeFanPositionUpdates();
    // Re-initialize when map is loaded
    document.addEventListener('mapLoaded', initializeFanPositionUpdates);
});