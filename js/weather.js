class WeatherService {
    constructor() {
        this.config = CONFIG;
        this.animations = weatherAnimations;
    }

    async getWeather(location) {
        console.log('Getting weather for location:', location);
        this.showLoadingState(true);

        try {
            if (!location) {
                throw new Error('Veuillez entrer une ville valide');
            }

            const response = await fetch(
                `${this.config.API_BASE_URL}weather?q=${location}&units=${this.config.UNITS}&lang=${this.config.LANGUAGE}&appid=${this.config.API_KEY}`
            );

            if (!response.ok) {
                throw new Error('Ville non trouvée');
            }

            const weatherData = await response.json();
            const processedData = this.processWeatherData(weatherData);
            this.updateUI(processedData);
            this.updateAnimations(weatherData.weather[0].id);

        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError(error.message);
        } finally {
            this.showLoadingState(false);
        }
    }

    showLoadingState(isLoading) {
        const elements = [
            '.temp-value',
            '.feels-like',
            '.wind-details',
            '.humidity-card',
            '.precipitation-graph',
            '.uv-meter',
            '.aqi-display',
            '.visibility-meter',
            '.pressure-gauge',
            '.cloud-layers'
        ];

        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                if (isLoading) {
                    element.innerHTML = `
                        <div class="loading-indicator">
                            <div class="loading-spinner"></div>
                        </div>
                    `;
                }
            }
        });
    }

    showError(message) {
        const weatherDisplay = document.querySelector('.weather-display');
        if (weatherDisplay) {
            weatherDisplay.innerHTML = `
                <div class="error-display">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${message}</div>
                    <button class="retry-button" onclick="location.reload()">Réessayer</button>
                </div>
            `;
        }
    }

    processWeatherData(weatherData) {
        return {
            data: {
                values: {
                    humidity: weatherData.main.humidity,
                    temperature: weatherData.main.temp,
                    temperatureApparent: weatherData.main.feels_like,
                    windSpeed: weatherData.wind.speed * 3.6,
                    windDirection: weatherData.wind.deg,
                    windGust: weatherData.wind.gust ? weatherData.wind.gust * 3.6 : undefined,
                    pressure: weatherData.main.pressure,
                    visibility: weatherData.visibility,
                    weatherCode: weatherData.weather[0].id,
                    description: weatherData.weather[0].description,
                    cloudCover: weatherData.clouds.all,
                    uvIndex: this.estimateUVIndex(weatherData.clouds.all, weatherData.dt),
                    precipitationProbability: weatherData.rain ? 100 : 0
                }
            }
        };
    }

    estimateUVIndex(cloudCover, timestamp) {
        const hour = new Date(timestamp * 1000).getHours();
        
        let baseUV = 0;
        if (hour >= 10 && hour <= 16) {
            baseUV = 8;
        } else if (hour >= 7 && hour <= 19) {
            baseUV = 4;
        }
        
        const uvReduction = cloudCover / 100;
        return Math.max(0, baseUV * (1 - uvReduction));
    }

    updateUI(data) {
        const values = data.data.values;
        
        // Update main weather display
        this.updateMainWeather(values);
        
        // Update wind information
        this.updateWindInfo(values);
        
        // Update humidity
        this.updateHumidity(values);
        
        // Update other weather cards
        this.updatePrecipitation(values);
        this.updateVisibility(values);
        this.updatePressure(values);
        this.updateCloudCover(values);
        this.updateAirQuality(values);
        
        // Add UV index update
        this.updateUVIndex(values);
    }

    updateMainWeather(values) {
        const mainWeather = document.querySelector('.main-weather-content');
        if (mainWeather) {
            mainWeather.innerHTML = `
                <div class="temperature-display">
                    <span class="temp-value">${Math.round(values.temperature)}°C</span>
                    <div class="temp-details">
                        <span class="feels-like">Ressenti ${Math.round(values.temperatureApparent)}°C</span>
                        <div class="weather-description">${values.description}</div>
                    </div>
                </div>
                <div class="weather-icon">${this.getWeatherIcon(values.weatherCode)}</div>
            `;
        }
    }

    updateWindInfo(values) {
        const windDisplay = document.querySelector('.wind-display');
        if (windDisplay) {
            windDisplay.innerHTML = `
                <div class="wind-compass">
                    <div class="compass-arrow" style="transform: rotate(${values.windDirection}deg)"></div>
                </div>
                <div class="wind-details">
                    <div class="wind-speed">${Math.round(values.windSpeed)} km/h</div>
                    ${values.windGust ? `<div class="wind-gust">Rafales: ${Math.round(values.windGust)} km/h</div>` : ''}
                </div>
            `;
        }
    }

    updateHumidity(values) {
        const humidityCard = document.querySelector('.humidity-card');
        if (humidityCard) {
            // Clear any loading indicators
            humidityCard.innerHTML = `
                <h3>Humidité</h3>
                <div class="circular-progress">
                    <div class="progress-value">${values.humidity}%</div>
                </div>
            `;

            // Get the newly created circular progress element
            const circularProgress = humidityCard.querySelector('.circular-progress');
            if (circularProgress) {
                // Convert humidity percentage to degrees for conic gradient
                const degrees = values.humidity * 3.6; // 360 degrees / 100% = 3.6
                circularProgress.style.setProperty('--progress', `${degrees}deg`);
            }
        }
    }

    updatePrecipitation(values) {
        const precipGraph = document.querySelector('.precipitation-graph');
        if (precipGraph) {
            precipGraph.innerHTML = `
                <div class="precipitation-bar-container">
                    <div class="precipitation-bar" style="width: ${values.precipitationProbability}%"></div>
                    <span class="precipitation-value">${Math.round(values.precipitationProbability)}%</span>
                </div>
                <div class="rain-drops"></div>
            `;

            // Add dynamic rain drops
            this.createRainDrops();
        }
    }

    createRainDrops() {
        const rainContainer = document.querySelector('.rain-drops');
        if (!rainContainer) return;

        for (let i = 0; i < 20; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            
            // Random properties
            const left = Math.random() * 100;
            const duration = 1 + Math.random() * 2;
            const delay = Math.random() * 2;
            const height = 10 + Math.random() * 20;
            
            drop.style.cssText = `
                left: ${left}%;
                height: ${height}px;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;
            
            rainContainer.appendChild(drop);
        }
    }

    updateVisibility(values) {
        const visibilityMeter = document.querySelector('.visibility-meter');
        if (visibilityMeter) {
            const visibilityKm = values.visibility / 1000;
            visibilityMeter.innerHTML = `
                <div class="visibility-value">${visibilityKm.toFixed(1)} km</div>
            `;
        }
    }

    updatePressure(values) {
        const pressureGauge = document.querySelector('.pressure-gauge');
        if (pressureGauge) {
            pressureGauge.innerHTML = `
                <div class="pressure-value">${values.pressure} hPa</div>
            `;
        }
    }

    updateCloudCover(values) {
        const cloudLayers = document.querySelector('.cloud-layers');
        if (cloudLayers) {
            cloudLayers.innerHTML = `
                <div class="cloud-cover-container">
                    <div class="cloud-percentage">${values.cloudCover}%</div>
                    <div class="cloud-visualization">
                        <div class="cloud-layer"></div>
                        <div class="cloud-layer"></div>
                        <div class="cloud-layer"></div>
                    </div>
                    <div class="cloud-info">
                        ${values.cloudBase ? `
                            <div class="cloud-base">Base: ${values.cloudBase.toFixed(1)} km</div>
                        ` : ''}
                        ${values.cloudCeiling ? `
                            <div class="cloud-ceiling">Plafond: ${values.cloudCeiling.toFixed(1)} km</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    }

    getWeatherIcon(code) {
        const icons = {
            200: '⛈️',  // thunderstorm with light rain
            300: '🌧️',  // drizzle
            500: '🌧️',  // rain
            600: '🌨️',  // snow
            700: '🌫️',  // mist
            800: '☀️',  // clear sky
            801: '🌤️',  // few clouds
            802: '⛅',  // scattered clouds
            803: '🌥️',  // broken clouds
            804: '☁️'   // overcast clouds
        };
        
        // Get the base code (first 3 digits)
        const baseCode = Math.floor(code / 100) * 100;
        return icons[baseCode] || icons[code] || '🌡️';
    }

    updateAnimations(weatherCode) {
        this.animations.stopAnimation();
        
        // Add intensity based on weather code
        const intensity = this.getIntensity(weatherCode);
        
        if (weatherCode >= 500 && weatherCode < 600) {
            // Rain conditions
            this.animations.startRain(intensity);
        } else if (weatherCode >= 600 && weatherCode < 700) {
            // Snow conditions
            this.animations.startSnow(intensity);
        } else if (weatherCode >= 700 && weatherCode < 800) {
            // Fog conditions
            this.animations.startFog();
        }
    }

    getIntensity(code) {
        // Light conditions
        if ([500, 600, 701].includes(code)) return 1;
        // Moderate conditions
        if ([501, 601, 721].includes(code)) return 2;
        // Heavy conditions
        if ([502, 503, 504, 602, 731, 751].includes(code)) return 3;
        return 1;
    }

    updateAirQuality(values) {
        const aqiCard = document.querySelector('.air-quality-card');
        if (aqiCard) {
            const aqiDisplay = aqiCard.querySelector('.aqi-display');
            if (aqiDisplay) {
                // Calculate AQI from available data
                // OpenWeatherMap doesn't provide direct AQI, so we'll estimate from other values
                const aqi = this.calculateAQI(values);
                const aqiLevel = this.getAQILevel(aqi);
                const aqiColor = this.getAQIColor(aqi);

                aqiDisplay.innerHTML = `
                    <div class="aqi-container">
                        <div class="aqi-value" style="color: ${aqiColor}">${aqi}</div>
                        <div class="aqi-bar">
                            <div class="aqi-indicator" style="left: ${(aqi / 500) * 100}%; background: ${aqiColor}"></div>
                        </div>
                        <div class="aqi-level" style="color: ${aqiColor}">${aqiLevel}</div>
                    </div>
                `;
            }
        }
    }

    // Helper methods for Air Quality calculations
    calculateAQI(values) {
        // Simple estimation based on available data
        // This is a basic approximation since OpenWeatherMap doesn't provide direct AQI
        const visibility = values.visibility / 1000; // Convert to km
        const humidity = values.humidity;
        const cloudCover = values.cloudCover;

        // Basic formula to estimate AQI (this is a simplified version)
        let aqi = 50; // Start with average value

        // Reduce AQI (better air quality) if visibility is good
        if (visibility > 10) {
            aqi -= 20;
        } else if (visibility < 5) {
            aqi += 30;
        }

        // Adjust for humidity (high humidity can indicate poor air quality)
        if (humidity > 70) {
            aqi += 10;
        }

        // Adjust for cloud cover
        if (cloudCover > 80) {
            aqi += 5;
        }

        // Ensure AQI stays within bounds
        return Math.max(0, Math.min(500, Math.round(aqi)));
    }

    getAQILevel(aqi) {
        if (aqi <= 50) return 'Bon';
        if (aqi <= 100) return 'Modéré';
        if (aqi <= 150) return 'Mauvais pour les sensibles';
        if (aqi <= 200) return 'Mauvais';
        if (aqi <= 300) return 'Très mauvais';
        return 'Dangereux';
    }

    getAQIColor(aqi) {
        if (aqi <= 50) return '#4CAF50';  // Green
        if (aqi <= 100) return '#FDD835'; // Yellow
        if (aqi <= 150) return '#FB8C00'; // Orange
        if (aqi <= 200) return '#E53935'; // Red
        if (aqi <= 300) return '#8E24AA'; // Purple
        return '#B71C1C';                 // Dark Red
    }

    updateUVIndex(values) {
        const uvCard = document.querySelector('.uv-card');
        if (uvCard) {
            const uvMeter = uvCard.querySelector('.uv-meter');
            if (uvMeter) {
                const uvLevel = this.getUVLevel(values.uvIndex);
                const uvColor = this.getUVColor(values.uvIndex);
                
                uvMeter.innerHTML = `
                    <div class="uv-container">
                        <div class="uv-value" style="color: ${uvColor}">${values.uvIndex.toFixed(1)}</div>
                        <div class="uv-bar">
                            <div class="uv-indicator" style="left: ${(values.uvIndex / 11) * 100}%; background: ${uvColor}"></div>
                        </div>
                        <div class="uv-level" style="color: ${uvColor}">${uvLevel}</div>
                    </div>
                `;
            }
        }
    }

    getUVLevel(uvi) {
        if (uvi <= 2) return 'Faible';
        if (uvi <= 5) return 'Modéré';
        if (uvi <= 7) return 'Élevé';
        if (uvi <= 10) return 'Très élevé';
        return 'Extrême';
    }

    getUVColor(uvi) {
        if (uvi <= 2) return '#4CAF50';  // Green
        if (uvi <= 5) return '#FDD835';  // Yellow
        if (uvi <= 7) return '#FB8C00';  // Orange
        if (uvi <= 10) return '#E53935'; // Red
        return '#8E24AA';                // Purple
    }
} 