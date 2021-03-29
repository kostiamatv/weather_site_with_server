const API_KEY = "c14ee76cfde0efbba2b3800719d0b7bc"
const DEFAULT_COORDS = new Object()
DEFAULT_COORDS.lat = 41.6459
DEFAULT_COORDS.lon = -88.6217

function loadCityDataByName(city, onSuccess){
	var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
	return loadCityDataByUrl(url, onSuccess)
}

function loadCityDataById(cityId, onSuccess){
	var url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${API_KEY}&units=metric`
	return loadCityDataByUrl(url, onSuccess)
}

function loadCityDataByCoords(latitude, longitude, onSuccess){
	var url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
	return loadCityDataByUrl(url, onSuccess)
}

function loadCityDataByUrl(url, onSuccess){
	var xhr = new XMLHttpRequest()
	xhr.open('GET', url)
	xhr.onload = function() {
		onSuccess(JSON.parse(xhr.response), xhr.status)
	}
	xhr.onerror = function() {
		onSuccess(null, 123)
	}
	xhr.send(null)
}

function convertWind(wind){
	var speed = ` ${wind.speed} м/с`
	if (wind.deg > 337.5) return `N ${speed}`
    if (wind.deg> 292.5) return `NW ${speed}`
    if (wind.deg > 247.5) return `W ${speed}`
    if (wind.deg > 202.5) return `SW ${speed}`
    if (wind.deg > 157.5) return `S ${speed}`
    if (wind.deg> 122.5) return `SE ${speed}`
    if (wind.deg > 67.5) return `E ${speed}`
    if (wind.deg > 22.5) return `NE ${speed}`
    return `N ${speed}`
}


function createFavoriteCity(list){
	let template = document.getElementsByClassName("favorite_city_template")[0]
	let newFavoriteCity = template.content.cloneNode(true).childNodes[1]
	list.appendChild(newFavoriteCity)
	return newFavoriteCity
}

function fillFavoriteCity(weatherState, newFavoriteCity){
	
	let cityId = weatherState.id
	newFavoriteCity.id = cityId
	newFavoriteCity.getElementsByClassName("remove_button")[0].addEventListener("click", function(){
		document.getElementsByClassName("favorite_cities")[0].removeChild(newFavoriteCity)
		removeCityFromStorage(cityId)
	})
	newFavoriteCity.querySelector('#favorite_city_name').textContent = weatherState.name
	newFavoriteCity.querySelector('#favorite_city_temperature').textContent = Math.round(weatherState.main.temp) + "°C"
	newFavoriteCity.querySelector('#wind').textContent = convertWind(weatherState.wind)
	newFavoriteCity.querySelector('#cloudiness').textContent = weatherState.clouds.all + "%"
	newFavoriteCity.querySelector('#pressure').textContent = weatherState.main.pressure + " hPa"
	newFavoriteCity.querySelector('#humidity').textContent = weatherState.main.humidity + "%"
	newFavoriteCity.querySelector('#coords').textContent = `[${weatherState.coord.lat}, ${weatherState.coord.lon}]`
	
	newFavoriteCity.querySelector('#weather_icon').src = `https://openweathermap.org/img/wn/${weatherState.weather[0].icon}.png`
}


function fillMainCity(weatherState){
	var mainCity = document.getElementsByClassName("current_location")[0]

	mainCity.querySelector('.main_city_name').textContent = weatherState.name
	mainCity.querySelector('.temperature').textContent = Math.round(weatherState.main.temp) + "°C"
	mainCity.querySelector('.wind').textContent = convertWind(weatherState.wind)
	mainCity.querySelector('.cloudiness').textContent = weatherState.clouds.all + "%"
	mainCity.querySelector('.pressure').textContent = weatherState.main.pressure + " hPa"
	mainCity.querySelector('.humidity').textContent = weatherState.main.humidity + "%"
	mainCity.querySelector('.coords').textContent = `[${weatherState.coord.lat}, ${weatherState.coord.lon}]`
	
	mainCity.querySelector('.weather_icon').src = `https://openweathermap.org/img/wn/${weatherState.weather[0].icon}@4x.png`
}


