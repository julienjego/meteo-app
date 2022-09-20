let long, lat, city, cityDep, time, temp, wind, windDir, wCode, cityButtons;
let arrLong = [];
let arrLat = [];
let arrCity = [];
let arrCityDep = [];

const searchBox = document.querySelector("input");
const searchButton = document.querySelector("#searchButton");
const geoButton = document.querySelector("#geoButton");
const labelCity = document.querySelector("#labelCity");
const labelTime = document.querySelector("#labelTime");
const labelTemp = document.querySelector("#labelTemp");
const labelWind = document.querySelector("#labelWind");
const labelWindDir = document.querySelector("#labelWindDir");
const labelWcode = document.querySelector("#labelWcode");
const cityList = document.querySelector("#cityList");
const alertBox = document.querySelector("#alertBox");

searchButton.addEventListener("click", doSearch, false);
geoButton.addEventListener("click", doGeoSearch, false);
alertBox.hidden = true;

let nbFormat = new Intl.NumberFormat("fr-FR");

searchBox.onkeydown = function (e) {
  e = e || window.event;
  if (e.which == 13 || e.keyCode == 13) {
    doSearch();
  }
};

function doSearch() {
  cityList.innerHTML = "";
  let cityName;
  if (searchBox.value.length < 2) {
    alertBox.hidden = false;
  } else {
    cityName = searchBox.value;
    let searchUrl = `https://geo.api.gouv.fr/communes?nom=${cityName}&fields=code,nom,departement,centre&boost=population&limit=10`;
    fetch(searchUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          alertBox.hidden = false;
        } else if (data.length === 1) {
          alertBox.hidden = true;
          long = data[0].centre.coordinates[0];
          lat = data[0].centre.coordinates[1];
          city = data[0].nom;
          cityDep = data[0].departement.nom;
          getWeather();
        } else {
          alertBox.hidden = true;
          cityList.innerHTML =
            "<p class='fw-light'>Seuls les 10 premiers résultats sont affichés :</p>";
          let i = 0;
          for (let d of data) {
            arrLong[i] = data[i].centre.coordinates[0];
            arrLat[i] = data[i].centre.coordinates[1];
            arrCity[i] = data[i].nom;
            arrCityDep[i] = data[i].departement.nom;
            cityList.innerHTML += `<button type="button" class="btn btn-info text-nowrap m-1 cityButton" id ="button${i}">${d.nom} (${arrCityDep[i]})</button>`;
            i += 1;
          }
          cityButtons = document.querySelectorAll(".cityButton");
          cityButtons.forEach((cityButton) => {
            cityButton.addEventListener("click", selectCity, false);
          });
        }
      });
  }
}

function doGeoSearch() {
  navigator.geolocation.getCurrentPosition((position) => {
    long = position.coords.longitude;
    lat = position.coords.latitude;
    city = "Votre position";
    getWeather();
  });

  //TODO finir la géoloc
}

function selectCity(event) {
  event.target.style.opacity = 0.7;
  let cityId = event.target.id.substring(6);
  long = arrLong[cityId];
  lat = arrLat[cityId];
  city = arrCity[cityId];
  getWeather();
}

function getWeather() {
  let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
  fetch(weatherUrl)
    .then((response) => response.json())
    .then((data) => {
      time = data.current_weather.time.substring(11).replace(":", "h");
      temp = data.current_weather.temperature;
      wind = data.current_weather.windspeed;
      windDir = data.current_weather.winddirection;
      wCode = data.current_weather.weathercode;
    })
    .then(showResults);
}

function showResults() {
  labelCity.innerHTML = city;
  labelTemp.innerHTML = nbFormat.format(temp) + "°C";
  labelWind.innerHTML = nbFormat.format(wind) + " km/h";
  labelWindDir.innerHTML = "Direction du vent : " + getWindDirection(windDir);
  labelTime.innerHTML = "<em>(mise à jour : " + time + ")</em>";
  fetch("./misc/weathercode.json")
    .then((response) => response.json())
    .then((data) => {
      for (let d of data) {
        if (d.code == wCode) {
          labelWcode.innerHTML = d.description;
        }
      }
    });
}

function getWindDirection(windDirection) {
  switch (true) {
    case windDirection >= 0 && windDirection < 22.5:
      return "N";
      break;
    case windDirection >= 22.5 && windDirection < 45:
      return "NNE";
      break;
    case windDirection >= 45 && windDirection < 67.5:
      return "NE";
      break;
    case windDirection >= 67.5 && windDirection < 90:
      return "ENE";
      break;
    case windDirection >= 90 && windDirection < 112.5:
      return "E";
      break;
    case windDirection >= 112.5 && windDirection < 135:
      return "ESE";
      break;
    case windDirection >= 135 && windDirection < 157.5:
      return "SE";
      break;
    case windDirection >= 157.5 && windDirection < 180:
      return "SSE";
      break;
    case windDirection >= 180 && windDirection < 202.5:
      return "S";
      break;
    case windDirection >= 202.5 && windDirection < 225:
      return "SS0";
      break;
    case windDirection >= 225 && windDirection < 247.5:
      return "SO";
      break;
    case windDirection >= 247.5 && windDirection < 270:
      return "OSO";
      break;
    case windDirection >= 270 && windDirection < 292.5:
      return "O";
      break;
    case windDirection >= 292.5 && windDirection < 315:
      return "ONO";
      break;
    case windDirection >= 315 && windDirection < 337.5:
      return "NO";
      break;
    case windDirection >= 337.5 && windDirection < 360:
      return "NNO";
      break;
    default:
      return "Inconnu";
  }
}
