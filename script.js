// Configuration
const CONFIG = {
  API_KEY: "5c225689bf668ac4c08d467b811a0c91",
  API_BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
  KELVIN_OFFSET: 273.15,
};

// Weather emoji mapping
const WEATHER_EMOJIS = {
  thunderstorm: "⛈️",
  drizzle: "🌧️",
  rain: "🌧️",
  snow: "❄️",
  atmosphere: "🌫️",
  clear: "🌞",
  clouds: "☁️",
  unknown: "❓",
};

// DOM Elements
const elements = {
  form: document.querySelector(".weatherForm"),
  input: document.querySelector(".cityInput"),
  card: document.querySelector(".card"),
};

// Weather Service
class WeatherService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async fetchWeather(city) {
    const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(
        response.status === 404 
          ? "City not found" 
          : "Could not fetch weather data"
      );
    }
    
    return response.json();
  }
}

// UI Manager
class WeatherUI {
  constructor(cardElement) {
    this.card = cardElement;
  }

  clear() {
    this.card.textContent = "";
    this.card.style.display = "block";
  }

  displayWeather(data) {
    this.clear();

    const { name: city, main: { temp, humidity }, weather } = data;
    const { description, id } = weather[0];

    const elements = [
      this.createElement("h1", city, "cityDisplay"),
      this.createElement("p", this.formatTemperature(temp), "tempDisplay"),
      this.createElement("p", `Humidity: ${humidity}%`, "humidityDisplay"),
      this.createElement("p", this.capitalizeWords(description), "descDisplay"),
      this.createElement("p", this.getWeatherEmoji(id), "weatherEmoji"),
    ];

    elements.forEach(el => this.card.appendChild(el));
  }

  displayError(message) {
    this.clear();
    const errorElement = this.createElement("p", message, "errorDisplay");
    this.card.appendChild(errorElement);
  }

  createElement(tag, content, className) {
    const element = document.createElement(tag);
    element.textContent = content;
    element.classList.add(className);
    return element;
  }

  formatTemperature(kelvin) {
    const celsius = (kelvin - CONFIG.KELVIN_OFFSET).toFixed(1);
    return `${celsius}°C`;
  }

  capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }

  getWeatherEmoji(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return WEATHER_EMOJIS.thunderstorm;
    if (weatherId >= 300 && weatherId < 400) return WEATHER_EMOJIS.drizzle;
    if (weatherId >= 500 && weatherId < 600) return WEATHER_EMOJIS.rain;
    if (weatherId >= 600 && weatherId < 700) return WEATHER_EMOJIS.snow;
    if (weatherId >= 700 && weatherId < 800) return WEATHER_EMOJIS.atmosphere;
    if (weatherId === 800) return WEATHER_EMOJIS.clear;
    if (weatherId >= 801 && weatherId < 810) return WEATHER_EMOJIS.clouds;
    return WEATHER_EMOJIS.unknown;
  }
}

// App Controller
class WeatherApp {
  constructor(weatherService, ui, formElement, inputElement) {
    this.weatherService = weatherService;
    this.ui = ui;
    this.form = formElement;
    this.input = inputElement;
    
    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();

    const city = this.input.value.trim();

    if (!city) {
      this.ui.displayError("Please enter a city name");
      return;
    }

    try {
      const weatherData = await this.weatherService.fetchWeather(city);
      this.ui.displayWeather(weatherData);
      this.input.value = ""; // Clear input after successful search
    } catch (error) {
      this.ui.displayError(error.message);
    }
  }
}

// Initialize the app
const weatherService = new WeatherService(CONFIG.API_KEY, CONFIG.API_BASE_URL);
const weatherUI = new WeatherUI(elements.card);
const app = new WeatherApp(weatherService, weatherUI, elements.form, elements.input);