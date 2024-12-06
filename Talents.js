
// Core talent data structure
const martyrTalentData = {
    sacred: {
        name: 'Sacred',
        background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.1), rgba(0, 0, 0, 0.9))',
        talents: {
            divineSacrifice: {
                name: 'Divine Sacrifice',
                icon: '/path/to/icons/divine_sacrifice.png',
                maxRank: 5,
                row: 0,
                col: 1,
                description: 'Your healing spells cost {value}% of base mana as health instead',
                values: [20, 40, 60, 80, 100],
                requires: null,
                arrow: null,
                stats: { healthCostReduction: [20, 40, 60, 80, 100] }
            },
            holyFervor: {
                name: 'Holy Fervor',
                icon: '/path/to/icons/holy_fervor.png',
                maxRank: 3,
                row: 1,
                col: 1,
                description: 'Each point of health spent increases healing by {value}%',
                values: [1, 2, 3],
                requires: { divineSacrifice: 3 },
                arrow: { from: 'divineSacrifice', to: 'holyFervor' },
                stats: { healing: [5, 10, 15] }
            },
            martyrdom: {
                name: 'Martyrdom',
                icon: '/path/to/icons/martyrdom.png',
                maxRank: 5,
                row: 2,
                col: 1,
                description: 'Missing health increases healing done by {value}%',
                values: [2, 4, 6, 8, 10],
                requires: { holyFervor: 2 },
                arrow: { from: 'holyFervor', to: 'martyrdom' },
                stats: { healing: [2, 4, 6, 8, 10] }
            }
        }
    },
    suffering: {
        name: 'Suffering',
        background: 'linear-gradient(to bottom, rgba(128, 0, 0, 0.1), rgba(0, 0, 0, 0.9))',
        talents: {
            bloodPrice: {
                name: 'Blood Price',
                icon: '/path/to/icons/blood_price.png',
                maxRank: 5,
                row: 0,
                col: 1,
                description: 'Take {value}% of incoming damage over 4 seconds instead',
                values: [20, 40, 60, 80, 100],
                requires: null,
                arrow: null,
                stats: { damageMitigation: [5, 10, 15, 20, 25] }
            },
            steelFlesh: {
                name: 'Steel Flesh',
                icon: '/path/to/icons/steel_flesh.png',
                maxRank: 3,
                row: 1,
                col: 1,
                description: 'Increase armor by {value}%',
                values: [5, 10, 15],
                requires: { bloodPrice: 3 },
                arrow: { from: 'bloodPrice', to: 'steelFlesh' },
                stats: { armor: [50, 100, 150] }
            }
        }
    },
    vengeance: {
        name: 'Vengeance',
        background: 'linear-gradient(to bottom, rgba(255, 0, 0, 0.1), rgba(0, 0, 0, 0.9))',
        talents: {
            retribution: {
                name: 'Retribution',
                icon: '/path/to/icons/retribution.png',
                maxRank: 5,
                row: 0,
                col: 1,
                description: 'Deal {value}% of damage taken back to attackers',
                values: [10, 20, 30, 40, 50],
                requires: null,
                arrow: null,
                stats: { damageReflection: [10, 20, 30, 40, 50] }
            }
        }
    }
};

class TalentSystem {
    constructor() {
        this.availablePoints = 51;
        this.selectedTree = 'sacred';
        this.treePoints = {
            sacred: 0,
            suffering: 0,
            vengeance: 0
        };
        this.talents = {};
        
        // Track mouse position for tooltip
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Track mouse position relative to viewport
        document.addEventListener('mousemove', (e) => {
            // Store mouse coordinates relative to the viewport
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Update tooltip if visible
            const tooltip = document.getElementById('talentTooltip');
            if (tooltip && tooltip.style.display === 'block') {
                this.updateTooltipPosition(e);
            }
        });
    
        // Handle window events
        window.addEventListener('scroll', () => {
            const tooltip = document.getElementById('talentTooltip');
            if (tooltip && tooltip.style.display === 'block') {
                this.updateTooltipPosition(null);
            }
        }, { passive: true });
    
        window.addEventListener('resize', () => {
            const tooltip = document.getElementById('talentTooltip');
            if (tooltip && tooltip.style.display === 'block') {
                this.updateTooltipPosition(null);
            }
        }, { passive: true });
    
        // Initialize
        this.init();
    }

    init() {
        this.createTooltipContainer();
        this.renderTrees();
        this.bindEvents();
        this.updateDisplay();
    }

