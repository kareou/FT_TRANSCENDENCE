export default class Game extends HTMLElement {
    constructor() {
        super();
        this.player1 = {
            score : 0,
	        width : 10,
	        height : 100,
	        x : 10,
	        y : (800 / 2) - 100/2,
	        pvelocityY : 0,
        }
        this.player2 = {
            score : 0,
            width : 10,
            height : 100,
            x : 800 - 20,
            y : (800 / 2) - 100/2,
            pvelocityY : 0,
        }

        this.ball = {
            x : 800 / 2,
            y : 800 / 2,
            radius : 10,
            velocityX : 5,
            velocityY : 5,
        }

    }
    connectedCallback() {
        this.render();
        const canvas = this.querySelector(".board");
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");
        this.#drawBoard(ctx);
        this.#drawPaddles(ctx);
        this.#drawBall(ctx);
        document.addEventListener('keydown', this.#movePaddels.bind(this));
        document.addEventListener('keyup', (e) => {
            if (e.code == "KeyW" || e.code == "KeyS")
                this.player1.pvelocityY = 0;
            else if (e.code == "ArrowUp" || e.code == "ArrowDown")
                this.player2.pvelocityY = 0;
        });
        this.#update(ctx)
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this.#movePaddels);
    }

    render() {
        this.innerHTML = /*HTML*/ `
        <div class="game_container"><canvas class="board"></canvas></div>
        `;
        
    }

    

    #update(ctx){
        requestAnimationFrame(() => this.#update(ctx));
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.#drawBoard(ctx);
        this.#drawPaddles(ctx);
        this.#drawBall(ctx);
    }

    #drawPaddles(ctx){
        ctx.fillStyle = "white";
        let nextY = this.player1.y + this.player1.pvelocityY;
        if (!(nextY < 0 || nextY + this.player1.height > 800))
            this.player1.y = nextY;
        ctx.beginPath();
        ctx.roundRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height,5);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "black";
        let nextY2 = this.player2.y + this.player2.pvelocityY;
        console.log(this.player2.y, this.player2.pvelocityY);
        if (!(nextY2 < 0 || nextY2 + this.player2.height > 800))
            this.player2.y = nextY2;
        ctx.beginPath();
        ctx.roundRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height,5);
        ctx.fill();
        ctx.closePath();
    }

    #paddelReachTopBottom(paddel){
        return paddel.y < 0 || paddel.y + paddel.height > 800;
    }

    #drawBall(ctx){
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

    }

    #drawBoard(ctx){
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    #movePaddels(e){
        if (e.code == "KeyW")
            this.player1.pvelocityY = -7;
        else if (e.code == "KeyS")
            this.player1.pvelocityY = 7;
        if (e.code == "ArrowUp")
            this.player2.pvelocityY = -7;
        else if (e.code == "ArrowDown")
            this.player2.pvelocityY = 7;
    }
}

customElements.define("co-game", Game);