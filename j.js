const game = document.getElementById("game");
const gameBoard = document.getElementById("game-board");
const gameStart = document.getElementById('game-start')
const start = document.getElementById("start");
const scoreElement = document.getElementById("score");
const lives = document.getElementById("lives");
const root = document.documentElement.style;

let soundtrack = document.createElement("audio");
soundtrack.loop = "true";
soundtrack.volume = 0.7;
let sound = document.createElement("audio");
sound.volume = 0.5;

//What change is made to current position after going in some direction
const startingPositions = [658, 322, 406, 404, 408];
const positionChange = {
    "ArrowRight": 1,
    "ArrowLeft": -1,
    "ArrowUp": -28,
    "ArrowDown": 28,
}

const oppositeDirection = {
    "ArrowUp": "ArrowDown",
    "ArrowDown": "ArrowUp",
    "ArrowRight": "ArrowLeft",
    "ArrowLeft": "ArrowRight",
}
const yellowSprite = {
    "ArrowRight": 0,
    "ArrowLeft": 3.2,
    "ArrowUp": 6.4,
    "ArrowDown": 9.6,
}
const ghostSprite = {
    "ArrowRight": 0,
    "ArrowLeft": 6.4,
    "ArrowUp": 12.8,
    "ArrowDown": 19.2,
}
const eatenSprite = {
    "ArrowRight": 25.6,
    "ArrowLeft": 28.8,
    "ArrowUp": 32,
    "ArrowDown": 35.2,
}
const characters = [{
    name: "yellow",
    direction: "ArrowLeft",
    directionNew: undefined,
    position: 658,
    nextPosition: undefined,
    mode: "normal",
    status: "normal",
    characterNode: undefined,
    animationLength: undefined,
    animationStart: undefined,
},
{
    name: "red",
    direction: "ArrowLeft",
    directionOld: undefined,
    directionList: ["ArrowUp", "ArrowUp", "ArrowUp"],
    position: 38,
    nextPosition: undefined,
    scatterTarget: 27,
    mode: "normal",
    status: "normal",
    characterNode: undefined,
    animationLength: undefined,
    animationStart: undefined,
},
{
    name: "pink",
    direction: "ArrowDown",
    directionOld: undefined,
    directionList: ["ArrowDown", "ArrowUp", "ArrowUp", "ArrowUp", "ArrowUp"],
    position: 406,
    nextPosition: undefined,
    scatterTarget: 0,
    mode: "normal",
    status: "normal",
    characterNode: undefined,
    animationLength: undefined,
    animationStart: undefined,
},
{
    name: "blue",
    direction: "ArrowUp",
    directionOld: undefined,
    directionList: ["ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowRight", "ArrowRight", "ArrowUp", "ArrowUp", "ArrowUp"],
    position: 404,
    nextPosition: undefined,
    scatterTarget: 867,
    mode: "normal",
    status: "normal",
    characterNode: undefined,
    animationLength: undefined,
    animationStart: undefined,
},
{
    name: "orange",
    direction: "ArrowUp",
    directionOld: undefined,
    directionList: ["ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowLeft", "ArrowUp", "ArrowUp", "ArrowUp"],
    position: 408,
    nextPosition: undefined,
    scatterTarget: 840,
    mode: "normal",
    status: "normal",
    characterNode: undefined,
    animationLength: undefined,
    animationStart: undefined,
},
];
let elements;
let points = 0;
let collisionInterval;
let ghostMode;
let ghostModeInterval;
let changingBackInterval
let isFrightenedWhite = false;
let ghostsEaten = 0;
let newLevel = true;
let score = 0;
let livesLost = 0;
let gameStartLength = 4200;
let whichMunch = 1;

document.addEventListener("click", startGame); 

function startGame() {
    gameStart.style.display = "none";
    game.style.display = "block ";
    startLevel();
    document.removeEventListener("click", startGame)
}

soundtrack.addEventListener('timeupdate', () => {
    var buffer = 0.3;
    if(soundtrack.currentTime > soundtrack.duration - buffer){
        soundtrack.currentTime = 0; 
        soundtrack.play()
    }
});