    createTooltipContainer() {
        // Remove any existing container
        const existingContainer = document.getElementById('talent-tooltip-container');
        if (existingContainer) {
            existingContainer.remove();
        }
    
        // Create a new container that will exist outside the main content
        const container = document.createElement('div');
        container.id = 'talent-tooltip-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    
        // Create the tooltip element inside the container
        const tooltip = document.createElement('div');
        tooltip.id = 'talentTooltip';
        tooltip.style.display = 'none';
        container.appendChild(tooltip);
    }

    renderTrees() {
        Object.keys(martyrTalentData).forEach(treeName => {
            const tree = martyrTalentData[treeName];
            const treeElement = document.getElementById(`${treeName}Tree`);
            if (!treeElement) return;

            treeElement.style.background = tree.background;
            
            const gridElement = treeElement.querySelector('.talent-grid');
            if (!gridElement) return;

            gridElement.innerHTML = '';

            // Create background overlay for the misty effect
            const overlay = document.createElement('div');
            overlay.className = 'tree-overlay';
            treeElement.insertBefore(overlay, gridElement);

            // Render talents
            Object.entries(tree.talents).forEach(([talentId, talent]) => {
                const talentElement = this.createTalentElement(talentId, talent);
                gridElement.appendChild(talentElement);
            });

            // Draw arrows after talents are placed
            this.drawArrows(treeName);
        });
    }

    createTalentElement(talentId, talent) {
        const div = document.createElement('div');
        div.className = 'talent-icon unavailable';
        div.dataset.talentId = talentId;
        div.dataset.maxRank = talent.maxRank;
        div.style.gridRow = talent.row + 1;
        div.style.gridColumn = talent.col + 1;

        // Create icon border
        const border = document.createElement('div');
        border.className = 'talent-border';
        div.appendChild(border);

        // Create icon image
        const icon = document.createElement('div');
        icon.className = 'talent-icon-image';
        icon.style.backgroundImage = `url(${talent.icon})`;
        div.appendChild(icon);

        // Create rank display
        const rankDiv = document.createElement('div');
        rankDiv.className = 'talent-rank';
        rankDiv.textContent = '0/' + talent.maxRank;
        div.appendChild(rankDiv);

        return div;
    }

    drawArrows(treeName) {
        const tree = martyrTalentData[treeName];
        const treeElement = document.getElementById(`${treeName}Tree`);
        const gridElement = treeElement.querySelector('.talent-grid');

        Object.values(tree.talents).forEach(talent => {
            if (talent.arrow) {
                const fromTalent = tree.talents[talent.arrow.from];
                const toTalent = tree.talents[talent.arrow.to];

                const arrow = this.createArrow(
                    fromTalent.row,
                    fromTalent.col,
                    toTalent.row,
                    toTalent.col,
                    talent.arrow.from
                );
                
                gridElement.appendChild(arrow);
            }
        });
    }

