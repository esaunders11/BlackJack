// Select document elements
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const betBtn = document.getElementById("bet");
const newGameBtn = document.getElementById("game");
const player1 = document.querySelector(".hand1");
const player2 = document.querySelector(".hand2");
const dealer = document.querySelector(".dealer");
const money = document.querySelector(".money");
const countTotal = document.querySelector(".count");
const ddBtn = document.getElementById("down");
const splitBtn = document.getElementById("split");
const amount = document.querySelector("#amount");
const result = document.querySelector(".result");
const dealerHeader = document.querySelector(".dealerHeader");

// Set up deck and hand lists
let deck = [];
let playerHand = [];
let dealerHand = [];

// Set up environment variables
let playerTotal = 0;
let playerTotal2 = 0;
let dealerTotal = 0;
let gamePlay = false;
let dealerPlay = false;
let bust = false;
let bust2 = false;
let dealerBust = false;
let split = false;
let turn = 0;
let bet = 0;
let total = 1000;
let count = 0;

// Card suites
const HEART = "h";
const SPADE = "s";
const CLUB = "c";
const DIAMOND = "d";

updateTotal();

// Function to prepare deck and shuffle
function shuffle() {
        deck = [];
        count = 0;
        updateTotal();
        player1.innerHTML = "";
        dealer.innerHTML = "";
        result.innerHTML = "";
        dealerHeader.innerHTML = "";
        let suite = HEART;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 2; k < 10; k++) {
                    deck.push({
                        val: k,
                        img: "cards/" + suite + k + ".gif"
                    });
                }
                deck.push({
                    val: 10,
                    img: "cards/" + suite + "T" + ".gif"
                });
                deck.push({
                    val: 10,
                    img: "cards/" + suite + "J" + ".gif"
                });
                deck.push({
                    val: 10,
                    img: "cards/" + suite + "Q" + ".gif"
                });
                deck.push({
                    val: 10,
                    img: "cards/" + suite + "Q" + ".gif"
                });
                deck.push({
                    val: 11,
                    img: "cards/" + suite + "A" + ".gif"
                });

                if (j === 0) {
                    suite = CLUB;
                } else if (j === 1) {
                    suite = SPADE;
                } else if (j === 2) {
                    suite = CLUB;
                }
            }
        }
    
        for (i = deck.length - 1; i > 0; i--) {
            const n = Math.floor(Math.random() * (i+1));
            [deck[i], deck[n]] = [deck[n], deck[i]];
        }

        console.log("Started New Game!");
}

// Function to deal out cards to start the round
async function deal() {
    // Get cards from the deck and push them to the player and dealer's hand
    playerHand[0] = [];
    playerHand[0].push(deck.pop());
    dealerHand.push(deck.pop());
    playerHand[0].push(deck.pop());
    dealerHand.push(deck.pop());

    // Calculate the count
    calculateCount(playerHand[0][0]);
    calculateCount(playerHand[1]);
    calculateCount(dealerHand[0][1]);
    calculateCount(dealerHand[1]);

    // Add card values to totals
    playerTotal = playerHand[0][0].val + playerHand[0][1].val;
    dealerTotal = dealerHand[0].val + dealerHand[1].val;

    // Delay cards showing up on screen
    setTimeout(() => {
        player1.innerHTML += ` <img src=${playerHand[0][0].img}>`;
    }, 1000);

    setTimeout(() => {
        dealer.innerHTML += ` <img src=${dealerHand[0].img}>`;
    }, 2000);

    setTimeout(() => {
        player1.innerHTML += ` <img src=${playerHand[0][1].img}>`;
    }, 3000);

    await new Promise((resolve) => {
        setTimeout(() => {
            dealer.innerHTML += ` <img src="cards/blank.gif">`;
            resolve();
        }, 4000);

        // If player gets blackjack end game
        if (playerTotal === 21) {
            total += bet * 1.5;
            gamePlay = false;
            playerHand = [];
            dealerHand = [];
            dealerTotal = 0;
            amount.value = "";
            amount.disabled = false;
            result.innerHTML = "You Win!";
        }
    
        // If players cards aren't the same disable split button
        if (playerHand[0][0].val != playerHand[0][1].val) {
            splitBtn.disable = true;
            splitBtn.style.opacity = "50%";
            if (playerHand[0].val === 11) {
                playerHand[0].val = 1;
                playerTotal -= 10;
            }
        }
    
        // If dealer gets 21 end the game
        if (dealerTotal === 21) {
            dealer.innerHTML += ` <img src=${dealerHand[1].img}>`;
            endRound();
        }
    
        updateTotal();
        console.log("Hand Dealt");
    })
    
}