function startLevel() {
    if (newLevel == true) {
        gameStartLength = 4200;
        sound.src = "audio/game_start.wav";
        makeLevel();
        sound.play();
    }
    setStartingProperties();
    setTimeout(() => {
        soundtrack.src = "audio/siren1.wav";
        soundtrack.play();
        sound.pause();
        lives.children[livesLost].style.visibility = "hidden";
        livesLost++;
        characterMove(0);
        characterMove(1);
        ghostRevive(2, 0);
        ghostRevive(3, 0);
        ghostRevive(4, 0);

        collisionInterval = setInterval(checkCollisions, 10)
        ghostModeInterval = setTimeout(changeModes, 5000);
    }, gameStartLength)
}
function makeLevel() {
    const gameClass = {
        0: "blank",
        1: "left-right wall",
        2: "top-bottom wall",
        3: "top-right wall",
        4: "top-left wall",
        5: "bottom-right wall",
        6: "bottom-left wall",
        7: "top wall",
        8: "bottom wall",
        9: "right wall",
        10: "left wall",
        11: "gate wall",
        12: "wall-empty" 
    }


    const gameArray = [0, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 18, 19, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 1,
        9, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 9,
        9, 126, 4, 10, 10, 5, 126, 4, 10, 10, 10, 5, 126, 11, 13, 126, 4, 10, 10, 10, 5, 126, 4, 10, 10, 5, 126, 9,
        9, 262, 11, 25, 25, 13, 126, 11, 25, 25, 25, 13, 126, 11, 13, 126, 11, 25, 25, 25, 13, 126, 11, 25, 25, 13, 262, 9,
        9, 126, 6, 12, 12, 7, 126, 6, 12, 12, 12, 7, 126, 6, 7, 126, 6, 12, 12, 12, 7, 126, 6, 12, 12, 7, 126, 9,
        9, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 9,
        9, 126, 4, 10, 10, 5, 126, 4, 5, 126, 4, 10, 10, 10, 10, 10, 10, 5, 126, 4, 5, 126, 4, 10, 10, 5, 126, 9,
        9, 126, 6, 12, 12, 7, 126, 11, 13, 126, 6, 12, 12, 15, 14, 12, 12, 7, 126, 11, 13, 126, 6, 12, 12, 7, 126, 9,
        9, 126, 126, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 126, 126, 9,
        2, 8, 8, 8, 8, 1, 126, 11, 16, 10, 10, 5, 26, 11, 13, 26, 4, 10, 10, 17, 13, 126, 0, 8, 8, 8, 8, 3,
        25, 25, 25, 25, 25, 9, 126, 11, 14, 12, 12, 7, 26, 6, 7, 26, 6, 12, 12, 15, 13, 126, 9, 25, 25, 25, 25, 25,
        25, 25, 25, 25, 25, 9, 126, 11, 13, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 11, 13, 126, 9, 25, 25, 25, 25, 25,
        25, 25, 25, 25, 25, 9, 126, 11, 13, 26, 0, 8, 8, 24, 24, 8, 8, 1, 26, 11, 13, 126, 9, 25, 25, 25, 25, 25,
        8, 8, 8, 8, 8, 3, 126, 6, 7, 26, 9, 26, 25, 25, 25, 25, 25, 9, 26, 6, 7, 126, 2, 8, 8, 8, 8, 8,
        26, 26, 26, 26, 26, 26, 126, 26, 26, 26, 9, 26, 26, 26, 26, 26, 26, 9, 26, 26, 26, 126, 26, 26, 26, 26, 26, 26,
        8, 8, 8, 8, 8, 1, 126, 4, 5, 26, 9, 25, 25, 25, 25, 25, 25, 9, 26, 4, 5, 126, 0, 8, 8, 8, 8, 8,
        25, 25, 25, 25, 25, 9, 126, 11, 13, 26, 2, 8, 8, 8, 8, 8, 8, 3, 26, 11, 13, 126, 9, 25, 25, 25, 25, 25,
        25, 25, 25, 25, 25, 9, 126, 11, 13, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 11, 13, 126, 9, 25, 25, 25, 25, 25,
        25, 25, 25, 25, 25, 9, 126, 11, 13, 26, 4, 10, 10, 10, 10, 10, 10, 5, 26, 11, 13, 126, 9, 25, 25, 25, 25, 25,
        0, 8, 8, 8, 8, 3, 126, 6, 7, 26, 6, 12, 12, 15, 14, 12, 12, 7, 26, 6, 7, 126, 2, 8, 8, 8, 8, 1,
        9, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 9,
        9, 126, 4, 10, 10, 5, 126, 4, 10, 10, 10, 5, 126, 11, 13, 126, 4, 10, 10, 10, 5, 126, 4, 10, 10, 5, 126, 9,
        9, 126, 6, 12, 15, 13, 126, 6,  12,  12,  12, 7, 126, 6, 7, 126, 6,  12,  12,  12, 7, 126, 11, 14,  12, 7, 126, 9,
        9, 262, 126, 126, 11, 13, 126, 126, 126, 126, 126, 126, 126, 26, 26, 126, 126, 126, 126, 126, 126, 126, 11, 13, 126, 126, 262, 9,
        20, 10, 5, 126, 11, 13, 126, 4, 5, 126, 4, 10, 10, 10, 10, 10, 10, 5, 126, 4, 5, 126, 11, 13, 126, 4, 10, 22,
        21, 12, 7, 126, 6, 7, 126, 11, 13, 126, 6, 12, 12, 15, 14, 12, 12, 7, 126, 11, 13, 126, 6, 7, 126, 6, 12, 23,
        9, 126, 126, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 11, 13, 126, 126, 126, 126, 126, 126, 9,
        9, 126, 4, 10, 10, 10, 10, 17, 16, 10, 10, 5, 126, 11, 13, 126, 4, 10, 10, 17, 16, 10, 10, 10, 10, 5, 126, 9,
        9, 126, 6, 12, 12, 12, 12, 12, 12, 12, 12, 7, 126, 6, 7, 126, 6, 12, 12, 12, 12, 12, 12, 12, 12, 7, 126, 9,
        9, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 126, 9,
        2, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 3
    ]

    for (let i = 0; i < gameArray.length; i++) {
        const element = document.createElement("DIV");

        if (gameArray[i] > 25) {
            element.className = "blank"
            for (let j = 0; j < characters.length; j++) {
                let character = document.createElement("DIV");
                character.className = characters[j].name;
                element.append(character);
            }
            if(gameArray[i] / 100 > 1) {
                let character = document.createElement("DIV");
                character.className = Math.floor(gameArray[i] / 100) == 1 ? "point" : "big-point";
                element.append(character);
            }
        } else {
            element.className = "wall"
            element.style.backgroundPosition = `-${gameArray[i] * 2}rem 0`;
        }

        gameBoard.append(element);
    }

    points = 0;
    //first element is absolute text so we exclude it
    elements = Array.from(gameBoard.children).splice(1);
    transformStartingElements();
}
function setStartingProperties() {
    newLevel = undefined;
    window.removeEventListener("keydown", getDirection);
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);

    clearTimeout(ghostModeInterval);
    game.style.visibility = "visible";
    start.style.display = "block";
    ghostMode = "scatter";
    ghostsEaten = 0;
    scoreElement.innerHTML = "Score " + score;

    for (let i = 0; i < characters.length; i++) {
        characters[i].position = startingPositions[i];
        characters[i].direction = i < 2 ? "ArrowLeft" : characters[i].directionList[0];
        characters[i].characterNode = elements[characters[i].position].children[i];
        characters[i].characterNode.classList.add(`${characters[i].name}-visible`);
        characters[i].mode = "normal";
        characters[i].status = "normal";

        if (i == 0) {
            root.setProperty(`--${characters[i].name}-sprite-x`, "-6.4rem")
            root.setProperty(`--${characters[i].name}-sprite-y`, "0rem")
            characters[i].directionNew = undefined;
        } else {
            getSprite(i);
        }
    }

    setTimeout(() => {
        window.addEventListener("keydown", getDirection);
        document.addEventListener('touchstart', handleTouchStart);        
        document.addEventListener('touchmove', handleTouchMove);

        for (let i = 2; i < 5; i++) {
            characters[i].animationLength = 200;
            characters[i].characterNode.classList.add(`${characters[i].name}-revive`);
        }
        start.style.display = "none";

        getSprite(0);
    }, gameStartLength)
}
//Transform has to be set before class visible is added in setStartingProperties cause transform will transition instead of changing instantly
function transformStartingElements() {
    for (let i = 0; i < 5; i++) {
        if (i == 1) {
            for (let j = 1; j < 5; j++) {
                elements[startingPositions[i]].children[j].style.transform = "translateX(-1rem)";
            }
        } else {
            elements[startingPositions[i]].children[i].style.transform = "translateX(-1rem)";
        }
    }
}
function changeModes() {
    if (ghostMode === "scatter") {
        ghostMode = "chase";
        ghostModeInterval = setTimeout(changeModes, 25000);
    } else if (ghostMode === "chase") {
        ghostMode = "scatter";
        ghostModeInterval = setTimeout(changeModes, 5000);
    }
    changeGhostDirections();
}
function checkCollisions() {
    const yellowTransform = new WebKitCSSMatrix(getComputedStyle(characters[0].characterNode).transform);
    let yellowTranslateX = yellowTransform.e;
    let yellowTranslateY = yellowTransform.f;

    for (let i = 1; i < 5; i++) {
        //soundtrack is so there aren't multiple gameOver if few ghosts hit pacman
        if (characters[0].status == "freeze") {
            clearInterval(collisionInterval)
            return;
        }

        const distance = calculateDistance(characters[0].position, characters[i].position)

        const ghostTransform = new WebKitCSSMatrix(getComputedStyle(characters[i].characterNode).transform);
        let ghostTranslateX = ghostTransform.e;
        let ghostTranslateY = ghostTransform.f;

        let requirement;
        let yellowNewPosition;
        let ghostNewPosition;

        if(distance == 0) {
           requirement -30;
           yellowNewPosition = characters[0].position + positionChange[characters[0].direction] + oppositeDirection[positionChange[characters[i].direction]];
           ghostNewPosition = characters[i].position + positionChange[characters[i].direction] + oppositeDirection[positionChange[characters[0].direction]]; 
        }
        if (distance == 1) {
            requirement = 10;
            yellowNewPosition = characters[0].position + positionChange[characters[0].direction];
            ghostNewPosition = characters[i].position + positionChange[characters[i].direction];
        } else if (distance == 4) {
            requirement = 30;
            yellowNewPosition = characters[0].position + positionChange[characters[0].direction] * 2;
            ghostNewPosition = characters[i].position + positionChange[characters[i].direction] * 2;
        } else if (distance == 2) {
            requirement = 25;
            yellowNewPosition = characters[0].position + positionChange[characters[0].direction] + positionChange[oppositeDirection[characters[i].direction]];
            ghostNewPosition = characters[i].position + positionChange[characters[i].direction] + positionChange[oppositeDirection[characters[0].direction]];
        } else if (distance != 0) {
            continue;
        }
        if(window.innerWidth < 600 || window.innerHeight < 700) {
            requirement /= 2;
        }


        if (yellowNewPosition == characters[i].position) {
            yellowTranslateX = Math.abs(yellowTranslateX);
            yellowTranslateY = Math.abs(yellowTranslateY);
        } else {
            yellowTranslateX = -Math.abs(yellowTranslateX);
            yellowTranslateY = -Math.abs(yellowTranslateY);
        }
        if (ghostNewPosition == characters[0].position) {
            ghostTranslateY = Math.abs(ghostTranslateY);
            ghostTranslateX = Math.abs(ghostTranslateX);
        } else {
            ghostTranslateY = -Math.abs(ghostTranslateY);
            ghostTranslateX = -Math.abs(ghostTranslateX);
        } 

        const transformDistance = yellowTranslateY + ghostTranslateY + yellowTranslateX + ghostTranslateX;


        if (transformDistance > requirement) {
            if (characters[i].mode == "frightened") {
                gameFreeze(i);
            } else if (characters[i].mode == "normal") {
                gameOver();
            }
        }
    }
}
//i - character index
function characterMove(i) {
    if (characters[i].status == "freeze") return;

    characters[i].nextPosition = getNewPosition(i);

    if (elements[characters[i].nextPosition].classList.contains("wall")) {
        if(sound.src.includes("munch")) {
            sound.pause();
        }
        setTimeout(() => {
            characterMove(i);
        }, 50)
        return;
    }

    getAnimationLength(i);
    getSprite(i)
    getTransition(i);
    changePosition(i);
}
function getNewPosition(i) {
    if (i == 0) {
        getYellowDirection(i);

        // forcing going backwards after changing modes. Without it, turning back is ignored in some situations. 
    } else if (characters[i].direction != oppositeDirection[characters[i].directionOld]) {
        if (characters[i].mode == "frightened") {
            getRandomDirection(i);
        } else {
            getGhostDirection(i);
        }
    } else {
        characters[i].directionOld = characters[i].direction;
    }
    let nextPosition = characters[i].position + positionChange[characters[i].direction];

    //for going through a tunnel
    if (characters[i].position == 392 && nextPosition == 391) {
        nextPosition = 419;
    } else if (characters[i].position == 419 && nextPosition == 420) {
        nextPosition = 392;
    }

    return nextPosition;
}
function getYellowDirection(i) {
    if (characters[i].directionNew != undefined) {
        const newPosition = characters[i].position + positionChange[characters[i].directionNew];

        if (!elements[newPosition].classList.contains("wall")) {
            characters[i].direction = characters[i].directionNew;
            characters[i].directionNew = undefined;
        }
    }
}
function getGhostDirection(i) {
    // so direction won't become undefined if newDirection has no move (like crossing tunnel)
    let newDirection = characters[i].directionOld = characters[i].direction;
    let biggestDistance = 100000;
    let target;

    if (characters[i].mode == "eaten") {
        target = 322;
    } else if (ghostMode == "scatter") {
        target = characters[i].scatterTarget
    } else {
        target = getChaseTarget(i) 
    }

    for (let [direction, value] of Object.entries(positionChange)) {
        const newPosition = characters[i].position + value;
        const newDistance = calculateDistance(target, newPosition)

        if (newDistance < biggestDistance) {
            if (!elements[newPosition].classList.contains("wall") &&
                oppositeDirection[direction] != characters[i].direction) {
                biggestDistance = newDistance;
                newDirection = direction;
            }
        }
    }
    characters[i].direction = newDirection;
}
function getRandomDirection(i) {
    let nextPosition = characters[i].position + positionChange[characters[i].direction];

    if ((characters[i].position == 392 && nextPosition == 391) ||
        (characters[i].position == 419 && nextPosition == 420)) {
        return;
    }

    let newDirection
    do {
        const random = ~~(Math.random() * 4);
        newDirection = Object.keys(positionChange)[random];

        newPosition = characters[i].position + positionChange[newDirection];

    } while (elements[newPosition].classList.contains("wall") ||
        oppositeDirection[newDirection] == characters[i].direction)

    characters[i].direction = newDirection;
}
function getChaseTarget(i) {
    switch (i) {
        case 1:
            if(characters[0].position == characters[i].position && !elements[characters[0].nextPosition].classList.contains("wall")) {
                return characters[0].position + positionChange[characters[0].direction];
            }
            return characters[0].position;
        case 2:
            return characters[0].position + positionChange[characters[0].direction] * 2;
        case 3:
            return getBlueTarget();
        case 4:
            const yellowOrangeDistance = calculateDistance(characters[0].position, characters[4].position);
            if (yellowOrangeDistance < 64) {
                return 840;
            } else {
                return characters[0].position;
            }
    }
}
function getBlueTarget() {
    const yellowPosition = characters[0].position + positionChange[characters[0].direction];
    const yellowRedDistanceX = yellowPosition % 28 - characters[1].position % 28;
    const yellowRedDistanceY = ~~(yellowPosition / 28) - ~~(characters[1].position / 28);

    let bluePositionX = yellowPosition % 28 + yellowRedDistanceX;

    if (bluePositionX < 0) {
        bluePositionX = 0;
    } else if (bluePositionX > 27) {
        bluePositionX = 27;
    }

    const bluePositionY = ~~(yellowPosition / 28) + yellowRedDistanceY;

    return bluePositionX + bluePositionY * 28;
}
function calculateDistance(target, newGhostPosition) {
    const distanceX = Math.floor(target / 28) - Math.floor(newGhostPosition / 28);
    const distanceY = target % 28 - newGhostPosition % 28;

    return distanceX ** 2 + distanceY ** 2;
}
function getAnimationLength(i) {
    let animationLength;
    if (i == 0) {
        animationLength = characters[i].mode == "hasEaten" ? 210 : 190;
    } else {
        const tunnel = [392, 393, 394, 395, 396, 419, 418, 417, 416, 415]

        if (characters[i].mode == "eaten") {
            if (characters[i].nextPosition === 322) {
                animationLength = characters[i].direction == "ArrowLeft" ? 25 : 75;
            } else {
                animationLength = 50;
            }
        } else if (tunnel.includes(characters[i].position) || tunnel.includes(characters[i].nextPosition)) {
            animationLength = 350;
            //if it started or it got revived
        } else if (characters[i].mode == "frightened") {
            animationLength = 300;
        } else if (
            characters[i].direction == characters[i].directionOld ||
            characters[i].direction == oppositeDirection[characters[i].directionOld]) {
            animationLength = 200;
        } else {
            animationLength = 220;
        }
    }

    if (characters[i].characterNode.style.transform == 'translateX(-1rem)') {
        animationLength /= 1.5;
    }

    root.setProperty(`--${characters[i].name}-animation-length`, animationLength + "ms");
    characters[i].animationLength = animationLength;
}
function getSprite(i) {
    let spriteX;
    let spriteY;
    if (i == 0) {
        spriteX = 3.2;
        spriteY = yellowSprite[characters[i].direction];
    } else {
        if (characters[i].mode == "normal") {
            spriteX = ghostSprite[characters[i].direction];
            spriteY = 9.6 + 3.2 * i;
        } else if (characters[i].mode == "frightened") {
            spriteX = isFrightenedWhite == true ? 32 : 25.6;
            spriteY = 12.8;
        } else {
            spriteX = eatenSprite[characters[i].direction];
            spriteY = 16;
        }
    }

    root.setProperty(`--${characters[i].name}-sprite-x`, `-${spriteX}rem`);
    root.setProperty(`--${characters[i].name}-sprite-y`, `-${spriteY}rem`);
}
function getTransition(i) {
    const isGoingToRespawn = characters[i].mode == "eaten" && characters[i].nextPosition == 322;
    const transitionMove = {
        "ArrowUp": "Y(-2rem)",
        "ArrowDown": "Y(2rem)",
        "ArrowRight": isGoingToRespawn ? "X(1rem)" : "X(2rem)",
        "ArrowLeft": isGoingToRespawn ? "X(-3rem)" : "X(-2rem)",
    }

    characters[i].characterNode.style.transform = `translate${transitionMove[characters[i].direction]}`;
}
async function changePosition(i) {
    await new Promise(resolve => {
        if (characters[i].mode != "eaten") {
            characters[i].characterNode.classList.add(`${characters[i].name}-animation-move`);
        }
        characters[i].animationStart = performance.now();
        setTimeout(() => {
            if (characters[i].status == "freeze") return;

            characters[i].characterNode.classList.remove(`${characters[i].name}-animation-move`, `${characters[i].name}-visible`);
            characters[i].characterNode.style.transform = "";
            characters[i].position = characters[i].nextPosition;
            characters[i].characterNode = elements[characters[i].position].children[i];
            characters[i].characterNode.classList.add(`${characters[i].name}-visible`);

            if (i == 0) {
                eatPoint(i);
            } else if (characters[i].mode == "eaten" && characters[i].position === 322) {
                ghostRetreat(i);
            }

            resolve("")
        }, characters[i].animationLength)

    })
    characterMove(i)
}
function eatPoint(i) {
    const point = elements[characters[i].position].children[5];

    if (point != undefined) {
        points++;
        characters[i].mode = "hasEaten";
        if (point.classList.contains("big-point")) {
            makeGhostsScared();
            score += 50;
        } else {
            score += 10;
            if(!sound.src.includes("munch") || sound.paused) {
                sound.src = `audio/munch.wav`;
                sound.play();
            }
        }

        scoreElement.innerHTML = "Score " + score;
        point.remove();

        if (points == 244) {
            gameWin();
            freezeCharacters();
        }
    } else {
        characters[i].mode = "normal";
        if(sound.src.includes("munch")) {
            sound.pause();
        }
    }
}
function makeGhostsScared() {
    soundtrack.src = "audio/power_pellet.wav";
    soundtrack.play();
    clearInterval(changingBackInterval);
    isFrightenedWhite = false;
    ghostsEaten = 0;
    changeGhostDirections();
    for (let i = 0; i < 5; i++) {
        if (characters[i].mode != "eaten") {
            characters[i].mode = "frightened";
            getSprite(i);
        }
    }
    setTimeout(() => {
        let intervalCount = 1;
        changingBackInterval = setInterval(() => {
            if (characters[0].status == "freeze") {
                return;
            }
            if (intervalCount == 10) {
                clearInterval(changingBackInterval);
                if(!soundtrack.src.includes("retreating")) {
                    soundtrack.src = "audio/siren1.wav";
                    soundtrack.play();
                }
                for (let i = 0; i < characters.length; i++) {
                    if (characters[i].mode != "eaten") {
                        characters[i].mode = "normal";
                    }
                }
            }
            if (intervalCount % 2 == 1) {
                isFrightenedWhite = true;
            } else {
                isFrightenedWhite = false;
            }

            for (let i = 0; i < 5; i++) {
                getSprite(i);
            }
            intervalCount++;
        }, 300)
    }, 800)
}
function changeGhostDirections() {
    for (let i = 1; i < 5; i++) {
        if (characters[i].mode == "normal" &&
            !characters[i].characterNode.className.includes("revive")) {
            characters[i].directionOld = characters[i].direction;
            characters[i].direction = oppositeDirection[characters[i].direction];
        }
    }
}
function gameFreeze(i) {
    sound.src = "audio/eat_ghost.wav";
    sound.play();
    const animationStop = performance.now();
    stopAnimations("stop");
    clearTimeout(ghostModeInterval);

    characters[i].mode = "eaten";
    characters[0].characterNode.classList.remove(`yellow-visible`);
    characters[i].characterNode.classList.remove(`${characters[i].name}-animation-move`);
    root.setProperty(`--${characters[i].name}-sprite-x`, `-${(ghostsEaten * 32) / 10}rem`);
    root.setProperty(`--${characters[i].name}-sprite-y`, "-25.6rem")

    for (let j = 0; j < 5; j++) {
        characters[j].animationLength = characters[j].animationLength - (animationStop - characters[j].animationStart);
        if (j == i) {
            characters[j].animationLength /= 6;
        }
        root.setProperty(`--${characters[j].name}-animation-length`, `${characters[j].animationLength}ms`);
    }

    setTimeout(() => {
        soundtrack.src = "audio/retreating.wav";
        soundtrack.play();
        characters[0].characterNode.classList.add(`yellow-visible`);
        getSprite(i);

        for (let j = 0; j < 5; j++) {
            characters[j].characterNode.style.removeProperty("transition");
            if (characters[j].status == "freeze") {
                characters[j].status = "normal";

                if (!characters[j].characterNode.className.includes(`revive`)) {
                    if (j == 0 && elements[characters[j].nextPosition].classList.contains("wall")) {
                        characterMove(j);
                    } else {
                        getTransition(j);
                        changePosition(j);
                    }

                }
                characters[j].characterNode.style.animationPlayState = "running";
            }
        }
        collisionInterval = setInterval(checkCollisions, 10);
        ghostModeInterval = setTimeout(changeModes, 5000);
    }, 1000)
    ghostsEaten++;
    score += 2 ** ghostsEaten * 100;
    scoreElement.innerHTML = "Score " + score;
}
function ghostRetreat(i) {
    characters[i].status = "freeze";
    characters[i].characterNode.classList.add(`${characters[i].name}-retreat`)

    setTimeout(() => {
        if(characters.some(char => char.mode == "frightened")) {
            soundtrack.src = "audio/power_pellet.wav";
        } else {
            soundtrack.src = "audio/siren1.wav";
        }
        soundtrack.play()
        characters[i].position = i == 1 ? 406 : startingPositions[i]
        characters[i].characterNode.classList.remove(`${characters[i].name}-visible`, `${characters[i].name}-animation-move`, `${characters[i].name}-retreat`);

        characters[i].characterNode.style.transform = "translateX(-1rem)";
        characters[i].characterNode = elements[characters[i].position].children[i];
        characters[i].animationLength = 200;
        characters[i].characterNode.classList.add(`${characters[i].name}-visible`, `${characters[i].name}-revive`)
        characters[i].mode = "normal";
        characters[i].animationLength = 200;
        ghostRevive(i, 0);
    }, i > 2 ? 250 : 150)
}
//revive animation progress
function ghostRevive(i, progress) {
    if (characters[i].direction != characters[i].directionList[progress] &&
        characters[i].directionList[progress] != undefined &&
        characters[i].mode != "frightened") {
        characters[i].direction = characters[i].directionList[progress];
        getSprite(i);
    }

    if (progress != characters[i].directionList.length && newLevel == undefined) {
        if (characters[0].status == "freeze") {
            characters[i].characterNode.style.animationPlayState = "paused";
        } else {
            characters[i].characterNode.style.animationPlayState = "running";
        }

        setTimeout(() => {
            characters[i].animationStart = performance.now();
            if (characters[0].status != "freeze") {
                progress++;
                characters[i].animationLength = 200;
            }

            ghostRevive(i, progress)
        }, characters[i].animationLength);
    } else if (newLevel == undefined) {
        characters[i].characterNode.classList.remove(`${characters[i].name}-visible`, `${characters[i].name}-revive`)
        characters[i].position = 322;
        characters[i].characterNode = elements[characters[i].position].children[i];
        characters[i].characterNode.classList.add(`${characters[i].name}-visible`);
        characters[i].status = "normal"
        characters[i].direction = "ArrowLeft"
        getSprite(i);
        characterMove(i);
    }
}
function gameOver() {
    stopAnimations();
    setTimeout(() => {
        for (let i = 1; i < 5; i++) {
            characters[i].characterNode.classList.remove(`${characters[i].name}-visible`);
        }

        characters[0].characterNode.classList.add("yellow-death-animation");
        sound.src = "audio/death_1.wav";
        sound.play();
        setTimeout(() => {
            sound.src = "audio/death_2.wav";
            sound.play();
        }, 1400)

        if (livesLost == 3) {
            newLevel = true;
            setTimeout(() => {
                start.innerHTML = "Game&nbsp; Over";
                start.style.display = "block";
                start.style.color = "red";

                setTimeout(() => {
                    start.style.display = "none";
                    start.style.color = "yellow";
                    start.innerHTML = "READY!";

                    hardReset();
                    deleteGameBoard();
                    game.style.visibility = "hidden";

                    setTimeout(startLevel, 500)
                }, 1500)
            }, 1500)
        } else {
            newLevel = false;
            gameStartLength = 2000;
            setTimeout(() => {

                game.style.visibility = "hidden";
                deleteClasses();
                setTimeout(startLevel, 500)
            }, 2000)
        }
    }, 1000)

}
function gameWin() {
    stopAnimations();
    newLevel = true;
    sound.src = "audio/extend.wav";
    sound.play();

    setTimeout(() => {
        for (let element of elements) {
            if (element.classList.contains("wall")) {
                element.classList.add("blinking-animation")
                element.style.backgroundColor = "black";

            } else if (element.classList.contains("wall-empty")) {
                element.classList.add("blinking-animation-corner")
            }
        }
        setTimeout(() => {
            game.style.visibility = "hidden";
            deleteGameBoard();
            setTimeout(startLevel, 500)
        }, 1500)
    }, 2000)
}
function stopAnimations(stop) {
    freezeCharacters(stop);
    for (let i = 0; i < 5; i++) {
        const characterTransform = new WebKitCSSMatrix(getComputedStyle(characters[i].characterNode).transform);

        if (stop == "stop" && characters[i].mode == "eaten") {
            continue;
        }
        characters[i].characterNode.style.transition = `none`
        characters[i].characterNode.style.transform = `translate(${parseInt(characterTransform.e)}px, ${parseInt(characterTransform.f)}px)`;
        if (stop != "stop") {
            soundtrack.pause();
            sound.pause();
            if (i != 0) {
                characters[i].characterNode.style.animationPlayState = "paused";
            }
            characters[i].characterNode.classList.remove(`${characters[i].name}-animation-move`);
        } else {
            characters[i].characterNode.style.animationPlayState = "paused";
        }
    }
}
function deleteGameBoard() {
    for (let element of elements) {
        element.remove();
    }
}
function deleteClasses() {
    for (let i = 0; i < 5; i++) {
        if (characters[i].characterNode != undefined) {
            characters[i].characterNode.className = characters[i].name;
            characters[i].characterNode.removeAttribute("style");
        }
        transformStartingElements();
    }
}
function hardReset() {
    livesLost = 0;
    score = 0;

    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            lives.children[i].removeAttribute("style");
        }
    }, 500)
}
function freezeCharacters(stop) {
    for (let i = 0; i < 5; i++) {
        if (stop == "stop" && characters[i].mode == "eaten") {
            continue;
        }
        characters[i].status = "freeze";
    }
}
function getDirection(e) {
    switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowRight":
        case "ArrowLeft":
            characters[0].directionNew = e.key;
    }
}

let xDown = null;                                                        
let yDown = null;                      

function handleTouchStart(e) {
    const firstTouch = e.touches[0];                               
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;                     
};                                                
function handleTouchMove(e) {
    if (!xDown || !yDown) {
        return;
    }
    let xMove = e.touches[0].clientX;
    let yMove = e.touches[0].clientY;
    let xDiff = xDown - xMove;
    let yDiff = yDown - yMove;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            characters[0].directionNew = "ArrowLeft";
        } else {
            characters[0].directionNew = "ArrowRight";
        }
    } else {
        if (yDiff > 0) {
            characters[0].directionNew = "ArrowUp";
        } else {
            characters[0].directionNew = "ArrowDown";
        }
    }
    xDown = null;
    yDown = null;
};