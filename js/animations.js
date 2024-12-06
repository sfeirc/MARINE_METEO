class WeatherAnimations {
    constructor() {
        this.container = document.querySelector('.ocean-background');
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        this.container.appendChild(this.particleContainer);
        this.initParticles();
    }

    initParticles() {
        const particles = document.querySelector('.particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = Math.random() * 10 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.opacity = Math.random() * 0.5;
            particles.appendChild(particle);
        }
    }

    // Crée une particule météo (pluie, neige, etc.)
    createParticle(type) {
        const particle = document.createElement('div');
        particle.className = `weather-particle ${type}`;
        
        // Position aléatoire sur l'axe X
        const randomX = Math.random() * window.innerWidth;
        particle.style.left = `${randomX}px`;
        
        // Durée aléatoire de l'animation
        const duration = 1 + Math.random() * 2;
        particle.style.animationDuration = `${duration}s`;

        return particle;
    }

    // Animation pour la pluie
    startRain(intensity = 1) {
        this.stopAnimation();
        this.currentAnimation = setInterval(() => {
            const rainDrop = this.createParticle('rain');
            this.particleContainer.appendChild(rainDrop);
            
            // Supprime la goutte après l'animation
            setTimeout(() => {
                rainDrop.remove();
            }, 3000);
        }, 100 / intensity);
    }

    // Animation pour la neige
    startSnow(intensity = 1) {
        this.stopAnimation();
        this.currentAnimation = setInterval(() => {
            const snowflake = this.createParticle('snow');
            this.particleContainer.appendChild(snowflake);
            
            setTimeout(() => {
                snowflake.remove();
            }, 5000);
        }, 200 / intensity);
    }

    // Arrête l'animation en cours
    stopAnimation() {
        if (this.currentAnimation) {
            clearInterval(this.currentAnimation);
            this.particleContainer.innerHTML = '';
        }
    }

    updateAnimations(weatherCode) {
        this.stopAnimation();
        
        // Add intensity based on weather code
        const intensity = this.getIntensity(weatherCode);
        
        if (weatherCode >= 4000 && weatherCode < 5000) {
            // Rain conditions
            this.startRain(intensity);
        } else if (weatherCode >= 5000 && weatherCode < 6000) {
            // Snow conditions
            this.startSnow(intensity);
        } else if (weatherCode >= 2000 && weatherCode < 3000) {
            // Fog conditions
            this.startFog();
        }
    }

    getIntensity(weatherCode) {
        // Light conditions
        if ([4000, 4200, 5001].includes(weatherCode)) return 1;
        // Moderate conditions
        if ([4001, 5000].includes(weatherCode)) return 2;
        // Heavy conditions
        if ([4201, 5100].includes(weatherCode)) return 3;
        return 1;
    }

    startFog() {
        this.stopAnimation();
        const fogLayer = document.createElement('div');
        fogLayer.className = 'fog-layer';
        this.particleContainer.appendChild(fogLayer);
    }
}

// Initialisation des animations
const weatherAnimations = new WeatherAnimations(); 

// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: {
            value: 0.5,
            random: true,
            animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
        },
        size: {
            value: 3,
            random: true,
            animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'bounce' },
            attract: { enable: false, rotateX: 600, rotateY: 1200 }
        }
    },
    interactivity: {
        detectsOn: 'canvas',
        events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
            resize: true
        }
    },
    retina_detect: true
});

// Create floating bubbles
function createBubbles() {
    const container = document.querySelector('.floating-bubbles');
    const bubbleCount = 20;

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size
        const size = Math.random() * 100 + 50;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration
        const duration = Math.random() * 10 + 10;
        bubble.style.setProperty('--duration', `${duration}s`);
        
        container.appendChild(bubble);
    }
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    createBubbles();
}); 