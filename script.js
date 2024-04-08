let array = [];
let tickSpeed = 200; // default tickspeed
let arraySize = 25; // default array size

generateArray();

function generateArray() {
    array = [];
    for (let i = 0; i < arraySize; i++) {
        array.push(Math.floor(Math.random() * 100));
    }
    displayArray();
}

function displayArray() {
    const containers = document.querySelectorAll(".bar-container");
    for (let a = 0; a < containers.length; a++) {
        const container = containers[a];
        container.innerHTML = '';
        let barsHtml = '';

        for (let i = 0; i < array.length; i++) {
            barsHtml += `<div class="bar-wrapper" style="height: 100%; width: 25px; display: inline-block; position: relative; margin: 0 2px;">
                <div class="bar" style="height: ${array[i]}px; background-color: #6699CC; position: absolute; bottom: 0; width: 100%;"></div>
                <div class="value" style="position: absolute; bottom: ${array[i]}px; color: #000; font-size: 12px; width: 100%; text-align: center;">${array[i]}</div>
            </div>`;
        }
        container.innerHTML = barsHtml;
    }
}

function updateSpeed() {
    let element = document.getElementById("tickSpeed");
    let output = document.getElementById("speedValue");
    output.innerHTML = element.value + " ms";
    tickSpeed = element.value;
}

function updateArraySize() {
    let element = document.getElementById("arraySize");
    arraySize = element.value;
    generateArray();
}

function startSorting() {
    const selectors = ["#bubbleSort .bar-container", "#selectionSort .bar-container", "#radixSort .bar-container", "#heapSort .bar-container"];
    for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        const container = document.querySelector(selector);
        const sortFunction = getSortFunction(selector);
        const arrayCopy = [];

        for (let j = 0; j < array.length; j++) {
            arrayCopy[j] = array[j];
        }

        sortAndDisplay(arrayCopy, container, sortFunction);
    }
}

function getSortFunction(selector) {
    switch (selector) {
        case "#bubbleSort .bar-container":
            return bubbleSort;
        case "#selectionSort .bar-container":
            return selectionSort;
        case "#radixSort .bar-container":
            return radixSort;
        case "#heapSort .bar-container":
            return heapSort;
        default:
            return null;
    }
}

async function sortAndDisplay(array, container, sortFunction) {
    let tick = startTimer(container);

    let updateDisplayCallback = function() {
        updateDisplay(array, container);
    };

    await sortFunction(array, updateDisplayCallback);

    clearInterval(tick);
}

function startTimer(container) {
    let startTime = performance.now();

    function updateTimer() {
        let time = performance.now() - startTime;
        let timeInSeconds = (time / 1000).toFixed(2);
        container.parentNode.querySelector(".timer").textContent = `Tid: ${timeInSeconds} sekunder`;
    }

    return setInterval(updateTimer, 10);
}

function updateDisplay(array, container) {
    let barsHtml = '';

    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        barsHtml += `<div class="bar-wrapper" style="height: 100%; width: 25px; display: inline-block; position: relative; margin: 0 2px;">
            <div class="bar" style="height: ${value}px; background-color: #6699CC; position: absolute; bottom: 0; width: 100%;"></div>
            <div class="value" style="position: absolute; bottom: ${value + 2}px; color: #000; font-size: 12px; width: 100%; text-align: center;">${value}</div>
        </div>`;
    }
    
    container.innerHTML = barsHtml;
}

function bubbleSort(array, updateUI) {
    let length = array.length;
    let i = 0;
    let j = 0;

    return new Promise (function(complete) {
        function step() {
            if (i < length) {
                if (j < length - i - 1) {
                    // compare elements and swap if in wrong order
                    if (array[j] > array[j + 1]) {
                        var swap = array[j];
                        array[j] = array[j + 1];
                        array[j + 1] = swap;
                        updateUI(); // ui callback
                    }
                    j++;
                } else {
                    j = 0; // reset inner loop
                    i++;
                }
                setTimeout(step, tickSpeed);
            } else {
                complete(); // everything sorted
            }
        }
        step(); // next step
    });
}

function selectionSort(array, updateUI) {
    let length = array.length;

    return new Promise(function(complete) {
        function sortNext(i) {
            if (i < length - 1) {
                let indexOfMin = i;
                
                // find index of minimum value in the rest of array.
                for (let j = i + 1; j < length; j++) {
                    if (array[j] < array[indexOfMin]) {
                        indexOfMin = j; // new minimum, store index.
                    }
                }
                // if current i is not minimum swap it with found minimum.
                if (indexOfMin !== i) {
                    let temp = array[i];
                    array[i] = array[indexOfMin];
                    array[indexOfMin] = temp;
                    updateUI();
                }
                setTimeout(function() { sortNext(i + 1); }, tickSpeed);
            } else {
                complete();
            }
        }
        sortNext(0);
    });
}

async function heapSort(array, updateUI) {
    let n = array.length;
    
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(array, n, i, updateUI);
    }
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        [array[0], array[i]] = [array[i], array[0]];
        updateUI();
        await delay(tickSpeed);
        // call max heapify on the reduced heap
        heapify(array, i, 0, updateUI);
    }
}

function heapify(array, size, i, updateUI) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;
    
    // if left is larger than root
    if (left < size && array[left] > array[largest]) {
        largest = left;
        updateUI();
    }
    // if right is larger than largest so far
    if (right < size && array[right] > array[largest]) {
        largest = right;
        updateUI();
    }
    // if largest is not root
    if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]];
        updateUI();
        // recursively heapify the affected sub-tree
        heapify(array, size, largest, updateUI);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function radixSort(array, updateUI) {
    let maxNumb = mostNumb(array);
    
    // loop through each digit
    for (let k = 0; k < maxNumb; k++) {
        // create digit buckets
        let buckets = [];
        // create 10 buckets for each digit
        for (let n = 0; n < 10; n++) {
            buckets[n] = [];
        }

        // place numbers into buckets
        for (let i = 0; i < array.length; i++) {
            let digit = getDigit(array[i], k);
            buckets[digit].push(array[i]);
            updateUI();
        }

        // remake array from buckets
        let idx = 0;
        for (let j = 0; j < buckets.length; j++) {
            // loop each bucket and place back into array
            for (let n = 0; n < buckets[j].length; n++) {
                array[idx++] = buckets[j][n];
                updateUI();
            }
        }
        await delay(tickSpeed);
    }
}


function getDigit(number, position) {
    let numberShifted = number / Math.pow(10, position);
    let integerPart = Math.floor(numberShifted);

    return digit = integerPart % 10;
}

function digitCount(num) {
    return Math.abs(num).toString().length;
}

function mostNumb(nums) {
    let maxNumb = 0;
    for (let i = 0; i < nums.length; i++) {
        maxNumb = Math.max(maxNumb, digitCount(nums[i]));
    }
    return maxNumb;
}