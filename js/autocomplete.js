class CityAutocomplete {
    constructor() {
        this.input = document.getElementById('location');
        this.suggestionsContainer = document.querySelector('.autocomplete-suggestions');
        this.debounceTimer = null;
        this.selectedIndex = -1;
        this.suggestions = [];
        this.FRENCH_CITIES = [
            "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", 
            "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Étienne", 
            "Toulon", "Le Havre", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne",
            "Le Mans", "Aix-en-Provence", "Clermont-Ferrand", "Brest", "Tours", "Amiens",
            "Limoges", "Annecy", "Perpignan", "Boulogne-Billancourt", "Metz", "Besançon",
            "Orléans", "Saint-Denis", "Rouen", "Argenteuil", "Montreuil", "Mulhouse",
            "Caen", "Nancy", "Saint-Paul", "Roubaix", "Tourcoing", "Nanterre", "Avignon"
        ];
    }

    init() {
        this.input.addEventListener('input', () => this.onInput());
        this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('click', (e) => this.onClick(e));

        // Add aria labels for accessibility
        this.input.setAttribute('aria-autocomplete', 'list');
        this.input.setAttribute('role', 'combobox');
        this.input.setAttribute('aria-expanded', 'false');
        this.suggestionsContainer.setAttribute('role', 'listbox');
    }

    async onInput() {
        const value = this.input.value.trim().toLowerCase();
        
        if (value.length < 2) {
            this.hideSuggestions();
            return;
        }

        // Show loading state
        this.input.classList.add('loading');
        
        // Debounce requests
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const suggestions = this.FRENCH_CITIES.filter(city => 
                city.toLowerCase().includes(value)
            ).slice(0, 5);

            this.suggestions = suggestions;
            this.showSuggestions(suggestions, value);
            this.input.classList.remove('loading');
        }, 300);
    }

    showSuggestions(cities, query) {
        if (cities.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsContainer.innerHTML = cities
            .map((city, index) => {
                const highlightedName = this.highlightMatch(city, query);
                
                return `
                    <div class="suggestion-item" 
                         data-index="${index}"
                         role="option"
                         aria-selected="false"
                         tabindex="0">
                        <div class="suggestion-content">
                            <span class="city-name">${highlightedName}</span>
                            <span class="region">France</span>
                        </div>
                        <div class="suggestion-weather">
                            <div class="mini-loading-spinner"></div>
                        </div>
                    </div>
                `;
            })
            .join('');

        this.suggestionsContainer.classList.add('show');
        this.input.setAttribute('aria-expanded', 'true');
        this.addSuggestionListeners();
        this.fetchWeatherForSuggestions(cities);
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    async fetchWeatherForSuggestions(cities) {
        for (const city of cities) {
            const suggestionElement = this.suggestionsContainer.querySelector(
                `.suggestion-item[data-index="${cities.indexOf(city)}"]`
            );
            
            if (suggestionElement) {
                const weatherElement = suggestionElement.querySelector('.suggestion-weather');
                
                try {
                    const response = await fetch(
                        `${CONFIG.API_BASE_URL}weather?q=${city},FR&units=${CONFIG.UNITS}&lang=${CONFIG.LANGUAGE}&appid=${CONFIG.API_KEY}`
                    );
                    
                    if (!response.ok) throw new Error('Erreur météo');
                    
                    const data = await response.json();
                    const temp = Math.round(data.main.temp);
                    const icon = this.getWeatherIcon(data.weather[0].id);
                    
                    weatherElement.innerHTML = `
                        <span class="weather-icon">${icon}</span>
                        <span class="temperature">${temp}°C</span>
                    `;
                } catch (error) {
                    weatherElement.innerHTML = '---';
                }
            }
        }
    }

    getWeatherIcon(code) {
        const icons = {
            200: '⛈️', 300: '🌧️', 500: '🌧️', 600: '🌨️',
            700: '🌫️', 800: '☀️', 801: '🌤️', 802: '⛅',
            803: '🌥️', 804: '☁️'
        };
        const baseCode = Math.floor(code / 100) * 100;
        return icons[baseCode] || icons[code] || '🌡️';
    }

    selectCity(city) {
        this.input.value = city;
        this.hideSuggestions();
        document.getElementById('search-btn').click();
    }

    hideSuggestions() {
        this.suggestionsContainer.classList.remove('show');
        this.input.setAttribute('aria-expanded', 'false');
        this.selectedIndex = -1;
    }

    onKeyDown(e) {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.updateSelection(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection(items);
                break;
            case 'Enter':
                if (this.selectedIndex >= 0) {
                    e.preventDefault();
                    this.selectCity(this.suggestions[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    updateSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
            item.setAttribute('aria-selected', index === this.selectedIndex);
            if (index === this.selectedIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    onClick(e) {
        if (!this.input.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
            this.hideSuggestions();
        }
    }
}

// Initialize autocomplete
document.addEventListener('DOMContentLoaded', () => {
    new CityAutocomplete();
}); 