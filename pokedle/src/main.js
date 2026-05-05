import correctPokeball from './assets/correct_pokeball.svg';
import blankPokeball from './assets/blank_pokeball.svg';
import midPokeball from './assets/mid_pokeball.svg';
import incPokeball from './assets/inc_pokeball.svg';
import decPokeball from './assets/dec_pokeball.svg';

let searchValue = document.getElementById("search");
let guessedValue = document.getElementById("constGuess")
let searchbarValue = document.getElementById("search-bar");
let pokemonSpriteValue = document.getElementById("pokemonSprite");

let guessSet = new Set();
let count = 0;
let pokemonData = await fetchData(Math.floor(Math.random() * (1024) + 1));
let speciesResponse = await fetch(pokemonData.species.url);
let speciesData = await speciesResponse.json();
pokemonSpriteValue.src = pokemonData.sprites.front_default;
let pokemonName = pokemonData.species.name;

let dittoGrab = await fetchData("ditto");

const pokemonCache = {};
const speciesCache = {};

const namesResponse = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0");
const namesData = await namesResponse.json();
const pokemonNames = namesData.results.map(p => p.name);

console.log(pokemonName);

let correctPokemon = {
    name: pokemonData.name,
    generation: getGeneration(speciesData.generation.name),
    type1: pokemonData.types[0]?.type.name,
    type2: pokemonData.types[1]?.type.name ?? null,
    pokemonHeight: pokemonData.height / 10,
    pokemonWeight: pokemonData.weight / 10
}

let debounceTimer;

searchValue.addEventListener("input", async function() {
    const query = searchValue.value.toLowerCase();
    if (query === "") { hideDropdown(); return; }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const matches = pokemonNames
            .filter(name => !name.includes('-') && name.startsWith(query))
            .slice(0, 20);

        if (matches.length === 0) { hideDropdown(); return; }

        await showDropdown(matches, query);
    }, 100);
});

searchValue.addEventListener("keydown", async function(event) {
    if (event.key == "Enter"){
        if (guessSet.size >= 8){
            document.getElementById("correct-pokemon-text").textContent = `The pokemon is ${correctPokemon.name}!`;
            return;
        }

        let guessedValue = searchValue.value.toLowerCase();

        if (guessedValue == ""){
            console.log("You MUST guess at least one pokemon!");
            return;
        }

        if (guessedValue == "ditto..."){
            pokemonSpriteValue.src = dittoGrab.sprites.front_default;
            pokemonSpriteValue.classList.replace("brightness-0", "brightness-100");
            document.getElementById(`gen-${count+1}`).src = correctPokeball;
            document.getElementById(`type1-${count+1}`).src = correctPokeball;
            document.getElementById(`type2-${count+1}`).src = correctPokeball;
            document.getElementById(`weight-${count+1}`).src = correctPokeball;
            document.getElementById(`height-${count+1}`).src = correctPokeball;

            document.getElementById(`guess-${count + 1}`).removeAttribute("hidden");
            document.getElementById(`constGuess${count + 1}`).textContent = guessedValue.charAt(0).toUpperCase() + guessedValue.slice(1);
            document.getElementById("pokemon-text").textContent = `The pokemon is ${guessedValue.charAt(0).toUpperCase() + guessedValue.slice(1)}?!`;
            hideDropdown();
            document.getElementById("reset-game").removeAttribute("hidden");
            return;
        }
        let guessData = await fetchData(guessedValue);
        let guessSpeciesResponse = await fetch(guessData.species.url);
        let guessSpeciesData = await guessSpeciesResponse.json();

        let currentPokemon = {
            name: guessData.name,
            generation: getGeneration(guessSpeciesData.generation.name),
            type1: guessData.types[0]?.type.name,
            type2: guessData.types[1]?.type.name ?? null,
            pokemonHeight: guessData.height / 10,
            pokemonWeight: guessData.weight / 10
        }

        if (!guessData){
            return; 
        }

        if (currentPokemon.name == correctPokemon.name){
            document.getElementById("pokemon-text").textContent = `The Pokémon is  ${guessedValue.charAt(0).toUpperCase() + guessedValue.slice(1)}!`;
            pokemonSpriteValue.classList.replace("brightness-0", "brightness-100");
            document.getElementById(`gen-${count+1}`).src = correctPokeball;
            document.getElementById(`type1-${count+1}`).src = correctPokeball;
            document.getElementById(`type2-${count+1}`).src = correctPokeball;
            document.getElementById(`weight-${count+1}`).src = correctPokeball;
            document.getElementById(`height-${count+1}`).src = correctPokeball;

            document.getElementById(`guess-${count + 1}`).removeAttribute("hidden");
            document.getElementById(`constGuess${count + 1}`).textContent = guessedValue.charAt(0).toUpperCase() + guessedValue.slice(1);
            hideDropdown();
            document.getElementById("reset-game").removeAttribute("hidden");
            return;
        }

        if (!guessSet.has(guessedValue)){
            guessSet.add(guessedValue);
            console.log("Guess:", guessedValue);
            document.getElementById(`guess-${count + 1}`).removeAttribute("hidden");
            document.getElementById(`constGuess${count + 1}`).textContent = guessedValue.charAt(0).toUpperCase() + guessedValue.slice(1);
            checkGuess(currentPokemon, correctPokemon, count);
            count++;
        } else {
            console.log("Already Guessed", searchValue.value);
        }

        searchValue.value = "";
        hideDropdown();
    }
})

