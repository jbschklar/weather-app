import "./style.css";
import { lightFormat } from "date-fns";

const sunIcon = "/sun.png";
const tabs = document.querySelectorAll(".tab");
const display = document.querySelector(".container");

const oneDayDisplay = function (data) {
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
			<img src=${sunIcon} class="temp-icon" />
			<span class="icon-description">${data.weather[0].main}</span>
		</div>
    </div>`;
};

const fiveDayDisplay = function (data) {
	display.classList.add("five-day");
	display.innerHTML = `
    <h1>${data.city.name}</h1>
				<div class="forcast day-one">
					<h2 class="forcast-date">${formatDate(data)}</h2>
					<div class="highlow-container">
						<span class="high-temp">High: ${Math.round(data.list[0].main.temp_max)}°</span>
						<span class="low-temp">Low: ${Math.round(data.list[0].main.temp_min)}°</span>
					</div>
					<div class="icon-container">
						<img src="/sun.png" class="forcast-icon" />
					</div>
				</div>
				<div class="forcast day-two">
					<h2 class="forcast-date">Tuesday</h2>
					<div class="highlow-container">
						<span class="high-temp">High: 75°</span>
						<span class="low-temp">Low: 50°</span>
					</div>
					<div class="icon-container">
						<img src="/sun.png" class="forcast-icon" />
					</div>
				</div>
				<div class="forcast day-three">
					<h2 class="forcast-date">Wednesday</h2>
					<div class="highlow-container">
						<span class="high-temp">High: 75°</span>
						<span class="low-temp">Low: 50°</span>
					</div>
					<div class="icon-container">
						<img src="/sun.png" class="forcast-icon" />
					</div>
				</div>
				<div class="forcast day-four">
					<h2 class="forcast-date">Thursday</h2>
					<div class="highlow-container">
						<span class="high-temp">High: 75°</span>
						<span class="low-temp">Low: 50°</span>
					</div>
					<div class="icon-container">
						<img src="/sun.png" class="forcast-icon" />
					</div>
				</div>
				<div class="forcast day-five">
					<h2 class="forcast-date">Friday</h2>
					<div class="highlow-container">
						<span class="high-temp">High: 75°</span>
						<span class="low-temp">Low: 50°</span>
					</div>
					<div class="icon-container">
						<img src="/sun.png" class="forcast-icon" />
					</div>
				</div>
    `;
};

const formatDate = function (data) {
	const date = data.list[0].dt_txt.slice(0, 10);
	const year = date.slice(0, 4);
	const month = date.slice(5, 7);
	const day = date.slice(8, 10);
	return `${month}/${day}/${year}`;
};
const getLocalWeather = async function (position, type) {
	try {
		const { latitude } = position.coords;
		const { longitude } = position.coords;
		const today = "weather";
		const fiveDay = "forecast";
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/${type}?lat=${latitude}&lon=${longitude}&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
			{ mode: "cors" }
		);
		const data = await response.json();

		type === "weather" ? oneDayDisplay(data) : fiveDayDisplay(data);
	} catch (error) {
		console.log(error);
	}
};
const init = function (type) {
	navigator.geolocation.getCurrentPosition(
		(pos) => getLocalWeather(pos, type),
		(err) => {
			console.log(err);
		}
	);
};

tabs.forEach((tab) => {
	tab.addEventListener("click", (e) => {
		tabs.forEach((tab) => tab.classList.toggle("selected"));
		display.innerHTML = "";
		if (e.target.textContent === "Today") {
			init("weather");
		} else {
			init("forecast");
		}
	});
});

// init();
