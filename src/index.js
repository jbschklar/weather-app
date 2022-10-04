import "./style.css";

const getLocalWeather = async function (position) {
	try {
		const { latitude } = position.coords;
		const { longitude } = position.coords;
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=e548290df6fc88b40ad44f22ee99dc3f&units=imperial`,
			{ mode: "cors" }
		);
		const data = await response.json();
		console.log(data.name, data.main.temp);
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