// Function to let the dealer play
async function dealerRound() {
    gamePlay = false;
    let ms = 2000;
    let i = 0;
    // Reveal other dealer card
    dealer.innerHTML = ` <img src=${dealerHand[0].img}> <img src=${dealerHand[1].img}>`;
    while (dealerPlay) {
        // Add cards to dealer hand until total reaches at least 17
        while (dealerTotal < 17) {
            // Allow a delay between each card
            await new Promise((resolve) => {
                let newCard = deck.pop();
                dealerHand.push(newCard);
                calculateCount(newCard.val);
                dealerTotal += newCard.val;
                i++;

                setTimeout(() => {
                    dealer.innerHTML += ` <img src=${newCard.img}>`;

                    resolve();
                }, ms);
            });
        }
        // If dealer total is greater than 21 and has an ace subtract 10 from the total
        if (dealerTotal > 21) {
            let aceAdjusted = false;
            for (let j = 0; j < dealerHand.length; j++) {
                if (dealerHand[j].val === 11) {
                    dealerHand[j].val = 1;
                    dealerTotal -= 10;
                    aceAdjusted = true;
                    break;
                }
            }
            if (!aceAdjusted || dealerTotal > 21) {
                dealerPlay = false;
            }
        } else if (dealerTotal >= 17) {
            dealerPlay = false; 
        }
    }
    // Check if dealer busts
    if (dealerTotal > 21) {
        dealerBust = true;
    }
    // Allow a delay before ending the round
    setTimeout(endRound, 1000);
}


// Function to end the round
function endRound() {
    gamePlay = false;
    dealerPlay = false;
    // Check if user split cards
    if (split) {
        if (bust && bust2) { // Check if either hand busted
            total -= bet * 2;
            bust = false;
            bust2 = false;
            result.innerHTML = "You Lose";
        } else if (dealerBust) {
            if (bust || bust2) {
                bust = false;
                bust2 = false;

                total += bet;
                result.innerHTML = "Push";
            } else {
                total += bet * 2;
                result.innerHTML = "You Win!";
            }
            dealerBust = false;
        } else { // Check if player beat the dealer on each hand
            if (playerTotal2 > dealerTotal && !bust2) {
                total += bet;
                result.innerHTML += "Win Hand 1 ";
            } else if (playerTotal2 < dealerTotal && !bust2){
                total -= bet;
                result.innerHTML += "Lost Hand 1";
            }
            if (playerTotal > dealerTotal && !bust) {
                total += bet;
                result.innerHTML += "Win Hand 2";
            } else if (playerTotal < dealerTotal && !bust){
                total -= bet;
                result.innerHTML += "Lost Hand 2";
            } 
        }

    } else { // If user did not split check the one hand
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
                result.innerHTML = "Push";
            }
        }
    }
    // Reset values and buttons
    updateTotal();
    playerHand = [];
    dealerHand = [];
    amount.value = "";
    split = false;

    amount.disabled = false;
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
    // Only allow button to work when user and dealer are not in action
    if (!dealerPlay && !gamePlay) {
        // Reset board
        player1.innerHTML = "";
        player2.innerHTML = "";
        dealer.innerHTML = "";
        result.innerHTML = "";
        split = false;
        if (deck.length <= 15) { // If deck is too low reset the deck
            shuffle();
        }
        // Get the bet value and set the user gameplay to true
        dealerHeader.innerHTML = "Dealer";
        amount.disabled = true;
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
    if (gamePlay) { // Only allow button to be used on players turn
        ddBtn.style.opacity = "50%";
        ddBtn.disabled = true;
        if (split) { // Check if user split cards
            if (turn === 0) { // Check which hand the turn is on
                let newCard = deck.pop(); // Add card to hand and update count
                playerHand[0].push(newCard);
                calculateCount(newCard.val);
                updateTotal();
                playerTotal += newCard.val;
                player1.innerHTML += ` <img src=${newCard.img}>`;
                if (playerTotal > 21) { // If player bust check hand for ace
                    for (let i = 0; i < playerHand[0].length; i++) {
                        if (playerHand[0][i].val === 11) {
                            playerHand[0][i].val = 1;
                            playerTotal -= 10;
                            break;
                        }
                    }
                    if (playerTotal > 21) { // If player bust set the turn to the next hand
                        turn = 1;
                        bust = true;
                    }
                }
                if (playerTotal === 21) {
                    turn = 1;
                }
            } else if (turn === 1) {
                let newCard = deck.pop();
                playerHand[1].push(newCard);
                calculateCount(newCard.val);
                updateTotal();
                playerTotal2 += newCard.val;
                player2.innerHTML += ` <img src=${newCard.img}>`;
                if (playerTotal2 > 21) {
                    for (let i = 0; i < playerHand[1].length; i++) {
                        if (playerHand[1][i].val === 11) {
                            playerHand[1][i].val = 1;
                            playerTotal -= 10;
                            break;
                        }
                    }
                    if (playerTotal > 21) { 
                        gamePlay = false;
                        bust2 = true;
                        if (bust) { // If both hands bust end the round
                            endRound();
                        } else { // If only this hand bust let the dealer play
                            dealerPlay = true;
                            dealerRound();
                        }
                    }
                }
                if (playerTotal2 === 21) {
                    dealerPlay = true;
                    dealerRound();
                }
            }
        } else { // If the cards are not split play the one hand
            splitBtn.style.opacity = "50%";
            splitBtn.disabled = true;

            let newCard = deck.pop();
            playerHand[0].push(newCard);
            calculateCount(newCard.val);
            updateTotal();
            playerTotal += newCard.val;
            player1.innerHTML += ` <img src=${newCard.img}>`;
            if (playerTotal > 21) {
                for (let i = 0; i < playerHand[0].length; i++) {
                    if (playerHand[0][i].val === 11) {
                        playerHand[0][i].val = 1;
                        playerTotal -= 10;
                        break;
                    }
                }
                if (playerTotal > 21) { // If player busts end the round
                    bust = true;
                    gamePlay = false;
                    endRound();
                }
            }
            if (playerTotal === 21) { // If player gets 21 let the dealer play
                dealerPlay = true;
                dealerRound();
            }
        }
    }

    console.log("Hit!");
});

