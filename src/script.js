const px = createPlayer("you", 'x');
const po = createPlayer("also you", 'o');

function createPlayer(name, mark) {
    const playerName = name;
    const playerMark = mark;

    const getName = () => playerName;
    const getMark = () => playerMark;

    return { getName, getMark };
}

const gameboard = (function (n) {
    let board = Array.from({ length : n }, () => new Array(n).fill('_'));

    const getBoard = () => board;
    const getCell = (i,j) => getBoard()[i][j];
    const getSize = () => n;
    const updateCell = (i, j, mark) => board[i][j] = mark;
    const isCellEmpty = (i, j) => (getCell(i, j) === '_');

    return { getBoard, getCell, getSize, updateCell, isCellEmpty };
})(3);

const UIController = (function (cells) {
    let moveHandler = () => console.log("error: moveHandler not set");
    const setMoveHandler = (handler) => { moveHandler = handler; };

    const setEvents = () => {
        cells.forEach(btn => {
        btn.addEventListener("click", function() {
            moveHandler(Number(btn.dataset.i), Number(btn.dataset.j));
        });
    });
    }

    const markCell = (i, j, mark) => {
        const cell = document.querySelector(`.cell[data-i="${i}"][data-j="${j}"]`);
        if (cell) {
            cell.textContent = mark;
            cell.classList.add(mark);
            cell.disabled = true;
            document.getElementById("ttt-grid").classList.toggle("o-active");
        } else {
            console.error(`error: cell (${i}, ${j}) not found`);
        }
    };

    const displayPlayers = (px, po) => {
        document.getElementById("player-x").textContent = `${px.getName()} (${px.getMark()})`;
        document.getElementById("player-o").textContent = `${po.getName()} (${po.getMark()})`;
    }

    const displayPlayer = (p) => {
        const elt = document.getElementById("player");
        if(p === null) {
            elt.textContent = "";
        } else {
            elt.textContent = `${p.getName()} (${p.getMark()})`;
            elt.classList = [];
            elt.classList.add(p.getMark());
        }
    }

    const displayEndgame = (w) => {
        cells.forEach(btn => btn.disabled = true);
        
        const p = document.getElementById("game-state");
        p.textContent = "game over: ";
        if(w !== null) {
            p.textContent += "the winner is ";
        } else {
            p.textContent += "it's a draw"
        }
        displayPlayer(w);
        document.getElementById("display").classList.add("endgame");
    };

    return { setMoveHandler, setEvents, markCell, displayPlayers, displayPlayer, displayEndgame };
})(document.querySelectorAll(".cell"));

const createGame = (function (px, po, gameboard, controller) {
    controller.displayPlayers(px, po);

    const size = gameboard.getSize();
    let round = 0;
    let currentPlayer = px;
    let isGameOver = false;
    
    controller.displayPlayer(currentPlayer);

    const handleMove = (i, j) => {
        if(isGameOver) return;

        if(!isValid(i, j)) {
            console.log(`error: invalid cell: (${i}, ${j})`);
            return;
        }

        playPosition(i, j, currentPlayer);
        controller.markCell(i, j, currentPlayer.getMark());
        
        let winner = getWinner();
        round++;
        switchPlayer();
        
        if(winner !== null || round === size * size) {
            isGameOver = true;
            controller.displayEndgame(winner);
            return;
        }

        controller.displayPlayer(currentPlayer);
    };

    controller.setMoveHandler(handleMove);
    controller.setEvents();
    
    const playPosition = (i, j, player) => {
        gameboard.updateCell(i, j, player.getMark());
    };

    const isValid = (i, j) => {
        if(isNaN(i) || isNaN(j)) return false;
        if(!gameboard.isCellEmpty(i, j)) return false;
        if(i < 0 || i >= size || j < 0 || j >= size) return false;
        return true;
    };

    const switchPlayer = () => currentPlayer === px ? currentPlayer = po : currentPlayer = px;

    const checkLineWinner = (line) => {
        const firstCell = line[0];
        if (firstCell === '_') return null;

        const allMatch = line.every(elt => elt === firstCell);
        if (allMatch) return firstCell === px.getMark() ? px : po;

        return null;
    };

    const getWinner = () => {
        for (let k = 0 ; k < size ; k++) {
            const row = Array.from({ length: size }, (_, j) => gameboard.getCell(k, j));
            let winner = checkLineWinner(row);
            if (winner) return winner;

            const col = Array.from({ length: size }, (_, i) => gameboard.getCell(i, k));
            winner = checkLineWinner(col);
            if (winner) return winner; 
        }

        const diag1 = Array.from({ length: size }, (_, k) => gameboard.getCell(k, k));
        let winner = checkLineWinner(diag1);
        if (winner) return winner;

        const diag2 = Array.from({ length: size }, (_, k) => gameboard.getCell(k, size - k- 1));
        winner = checkLineWinner(diag2);
        if (winner) return winner;

        return null;
    };

    return { handleMove };

})(px, po, gameboard, UIController);