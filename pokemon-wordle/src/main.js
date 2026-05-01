let searchValue = document.getElementById("search");
let guessedValue = document.getElementById("constGuess")
let searchbarValue = document.getElementById("search-bar");
let guessSet = new Set();
let count = 0;
let correctGuess = "Charizard";
let correct = false;
let correctPokemon = {
    name: "charizard",
    type1: "fire",
    type2: "flying",
    height: 1.7,
    weight: 90.5
}

let currentGuessIndex = "guess-1";
let currentGuessIndexValue = document.getElementById(currentGuessIndex);

searchValue.addEventListener("keydown", function(event){
    if (event.key == "Enter"){
        if (guessSet.size >= 8){
            console.log("Max Guesses!");
            return;
        }

        if (searchValue.value == ""){
            console.log("You MUST guess at least one pokemon!");
            correct = true;
            return;
        }
        
        if (searchValue.value == correctGuess){
            console.log("THE POKEMON IS", correctGuess);
            return;
        }

        if (!guessSet.has(searchValue.value)){
            guessSet.add(searchValue.value);
            console.log("Guess:", searchValue.value);
            document.getElementById(`guess-${count + 1}`).removeAttribute("hidden");
            document.getElementById(`constGuess${count + 1}`).textContent = searchValue.value;
            count++;
        }
        else{
            console.log("Already Guessed", searchValue.value);
        }

        searchValue.value = "";
    }
})
