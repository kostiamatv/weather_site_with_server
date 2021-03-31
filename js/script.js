const URL = "http://localhost:3000"
const DEFAULT_COORDS = new Object()
DEFAULT_COORDS.lat = 41.6459
DEFAULT_COORDS.lon = -88.6217

function loadCityDataByName(city, onLoad){
	var url = `${URL}/weather/city?q=${city}`
	return loadCityDataByUrl(url, onLoad)
}


function loadCityDataByCoords(latitude, longitude, onLoad){
	var url = `${URL}/weather/coordinates?lat=${latitude}&lon=${longitude}`
	return loadCityDataByUrl(url, onLoad)
}

function loadCityDataByUrl(url, onLoad){
	var xhr = new XMLHttpRequest()
	xhr.open('GET', url)
	xhr.onload = function(){onLoad(xhr.status, JSON.parse(xhr.response))}
	xhr.onerror = function() {
		onLoad(400, JSON.parse('{"message": "When using API an error occured."'))
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

	newFavoriteCity.name = weatherState.name
	newFavoriteCity.getElementsByClassName("remove_button")[0].addEventListener("click", function(){
		removeCityFromStorage(newFavoriteCity.name, (status, response) => {
			if(status != 200){
				alert(response.message)
				return
			}
			else{
				document.getElementsByClassName("favorite_cities")[0].removeChild(newFavoriteCity)
			}
		})
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


function fillFavoriteCities(cities){
	for (var city of cities){
		let newFavoriteCity = createFavoriteCity(document.getElementsByClassName("favorite_cities")[0])
		loadCityDataByName(city.name, (status, cityResponse) => {
			fillFavoriteCity(cityResponse, newFavoriteCity)
		})
	}
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
	var xhr = new XMLHttpRequest()
	xhr.open('GET', `${URL}/favorites`)
	xhr.onload = function() {
		if (xhr.status == 200){
			fillFavoriteCities(JSON.parse(xhr.response))
		}
	}
	xhr.send(null)
}

function addCityToStorage(city, onLoad){
	var xhr = new XMLHttpRequest()
	xhr.open('POST', `${URL}/favorites?q=${city}`)
	xhr.onload = function(){onLoad(xhr.status, JSON.parse(xhr.response))}
	xhr.send(null)
}

function removeCityFromStorage(city, onLoad){
	var xhr = new XMLHttpRequest()
	xhr.open('DELETE', `${URL}/favorites?q=${city}`)
	xhr.onload = function(){onLoad(xhr.status, JSON.parse(xhr.response))}
	xhr.send(null)
}

function addCity(city){
	if (city.trim() === ""){
		return
	}
	var newFavoriteCity = createFavoriteCity(document.getElementsByClassName("favorite_cities")[0])
	addCityToStorage(city, (status, response) => {
		if(status != 200){
				document.getElementsByClassName("favorite_cities")[0].removeChild(newFavoriteCity)
				alert(response.message)
				return
			}
		loadCityDataByName(city, (loadStatus, cityResponse) => {
			if (loadStatus != 200){
				document.getElementsByClassName("favorite_cities")[0].removeChild(newFavoriteCity)
				alert(cityResponse.message)
				return
			}
			fillFavoriteCity(cityResponse, newFavoriteCity)
		})
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

	loadCityDataByName(cityName, (status, cityResponse) => {
		fillMainCity(cityResponse)
	})
}



function updateLocation(){
	navigator.geolocation.getCurrentPosition(
		pos => {
			loadCityDataByCoords(pos.coords.latitude, pos.coords.longitude, (status, cityResponse) => {
				fillMainCity(cityResponse)
			})	
		},
		pos => {
			loadCityDataByCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, (status, cityResponse) => {
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
	

	getCitiesFromStorage()
	
}

window.addEventListener('offline', function(){
	alert("Connection lost. Please refresh the page.")
	document.getElementsByClassName("add_button")[0].disabled = true
	document.getElementsByClassName("update_location")[0].disabled = true
	for (var removeButton of document.getElementsByClassName("remove_button")){
		removeButton.disabled = true
	}
})