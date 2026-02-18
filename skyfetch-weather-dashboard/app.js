// ===============================
// SkyFetch Weather Dashboard - FINAL VERSION
// OOP + Forecast + localStorage + Deployment Ready
// ===============================

// ===============================
// WeatherApp Constructor
// ===============================
function WeatherApp(apiKey) {

    // API configuration
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    // DOM elements
    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentSearchesSection = document.getElementById("recent-searches-section");
    this.recentSearchesContainer = document.getElementById("recent-searches-container");

    this.clearHistoryBtn = document.getElementById("clear-history-btn");

    // Data
    this.recentSearches = [];
    this.maxRecentSearches = 5;

    // Initialize app
    this.init();
}


// ===============================
// INIT METHOD
// ===============================
WeatherApp.prototype.init = function () {

    // Button click
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    // Enter key
    this.cityInput.addEventListener(
        "keypress",
        function (e) {
            if (e.key === "Enter") {
                this.handleSearch();
            }
        }.bind(this)
    );

    // Clear history button
    if (this.clearHistoryBtn) {
        this.clearHistoryBtn.addEventListener(
            "click",
            this.clearHistory.bind(this)
        );
    }

    // Load stored data
    this.loadRecentSearches();
    this.loadLastCity();
};


// ===============================
// HANDLE SEARCH
// ===============================
WeatherApp.prototype.handleSearch = function () {

    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name");
        return;
    }

    if (city.length < 2) {
        this.showError("City name too short");
        return;
    }

    this.getWeather(city);
};


// ===============================
// GET WEATHER + FORECAST
// ===============================
WeatherApp.prototype.getWeather = async function (city) {

    this.showLoading();

    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    const weatherUrl =
        `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    const forecastUrl =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {

        const [weatherResponse, forecastResponse] =
            await Promise.all([
                axios.get(weatherUrl),
                axios.get(forecastUrl)
            ]);

        this.displayWeather(weatherResponse.data);
        this.displayForecast(forecastResponse.data);

        // Save searches
        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

    }
    catch (error) {

        console.error(error);

        if (error.response && error.response.status === 404) {
            this.showError("City not found");
        } else {
            this.showError("Network error. Try again.");
        }

    }
    finally {

        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "Search";
    }
};


// ===============================
// DISPLAY CURRENT WEATHER
// ===============================
WeatherApp.prototype.displayWeather = function (data) {

    const city = data.name;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;

    const iconUrl =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    this.weatherDisplay.innerHTML = `

        <div class="weather-info">

            <h2>${city}</h2>

            <img src="${iconUrl}">

            <h3>${temp}°C</h3>

            <p>${desc}</p>

        </div>

        <div id="forecast-container"></div>
    `;
};


// ===============================
// DISPLAY 5 DAY FORECAST
// ===============================
WeatherApp.prototype.displayForecast = function (data) {

    const container =
        document.getElementById("forecast-container");

    container.innerHTML =
        "<h3>5-Day Forecast</h3>";

    const row =
        document.createElement("div");

    row.className =
        "forecast-row";

    const daily = {};

    data.list.forEach(function (item) {

        const date =
            item.dt_txt.split(" ")[0];

        if (!daily[date]) {

            daily[date] = item;

        }

    });

    Object.values(daily)
        .slice(0, 5)
        .forEach(function (day) {

            const temp =
                Math.round(day.main.temp);

            const icon =
                day.weather[0].icon;

            const date =
                new Date(day.dt_txt)
                    .toDateString()
                    .slice(0, 10);

            const card =
                document.createElement("div");

            card.className =
                "forecast-card";

            card.innerHTML = `
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png">
                <p>${temp}°C</p>
            `;

            row.appendChild(card);

        });

    container.appendChild(row);

};


// ===============================
// SHOW LOADING
// ===============================
WeatherApp.prototype.showLoading = function () {

    this.weatherDisplay.innerHTML =
        "<p>Loading weather...</p>";
};


// ===============================
// SHOW ERROR
// ===============================
WeatherApp.prototype.showError = function (msg) {

    this.weatherDisplay.innerHTML =
        `<p class="error">${msg}</p>`;
};


// ===============================
// SHOW WELCOME
// ===============================
WeatherApp.prototype.showWelcome = function () {

    this.weatherDisplay.innerHTML = `

        <div class="welcome-message">

            <h3>🌤️ Welcome to SkyFetch</h3>

            <p>Search a city to get weather</p>

            <p>Try: London, Tokyo, Delhi</p>

        </div>
    `;
};


// ===============================
// LOAD RECENT SEARCHES
// ===============================
WeatherApp.prototype.loadRecentSearches = function () {

    const saved =
        localStorage.getItem("recentSearches");

    if (saved) {

        this.recentSearches =
            JSON.parse(saved);
    }

    this.displayRecentSearches();
};


// ===============================
// SAVE RECENT SEARCH
// ===============================
WeatherApp.prototype.saveRecentSearch = function (city) {

    city =
        city.charAt(0).toUpperCase() +
        city.slice(1).toLowerCase();

    const index =
        this.recentSearches.indexOf(city);

    if (index > -1) {
        this.recentSearches.splice(index, 1);
    }

    this.recentSearches.unshift(city);

    if (
        this.recentSearches.length >
        this.maxRecentSearches
    ) {
        this.recentSearches.pop();
    }

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(this.recentSearches)
    );

    this.displayRecentSearches();
};


// ===============================
// DISPLAY RECENT SEARCHES
// ===============================
WeatherApp.prototype.displayRecentSearches =
    function () {

        if (!this.recentSearchesContainer)
            return;

        this.recentSearchesContainer.innerHTML = "";

        if (
            this.recentSearches.length === 0
        ) {

            this.recentSearchesSection.style.display =
                "none";

            return;
        }

        this.recentSearchesSection.style.display =
            "block";

        this.recentSearches.forEach(

            function (city) {

                const btn =
                    document.createElement("button");

                btn.className =
                    "recent-search-btn";

                btn.textContent =
                    city;

                btn.addEventListener(

                    "click",

                    function () {

                        this.cityInput.value =
                            city;

                        this.getWeather(city);

                    }.bind(this)
                );

                this.recentSearchesContainer.appendChild(
                    btn
                );

            }.bind(this)
        );
    };


// ===============================
// LOAD LAST CITY
// ===============================
WeatherApp.prototype.loadLastCity =
    function () {

        const lastCity =
            localStorage.getItem("lastCity");

        if (lastCity) {

            this.cityInput.value =
                lastCity;

            this.getWeather(lastCity);

        } else {

            this.showWelcome();
        }
    };


// ===============================
// CLEAR HISTORY
// ===============================
WeatherApp.prototype.clearHistory =
    function () {

        if (
            confirm(
                "Clear search history?"
            )
        ) {

            this.recentSearches = [];

            localStorage.removeItem(
                "recentSearches"
            );

            this.displayRecentSearches();
        }
    };


// ===============================
// START APP
// ===============================
const app =
    new WeatherApp(
        "903589fe8919185a5a2b91e814d1ee3e"
    );

/* =========================
   SHOW ERROR METHOD
========================= */
WeatherApp.prototype.showError = function(message) {

    const errorHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <h3 class="error-heading">Error</h3>
            <p class="error-text">${message}</p>
        </div>
    `;

    // Show error in weather display
    this.weatherDisplay.innerHTML = errorHTML;

    // Clear forecast when error occurs
    this.forecastContainer.innerHTML = "";
};



