//for loading images with correct path
this.mydir = location.href.substring(0, location.href.lastIndexOf("/") + 1);


//fieldsize
let w = 32;
let margin = 2;
let wait = 800;
let style = "classic";

/*
    #: Baum
    @: Kara
    .: Blatt
    $: Pilz
    *: Pilz auf einem Blatt
    +: Kara auf einem Blatt

*/

let karasworld = `world:
#####
#  . #
#$@  #
# *  #
######`

const imagestore = {
    classic: {
        player: "img/classic/kara.png",
        player_up: "img/classic/kara-up.png",
        player_down: "img/classic/kara-down.png",
        player_right: "img/classic/kara-right.png",
        player_left: "img/classic/kara-left.png",
        box: "img/classic/mushroom.png",
        wall: "img/classic/tree.png",
        storage: "img/classic/leaf.png",
        border_color: '#737373',
        background_color: "rgb(180, 230, 180)"
    },
    flaticon: {
        player: "img/flaticon/ladybug.png",
        player_up: "img/flaticon/ladybug-up.png",
        player_down: "img/flaticon/ladybug-down.png",
        player_right: "img/flaticon/ladybug-right.png",
        player_left: "img/flaticon/ladybug-left.png",
        box: "img/flaticon/mushroom-single.png",
        wall: "img/flaticon/forest.png",
        storage: "img/flaticon/strawberry.png",
        border_color: '#737373',
        background_color: "rgb(180, 230, 180)"
    },
    icon8_color: {
        player: "img/icon8-color/icons8-marienkäfer-48.png",
        player_up: "img/icon8-color/icons8-marienkäfer-48-up.png",
        player_down: "img/icon8-color/icons8-marienkäfer-48-down.png",
        player_right: "img/icon8-color/icons8-marienkäfer-48-right.png",
        player_left: "img/icon8-color/icons8-marienkäfer-48-left.png",
        box: "img/icon8-color/icons8-pilz-48.png",
        wall: "img/icon8-color/icons8-laubbaum-48.png",
        storage: "img/icon8-color/icons8-kleeblatt-48.png",
        border_color: '#737373',
        background_color: "rgb(180, 230, 180)"
    },
    icon8_ios: {
        player: "img/icon8-ios/icons8-marienkäfer-filled-50.png",
        player_up: "img/icon8-ios/icons8-marienkäfer-filled-50-up.png",
        player_down: "img/icon8-ios/icons8-marienkäfer-filled-50-down.png",
        player_right: "img/icon8-ios/icons8-marienkäfer-filled-50-right.png",
        player_left: "img/icon8-ios/icons8-marienkäfer-filled-50-left.png",
        box: "img/icon8-ios/icons8-pilz-filled-50.png",
        wall: "img/icon8-ios/icons8-laubbaum-filled-50.png",
        storage: "img/icon8-ios/icons8-kleeblatt-filled-50.png",
        border_color: '#737373',
        background_color: "rgb(255, 255, 255)"
    },
    icon8_office: {
        player: "img/icon8-office/icons8-marienkäfer-40.png",
        player_up: "img/icon8-office/icons8-marienkäfer-40-up.png",
        player_down: "img/icon8-office/icons8-marienkäfer-40-down.png",
        player_right: "img/icon8-office/icons8-marienkäfer-40-right.png",
        player_left: "img/icon8-office/icons8-marienkäfer-40-left.png",
        box: "img/icon8-office/icons8-pilz-40.png",
        wall: "img/icon8-office/icons8-laubbaum-40.png",
        storage: "img/icon8-office/icons8-kleeblatt-40.png",
        border_color: '#737373',
        background_color: "rgb(255, 255, 255)"
    }
}

let rows = 0, cols = 0, kara, level, cw,
    playerSprite, playerUpSprite, playerDownSprite, playerLeftSprite, playerRightSprite, boxSprite, wallSprite, storageSprite,
    boxes = [],
    storages = [],
    walles = [],
    grid = [],
    world = null;

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
//var canvas_background = document.createElement('canvas');
//var ctx_background = canvas_background.getContext("2d");