function getCitiesFromStorage(){
	if (localStorage.favorite_cities === undefined || localStorage.favorite_cities === ""){
		return []
	}
	return JSON.parse(localStorage.favorite_cities)
}

function saveCitiesToStorage(cities){
	localStorage.setItem("favorite_cities", JSON.stringify(cities))
}

function addCityToStorage(city){
	cities = getCitiesFromStorage()
	cities.push(city)
	saveCitiesToStorage(cities)
}

function removeCityFromStorage(city){
	cities = getCitiesFromStorage()
	index = cities.indexOf(city)
	cities.splice(index, 1)
	saveCitiesToStorage(cities)
}

function addCity(city){
	if (city.trim() === ""){
		return
	}
	var newFavoriteCity = createFavoriteCity(document.getElementsByClassName("favorite_cities")[0])
	loadCityDataByName(city, (cityResponse, status) => {
		if(status != 200){
				document.getElementsByClassName("favorite_cities")[0].removeChild(newFavoriteCity)
				alert("При обращении к API возникла ошибка, может быть такой город не существует.")
				return
			}
		if (getCitiesFromStorage().includes(cityResponse.id)) {
			document.getElementsByClassName("favorite_cities")[0].removeChild(newFavoriteCity)
			alert(`${city} уже есть`)
		} else {
			fillFavoriteCity(cityResponse, newFavoriteCity)
			addCityToStorage(cityResponse.id)
		}
	})
}

function resetMainCity(){
	var mainCity = document.getElementsByClassName("current_location")[0]
	var cityName = mainCity.querySelector('.main_city_name').textContent
	mainCity.querySelector('.main_city_name').textContent = "??????"
	mainCity.querySelector('.temperature').textContent = "???°C"
	mainCity.querySelector('.wind').textContent = "???????????"
	mainCity.querySelector('.cloudiness').textContent = "???????????%"
	mainCity.querySelector('.pressure').textContent = "??????????? hPa"
	mainCity.querySelector('.humidity').textContent = "???????????%"
	mainCity.querySelector('.coords').textContent = `[???????????, ???????????]`
	mainCity.querySelector('.weather_icon').src = `./images/tmp_icon.png`

	loadCityDataByName(cityName, cityResponse => {
		fillMainCity(cityResponse)
	})
}



function updateLocation(){
	navigator.geolocation.getCurrentPosition(
		pos => {
			loadCityDataByCoords(pos.coords.latitude, pos.coords.longitude, cityResponse => {
				fillMainCity(cityResponse)
			})	
		},
		pos => {
			loadCityDataByCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, cityResponse => {
				fillMainCity(cityResponse)
			})
		}
	)
}

window.onload = function(){ 
	document.getElementsByClassName("add_city")[0].addEventListener('submit', event => {
        event.preventDefault()
    })

	document.getElementsByClassName("add_button")[0].addEventListener("click", function(){
		addCity(document.getElementsByClassName("new_city")[0].value)
		document.getElementsByClassName("new_city")[0].value = ""
	})

	updateLocation()
	
	document.getElementsByClassName("update_location")[0].addEventListener("click", function(){
		var mainCity = document.getElementsByClassName("current_location")[0]
		resetMainCity()
	})
	

	let cities = getCitiesFromStorage()
	for (var cityId of cities){

		let newFavoriteCity = createFavoriteCity(document.getElementsByClassName("favorite_cities")[0])
		loadCityDataById(cityId, cityResponse => {
			fillFavoriteCity(cityResponse, newFavoriteCity)
		})
	}
}

window.addEventListener('offline', function(){
	alert("Соединение потеряно. Перезагрузите страницу")
	document.getElementsByClassName("add_button")[0].disabled = true
	document.getElementsByClassName("update_location")[0].disabled = true
})