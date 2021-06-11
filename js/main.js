let config = {
    time: {
        initialDelay: 5000,  // pre-game delay
        cardsDelay: 1000     // card refund delay
    },
    canvas: {
        name: document.getElementById("game")
    },
    icons: {
        number: 8,
        size: {
            width: 128,
            height: 128,
            marginX: 10,
            marginY: 10
        },
        cover: {
            front: 'images/front/icon#.jpg',
            back: 'images/back/back.jpg'
        },
        rows: {
            coordX: 4,
            coordY: 4
        }
    },
    screen: {
        name: document.getElementById("game-box"),
        time: document.querySelector("#game-info .time div"),
        score: document.querySelector('#game-info .score div')
    }
}

function MemoryGame(config) {

    this.config = config;

    this.game = new PIXI.Application({width: 900, height:720, transparent: true, resolution: 1, autoResize: true});
    this.config.canvas.name.appendChild(this.game.view);

    this.container = new PIXI.Container();
    this.game.stage.addChild(this.container);

    this.config.screen.name.style.display = "flex";

    this.cards = {
        front: [],
        back: PIXI.Texture.from(this.config.icons.cover.back)
    }

    // generation cards function
    let generateCards = () => {
        for (let i = 0; i < this.config.icons.number; i++) {
            this.cards.front.push(PIXI.Texture.from(this.config.icons.cover.front.replace('#', i)));
            this.cards.front.push(PIXI.Texture.from(this.config.icons.cover.front.replace('#', i)));
        }
    }

    // shuffling cards on the table
    let shuffleCards = () => {
        let temp = [...this.cards.front];

        this.cards.front = this.cards.front.map((item) => {
            return item = temp.splice(Math.floor(Math.random() * temp.length), 1)
        })

        this.cards.front = this.cards.front.flat();
    }

    generateCards();

    this.cards.front.forEach((card, idx) => {
        let sprite = new PIXI.Sprite();

        sprite.anchor.set(0.5);
        sprite.anchor.set(0.5);
        sprite.x = (idx % this.config.icons.rows.coordX) * (this.config.icons.size.width + this.config.icons.size.marginX);
        sprite.y = Math.floor(idx / this.config.icons.rows.coordY) * (this.config.icons.size.height + this.config.icons.size.marginY);

        this.container.addChild(sprite);
    });

    this.container.x = (this.game.screen.width - this.container.width) / 2;
    this.container.y = (this.game.screen.height - this.container.height) / 2;

    // game going on
    this.checkIfMatch = () => {
        this.cards.selected.forEach(card => {
            card.removeAllListeners();
        })
        
        this.cards.selected = [];
        // all pairs of cards are found, the game restarts again
        if (this.cards.pairs == this.config.icons.number) { this.newGame(); } 
    }

    this.noMatch = () => {
        this.cards.selected.forEach(card => {
            card.texture = this.cards.back;
        })

        this.cards.selected = [];
    }

    this.stageTimeout;
    this.cardsTimeout;
    this.matched = false;

    this.score = {
        current: 0,
        wrong: -5,
        correct: 10
    }

    this.userClick = (child, idx) => {

        if (this.cards.selected.includes(child)) return;

        clearTimeout(this.cardsTimeout);

        if (this.matched) {
            this.checkIfMatch();
            this.matched = false;
        }

        if (this.cards.selected.length == 2) { this.noMatch(); }

        this.cards.selected.push(child);

        child.texture = this.cards.front[idx];

        if (this.cards.selected.length == 2) {
            if (this.cards.selected[0].texture == this.cards.selected[1].texture) {
                this.cards.pairs++;
                this.score.current += this.score.correct;
                this.cardsTimeout = setTimeout(this.checkIfMatch, this.config.time.cardsDelay);
                this.matched = true;
            }
            else {
                this.cardsTimeout = setTimeout(this.noMatch, this.config.time.cardsDelay);
                this.score.current += this.score.wrong;
            }
        }
        this.config.screen.score.textContent = this.score.current;
    }

    this.round = {
        interval: null,
        underTen: (no) => {
            return no < 10 ? ('0' + no) : no;
        },
        roundTime: () => {
            this.round.seconds++;
            if (this.round.seconds == 60) {
                this.round.seconds = 0;
                this.round.minutes++;
            }
            if (this.round.minutes == 60) {
                this.round.minutes = 0
                this.round.hours++;
            }
            this.config.screen.time.textContent = this.round.underTen(this.round.hours) + ' : ' + this.round.underTen(this.round.minutes) + ' : ' + this.round.underTen(this.round.seconds);
        }
    }

    this.newGame = () => {

        clearInterval(this.round.interval);
        clearTimeout(this.cardsTimeout);
        clearTimeout(this.stageTimeout);

        this.round.seconds = 0;
        this.round.minutes = 0;
        this.round.hours = 0;

        this.cards.pairs = 0;
        this.cards.selected = [];

        this.config.screen.time.textContent = '00 : 00 : 00';

        this.score.current = 0;
        this.config.screen.score.textContent = this.score.current;

        shuffleCards();
        
        this.container.children.forEach((child, idx) => {
            child.texture = this.cards.front[idx];
            child.interactive = false;
        })

        this.stageTimeout = setTimeout(() => {
            this.container.children.forEach((child, idx) => {
                child.interactive = true;
                child.buttonMode = true;
                child.texture = this.cards.back;
            })

            this.round.interval = setInterval(this.round.roundTime, 1000);

        }, this.config.time.initialDelay)

        this.container.children.forEach((child, idx) => child.on('click', this.userClick.bind(false, child, idx)));
    }

    this.newGame();
}

let theMemoryGame = new MemoryGame(config);