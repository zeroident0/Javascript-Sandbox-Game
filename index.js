// Create a 2D array
function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
        // Fill the array with 0s
        for (let j = 0; j < arr[i].length; j++) {
            arr[i][j] = 0;
        }
    }
    return arr;
}

// The grid
let grid;
// How big is each square?
let w = 5;
let cols, rows;
let hueValue = 30;

// Check if a row is within the bounds
function withinCols(i) {
    return i >= 0 && i <= cols - 1;
}

// Check if a column is within the bounds
function withinRows(j) {
    return j >= 0 && j <= rows - 1;
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 255, 255);
    cols = floor(width / w);
    rows = floor(height / w);
    grid = make2DArray(cols, rows);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = floor(width / w);
    rows = floor(height / w);
    grid = make2DArray(cols, rows);
}

function mouseDragged() {
    let mouseCol = floor(mouseX / w);
    let mouseRow = floor(mouseY / w);

    // Randomly add an area of sand particles
    let matrix = 5;
    let extent = floor(matrix / 2);
    for (let i = -extent; i <= extent; i++) {
        for (let j = -extent; j <= extent; j++) {
            if (random(1) < 0.75) {
                let col = mouseCol + i;
                let row = mouseRow + j;
                if (withinCols(col) && withinRows(row)) {
                    grid[col][row] = hueValue;
                }
            }
        }
    }
    // Change the color of the sand over time
    hueValue += 1;
    if (hueValue > 40) {
        hueValue = 30;
    }
}

function draw() {
    background(0);

    // Draw the sand
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            noStroke();
            if (grid[i][j] > 0) {
                fill(grid[i][j], 255, 255);
                let x = i * w;
                let y = j * w;
                square(x, y, w);
            }
        }
    }

    // Create a 2D array for the next frame of animation
    let nextGrid = make2DArray(cols, rows);

    // Check every cell
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // What is the state?
            let state = grid[i][j];

            // If it's a piece of sand!
            if (state > 0) {
                // What is below?
                let below = grid[i][j + 1];

                // Randomly fall left or right
                let dir = 1;
                if (random(1) < 0.5) {
                    dir *= -1;
                }

                // Check below left or right
                let belowA = -1;
                let belowB = -1;
                if (withinCols(i + dir)) {
                    belowA = grid[i + dir][j + 1];
                }
                if (withinCols(i - dir)) {
                    belowB = grid[i - dir][j + 1];
                }


                // Can it fall below or left or right?
                if (below === 0) {
                    nextGrid[i][j + 1] = state;
                } else if (belowA === 0) {
                    nextGrid[i + dir][j + 1] = state;
                } else if (belowB === 0) {
                    nextGrid[i - dir][j + 1] = state;
                    // Stay put!
                } else {
                    nextGrid[i][j] = state;
                }
            }
        }
    }
    grid = nextGrid;
}
