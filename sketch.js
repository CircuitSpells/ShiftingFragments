let mainContainerId = "p5-canvas";
let mainContainer = document.getElementById(mainContainerId);

let canvasWidth;
let canvasHeight;

let segmentSize = 15;
let segmentFraction = 1 / segmentSize;
let rectWidth;
let randomWidthMin;
let randomWidthMax;
let rectHeight;
let randomHeightMin;
let randomHeightMax;

let colorMin = 202;
let colorMax = 220;
let color1 = 279;
let color2 = 242;
let xColor;
let yColor;
let mouseXtoY;
let mouseYtoX;
let windowMax;
let windowMin;

let colorRandomOffsetArrayOld = Array(segmentSize);
let colorRandomOffsetArrayNew = Array(segmentSize);
let colorRandomOffsetAmount = 40;

let randomOffsetLength = 240; // num frames until new rand val
let randomOffsetArrayOld = Array(segmentSize);
let randomOffsetArrayNew = Array(segmentSize);

function setup() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent(mainContainerId);
    noStroke();

    rectWidth = canvasWidth / segmentSize;
    randomWidthMin = rectWidth * 2;
    randomWidthMax = rectWidth * 4;

    rectHeight = canvasHeight / segmentSize;
    randomHeightMin = randomWidthMin;
    randomHeightMax = randomWidthMax;

    windowMax = max(canvasWidth, canvasHeight);
    windowMin = min(canvasWidth, canvasHeight);

    xColor = map(mouseX, 0, canvasWidth, colorMin, colorMax);
    yColor = map(mouseY, 0, canvasHeight, colorMin, colorMax);

    for (let i = 0; i < segmentSize; i++) {
        colorRandomOffsetArrayOld[i] = Array(segmentSize);
        colorRandomOffsetArrayNew[i] = Array(segmentSize);
        randomOffsetArrayOld[i] = Array(segmentSize);
        randomOffsetArrayNew[i] = Array(segmentSize);

        for (let j = 0; j < segmentSize; j++) {
            if (j % 2 == 0) {
                let rgb = [color1, xColor, yColor];
                rgb.forEach(recalibrateColor);
                fill(rgb[0], rgb[1], rgb[2]);
            }
            else {
                let rgb = [yColor, color2, xColor];
                rgb.forEach(recalibrateColor);
                fill(rgb[0], rgb[1], rgb[2]);
            }
            
            let rectXPos = ((i + 1) * segmentFraction) * canvasWidth;
            let rectYPos = ((j + 1) * segmentFraction) * canvasHeight;
            rect(rectXPos, rectYPos, rectWidth, rectHeight);
            
            colorRandomOffsetArrayOld[i][j] = randomGaussian(0, colorRandomOffsetAmount);
            colorRandomOffsetArrayNew[i][j] = randomGaussian(0, colorRandomOffsetAmount);
            
            let randomOffsetOld = random(randomWidthMin, randomWidthMax);
            randomOffsetArrayOld[i][j] = getRandomInteger(0, 1) ? -randomOffsetOld : randomOffsetOld;
            let randomOffsetNew = random(randomWidthMin, randomWidthMax);
            randomOffsetArrayNew[i][j] = getRandomInteger(0, 1) ? -randomOffsetNew : randomOffsetNew;
        }
    }
}

function windowResized() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    resizeCanvas(canvasWidth, canvasHeight);

    rectWidth = canvasWidth / segmentSize;
    randomWidthMin = rectWidth * 2;
    randomWidthMax = rectWidth * 4;

    rectHeight = canvasHeight / segmentSize;
    randomHeightMin = randomWidthMin;
    randomHeightMax = randomWidthMax;

    windowMax = max(canvasWidth, canvasHeight);
    windowMin = min(canvasWidth, canvasHeight);
}

function draw() {
    xColor = map(mouseX, 0, canvasWidth, colorMin, colorMax);
    yColor = map(mouseY, 0, canvasHeight, colorMin, colorMax);

    let isNewRandomEnabled = false;
    let randomOffsetFrameCount = frameCount % randomOffsetLength;
    let randomOffsetFrameRatio = map(randomOffsetFrameCount, 0, randomOffsetLength - 1, 0, 1 - (1 / randomOffsetLength));
    let easeInOutSineRatio = easeInOutSine(randomOffsetFrameRatio);
    if (randomOffsetFrameCount == 0) {
        isNewRandomEnabled = true;
    }

    let colorTimeOffset = map(sin(TWO_PI * randomOffsetFrameRatio), -1, 1, -15, 15);

    for (let i = 0; i < segmentSize; i++) {
        for (let j = 0; j < segmentSize; j++) {
            if (isNewRandomEnabled) {
                colorRandomOffsetArrayOld[i][j] = colorRandomOffsetArrayNew[i][j];
                colorRandomOffsetArrayNew[i][j] = randomGaussian(0, colorRandomOffsetAmount);
                
                randomOffsetArrayOld[i][j] = randomOffsetArrayNew[i][j];
                let randomOffsetNew = random(randomWidthMin, randomWidthMax);
                randomOffsetArrayNew[i][j] = getRandomInteger(0, 1) ? -randomOffsetNew : randomOffsetNew;
            }
            
            let colorRandomOffset = colorRandomOffsetArrayOld[i][j] + ((colorRandomOffsetArrayNew[i][j] - colorRandomOffsetArrayOld[i][j]) * easeInOutSineRatio);
            let colorOffset = colorTimeOffset + colorRandomOffset;
            
            if (j % 2 == 0) {
                let rgb = [color1 + colorOffset - 10, xColor + colorOffset + 20, yColor + colorOffset];
                rgb.forEach(recalibrateColor);
                fill(rgb[0], rgb[1], rgb[2]);
            }
            else {
                let rgb = [yColor + colorOffset + 20, color2 + colorOffset, xColor + colorOffset + 10];
                rgb.forEach(recalibrateColor);
                fill(rgb[0], rgb[1], rgb[2]);
            }
            
            let rectWidthOffset = rectWidth + randomOffsetArrayOld[i][j] + ((randomOffsetArrayNew[i][j] - randomOffsetArrayOld[i][j]) * easeInOutSineRatio);
            let rectHeightOffset = rectHeight + randomOffsetArrayOld[i][j] + ((randomOffsetArrayNew[i][j] - randomOffsetArrayOld[i][j]) * easeInOutSineRatio);
            
            let rectXPos = ((i + 1) * segmentFraction) * canvasWidth;
            let rectYPos = ((j + 1) * segmentFraction) * canvasHeight;
            rect(rectXPos, rectYPos, rectWidthOffset, rectHeightOffset);
        }
    }
}

// input should be between 0 and 1 inclusive
// output is a value between 0 and 1 inclusive
function easeInOutSine(input) {
    return -(cos(PI * input) - 1) / 2;
}

// min inclusive, max inclusive
function getRandomInteger(min, max) {
    return floor(random() * (max - min + 1)) + min;
}

function logLowFrameRate(threshold = 50) {
    let currentFrameRate = frameRate();
    if (currentFrameRate < threshold) {
        console.log(currentFrameRate);
    }
}

function recalibrateColor(initColorVal, index, arr) {
    newColorVal = initColorVal % 512; // (256 * 2) = 512 color options before looping
    if (newColorVal / 2 > 255) {
        newColorVal = 255 - (newColorVal - 256);
    }

    //newColorVal = map(newColorVal, 0, 255, 15, 240);
    arr[index] = newColorVal;
}