class KaraException extends Error {
    constructor(message) {
        super(message);
        this.name = "KaraException";
    }
}

class Player {
    constructor(cell) {
        //index
        this.i = cell.i;
        this.j = cell.j;
        //coordinates
        this.x = this.i * w;
        this.y = this.j * w;
        this.rotation = "right";
    }

    show() {
        switch (this.rotation) {
            case "right":
                cw.image(playerRightSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
                break;
            case "left":
                cw.image(playerLeftSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
                break;
            case "up":
                cw.image(playerUpSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
                break;
            case "down":
                cw.image(playerDownSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
                break;
            default:
                cw.image(playerSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
        }

    }

    moveVector(vector) {
        //is blocked?
        if (!(world[this.i + vector.x] == undefined)) {
            if (!(world[this.i + vector.x][this.j + vector.y] == undefined)) {
                if (!world[this.i + vector.x][this.j + vector.y].blocked) {
                    //is there a box (mushroom)?
                    if (world[this.i + vector.x][this.j + vector.y].occupied) {
                        //is musroom movable?
                        if (!(typeof world[this.i + (vector.x * 2)][this.j + (vector.y * 2)] == undefined)) {
                            if (!(typeof world[this.i + (vector.x * 2)][this.j + (vector.y * 2)] == undefined)) {
                                if (!world[this.i + (vector.x * 2)][this.j + (vector.y * 2)].occupied &&
                                    (!world[this.i + (vector.x * 2)][this.j + (vector.y * 2)].blocked)) {
                                    //move box (mushroom)
                                    world[this.i + vector.x][this.j + vector.y].occupied = false;
                                    world[this.i + (vector.x * 2)][this.j + (vector.y * 2)].occupied = true;
                                }
                                else {
                                    throw new KaraException("mushroom on target field not movable");
                                    return false;
                                }
                            }
                            else {
                                throw new KaraException("mushroom on target field");
                                return false;
                            }
                        }
                        else {
                            throw new KaraException("mushroom on target field");
                            return false;
                        }
                    }
                    else {
                        console.log("empty target field");
                        //in this case you want to complete the movement
                    }
                }
                else {
                    throw new KaraException("tree on target field");
                    return false;
                }

                this.x = (this.i + vector.x) * w;
                this.y = (this.j + vector.y) * w;
                this.i = this.i + vector.x;
                this.j = this.j + vector.y;

                return true;
            }
            else {
                throw new KaraException("target field does not exist");
                return false;
            }
        }
        else {
            throw new KaraException("target field does not exist");
            return false;
        }
    }

}

class Kara extends Player {
    constructor(cell) {
        super(cell);
    }

    update() {
        cw.draw();
    }

    async move() {

        switch (this.rotation) {
            case "right":
                super.moveVector({ x: 1, y: 0 });
                break;
            case "left":
                super.moveVector({ x: -1, y: 0 });
                break;
            case "up":
                super.moveVector({ x: 0, y: -1 });
                break;
            case "down":
                super.moveVector({ x: 0, y: 1 });
                break;
            default:
                super.moveVector({ x: 1, y: 0 });
        }
        //window.requestAnimationFrame(refresh);

        await sleep(wait);
        refresh();
    }

    async turnLeft() {
        switch (this.rotation) {
            case "right":
                this.rotation = "up";
                break;
            case "left":
                this.rotation = "down";
                break;
            case "up":
                this.rotation = "left";
                break;
            case "down":
                this.rotation = "right";
                break;
        }

        new Promise(function (resolve, reject) {
            setTimeout(() => resolve(1), wait); // (*)
        }).then(function (result) { // (**)
            refresh();
        })

        await sleep(wait);
        refresh();
    }

    async turnRight() {
        switch (this.rotation) {
            case "right":
                this.rotation = "down";
                break;
            case "left":
                this.rotation = "up";
                break;
            case "up":
                this.rotation = "right";
                break;
            case "down":
                this.rotation = "left";
                break;
        }

        await sleep(wait);
        refresh();
    }

    async putLeaf() {
        if (world[this.i][this.j].target) throw new KaraException("there is already a Leaf on this field");
        world[this.i][this.j].target = true;
        await sleep(wait);
        refresh();
    }

    async removeLeaf() {
        if (!world[this.i][this.j].target) throw new KaraException("there is no Leaf on this field");
        world[this.i][this.j].target = false;
        await sleep(wait);
        refresh();
    }

    //synonym for style with strawberry instead of leafs
    async putBerry() {
        if (world[this.i][this.j].target) throw new KaraException("there is already a Berry on this field");
        world[this.i][this.j].target = true;
        await sleep(wait);
        refresh();
    }

    async removeBerry() {
        if (!world[this.i][this.j].target) throw new KaraException("there is no Berry on this field");
        world[this.i][this.j].target = false;
        await sleep(wait);
        refresh();
    }

    onBerry() {
        return world[this.i][this.j].target;
    }

    onLeaf() {
        return world[this.i][this.j].target;
    }

    treeFront() {
        var vector = null;
        switch (this.rotation) {
            case "right":
                vector = { x: 1, y: 0 };
                break;
            case "left":
                vector = { x: -1, y: 0 };
                break;
            case "up":
                vector = { x: 0, y: -1 };
                break;
            case "down":
                vector = { x: 0, y: 1 };
                break;
            default:
                vector = { x: 1, y: 0 };
        }

        if (world[this.i + vector.x] === undefined) {
            throw new KaraException("there is no Leaf on this field");
        }
        else if (world[this.i + vector.x][this.j + vector.y] === undefined) {
            return false;
        }
        else {
            return world[this.i + vector.x][this.j + vector.y].blocked;
        }
    }

    treeLeft() {
        var vector = null;
        switch (this.rotation) {
            case "right":
                vector = { x: 0, y: -1 };
                break;
            case "left":
                vector = { x: 0, y: 1 };
                break;
            case "up":
                vector = { x: -1, y: 0 };
                break;
            case "down":
                vector = { x: 1, y: 0 };
                break;
            default:
                vector = { x: 0, y: -1 };
        }

        if (world[this.i + vector.x] === undefined) {
            return false;
        }
        else if (world[this.i + vector.x][this.j + vector.y] === undefined) {
            return false;
        }
        else {
            return world[this.i + vector.x][this.j + vector.y].blocked;
        }
    }

    treeRight() {
        var vector = null;
        switch (this.rotation) {
            case "right":
                vector = { x: 0, y: 1 };
                break;
            case "left":
                vector = { x: 0, y: -1 };
                break;
            case "up":
                vector = { x: 1, y: 0 };
                break;
            case "down":
                vector = { x: -1, y: 0 };
                break;
            default:
                vector = { x: 0, y: 1 };
        }

        if (world[this.i + vector.x] === undefined) {
            return false;
        }
        else if (world[this.i + vector.x][this.j + vector.y] === undefined) {
            return false;
        }
        else {
            return world[this.i + vector.x][this.j + vector.y].blocked;
        }
    }

    mushroomFront() {
        var vector = null;
        switch (this.rotation) {
            case "right":
                vector = { x: 1, y: 0 };
                break;
            case "left":
                vector = { x: -1, y: 0 };
                break;
            case "up":
                vector = { x: 0, y: -1 };
                break;
            case "down":
                vector = { x: 0, y: 1 };
                break;
            default:
                vector = { x: 1, y: 0 };
        }

        if (world[this.i + vector.x] === undefined) {
            return false;
        }
        else if (world[this.i + vector.x][this.j + vector.y] === undefined) {
            return false;
        }
        else {
            return world[this.i + vector.x][this.j + vector.y].blocked;
        }
    }

}

class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.x = i * w;
        this.y = j * w;
        this.border = true; //draw a border around
        this.blocked = false; //is tree
        this.occupied = false; //has mushroom
        this.target = false; //has leaf
    }

    drawGrid() {
        if (this.border) {
            cw.line(this.x, this.y, this.x + w, this.y);
            cw.line(this.x + w, this.y, this.x + w, this.y + w);
            cw.line(this.x + w, this.y + w, this.x, this.y + w);
            cw.line(this.x, this.y + w, this.x, this.y);
        }
    }

    draw() {
        if (this.target) cw.image(storageSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
        if (this.occupied) cw.image(boxSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
        if (this.blocked) cw.image(wallSprite, this.x + margin, this.y + margin, w - (margin * 2), w - (margin * 2));
    }
}

class canvasWorld {
    constructor(userstyle) {
        style = userstyle || "classic";

        //load world from string above
        world = this.loadWorld(karasworld.replace("world:\n", ""));
        //this.preload()


        console.log("Karas World: (" + cols + ", " + rows + ")");

        //create canvas
        var body = document.getElementsByTagName("body")[0];

        canvas.id = "world";
        canvas.width = cols * w;
        canvas.height = rows * w;
        canvas.style.zIndex = 10;

        body.appendChild(canvas);
    }

    preload(callback) {
        console.log('starting preload');
        var loaded = 0;

        var loadImage = function (src) {
            var img = new Image();
            img.onload = complete;
            console.log("img.src = " + mydir + src);
            img.src = mydir + src;
            return img;
        }

        var complete = function () {
            loaded += 1;
            if (loaded === 8 && callback) {
                console.log("prealoding compleated");
                callback(true);
            }
        }
        console.log(style);
        playerSprite = loadImage(imagestore[style].player); //Kara
        playerUpSprite = loadImage(imagestore[style].player_up); //Kara
        playerDownSprite = loadImage(imagestore[style].player_down); //Kara
        playerLeftSprite = loadImage(imagestore[style].player_left); //Kara
        playerRightSprite = loadImage(imagestore[style].player_right); //Kara

        boxSprite = loadImage(imagestore[style].box); // Mushroom
        wallSprite = loadImage(imagestore[style].wall); //Tree
        storageSprite = loadImage(imagestore[style].storage); //Leaf

    }

    draw() {
        //ctx.beginPath();
        ctx.clearRect(0, 0, cols * w, rows * w);
        ctx.fillStyle = imagestore[style].background_color;
        ctx.fillRect(0, 0, cols * w, rows * w);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                world[x][y].drawGrid();
                world[x][y].draw();
            }
        }

        kara.show();
    }

    line(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 0.1;
        // set line color
        ctx.strokeStyle = imagestore[style].border_color;
        ctx.stroke();
        ctx.closePath();
    }


    image(_img, _x, _y, _w, _h) {
        ctx.drawImage(_img, _x, _y, _w, _h);
    }

    loadWorld(world) {
        let mapCoords = { player: [], crates: [], storages: [], walls: [] };

        // Read line by line of a txt with the levels and map it
        var lines = world.split('\n');
        rows = lines.length; //set rows of world
        for (var y = 0; y < lines.length; y++) {
            if (lines[y].length > cols) cols = lines[y].length; //set cols of world
        }

        for (var x = 0; x < cols; x++) {
            // init grid to access like grid[x][j]
            grid[x] = [];
            for (var y = 0; y < rows; y++) {
                grid[x].push(null);
            }
        }

        for (var y = 0; y < lines.length; y++) {
            if (lines[y].length > cols) cols = lines[y].length; //set cols of world

            for (let x = 0; x < cols; x++) {
                let cell = new Cell(x, y);

                if (!(typeof lines[y][x] === 'undefined')) { //fill not defined cell
                    if (lines[y][x] == "#")
                        cell.blocked = true;
                    if (lines[y][x] == ".")
                        cell.target = true;
                    if (lines[y][x] == "$")
                        cell.occupied = true;
                    if (lines[y][x] == "@")
                        kara = new Kara(cell);
                    if (lines[y][x] == "*") {
                        cell.target = true;
                        cell.occupied = true;
                    }
                    if (lines[y][x] == "+") {
                        kara = new Kara(cell);
                        cell.target = true;
                    }
                }

                grid[x][y] = cell;
            }
        }
        return grid;
    }
}

window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "ArrowDown":
            // Do something for "down arrow" key press.
            kara.rotation = "down";
            kara.moveVector({ x: 0, y: 1 });
            break;
        case "ArrowUp":
            // Do something for "up arrow" key press.
            kara.rotation = "up";
            kara.moveVector({ x: 0, y: -1 });
            break;
        case "ArrowLeft":
            // Do something for "left arrow" key press.
            kara.rotation = "left";
            kara.moveVector({ x: -1, y: 0 });
            break;
        case "ArrowRight":
            // Do something for "right arrow" key press.
            kara.rotation = "right";
            kara.moveVector({ x: 1, y: 0 });
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }

    cw.draw();

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);


const sleep = ms => new Promise(res => setTimeout(res, ms));

function refresh() {
    cw.draw();
    console.log("refreshed");
}

function setup() {
    cw = new canvasWorld(style);
    //cw.drawBackground();
    cw.preload(async function () { //you have to wait that all images are loaded
        refresh();

        var userprogramm = run.toString();
        userprogramm = userprogramm.trim();
        userprogramm = userprogramm.substring(0, userprogramm.length - 1); // remove '}'
        userprogramm = userprogramm.replace("function run()", ""); // remove 'function run()'
        userprogramm = userprogramm.trim();
        userprogramm = userprogramm.substring(1); // remove '{'
        userprogramm = userprogramm.replace(/kara.move/g, "await kara.move");
        userprogramm = userprogramm.replace(/kara.turnLeft/g, "await kara.turnLeft");
        userprogramm = userprogramm.replace(/kara.turnRight/g, "await kara.turnRight");
        userprogramm = userprogramm.replace(/kara.putLeaf/g, "await kara.putLeaf");
        userprogramm = userprogramm.replace(/kara.removeLeaf/g, "await kara.removeLeaf");
        userprogramm = userprogramm.replace(/kara.putBerry/g, "await kara.putBerry");
        userprogramm = userprogramm.replace(/kara.removeBerry/g, "await kara.removeBerry");

        var regexp = /function (\w+)[ ]?\(\)/g;
        while (result = regexp.exec(userprogramm)) {
            userprogramm = userprogramm.split(result[1] + "(").join("await " + result[1] + "(");
            userprogramm = userprogramm.split(result[1] + " (").join("await " + result[1] + " (");
            userprogramm = userprogramm.replace("function await " + result[1], "async function " + result[1]);
        }

        console.log(userprogramm);

        var AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        var fn = new AsyncFunction(userprogramm);

        try {
            await fn();
        } catch (e) {
            //draw world monochrome
            ctx.globalCompositeOperation = 'luminosity';
            cw.draw();

            //get error line
            var line = /AsyncFunction:([0-9]+):([0-9]+)/.exec(e.stack)[1] - 3; //don't know why I have to remove 3 lines...

            if (e instanceof KaraException) {
                //error for Kara    
                showwarning("Line " + line + ": " + e.message);
            } else {
                //regular error in js
                showerror("Line " + line + ": " + e.message);
            }
        }


    });
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
    showerror(error.message);
    return false;
};



function showerror(msg) {
    console.log("Error: " + msg);

    var newError = document.createElement("div");
    newError.classList.add("alert");
    newError.classList.add("alert-danger");
    var newContent = document.createTextNode(msg);
    newError.appendChild(newContent);

    // add the newly created element and its content into the DOM 
    var currentWorld = document.getElementById("world");
    document.body.insertBefore(newError, currentWorld);
}

function showwarning(msg) {
    console.log("Warning: " + msg);

    var newWarning = document.createElement("div");
    newWarning.classList.add("alert");
    newWarning.classList.add("alert-warning");
    var newContent = document.createTextNode(msg);
    newWarning.appendChild(newContent);

    // add the newly created element and its content into the DOM 
    var currentWorld = document.getElementById("world");
    document.body.insertBefore(newWarning, currentWorld);


}