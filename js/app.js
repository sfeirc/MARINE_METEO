document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const weatherService = new WeatherService();
    const searchButton = document.getElementById('search-btn');
    const locationInput = document.getElementById('location');
    let currentFactIndex = 0;

    // Initialize with default city
    weatherService.getWeather(CONFIG.DEFAULT_LOCATION);

    // Add search button click handler
    searchButton.addEventListener('click', () => {
        const location = locationInput.value.trim();
        if (location) {
            weatherService.getWeather(location);
        }
    });

    // Add enter key handler for search
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchButton.click();
        }
    });

    // Initialize city tags
    document.querySelectorAll('.city-tag').forEach(tag => {
        console.log('Setting up city tag:', tag.dataset.city);
        tag.addEventListener('click', () => {
            const city = tag.dataset.city;
            console.log('City tag clicked:', city);
            locationInput.value = city;
            weatherService.getWeather(city);
            
            // Add active state to clicked tag
            document.querySelectorAll('.city-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });

    // Fact carousel navigation
    const factCarousel = document.querySelector('.fact-carousel');
    const prevButton = document.querySelector('.prev-fact');
    const nextButton = document.querySelector('.next-fact');
    const factDots = document.querySelector('.fact-dots');

    // Create dots for each fact
    OCEAN_FACTS.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `fact-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => showFact(index));
        factDots.appendChild(dot);
    });

    prevButton.addEventListener('click', () => {
        currentFactIndex = (currentFactIndex - 1 + OCEAN_FACTS.length) % OCEAN_FACTS.length;
        showFact(currentFactIndex);
    });

    nextButton.addEventListener('click', () => {
        currentFactIndex = (currentFactIndex + 1) % OCEAN_FACTS.length;
        showFact(currentFactIndex);
    });

    function showFact(index) {
        currentFactIndex = index;
        factCarousel.classList.remove('visible');
        
        setTimeout(() => {
            factCarousel.textContent = OCEAN_FACTS[currentFactIndex];
            factCarousel.classList.add('visible');
            
            // Update dots
            document.querySelectorAll('.fact-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentFactIndex);
            });
        }, 500);
    }
}); 