let G = 500; //Gravitational constant
let EPSILON = 20;
let TAIL_LENGTH = 64;
let TAIL_VISIBILITY = 180;
let SIDE_MARGIN = 0.1; // For particles, as fraction of div width/height
let VERTICAL_MARGIN = 0.1;
let SHOT_RAD = 400;
let BACKGROUND = 30;
let PARTICLE_DRAW_SCALE = 8;


let ball = null;
let nuclei = []; //Static particles
let walls = [];
let target = null;
let shootx = 0;
let shooty = 0;
let div_height = 0;
let div_width = 0;
let level = 0;
var cnv;
//
// document.getElementById("reset").onclick = function() {ready_game()};

window.onkeydown = function(event){
    if(event.keyCode === 32) {
        event.preventDefault();
        document.getElementById("retry").click();
    }
    else if(event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("new").click();
    }

};

window.onload = function() {
    div_width = document.getElementById("game").offsetWidth;
    div_height = document.getElementById("game").offsetHeight;
    console.log(div_height, div_width);
    new_game();
};

function setup() {
    cnv = createCanvas(div_width, div_height);
    cnv.style('display', 'block');
    cnv.parent("game");

    pos_img = loadImage("./assets/BLUE.png");
    neg_img = loadImage("./assets/YELLOW.png");
    el_img = loadImage("./assets/WHITE.png");
    target_img = loadImage("./assets/TARGET.png");

    // console.log(p.x +', '+p.y + ' v: ', p.vx);
    // console.log(i.x +', '+i.y + ', ' + i.intensity);
    // frameRate(1);
}
function new_game() {
    nuclei = [];
    walls = [];
    resizeCanvas(div_width, div_height);

    if(level >= levels.length) {
        end_game()
    }
    else {
        let level_indicator = document.getElementById("level");
        level_indicator.style.color = "#656565";
        level_indicator.style.fontSize = "40px";
        level_indicator.textContent = "LEVEL " + (level+1).toString();

        create_field_from_data(levels[level]);
        ball = new particle(50, div_height / 2, 1, 0, 0, 0, 0, true);
    }
}
function ready_game() {
    if (level >= levels.length) {
        level = 0;
        new_game();
    }
    else
        ball = new particle(50, div_height / 2, 1, 0, 0, 0, 0, true);
}
function win() {
    level++;
    new_game();
}
function end_game() {
    let level_indicator = document.getElementById("level");
    level_indicator.textContent = "YOU WIN!";
    level_indicator.style.color = "red";
    level_indicator.style.fontSize = "60px";
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * Math.floor(max - min)) + min;
}

function reletive_to_absolute_position(x, y, intensity=1) {
    let left_extreme = div_width * SIDE_MARGIN;
    let right_extreme = div_width * (1 - SIDE_MARGIN);
    let up_extreme = div_height * VERTICAL_MARGIN;
    let bottom_extreme = div_height * (1 - VERTICAL_MARGIN);

    let x_abs = x * (right_extreme - left_extreme) + left_extreme;
    let y_abs = y * (bottom_extreme - up_extreme) + up_extreme;
    return [x_abs, y_abs, intensity];
}

function reletive_to_absolute_size(x, y) {
    let left_extreme = div_width * SIDE_MARGIN;
    let right_extreme = div_width * (1 - SIDE_MARGIN);
    let up_extreme = div_height * VERTICAL_MARGIN;
    let bottom_extreme = div_height * (1 - VERTICAL_MARGIN);

    let x_abs = x * (right_extreme - left_extreme);
    let y_abs = y * (bottom_extreme - up_extreme);
    return [x_abs, y_abs];
}

function create_field_from_data(data) {
    let x, y, intensity, width, height;

    for(let i = 0; i < data.nuclei.length; i++) {
        let curr = data.nuclei[i];
        [x, y, intensity] = reletive_to_absolute_position(curr.x, curr.y, curr.intensity);
        nuclei.push(new particle(x, y, intensity))
    }

    for(let i = 0; i < data.walls.length; i++) {
        let curr = data.walls[i];
        [x, y] = reletive_to_absolute_position(curr.x, curr.y);
        [width, height] = reletive_to_absolute_size(curr.width, curr.height);

        walls.push(new wall(x, y, width, height));
    }

    [x,y] = reletive_to_absolute_position(data.target.x, data.target.y);
    target = new particle(x, y);
}

function create_random_field(nuclei_num, target_num, min_intensity, max_intensity) {

    let this_field = {"nuclei":[], "target":null};

    let pos_num = getRandomInt(nuclei_num / 2, nuclei_num); //number of positive nuclei

    let left_extreme = div_width * SIDE_MARGIN;
    let right_extreme = div_width * (1 - SIDE_MARGIN);
    let up_extreme = div_height * VERTICAL_MARGIN;
    let bottom_extreme = div_height * (1 - VERTICAL_MARGIN);

    for(let i = 0; i < pos_num; i++) {
        let intensity = getRandomInt(min_intensity, max_intensity);
        let x = getRandomInt(left_extreme, right_extreme);
        let y = getRandomInt(up_extreme, bottom_extreme);
        let p = new particle(x, y, intensity);
        nuclei.push(p);

        this_field.nuclei.push([x, y, intensity]);
    }
    for(let i = 0; i < nuclei_num - pos_num - 1; i++) {
        let intensity = getRandomInt(min_intensity, max_intensity);
        let x = getRandomInt(left_extreme, right_extreme);
        let y = getRandomInt(up_extreme, bottom_extreme);
        let p = new particle(x, y, -intensity);
        nuclei.push(p);

        this_field.nuclei.push([x, y, intensity]);
    }

    for(let i = 0; i < target_num; i++) {
        let x = getRandomInt(left_extreme, right_extreme);
        let y = getRandomInt(up_extreme, bottom_extreme);
        target = new particle(x, y);

        this_field.target = [x, y];
    }

    console.log(JSON.stringify(this_field, null, 2));
}

