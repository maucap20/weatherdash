const apiKey = "87415fb694122c5c0a1eacde1eec7367";
const searchButton = document.querySelector("#search-button");
const cityInput = document.querySelector("#city-input");
const currentWeather = document.querySelector("#current-weather");
const weatherCards = document.querySelector("#weather-cards");
const historyEl = document.querySelector("#history");
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
const clearButton = document.querySelector("#clear-history");

function getCoordinates() {
  let cityName = cityInput.value.trim(); // Get user input city name.
  const apiGeocodingCall = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&units=imperial&limit=1&appid=${apiKey}`;
  if (!cityName) {
    return;
  }

  // Get coordinates from openweathermap API
  fetch(apiGeocodingCall)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data.length) return alert(`${cityName} was not found.`);
      const { name, lat, lon } = data[0];

      searchHistory.push({ name, lat, lon });
      console.log(searchHistory);
      localStorage.setItem("search", JSON.stringify(searchHistory));

      getWeather(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred.");
    });
}

function getWeather(cityName, lat, lon) {
  const apiWeatherCall = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  fetch(apiWeatherCall)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const uniqueDays = [];

      // Get one forcast per day
      const fiveDayForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueDays.includes(forecastDate)) {
          return uniqueDays.push(forecastDate);
        }
      });

      // Clear previous values
      cityInput.value = "";
      currentWeather.innerHTML = "";
      weatherCards.innerHTML = "";

      // Creating and adding cards
      fiveDayForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeather.insertAdjacentHTML(
            "beforeend",
            createCard(cityName, weatherItem, index)
          );
        } else {
          weatherCards.insertAdjacentHTML(
            "beforeend",
            createCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch(() => {
      alert("An error occurred.");
    });
}

function createCard(cityName, weatherItem, index) {
  // Main Card
  if (index === 0) {
    return `<div class="stats">
                    <h2>${cityName} ${weatherItem.dt_txt.split(" ")[0]}</h2>
                    <h4>Temperature: ${weatherItem.main.temp}°F</h4>
                    <h4>Wind: ${weatherItem.wind.speed} mph</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@2x.png" alt="">
            </div>`;
    // 5-Day Forecast Cards
  } else {
    return `<li class="col-md-2 forecast bg-primary text-white m-2 rounded" id="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@2x.png" alt="">
                    <h4>Temp: ${weatherItem.main.temp}°F</h4>
                    <h4>Wind: ${weatherItem.wind.speed} mph</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
  }
}

// Get and display search history as interactable buttons
function renderSearchHistory() {
  historyEl.innerHTML = "";
  for (let i = 0; i < searchHistory.length; i++) {
    const currentCity = searchHistory[i];
    const historyCity = document.createElement("button");
    historyCity.textContent = currentCity.name;
    historyCity.classList.add("btn", "btn-secondary", "mb-2", "w-100");
    historyCity.addEventListener("click", function () {
      getWeather(currentCity.name, currentCity.lat, currentCity.lon);
    });
    historyEl.append(historyCity);
  }
}

// Listens for clicks on search Button
searchButton.addEventListener("click", function () {
  getCoordinates();
  renderSearchHistory();
});

//Listens for clicks on Clear History Button
clearButton.addEventListener("click", function () {
  localStorage.clear();
  searchHistory = [];
  renderSearchHistory();
});
