let long;
let lat;
let city;
let time;
let temp;
let wind;
let wCode;

const searchBox = document.querySelector("input");
const searchButton = document.querySelector("#search-button");
const labelCity = document.querySelector("#labelCity");
const labelTime = document.querySelector("#labelTime");
const labelTemp = document.querySelector("#labelTemp");
const labelWind = document.querySelector("#labelWind");
const labelWcode = document.querySelector("#labelWcode");

searchButton.addEventListener("click", doSearch, false);

let nbFormat = new Intl.NumberFormat("fr-FR");

function doSearch() {
  let postalCode;
  if (searchBox.value.length == 5) {
    postalCode = searchBox.value;
    let searchUrl = `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=centre&format=json&geometry=centre`;
    fetch(searchUrl)
      .then((response) => response.json())
      .then((data) => {
        long = data[0].centre.coordinates[0];
        lat = data[0].centre.coordinates[1];
        city = data[0].nom;
      })
      .then(getweather);
  }
}

function getweather() {
  let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
  fetch(weatherUrl)
    .then((response) => response.json())
    .then((data) => {
      time = data.current_weather.time; // TODO split pour juste avoir l'heure
      temp = data.current_weather.temperature;
      wind = data.current_weather.windspeed;
      wCode = data.current_weather.weathercode;
    })
    .then(showResults);
}

function showResults() {
  labelCity.innerHTML = city;
  labelTemp.innerHTML = nbFormat.format(temp) + "°C";
  labelWind.innerHTML = nbFormat.format(wind) + " km/h";
  labelTime.innerHTML = time;
  fetch("./weathercode.json")
    .then((response) => response.json())
    .then((data) => {
      for (let d of data) {
        if (d.code == wCode) {
          labelWcode.innerHTML = d.description;
        }
      }
    });
}