document.addEventListener("click", function(event) {
    if (!searchValue.contains(event.target) && !document.getElementById("dropdown").contains(event.target)) {
        hideDropdown();
    }
});

async function getDropdownData(name) {
    if (pokemonCache[name] && speciesCache[name])
        return { data: pokemonCache[name], speciesData: speciesCache[name] };

    const data = await fetchData(name);
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();

    pokemonCache[name] = data;
    speciesCache[name] = speciesData;

    return { data, speciesData };
}

async function showDropdown(matches, query) {
    const dropdown = document.getElementById("dropdown");
    dropdown.innerHTML = "";

    for (const name of matches) {
        if (searchValue.value.toLowerCase() !== query) return;

        const { data, speciesData } = await getDropdownData(name);

        if (searchValue.value.toLowerCase() !== query) return;

        const gen = getGeneration(speciesData.generation.name);
        const type1 = data.types[0]?.type.name ?? "-";
        const type2 = data.types[1]?.type.name ?? "-";
        const weight = data.weight / 10;
        const height = data.height / 10;

        const item = document.createElement("div");
        item.className = "flex flex-col text-black bg-white hover:bg-gray-100 border border-gray-200 cursor-pointer px-2 py-1";
        item.innerHTML = `
            <p class="text-center font-bold">${speciesData.name.charAt(0).toUpperCase() + speciesData.name.slice(1)}</p>
            <div class="grid grid-cols-4 text-center text-sm text-black">
                <p>Gen: ${gen}</p>
                <p>${type1.charAt(0).toUpperCase() + type1.slice(1)}/${type2 == "-" ? "None" : type2.charAt(0).toUpperCase() + type2.slice(1)}</p>
                <p>Weight: ${weight}kg</p>
                <p>Height: ${height}m</p>
            </div>
        `;

        item.addEventListener("click", () => {
            searchValue.value = speciesData.name;
            hideDropdown();
        });

        dropdown.appendChild(item);
    }

    dropdown.removeAttribute("hidden");
}

function hideDropdown() {
    const dropdown = document.getElementById("dropdown");
    dropdown.innerHTML = "";
    dropdown.setAttribute("hidden", "");
}

