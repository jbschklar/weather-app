import "./style.css";
import { lightFormat } from "date-fns";

const sunIcon = "/sun.png";

const oneDayDisplay = function (data) {
	const display = document.querySelector(".display-container");
	display.innerHTML = `<h1>${data.name}</h1>
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

const getLocalWeather = async function (position) {
	try {
		const { latitude } = position.coords;
		const { longitude } = position.coords;
		const today = "weather";
		const fiveDay = "forcast";
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/${today}?lat=${latitude}&lon=${longitude}&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
			{ mode: "cors" }
		);
		const data = await response.json();
		console.log(
			data.name,
			data.main.temp,
			data.weather[0].main,
			data.weather[0].description,
			data.main.temp_min,
			data.main.temp_max
		);
		oneDayDisplay(data);
	} catch (error) {
		console.log(error);
	}
};
const init = function () {
	navigator.geolocation.getCurrentPosition(getLocalWeather, (err) => {
		console.log(err);
	});
};

init();