// /* =========================
//    SHOW LOADING METHOD
// ========================= */
// WeatherApp.prototype.showLoading = function() {

//     const loadingHTML = `
//         <div class="loading-container">
//             <div class="spinner"></div>
//             <p class="loading-text">Fetching weather data...</p>
//         </div>
//     `;

//     // Show loading spinner
//     this.weatherDisplay.innerHTML = loadingHTML;

//     // Clear forecast while loading
//     this.forecastContainer.innerHTML = "";
// };



/* =========================
   GET WEATHER METHOD
========================= */
WeatherApp.prototype.getWeather = async function(city) {

    // Show loading state
    this.showLoading();

    // Disable search button
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    const weatherUrl =
        `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    const forecastUrl =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {

        // Fetch weather + forecast together
        const [weatherResponse, forecastResponse] =
            await Promise.all([
                axios.get(weatherUrl),
                axios.get(forecastUrl)
            ]);

        // Display weather
        this.displayWeather(weatherResponse.data);

        // Display forecast
        this.displayForecast(forecastResponse.data);

        // Save recent search
        this.saveRecentSearch(city);

        // Save last searched city
        localStorage.setItem("lastCity", city);

    }
    catch (error) {

        console.error("Weather error:", error);

        if (error.response && error.response.status === 404) {

            this.showError(`City "${city}" not found`);

        }
        else if (error.response && error.response.status === 401) {

            this.showError("Invalid API key");

        }
        else {

            this.showError("Network error. Please check your internet.");

        }
    }
    finally {

        // Enable search button again
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "Search";

        // Focus input for next search
        this.cityInput.focus();
    }
};
