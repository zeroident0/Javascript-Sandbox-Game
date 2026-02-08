// Material Types
const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const MUD = 3;
const SEED = 4;
const PLANT = 5;

// The grid
let grid, nextGrid;
let hueGrid, nextHueGrid;
let energyGrid, nextEnergyGrid;
let w = 4; // Smaller squares for more detail
let cols, rows;
let hueValue = 30;
let currentMaterial = 'sand';

const MATERIAL_COLORS = {
    sand: 'rgba(255, 191, 128, 1)',    // Sandy Orange
    water: 'rgba(52, 152, 219, 1)',   // Bright Water Blue
    mud: 'rgba(100, 67, 39, 1)',      // Earthy Brown
    seed: 'rgba(150, 131, 121, 1)'    // Seed Beige
};

function setType(type) {
    currentMaterial = type;
    const buttons = {
        sand: document.getElementById('sandBtn'),
        water: document.getElementById('waterBtn'),
        mud: document.getElementById('mudBtn'),
        seed: document.getElementById('seedBtn')
    };

    Object.keys(buttons).forEach(key => {
        const btn = buttons[key];
        const isActive = key === type;
        btn.classList.toggle('active', isActive);

        // Update color via GSAP to ensure smooth transition
        gsap.to(btn, {
            backgroundColor: isActive ? MATERIAL_COLORS[key] : "#333",
            duration: 0.3
        });
    });
}

function withinCols(i) {
    return i >= 0 && i < cols;
}

function withinRows(j) {
    return j >= 0 && j < rows;
}

function getIndex(i, j) {
    return i + j * cols;
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    colorMode(HSB, 360, 255, 255);
    initGrid();
    initButtonAnimations();
}

function initGrid() {
    cols = floor(width / w);
    rows = floor(height / w);
    grid = new Uint8Array(cols * rows);
    nextGrid = new Uint8Array(cols * rows);
    hueGrid = new Uint16Array(cols * rows);
    nextHueGrid = new Uint16Array(cols * rows);
    energyGrid = new Uint8Array(cols * rows);
    nextEnergyGrid = new Uint8Array(cols * rows);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initGrid();
}

function mouseDragged() {
    if (mouseY < 0 || mouseY >= height || mouseX < 0 || mouseX >= width) return;

    let mouseCol = floor(mouseX / w);
    let mouseRow = floor(mouseY / w);

    let matrix = 5;
    let extent = floor(matrix / 2);
    for (let i = -extent; i <= extent; i++) {
        for (let j = -extent; j <= extent; j++) {
            if (random(1) < 0.75) {
                let col = mouseCol + i;
                let row = mouseRow + j;
                if (withinCols(col) && withinRows(row)) {
                    let idx = getIndex(col, row);
                    if (grid[idx] === EMPTY) {
                        if (currentMaterial === 'sand') {
                            grid[idx] = SAND;
                            hueGrid[idx] = hueValue;
                        } else if (currentMaterial === 'water') {
                            grid[idx] = WATER;
                            hueGrid[idx] = 200 + random(-5, 5);
                        } else if (currentMaterial === 'mud') {
                            grid[idx] = MUD;
                            hueGrid[idx] = floor(random(20, 35));
                        } else if (currentMaterial === 'seed') {
                            if (random(1) < 0.1) { // Much lower spawn rate for seeds
                                grid[idx] = SEED;
                                hueGrid[idx] = floor(random(10, 20));
                                energyGrid[idx] = 100;
                            }
                        }
                    }
                }
            }
        }
    }

    if (currentMaterial === 'sand') {
        hueValue += 1;
        if (hueValue > 40) hueValue = 30;
    }
}