// Event click the stand button
// Moves to dealers turn
standBtn.addEventListener("click", () => {
    if (gamePlay) {
        if (split) { // If player split change the hand or let the dealer play
            if (turn === 0) {
                turn = 1;
            } else {
                dealerPlay = true;
                dealerRound();
            }
        } else { // Let the dealer play
            dealerPlay = true;
            dealerRound();
        }
    }
})

// Event click the double down button
// Add one card then end the round
ddBtn.addEventListener("click", () => {
    if (gamePlay) {
        bet = bet * 2; // Double the bet

        let newCard = deck.pop(); // Add a card to hand then let the dealer play
        playerHand[0].push(newCard);
        calculateCount(newCard.val);
        updateTotal();
        playerTotal += newCard.val;
        player1.innerHTML += ` <img src=${newCard.img}>`;

        if (playerTotal > 21) {
            for (let i = 0; i < playerHand[0].length; i++) {
                if (playerHand[0][i].val === 11) {
                    playerHand[0][i].val = 1;
                    playerTotal -= 10;
                    break;
                }
            }
            if (playerTotal > 21) { // If hand busts end the round
                bust = true;
                gamePlay = false;
                endRound();
            }
        } else {
            dealerPlay = true;
            dealerRound();
        }

    }
});

// Event click split button
splitBtn.addEventListener("click", () => {
    if (gamePlay) {
        // Split the two cards into seperate hands inside the player hand
        playerHand[1] = [];
        playerHand[1][0] = playerHand[0].pop();
        player1.innerHTML = ` <img src=${playerHand[0][0].img}>`;
        player2.innerHTML = ` <img src=${playerHand[1][0].img}>`;

        // Update the totals
        playerTotal = playerHand[0][0].val;
        playerTotal2 = playerHand[1][0].val;

        // Deal new cards to the hands and update totals
        playerHand[0].push(deck.pop());
        playerHand[1].push(deck.pop());
        playerTotal += playerHand[0][1].val;
        playerTotal2 += playerHand[1][1].val;

        player1.innerHTML += ` <img src=${playerHand[0][1].img}>`;
        player2.innerHTML += ` <img src=${playerHand[1][1].img}>`;
        
        // Set split value to true and disable split button
        split = true;
        splitBtn.opacity = "50%";
        splitBtn.disabled = true;
    }
})



