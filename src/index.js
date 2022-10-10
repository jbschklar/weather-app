import "./style.css";
import { lightFormat } from "date-fns";
import { rangeRight } from "lodash";

const sunIcon = "/sun.png";
const cloudIcon = "/cloudy.png";
const rainIcon = "/rain.png";
const stormIcon = "/storm.png";
const snowIcon = "/snowing.png";
const tabs = document.querySelectorAll(".tab");
const form = document.querySelector("form");
const search = document.getElementById("location-search");
const display = document.querySelector(".container");
let location;

const oneDayDisplay = function (data) {
	console.log(data);
	display.classList.remove("five-day");
	display.innerHTML = `
    <h1>${data.name}</h1>
    <div class="temp-container">
        <div class="temp-data">
            <h2 class="date">${lightFormat(new Date(), "MM/dd/yyyy")}</h2>
            <span class="high-low">High ${Math.round(
							data.main.temp_max
						)}° Low ${Math.round(data.main.temp_min)}°</span>
            <span class="curr-temp">${Math.round(data.main.temp)}°F</span>
            <span class="feels-like">Feels like ${Math.round(
							data.main.feels_like
						)}°</span>
        </div>
        <div class="icon-container">
			<img src=${getIcon(data.weather[0].main)} class="temp-icon" />
			<span class="icon-description">${data.weather[0].main}</span>
		</div>
    </div>`;
};

// const getDays = function (arr) {
// 	let dayOne = [];
// 	arr.forEach((obj, i) => {
// 		if (i === 0 || obj.dt_txt.slice(8, 10) === arr[i - 1].dt_txt.slice(8, 10)) {
// 			dayArr.push(obj);
// 		} else {
// 			forcastArr.push();
// 		}
// 	});
// };

const getIcon = function (str) {
	const string = str.toLowerCase();
	if (string.includes("cloud")) return cloudIcon;
	if (string.includes("rain")) return rainIcon;
	if (string.includes("storm")) return stormIcon;
	if (string.includes("snow")) return snowIcon;
	return sunIcon;
};

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

const fiveDayDisplay = function (data) {
	console.log(data);
	const forcastArr = [
		data.list.slice(1, 9),
		data.list.slice(9, 17),
		data.list.slice(17, 25),
		data.list.slice(25, 33),
		data.list.slice(33),
	];
	display.classList.add("five-day");
	display.innerHTML = `<h1>${data.city.name}</h1>`;
	for (let i = 0; i < 5; i++) {
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

const formatDate = function (data) {
	const date = data.dt_txt.slice(0, 10);
	const year = date.slice(0, 4);
	const month = date.slice(5, 7);
	const day = date.slice(8, 10);
	return `${month}/${day}/${year}`;
};
const getLocalWeather = async function (position, type) {
	try {
		const { latitude } = position.coords;
		const { longitude } = position.coords;
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/${type}?lat=${latitude}&lon=${longitude}&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
			{ mode: "cors" }
		);
		const data = await response.json();

		type === "weather" ? oneDayDisplay(data) : fiveDayDisplay(data);
	} catch (error) {
		console.log(error);
	}
	display.classList.remove("loading");
};

const getUSWeather = async function (location, type, state) {
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/${type}?q=${location},${state},US&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
			{ mode: "cors" }
		);
		const data = await response.json();
		console.log(data);
	} catch (error) {
		console.log(error);
	}
};

const getIntWeather = async function (location, type, country) {
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/${type}?q=${location},${country}&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
			{ mode: "cors" }
		);
		const data = await response.json();
		console.log(data);
	} catch (error) {
		console.log(error);
	}
};

const init = function (type) {
	display.classList.add("loading");
	display.innerHTML = "<p>Loading ...</p>";
	navigator.geolocation.getCurrentPosition(
		(pos) => getLocalWeather(pos, type),
		(err) => {
			console.log(err);
		}
	);
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
		if (e.target.textContent === "Today") {
			init("weather");
		} else {
			init("forecast");
		}
	});
});

form.addEventListener("submit", (e) => {
	e.preventDefault();
	console.log(search.value);
});

init("weather");
getUSWeather("chicago", "weather", "IL");
getIntWeather("london", "weather");

//////////// Check List
// - add loading icon/display img
// - add search function
// - tweek input to only allow city, zip, or city & state