    createArrow(fromRow, fromCol, toRow, toCol, fromTalentId) {
        const arrow = document.createElement('div');
        arrow.className = 'talent-arrow';
        arrow.dataset.fromTalent = fromTalentId;

        const cellSize = 80; // Size of grid cell
        const iconCenter = 25; // Half of icon size

        const startX = (fromCol * cellSize) + iconCenter;
        const startY = (fromRow * cellSize) + iconCenter;
        const endX = (toCol * cellSize) + iconCenter;
        const endY = (toRow * cellSize) + iconCenter;

        // Calculate length and angle
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        arrow.style.width = `${length}px`;
        arrow.style.left = `${startX}px`;
        arrow.style.top = `${startY}px`;
        arrow.style.transform = `rotate(${angle}deg)`;
        arrow.style.transformOrigin = '0 50%';

        return arrow;
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTree(e.target.dataset.tree);
            });
        });

        // Talent interactions
        document.querySelectorAll('.talent-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const talentId = e.currentTarget.dataset.talentId;
                this.spendPoint(talentId);
            });

            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const talentId = e.currentTarget.dataset.talentId;
                this.unlearnTalent(talentId);
            });

            icon.addEventListener('mouseover', (e) => this.showTooltip(e));
            icon.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
            icon.addEventListener('mouseout', () => this.hideTooltip());
        });

        // Reset button
        document.getElementById('resetTalents')?.addEventListener('click', () => {
            this.resetTalents();
        });
    }

    showTooltip(event) {
        const talentId = event.currentTarget.dataset.talentId;
        const talent = this.findTalent(talentId);
        if (!talent) return;
    
        const tooltip = document.getElementById('talentTooltip');
        
        // Add the talentId directly to the talent object for reference
        talent.id = talentId;
        tooltip.dataset.currentTalentId = talentId;
        
        this.updateTooltipContent(tooltip, talent);
        tooltip.style.display = 'block';
        this.updateTooltipPosition(event);
    }

    updateTooltipContent(tooltip, talent) {
        const currentRank = this.talents[talent.id] || 0;
        const tooltipContent = this.generateTooltipContent(talent, currentRank);
        tooltip.innerHTML = tooltipContent;
    }

    generateTooltipContent(talent, currentRank) {
        const nextRank = currentRank < talent.maxRank ? currentRank + 1 : currentRank;
        const currentEffect = talent.values[currentRank - 1] || talent.values[0];
        const nextEffect = talent.values[nextRank - 1];

        return `
            <h3>${talent.name}</h3>
            <div class="rank">Rank ${currentRank}/${talent.maxRank}</div>
            <div class="description">
                ${currentRank > 0 ? this.formatDescription(talent.description, currentEffect) : 
                                  this.formatDescription(talent.description, talent.values[0])}
            </div>
            ${currentRank < talent.maxRank ? `
                <div class="next-rank">
                    Next Rank:<br>
                    ${this.formatDescription(talent.description, nextEffect)}
                </div>
            ` : ''}
            ${this.getRequirementsTooltip(talent)}
        `;
    }

    updateTooltipPosition(event) {
        const tooltip = document.getElementById('talentTooltip');
        if (!tooltip || tooltip.style.display === 'none') return;
    
        const padding = 15;
        let x, y;
    
        // Get coordinates relative to the viewport
        if (event) {
            // If we have an event, use its coordinates
            x = event.clientX;
            y = event.clientY;
        } else {
            // Otherwise use stored mouse position
            x = this.mouseX;
            y = this.mouseY;
        }
    
        // Calculate tooltip position
        let left = x + padding;
        let top = y + padding;
    
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const tooltipRect = tooltip.getBoundingClientRect();
    
        // Adjust if tooltip would go off screen
        if (left + tooltipRect.width > viewportWidth) {
            left = x - tooltipRect.width - padding;
        }
    
        if (top + tooltipRect.height > viewportHeight) {
            top = y - tooltipRect.height - padding;
        }
    
        // Apply position using fixed positioning relative to viewport
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }
    
    

    hideTooltip() {
        const tooltip = document.getElementById('talentTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    getRequirementsTooltip(talent) {
        if (!talent.requires) return '';

        return Object.entries(talent.requires).map(([reqTalentId, reqPoints]) => {
            const reqTalent = this.findTalent(reqTalentId);
            const currentPoints = this.talents[reqTalentId] || 0;
            const isMet = currentPoints >= reqPoints;
            
            return `
                <div class="requirement ${isMet ? 'met' : 'unmet'}">
                    Requires ${reqPoints} point${reqPoints > 1 ? 's' : ''} in ${reqTalent.name}
                </div>
            `;
        }).join('');
    }

    updateArrows() {
        document.querySelectorAll('.talent-arrow').forEach(arrow => {
            const fromTalentId = arrow.dataset.fromTalent;
            const fromTalentRank = this.talents[fromTalentId] || 0;
            
            arrow.classList.toggle('active', fromTalentRank > 0);
        });
    }

    spendPoint(talentId) {
        if (this.availablePoints <= 0) return;
    
        const talent = this.findTalent(talentId);
        if (!talent) return;
    
        // Add the talentId to the talent object
        talent.id = talentId;
    
        const currentRank = this.talents[talentId] || 0;
        if (currentRank >= talent.maxRank) return;
    
        if (!this.checkRequirements(talent)) return;
    
        // Spend point
        this.talents[talentId] = currentRank + 1;
        this.availablePoints--;
        this.treePoints[this.selectedTree]++;
    
        // Update UI
        this.updateDisplay();
        this.updateArrows();
        
        // Update tooltip if it's currently showing this talent
        const tooltip = document.getElementById('talentTooltip');
        if (tooltip && tooltip.style.display === 'block' && tooltip.dataset.currentTalentId === talentId) {
            this.updateTooltipContent(tooltip, talent);
        }
        
        this.updateCharacterStats(talent, currentRank + 1);
    }

    unlearnTalent(talentId) {
        const currentRank = this.talents[talentId] || 0;
        if (currentRank <= 0) return;
    
        // Check dependencies
        const dependentTalents = this.getDependentTalents(talentId);
        for (const depTalentId of dependentTalents) {
            if (this.talents[depTalentId]) {
                const depTalent = this.findTalent(depTalentId);
                alert(`Cannot unlearn ${this.findTalent(talentId).name} - required for ${depTalent.name}`);
                return;
            }
        }
    
        // Remove point
        this.talents[talentId] = currentRank - 1;
        if (this.talents[talentId] === 0) {
            delete this.talents[talentId];
        }
        
        this.availablePoints++;
        this.treePoints[this.selectedTree]--;
    
        // Update UI
        this.updateDisplay();
        this.updateArrows();
        
        // **Fetch the talent data**
        const talent = this.findTalent(talentId);
    
        // Update tooltip if it's currently showing this talent
        const tooltip = document.getElementById('talentTooltip');
        if (tooltip && tooltip.style.display === 'block' && tooltip.dataset.currentTalentId === talentId) {
            this.updateTooltipContent(tooltip, talent);
        }
        
        // Update character stats if available
        this.updateCharacterStats(talent, currentRank - 1, true);
    }
    

    resetTalents() {
        this.availablePoints = 51;
        this.treePoints = {
            sacred: 0,
            suffering: 0,
            vengeance: 0
        };
        this.talents = {};

        // Reset character stats if available
        if (window.characterState && window.characterState.talentBonuses) {
            Object.keys(window.characterState.talentBonuses).forEach(stat => {
                window.characterState.talentBonuses[stat] = 0;
            });
        }

        this.updateDisplay();
        this.updateArrows();
        
        // Update character stats if available
        if (typeof window.updateCharacterStats === 'function') {
            window.updateCharacterStats();
        }
    }

    formatDescription(description, value) {
        return description.replace('{value}', value);
    }

    findTalent(talentId) {
        for (const tree of Object.values(martyrTalentData)) {
            if (tree.talents[talentId]) {
                return tree.talents[talentId];
            }
        }
        return null;
    }

    checkRequirements(talent) {
        if (!talent.requires) return true;

        return Object.entries(talent.requires).every(([reqTalentId, reqPoints]) => {
            return (this.talents[reqTalentId] || 0) >= reqPoints;
        });
    }

    getDependentTalents(talentId) {
        const dependentTalents = [];
        for (const tree of Object.values(martyrTalentData)) {
            for (const [id, talent] of Object.entries(tree.talents)) {
                if (talent.requires && talent.requires[talentId]) {
                    dependentTalents.push(id);
                }
            }
        }
        return dependentTalents;
    }

    updateDisplay() {
        // Update available points display
        document.getElementById('availablePoints').textContent = this.availablePoints;

        // Update tab points
        Object.entries(this.treePoints).forEach(([tree, points]) => {
            const tab = document.querySelector(`[data-tree="${tree}"]`);
            if (tab) {
                tab.textContent = `${martyrTalentData[tree].name} (${points})`;
            }
        });

        // Update talent ranks and availability
        this.updateTalentIcons();
    }

    updateTalentIcons() {
        Object.entries(martyrTalentData).forEach(([treeName, tree]) => {
            Object.entries(tree.talents).forEach(([talentId, talent]) => {
                const icon = document.querySelector(`[data-talent-id="${talentId}"]`);
                if (!icon) return;

                const currentRank = this.talents[talentId] || 0;
                
                // Update rank display
                const rankDisplay = icon.querySelector('.talent-rank');
                if (rankDisplay) {
                    rankDisplay.textContent = `${currentRank}/${talent.maxRank}`;
                }

                // Update icon states
                icon.classList.remove('available', 'unavailable', 'maxed');
                if (currentRank >= talent.maxRank) {
                    icon.classList.add('maxed');
                } else if (this.checkRequirements(talent) && this.availablePoints > 0) {
                    icon.classList.add('available');
                } else {
                    icon.classList.add('unavailable');
                }
            });
        });
    }

    updateCharacterStats(talent, rank, isRemoving = false) {
        if (!talent.stats || !window.characterState) return;
        
        // Calculate and apply stat changes
        Object.entries(talent.stats).forEach(([stat, values]) => {
            const newValue = isRemoving ? 0 : (values[rank - 1] || 0);
            const oldValue = isRemoving ? (values[rank - 1] || 0) : (values[rank - 2] || 0);

            // Use talentBonuses instead of temporaryBonuses
            if (!window.characterState.talentBonuses) {
                window.characterState.talentBonuses = {};
            }
            if (!window.characterState.talentBonuses[stat]) {
                window.characterState.talentBonuses[stat] = 0;
            }

            window.characterState.talentBonuses[stat] -= oldValue;
            window.characterState.talentBonuses[stat] += newValue;
        });

        // Trigger character stats update if available
        if (typeof window.updateCharacterStats === 'function') {
            window.updateCharacterStats();
        }
    }

    switchTree(treeName) {
        if (!martyrTalentData[treeName]) return;

        // Update active tree
        this.selectedTree = treeName;

        // Update UI
        document.querySelectorAll('.talent-tree').forEach(tree => {
            tree.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
        });

        document.getElementById(`${treeName}Tree`).classList.add('active');
        document.querySelector(`[data-tree="${treeName}"]`).classList.add('active');

        // Update arrows for the new active tree
        this.updateArrows();
    }
}

// Initialize the system when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.talentSystem = new TalentSystem();
});
