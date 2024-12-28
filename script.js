// Select document elements
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const betBtn = document.getElementById("bet");
const newGameBtn = document.getElementById("game");
const player = document.querySelector(".total");
const dealer = document.querySelector(".dealer");
const money = document.querySelector(".money");
const countTotal = document.querySelector(".count");
const ddBtn = document.getElementById("down");
const splitBtn = document.getElementById("split");
const amount = document.querySelector("#amount");
const result = document.querySelector(".result");

// Set up deck and hand lists
let deck = [];
let playerHand = [];
let dealerHand = [];

// Set up environment variables
let playerTotal = 0;
let dealerTotal = 0;
let gamePlay = false;
let dealerPlay = false;
let bust = false;
let dealerBust = false;
let bet = 0;
let total = 1000;
let count = 0;

updateTotal();

// Function to prepare deck and shuffle
function shuffle() {
        deck = [];
        count = 0;
        updateTotal();
        player.innerHTML = "Player Hand:";
        dealer.innerHTML = "Dealer Hand:";
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 2; k < 10; k++) {
                    deck.push(k);
                }
    
                deck.push(10);
                deck.push(10);
                deck.push(10);
                deck.push(10);
                deck.push(11);
            }
        }
    
        for (i = deck.length - 1; i > 0; i--) {
            const n = Math.floor(Math.random() * (i+1));
            [deck[i], deck[n]] = [deck[n], deck[i]];
        }

        console.log("Started New Game!");
}

// Function to deal out cards to start the round
function deal() {
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());

    calculateCount(playerHand[0]);
    calculateCount(playerHand[1]);
    calculateCount(dealerHand[0]);
    calculateCount(dealerHand[1]);

    playerTotal = playerHand[0] + playerHand[1];
    dealerTotal = dealerHand[0] + dealerHand[1];
    player.innerHTML += ` ${playerHand[0]} ${playerHand[1]}`;
    dealer.innerHTML += ` ${dealerHand[0]}`;

    if (playerTotal === 21) {
        total += bet * 1.5;
        gamePlay = false;
        playerHand = [];
        dealerHand = [];
        dealerTotal = 0;
    }

    if (playerHand[0] != playerHand[1]) {
        splitBtn.disable = true;
        splitBtn.style.opacity = "50%";
    }

    if (dealerTotal === 21) {
        dealer.innerHTML += ` ${dealerHand[1]}`;
        endRound();
    }

    updateTotal();
    console.log("Hand Dealt");
}

// Function to let the dealer play
function dealerRound() {
    gamePlay = false;
    dealer.innerHTML += ` ${dealerHand[1]}`;
    let flag = true;
    while (dealerPlay) {
        while (dealerTotal < 17 && flag){
            let newCard = deck.pop();
            dealerHand.push(newCard);
            calculateCount(newCard);
            dealerTotal += newCard;
            setTimeout(() => {
                dealer.innerHTML += ` ${newCard}`;
                if (dealerTotal > 16) {
                    flag = false;
                }
            }, 2000);
        }
        if (dealerHand.includes(11) && dealerTotal > 21) {
            dealerTotal -= 10;
        } else {
            dealerPlay = false;
        }
    }
    if (dealerTotal > 21) {
        dealerBust = true;
    }
    setTimeout(endRound(), 4000, !flag);

}


// Function to end the round
function endRound() {
    gamePlay = false;
    if (bust) {
        total -= bet;
        bust = false;
        result.innerHTML = "You Bust";
    } else if (dealerBust) {
        total += bet;
        dealerBust = false;
        result.innerHTML = "Dealer Bust";
    }
    else {
        if (playerTotal > dealerTotal) {
            total += bet;
            result.innerHTML = "You Win!"
        } else if (playerTotal < dealerTotal) {
            total -= bet;
            result.innerHTML = "You Lose";
        } else {
            result.innerHTML = "Split";
        }
    }
    updateTotal();
    playerHand = [];
    dealerHand = [];
    amount.value = "";

    ddBtn.style.opacity = "100%";
    ddBtn.disabled = false;
    splitBtn.style.opacity = "100%";
    splitBtn.disabled = false;
}

// Function to update the total money
function updateTotal() {
    money.innerHTML = "$" + total;
    countTotal.innerHTML = `Count: ${count}`;
}

// Function to calculate the count
function calculateCount(card) {
    card = Number(card);
    if (card > 1 && card < 7) {
        count++;
    } else if (card === 10 || card === 11) {
        count--;
    }
}

// Event click shuffle button
newGameBtn.addEventListener("click", shuffle);

// Even click the bet button
// Takes bet and starts the round by dealing the cards
betBtn.addEventListener("click", () => {
    player.innerHTML = "Player Hand:";
    dealer.innerHTML = "Dealer Hand:";
    result.innerHTML = "";
    if (!dealerPlay) {
        if (deck.length <= 15) {
            newGame();
        }
        gamePlay = true;
        bet = Number(amount.value);
        deal();
    }

    console.log("Start Hand");
});

// Event click the hit button
// Can only be clicked when round is active
// Adds a card to the players hand
hitBtn.addEventListener("click", () => {
    if (gamePlay) {
        ddBtn.style.opacity = "50%";
        ddBtn.disabled = true;

        let newCard = deck.pop();
        playerHand.push(newCard);
        calculateCount(newCard);
        updateTotal();
        playerTotal += newCard;
        player.innerHTML += ` ${newCard}`;
        if (playerTotal > 21) {
            if (playerHand.includes(11)) {
                playerTotal -= 10;
            } else {
                bust = true;
                gamePlay = false;
                endRound();
            }
        }
        if (playerTotal === 21) {
            dealerPlay = true;
            dealerRound();
        }
    }

    console.log("Hit!");
});

// Event click the stand button
// Moves to dealers turn
standBtn.addEventListener("click", () => {
    if (gamePlay) {
        dealerPlay = true;
        dealerRound();
    }
})

// Event click the double down button
// Add one card then end the round
ddBtn.addEventListener("click", () => {
    if (gamePlay) {
        let newCard = deck.pop();
        playerHand.push(newCard);
        calculateCount(newCard);
        updateTotal();
        playerTotal += newCard;
        player.innerHTML += ` ${newCard}`;

        if (playerTotal > 21) {
            if (playerHand.includes(11)) {
                playerTotal -= 10;
            } else {
                bust = true;
                gamePlay = false;
                endRound();
            }
        }

        dealerPlay = true;
        dealerRound();
    }
});