function draw_nuclei() {
    for(let i = 0; i < nuclei.length; i++) {
        let size = PARTICLE_DRAW_SCALE * nuclei[i].intensity;
        // ellipse(nuclei[i].x, nuclei[i].y, size, size);
        if(nuclei[i].intensity > 0)
            image(pos_img, nuclei[i].x, nuclei[i].y, size, size);
        else
            image(neg_img, nuclei[i].x, nuclei[i].y, size, size)
    }
}

function collided_with_wall(x, y, i) {
    return x > walls[i].x && x < (walls[i].x + walls[i].width) &&
           y > walls[i].y && y < (walls[i].y + walls[i].height);

}
function update_ball() {
    if (ball.locked === false) {
        for (let j = 0; j < nuclei.length; j++) {
            ball.influenced_by(nuclei[j]);
        }
        ball.update();

        //Hit wall?
        for(let i = 0; i < walls.length; i++) {
            if(collided_with_wall(ball.x, ball.y, i))
                ball.die = true;
        }

        //Hit target?
        let distsq, dirx, diry;
        [distsq, [dirx, diry]] = ball.dist_from_particle(target);
        if(sqrt(distsq) < EPSILON) {
            ball.die = true;
            if(ball.die === true)
                win();
        }
    }
}

function draw_ball() {
    image(el_img, ball.x, ball.y, 10, 10);
}

function draw_target() {
    let size = PARTICLE_DRAW_SCALE * 6;
    image(target_img, target.x, target.y, size, size);
}

function draw_tails() {
    for(let j = 0; j < ball.history.length - 1; j++) {
        fill(Math.max(BACKGROUND, BACKGROUND + (j + 1) * (TAIL_VISIBILITY - BACKGROUND) / ball.history.length));
        ellipse(ball.history[j][0], ball.history[j][1], 3, 3);
    }
}

function draw_walls() {
    fill(193, 255, 193);
    stroke(200);
    rectMode(CORNER);
    for(let i = 0; i < walls.length; i++) {
        rect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);
    }
}

function draw() {
    if(ball === null)
        return;
    console.log(ball.die);

    imageMode(CENTER);
    rectMode(CENTER);
    background(BACKGROUND);
    stroke(BACKGROUND);
    fill(255);
    smooth();

    if(ball.die === false)
        update_ball();
    draw_nuclei();
    draw_target();
    draw_ball();
    draw_tails();
    push();
    draw_walls();
    pop();

    if(ball.die === true && level < levels.length)
        ready_game();
    push();
    if(ball.locked === true)
        ready_shoot(ball);
    pop();

}

function dottedLine(x1, y1, x2, y2, dot_num) {
    for (let i = 0; i <= dot_num; i++) {
        let x = lerp(x1, x2, i/dot_num);
        let y = lerp(y1, y2, i/dot_num);
        point(x, y);
    }
}

function ready_shoot(p){
    stroke(250);
    let sx = mouseX;
    let sy = mouseY;
    let len = sqrt(pow(mouseX - p.x, 2) + pow(mouseY - p.y, 2));
    if(len > SHOT_RAD) {
        sx = (mouseX - p.x) * SHOT_RAD / len + p.x;
        sy = (mouseY - p.y) * SHOT_RAD / len + p.y;
    }
    dottedLine(p.x, p.y, sx, sy, 20);
    strokeWeight(.3);

    let angle = Math.atan((p.y - sy)/(sx - p.x)) * 360 / (2 * Math.PI);
    if(angle < 0 && sy < p.y)
        angle += 180;
    else if(angle > 0 && sy > p.y)
        angle -=180;

    text(Math.min(Math.round(len), SHOT_RAD).toString() + "\n" +
         (Math.round(angle * 10) / 10).toString() + "\xB0", sx, sy + 20);
    // line(p.x, p.y, sx, sy);
    shootx = (sx - p.x) / 100;
    shooty = (sy - p.y) / 100;
}

function mousePressed() {
    if(ball.locked === true && mouseX < div_width) {
        ball.locked = false;
        ball.vx = shootx;
        ball.vy = shooty;
    }
}
let particle = function (x, y, intensity = 1, vx = 0, vy = 0, ax = 0, ay = 0, locked = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;
    this.intensity = intensity;
    this.locked = locked;
    this.die = false;
    this.history = [];
    this.tick = 0;

    this.dist_from_particle = function(other) {
        // returns square of distance aith normalized direction
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        let distsq = pow(dx, 2) + pow(dy, 2);
        let dirx = dx / sqrt(distsq);
        let diry = dy / sqrt(distsq);

        return [distsq, [dirx, diry]];
    };

    this.influenced_by = function(other) {
        let distsq, dirx, diry;
        [distsq, [dirx, diry]] = this.dist_from_particle(other);

        this.ax += dirx * G * this.intensity * other.intensity / distsq;
        this.ay += diry * G * this.intensity * other.intensity / distsq;

        if(sqrt(distsq) < EPSILON)
            this.die = true;
    };

    this.update = function() {
        this.tick++;
        this.vx += this.ax;
        this.vy += this.ay;

        if(this.tick % 3 === 0) {
            this.history.push([this.x, this.y]);
            if(this.history.length > TAIL_LENGTH)
                this.history.splice(0, 1);
        }
        this.x += this.vx;
        this.y += this.vy;

        this.ax = this.ay = 0;
    };
};

let wall = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};