function draw() {
    background(0);

    // 1. Rendering
    loadPixels();
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let idx = getIndex(i, j);
            let type = grid[idx];
            if (type !== EMPTY) {
                let h = hueGrid[idx];
                let s = 200;
                let v = 255;

                if (type === MUD) {
                    h = hueGrid[idx]; s = 150; v = 100;
                } else if (type === SEED) {
                    h = hueGrid[idx]; s = 50; v = 150;
                } else if (type === PLANT) {
                    // Visual Variance: Higher energy (trunk) is darker, lower energy (leaves) is brighter
                    let energy = energyGrid[idx];
                    h = hueGrid[idx];
                    s = map(energy, 0, 25, 100, 255);
                    v = map(energy, 0, 25, 255, 100);
                }

                let rgb = hsbToRgb(h / 360, s / 255, v / 255);

                for (let px = 0; px < w; px++) {
                    for (let py = 0; py < w; py++) {
                        let screenX = i * w + px;
                        let screenY = j * w + py;
                        if (screenX < width && screenY < height) {
                            let pidx = (screenX + screenY * width) * 4;
                            pixels[pidx] = rgb[0];
                            pixels[pidx + 1] = rgb[1];
                            pixels[pidx + 2] = rgb[2];
                            pixels[pidx + 3] = 255;
                        }
                    }
                }
            }
        }
    }
    updatePixels();

    // 2. Physics logic
    nextGrid.fill(EMPTY);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let idx = getIndex(i, j);
            let type = grid[idx];
            let currentHue = hueGrid[idx];

            if (type !== EMPTY) {
                // Reaction: Sand + Water = Mud (Mutual Annihilation)
                if (type === SAND) {
                    let waterIdx = -1;
                    if (withinCols(i - 1) && grid[getIndex(i - 1, j)] === WATER) waterIdx = getIndex(i - 1, j);
                    else if (withinCols(i + 1) && grid[getIndex(i + 1, j)] === WATER) waterIdx = getIndex(i + 1, j);
                    else if (withinRows(j - 1) && grid[getIndex(i, j - 1)] === WATER) waterIdx = getIndex(i, j - 1);
                    else if (withinRows(j + 1) && grid[getIndex(i, j + 1)] === WATER) waterIdx = getIndex(i, j + 1);

                    if (waterIdx !== -1) {
                        type = MUD;
                        currentHue = floor(random(20, 35)); // Mud color range
                        grid[waterIdx] = EMPTY;
                        nextGrid[waterIdx] = EMPTY;
                    }
                }

                // Reaction: Seed + Mud/Plant = Plant (Growth)
                if (type === SEED) {
                    let onMud = false;
                    for (let ni = -1; ni <= 1; ni++) {
                        for (let nj = -1; nj <= 1; nj++) {
                            let ti = i + ni, tj = j + nj;
                            if (withinCols(ti) && withinRows(tj)) {
                                let nType = grid[getIndex(ti, tj)];
                                if (nType === MUD || nType === PLANT) {
                                    onMud = true; break;
                                }
                            }
                        }
                        if (onMud) break;
                    }
                    if (onMud) {
                        type = PLANT;
                        currentHue = floor(random(80, 140)); // Green range
                        energyGrid[idx] = 25; // Sprouting energy (increased for trees)
                    }
                }

                // Logic: Plant spreading (Tree Shape & Leafy Gaps)
                if (type === PLANT) {
                    let energy = energyGrid[idx];

                    // 1. Aging: Small chance to lose energy every frame
                    if (random(1) < 0.01) energy = Math.max(0, energy - 1);

                    if (energy > 0 && random(1) < 0.1) {
                        let growDirI = 0;
                        let growDirJ = -1; // Default upward (trunk)

                        // If energy is lower (crown/canopy), start branching out
                        if (energy < 15) {
                            // Introduce Permanent Leafy Gaps: High skip probability
                            if (random(1) < 0.6) {
                                // Skip growing this frame, but stay alive
                            } else {
                                growDirI = floor(random(-1, 2)); // Lateral branching
                                if (random(1) < 0.4) growDirJ = 0; // More lateral bias

                                let ti = i + growDirI, tj = j + growDirJ;
                                if (withinCols(ti) && withinRows(tj)) {
                                    let tIdx = getIndex(ti, tj);
                                    if (grid[tIdx] === EMPTY && nextGrid[tIdx] === EMPTY) {
                                        nextGrid[tIdx] = PLANT;
                                        nextHueGrid[tIdx] = floor(random(80, 140));
                                        nextEnergyGrid[tIdx] = energy - 1; // Child gets less energy
                                        energy = Math.max(0, energy - 1); // Parent loses energy (tax)
                                    }
                                }
                            }
                        } else {
                            // Trunk phase: mostly straight up
                            if (random(1) < 0.2) growDirI = random(1) < 0.5 ? -1 : 1;

                            let ti = i + growDirI, tj = j + growDirJ;
                            if (withinCols(ti) && withinRows(tj)) {
                                let tIdx = getIndex(ti, tj);
                                if (grid[tIdx] === EMPTY && nextGrid[tIdx] === EMPTY) {
                                    nextGrid[tIdx] = PLANT;
                                    nextHueGrid[tIdx] = floor(random(80, 140));
                                    nextEnergyGrid[tIdx] = energy - 1;
                                    energy = Math.max(0, energy - 1);
                                }
                            }
                        }
                    }
                    currentHue = hueGrid[idx]; // Preserve hue
                    energyGrid[idx] = energy; // Store updated energy back
                }

                let dir = random(1) < 0.5 ? 1 : -1;
                let nextI = i;
                let nextJ = j + 1;
                let canMove = false;

                const check = (ti, tj) => {
                    if (!withinCols(ti) || !withinRows(tj)) return false;
                    let targetIdx = getIndex(ti, tj);
                    let target = grid[targetIdx];
                    if (nextGrid[targetIdx] !== EMPTY) return false;
                    if (target === EMPTY) return true;
                    if ((type === SAND || type === MUD || type === SEED) && target === WATER) return true;
                    return false;
                };

                // Plants are static
                if (type === PLANT) {
                    canMove = false;
                } else if (check(i, j + 1)) {
                    nextI = i; nextJ = j + 1; canMove = true;
                } else if (check(i + dir, j + 1)) {
                    nextI = i + dir; nextJ = j + 1; canMove = true;
                } else if (check(i - dir, j + 1)) {
                    nextI = i - dir; nextJ = j + 1; canMove = true;
                } else if (type === WATER) {
                    if (check(i + dir, j)) {
                        nextI = i + dir; nextJ = j; canMove = true;
                    } else if (check(i - dir, j)) {
                        nextI = i - dir; nextJ = j; canMove = true;
                    }
                }

                if (canMove) {
                    let nIdx = getIndex(nextI, nextJ);
                    if (grid[nIdx] === WATER && type !== WATER) {
                        // Displace water
                        let found = false;
                        for (let di = -1; di <= 1; di++) {
                            for (let dj = -1; dj <= 1; dj++) {
                                let ti = i + di, tj = j + dj;
                                if (withinCols(ti) && withinRows(tj)) {
                                    let diIdx = getIndex(ti, tj);
                                    if (grid[diIdx] === EMPTY && nextGrid[diIdx] === EMPTY) {
                                        nextGrid[diIdx] = WATER;
                                        nextHueGrid[diIdx] = hueGrid[nIdx];
                                        nextEnergyGrid[diIdx] = energyGrid[nIdx];
                                        found = true; break;
                                    }
                                }
                            }
                            if (found) break;
                        }
                    }
                    nextGrid[nIdx] = type;
                    nextHueGrid[nIdx] = currentHue;
                    nextEnergyGrid[nIdx] = energyGrid[idx];
                } else {
                    if (nextGrid[idx] === EMPTY) {
                        nextGrid[idx] = type;
                        nextHueGrid[idx] = currentHue;
                        nextEnergyGrid[idx] = energyGrid[idx];
                    } else {
                        // Fallback displacement
                        for (let di = -1; di <= 1; di++) {
                            for (let dj = -1; dj <= 1; dj++) {
                                let ti = i + di, tj = j + dj;
                                if (withinCols(ti) && withinRows(tj)) {
                                    let diIdx = getIndex(ti, tj);
                                    if (grid[diIdx] === EMPTY && nextGrid[diIdx] === EMPTY) {
                                        nextGrid[diIdx] = type;
                                        nextHueGrid[diIdx] = currentHue;
                                        nextEnergyGrid[diIdx] = energyGrid[idx];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Swap buffers
    let tempGrid = grid;
    grid = nextGrid;
    nextGrid = tempGrid;

    let tempHue = hueGrid;
    hueGrid = nextHueGrid;
    nextHueGrid = tempHue;

    let tempEnergy = energyGrid;
    energyGrid = nextEnergyGrid;
    nextEnergyGrid = tempEnergy;
}

// Simple HSB to RGB helper
function hsbToRgb(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function initButtonAnimations() {
    const buttons = {
        sand: document.getElementById('sandBtn'),
        water: document.getElementById('waterBtn'),
        mud: document.getElementById('mudBtn'),
        seed: document.getElementById('seedBtn')
    };

    Object.keys(buttons).forEach(type => {
        const btn = buttons[type];
        const color = MATERIAL_COLORS[type];
        const hoverColor = color.replace('1)', '0.5)');

        // Hover Scale & Color Effect
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.08,
                duration: 0.3,
                ease: "power2.out",
                backgroundColor: hoverColor
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
                backgroundColor: btn.classList.contains('active') ? color : "#333"
            });
        });

        // Click Logic
        btn.addEventListener('mousedown', () => {
            gsap.to(btn, {
                scale: 0.92,
                duration: 0.1,
                ease: "power2.inOut"
            });
        });

        btn.addEventListener('mouseup', () => {
            gsap.to(btn, {
                scale: 1.08,
                duration: 0.1,
                ease: "power2.inOut"
            });
        });
    });
}
