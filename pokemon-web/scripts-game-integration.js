import { tiktokAPI } from './tiktok-api.js';

class GameIntegration {
    constructor() {
        this.userCollection = [];
        this.currentUser = null;
        
        this.init();
    }

    async init() {
        this.loadUser();
        this.setupEventListeners();
    }

    loadUser() {
        const savedUser = localStorage.getItem('tiktokUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.loadCollection(this.currentUser.openId);
        }
    }

    async loadCollection(userId) {
        try {
            // En producción, esto haría fetch a tu backend
            const response = await fetch(`/api/users/${userId}/collection`);
            this.userCollection = await response.json();
            this.updateUI();
        } catch (error) {
            console.error("Error loading collection:", error);
        }
    }

    async addPokemon(pokemonData) {
        this.userCollection.push(pokemonData);
        this.updateUI();
        
        // Guardar en backend
        await fetch('/api/collection/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: this.currentUser.openId,
                pokemon: pokemonData
            })
        });
    }

    updateUI() {
        window.dispatchEvent(new CustomEvent('collection-updated', {
            detail: this.userCollection
        }));
    }

    setupEventListeners() {
        // Integración con eventos de TikTok
        window.addEventListener('new-pokemon', (e) => {
            const { tier, sender } = e.detail;
            this.generateRandomPokemon(tier, sender);
        });

        // Escuchar actualizaciones del juego
        window.addEventListener('game-event', this.handleGameEvents.bind(this));
    }

    async generateRandomPokemon(tier, sender) {
        const pokemon = await this.fetchRandomPokemon(tier);
        pokemon.obtainedFrom = sender;
        pokemon.obtainedDate = new Date().toISOString();
        this.addPokemon(pokemon);
    }

    async fetchRandomPokemon(tier) {
        // Implementación similar a tu código original
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new GameIntegration();
});