async function fetchData(data){

    try{
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${data}`);
        if (!response.ok){
            return;
        }
        else{
            const pokeData = await response.json();
            return pokeData;
        }
    }
    catch(error){
        console.error(error);
    }
}

function checkGuess(guess, pokemon, count){
    if (guess.generation == pokemon.generation){
        document.getElementById(`gen-${count+1}`).src = correctPokeball;
    }
    else if ((guess.generation == (pokemon.generation) + 1) || (guess.generation == (pokemon.generation) - 1)){
        document.getElementById(`gen-${count+1}`).src = midPokeball;
    }
    else{
        document.getElementById(`gen-${count+1}`).src = blankPokeball;
    }

    if (guess.type1 == pokemon.type1){
        document.getElementById(`type1-${count+1}`).src = correctPokeball;
    }
    else if (guess.type1 == pokemon.type2){
        document.getElementById(`type1-${count+1}`).src = midPokeball;
    }
    else{
        document.getElementById(`type1-${count+1}`).src = blankPokeball;
    }
    
    if (guess.type2 == pokemon.type2){
        document.getElementById(`type2-${count+1}`).src = correctPokeball;
    }
    else if (guess.type2 == pokemon.type1){
        document.getElementById(`type2-${count+1}`).src = midPokeball;
    }
    else{
        document.getElementById(`type2-${count+1}`).src = blankPokeball;
    }

    if (guess.pokemonWeight == pokemon.pokemonWeight){
        document.getElementById(`weight-${count+1}`).src = correctPokeball;
    }
    else if (guess.pokemonWeight > pokemon.pokemonWeight){
        document.getElementById(`weight-${count+1}`).src = decPokeball;
    }
    else{
        document.getElementById(`weight-${count+1}`).src = incPokeball;
    }

    if (guess.pokemonHeight == pokemon.pokemonHeight){
        document.getElementById(`height-${count+1}`).src = correctPokeball;
    }
    else if (guess.pokemonHeight > pokemon.pokemonHeight){
        document.getElementById(`height-${count+1}`).src = decPokeball;
    }
    else{
        document.getElementById(`height-${count+1}`).src = incPokeball;
    }
    return;
}

function getGeneration(gen){
    switch (gen) {
    case "generation-i":
        return 1;
        break;
    case "generation-ii":
        return 2;
        break;
    case "generation-iii":
        return 3;
        break;
    case "generation-iv":
        return 4;
        break;
    case "generation-v":
        return 5;
        break;
    case "generation-vi":
        return 6;
        break;
    case "generation-vii":
        return 7;
        break;
    case "generation-viii":
        return 8;
        break;
    case "generation-ix":
        return 9;
        break;
    default:
        console.log("Unknown generation");
}
}

document.getElementById("reset-game").addEventListener("click", resetGame);

async function resetGame(){
    for (let i = 0; i < 8; i++){
        document.getElementById(`guess-${i + 1}`).setAttribute("hidden", "");
        document.getElementById(`gen-${i+1}`).src = "";
        document.getElementById(`type1-${i+1}`).src = "";
        document.getElementById(`type2-${i+1}`).src = "";
        document.getElementById(`weight-${i+1}`).src = "";
        document.getElementById(`height-${i+1}`).src = "";
        document.getElementById(`constGuess${i + 1}`).textContent = "";
    }
    document.getElementById("pokemon-text").textContent = "";
    searchValue.value = "";
    guessSet = new Set();
    count = 0;
    pokemonData = await fetchData(Math.floor(Math.random() * (1024) + 1));
    speciesResponse = await fetch(pokemonData.species.url);
    speciesData = await speciesResponse.json();
    pokemonSpriteValue.src = pokemonData.sprites.front_default;
    pokemonName = pokemonData.species.name;
    correctPokemon = {
        name: pokemonData.name,
        generation: getGeneration(speciesData.generation.name),
        type1: pokemonData.types[0]?.type.name,
        type2: pokemonData.types[1]?.type.name ?? null,
        pokemonHeight: pokemonData.height / 10,
        pokemonWeight: pokemonData.weight / 10
    }
    pokemonSpriteValue.classList.replace("brightness-100", "brightness-0");
    document.getElementById("reset-game").setAttribute("hidden", "");
}

/*
Notes: Keep images from being draggable (logos pokeballs pokemon).
Edit logo and search bar to be lower on screen.
Add "next" button.
*/