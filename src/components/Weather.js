import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Weather.css"; // Add CSS styles for layout

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState("F"); // Default unit is Fahrenheit
  const [forecast, setForecast] = useState([]); // State to hold forecast data
  const [favoriteCity, setFavoriteCity] = useState(""); // Store favorite city
  const [isFavorite, setIsFavorite] = useState(false); // Track favorite status

  // Load favorite city from local storage on component mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);

    const storedFavoriteCity = localStorage.getItem("favoriteCity");
    if (storedFavoriteCity) {
      setFavoriteCity(storedFavoriteCity);
      fetchWeather(storedFavoriteCity);
    }
  }, []);

  const fetchWeather = async (cityName) => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=279afa0b791f452b83e182257240310&q=${cityName}&days=5` // Fetching the current weather and 5-day forecast
      );
      setWeatherData(response.data);
      setForecast(response.data.forecast.forecastday); // Save forecast data
      setCity(""); // Clear input after fetching data
      setIsFavorite(favorites.includes(response.data.location.name)); // Check if the city is in favorites
    } catch (err) {
      setError("Could not fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const saveAsFavorite = (e) => {
    const favoriteCityName = weatherData.location.name;

    // Save favorite city in local storage
    if (e.target.checked) {
      if (!favorites.includes(favoriteCityName)) {
        const updatedFavorites = [...favorites, favoriteCityName];
        setFavorites(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        localStorage.setItem("favoriteCity", favoriteCityName); // Save as favorite city
        setFavoriteCity(favoriteCityName); // Set the favorite city state
      }
    } else {
      // Clear favorite city
      localStorage.removeItem("favoriteCity");
      setFavoriteCity("");
      const updatedFavorites = favorites.filter(
        (city) => city !== favoriteCityName
      ); // Remove from favorites
      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setIsFavorite(false); // Uncheck checkbox
    }
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const clearSearchResults = () => {
    setWeatherData(null); // Clear weather data
    setForecast([]); // Clear forecast data
    setCity(""); // Clear input field
  };

  return (
    <div className="weather-container">
      <div className="weather-input">
        <div className="input-box">
          {" "}
          {/* Added white box for input */}
          <h1>Anytime Weather</h1>
          <h2>Enter city below</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter City Name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <button type="submit">Enter</button>
            <div className="unit-selector">
              <label>
                <input
                  type="radio"
                  value="F"
                  checked={unit === "F"}
                  onChange={handleUnitChange}
                />
                °F
              </label>
              <label>
                <input
                  type="radio"
                  value="C"
                  checked={unit === "C"}
                  onChange={handleUnitChange}
                />
                °C
              </label>
            </div>
          </form>
        </div>
        <div className="favorite-info">
          <h3> * The current favorite city is: {favoriteCity || "None"}</h3>
          <button
            onClick={() => {
              setFavoriteCity("");
              localStorage.removeItem("favoriteCity");
              setIsFavorite(false);
            }}
          >
            Remove Favorite City
          </button>
          <button onClick={clearSearchResults}>Remove Weather Results</button>
        </div>
      </div>

      <div className="weather-result">
        {loading && <div className="loader">Loading...</div>}
        {error && <p className="error">{error}</p>}
        {weatherData && (
          <>
            <div className="weather-display">
              <div className="current-weather" style={{ textAlign: "center" }}>
                <h2>{weatherData.location.name}</h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <h2 style={{ fontSize: "3rem", marginRight: "10px" }}>
                    {unit === "F"
                      ? weatherData.current.temp_f
                      : weatherData.current.temp_c}{" "}
                    °{unit}
                  </h2>
                  <img
                    src={weatherData.current.condition.icon}
                    alt={weatherData.current.condition.text}
                    style={{ width: "100px" }} // Adjust the size of the icon as needed
                  />
                </div>
                <button className="favorite-button" onClick={saveAsFavorite}>
                  {isFavorite ? "Remove from Favorites" : "Save as Favorite"}
                </button>
              </div>
            </div>
            <div className="forecast">
              <h3>5 Day Forecast:</h3>
              <div className="forecast-days">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <h4>{new Date(day.date).toLocaleDateString()}</h4>
                    <img
                      src={day.day.condition.icon}
                      alt={day.day.condition.text}
                    />
                    <p>
                      High:{" "}
                      {unit === "F" ? day.day.maxtemp_f : day.day.maxtemp_c} °
                      {unit}
                    </p>
                    <p>
                      Low:{" "}
                      {unit === "F" ? day.day.mintemp_f : day.day.mintemp_c} °
                      {unit}
                    </p>
                    <p>{day.day.condition.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;
