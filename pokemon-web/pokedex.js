// Datos de ejemplo (en producción vendrían de una API)
const userCollection = [
    { id: 25, name: 'Pikachu', type: ['Electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
    { id: 6, name: 'Charizard', type: ['Fire', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' },
    { id: 150, name: 'Mewtwo', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png' },
    // Añade más Pokémon...
];

// Elementos DOM
const pokemonDisplay = document.getElementById('pokemon-display');
const pokemonStats = document.getElementById('pokemon-stats');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Mostrar colección
function displayCollection(pokemons) {
    pokemonDisplay.innerHTML = '';
    
    pokemons.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h3>#${pokemon.id} ${pokemon.name}</h3>
            <div class="types">
                ${pokemon.type.map(t => `<span class="type ${t.toLowerCase()}">${t}</span>`).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => showPokemonDetails(pokemon));
        pokemonDisplay.appendChild(card);
    });
}

// Mostrar detalles
function showPokemonDetails(pokemon) {
    pokemonStats.innerHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.image}" alt="${pokemon.name}" class="detail-img">
        <div class="type-container">
            ${pokemon.type.map(t => `<span class="type ${t.toLowerCase()}">${t}</span>`).join('')}
        </div>
        <table class="stats-table">
            <tr>
                <th>ID</th>
                <td>${pokemon.id}</td>
            </tr>
            <tr>
                <th>Obtenido</th>
                <td>12/05/2023</td>
            </tr>
            <tr>
                <th>Estado</th>
                <td>Disponible</td>
            </tr>
        </table>
    `;
}

// Buscar Pokémon
function searchPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = userCollection.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.id.toString().includes(searchTerm)
    );
    displayCollection(filtered);
}

// Event Listeners
searchBtn.addEventListener('click', searchPokemon);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchPokemon();
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Obtener usuario actual (simulado)
    const username = localStorage.getItem('pokemonUsername') || 'Entrenador';
    document.getElementById('username').textContent = username;
    
    // Mostrar colección inicial
    displayCollection(userCollection);
    
    // Mostrar primer Pokémon como detalle
    if (userCollection.length > 0) {
        showPokemonDetails(userCollection[0]);
    }
});