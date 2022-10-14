import "./style.css";
import { lightFormat } from "date-fns";
import sun from "./sun.png";
import cloud from "./cloudy.png";
import rain from "./rain.png";
import storm from "./storm.png";
import snow from "./snowing.png";
import { rangeRight } from "lodash";

// const sunIcon = "/sun.png";
// const cloudIcon = "/cloudy.png";
// const rainIcon = "/rain.png";
// const stormIcon = "/storm.png";
// const snowIcon = "/snowing.png";
const tabs = document.querySelectorAll(".tab");
const form = document.querySelector("form");
const search = document.getElementById("location-search");
const display = document.querySelector(".container");
const msgDisplay = document.querySelector(".msg-container");
let location;

// populates display for current weather under Today tab
const oneDayDisplay = function (data, cityParent) {
	display.classList.remove("five-day");
	display.innerHTML = `
    <h1>${data.name}, ${cityParent}</h1>
    <div class="temp-container">
        <div class="temp-data">
            <div>
            <h2 class="date">${lightFormat(new Date(), "MM/dd/yyyy")}</h2>
            <h3>Current Temp</h3>
            <span class="curr-temp">${Math.round(data.main.temp)}°F</span>
            </div>
            <span class="feels-like">Feels like ${Math.round(
							data.main.feels_like
						)}°</span>
        </div>
        <div class="icon-container">
			<img src=${getIcon(data.weather[0].main)} class="temp-icon" />
		</div>
    </div>`;
};

// populates 5 day display tab
const fiveDayDisplay = function (data, cityParent) {
	const forcastArr = getDays(data.list);
	display.classList.add("five-day");
	display.innerHTML = `<h1>${data.city.name}, ${cityParent}</h1>`;
	for (let i = 1; i <= 5; i++) {
		const forcast = document.createElement("div");
		const { high, low } = getHighLow(forcastArr[i]);

		forcast.classList.add("forcast");
		forcast.innerHTML = `
        <h2 class="forcast-date">${formatDate(forcastArr[i][0])}</h2>
        <div class="highlow-container">
            <span class="high-temp">High: ${Math.round(high)}°</span>
            <span class="low-temp">Low: ${Math.round(low)}°</span>
        </div>
        <div class="icon-container">
            <img src=${getIcon(
							forcastArr[i][3].weather[0].main
						)} class="forcast-icon" />
        </div>`;
		display.appendChild(forcast);
	}
};

// returns array to seperate forcast API call list array which is in 3 hr increments into days
const getDays = function (arr) {
	const today = arr[0].dt_txt.slice(8, 10);
	let dayOne = [];
	let forcast = [];
	arr.forEach((obj) => {
		if (obj.dt_txt.slice(8, 10) === today) dayOne.push(obj);
	});
	forcast.push(dayOne);
	for (let i = dayOne.length; i < arr.length; i += 8) {
		forcast.push(arr.slice(i, i + 8));
	}
	return forcast;
};

const getIcon = function (str) {
	const string = str.toLowerCase();
	if (string.includes("cloud")) return cloud;
	if (string.includes("rain")) return rain;
	if (string.includes("storm")) return storm;
	if (string.includes("snow")) return snow;
	return sun;
};

// returns high/low temp for each day since free version of open weather API doesn't have this feature
const getHighLow = function (arr) {
	let high = arr[0].main.temp_max;
	let low = arr[0].main.temp_min;
	for (let i = 0; i < arr.length; i++) {
		const temp = arr[i].main.temp;
		if (temp > high) high = temp;
		if (temp < low) low = temp;
	}
	return { high, low };
};

const getCityParent = async function (data) {
	const { lon, lat } = data.coord ? data.coord : data.city.coord;
	try {
		const response = await fetch(
			`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=e548290df6fc88b40ad44f22ee99dc3f`
		);
		const [data] = await response.json();
		const result = data.country === "US" ? data.state : data.country;
		return result;
	} catch (error) {
		console.log(error);
	}
};

const formatDate = function (data) {
	const date = data.dt_txt.slice(0, 10);
	const year = date.slice(0, 4);
	const month = date.slice(5, 7);
	const day = date.slice(8, 10);
	return `${month}/${day}/${year}`;
};

// this is to determin which API call to use, weather for current and forcast for 5 day calls
const getCallType = function () {
	const selected = document.querySelector(".selected");
	const type = selected.textContent === "Today" ? "weather" : "forecast";
	return type;
};

// this populates display with API call based on user's current location data on page load
const getLocalWeather = async function (position) {
	try {
		const { latitude } = position.coords;
		const { longitude } = position.coords;

		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/${getCallType()}?lat=${latitude}&lon=${longitude}&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
			{ mode: "cors" }
		);
		const data = await response.json();
		const cityParent = await getCityParent(data);
		getCallType() === "weather"
			? oneDayDisplay(data, cityParent)
			: fiveDayDisplay(data, cityParent);
	} catch (error) {
		console.error(error);
		errorHandler(error);
	}
	display.classList.remove("loading");
};

// API call from user search data
const getWeather = async function (location) {
	let city;
	let state;
	[city, state] = location.split(",");
	try {
		if (state && state.length > 3)
			throw new Error("Please use two letter abreviation for state");
		const response = state
			? await fetch(
					`https://api.openweathermap.org/data/2.5/${getCallType()}?q=${city},${state},US&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
					{ mode: "cors" }
			  )
			: await fetch(
					`https://api.openweathermap.org/data/2.5/${getCallType()}?q=${city}&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
					{ mode: "cors" }
			  );
		const data = await response.json();
		const cityParent = await getCityParent(data);
		getCallType() === "weather"
			? oneDayDisplay(data, cityParent)
			: fiveDayDisplay(data, cityParent);
	} catch (error) {
		console.log(error.name);
		errorHandler(error);
	}
	display.classList.remove("loading");
};

// handles API calls either on page load or user search selection and pauses UI while loading to prevent errors
const weatherHandler = function (type) {
	display.classList.add("loading");
	display.innerHTML = "<p>Loading ...</p>";
	if (location) {
		getWeather(location);
	} else {
		navigator.geolocation.getCurrentPosition(
			(pos) => getLocalWeather(pos, type),
			(err) => {
				console.error(err);
				errorHandler(err);
			}
		);
	}
};

tabs.forEach((tab) => {
	tab.addEventListener("click", (e) => {
		if (
			e.target.classList.contains("selected") ||
			display.classList.contains("loading")
		)
			return;
		tabs.forEach((tab) => tab.classList.toggle("selected"));
		display.innerHTML = "";
		weatherHandler();
	});
});

form.addEventListener("submit", (e) => {
	e.preventDefault();
	location = search.value;
	weatherHandler();
});

// error handling/ display
const errorHandler = function (error) {
	const errorMsg = document.createElement("p");
	errorMsg.classList.add("error-display");
	errorMsg.textContent =
		error.name === "TypeError"
			? "Whoops! Something went wrong 🤬. Please check your search and try again."
			: error;

	display.appendChild(errorMsg);
};

// fn call on page load
weatherHandler();

//////////// Check List
// - add loading icon/display img
// - bundle images via webpack
// - tweek input to only allow city, zip, or city & state
// - display loading and error msg's in the same container/element as the city name by making that element hard coded in HTML
