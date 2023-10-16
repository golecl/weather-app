import { clearPredictions, search, selectCity, updateSearchQuery, handleInputChange } from './search.js';
import { getFiveDayCityForecast } from './weather.js';

let map;
var selectedLocation;
let marker;

async function loadGoogleMapsAPI() {
    const script = document.createElement('script');
    script.src = `/getMap/`;
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}

async function findClosestCity(selectedLocation) {
    if (selectedLocation.length < 2) {
        return;
    }

    const selectedLat = selectedLocation.lat;
    const selectedLng = selectedLocation.lng;

    try {
        const response = await fetch(`/getCity/${selectedLat}/${selectedLng}`);
        const data = await response.json();
        console.log(data)
        if (data.results.length > 0) {
            data.results[0].address_components.forEach(function (element) {
                if (element.types[0] == 'locality' && element.types[1] == 'political') {
                    console.log('City:')
                    console.log(element.long_name);
                    selectedLocation.lat = data.results[0].geometry.location.lat;
                    selectedLocation.lng = data.results[0].geometry.location.lng;
                }
                if (element.types[0] == 'country' && element.types[1] == 'political') {
                    console.log('Country:')
                    console.log(element.long_name);
                }
            });
            return data.results[0];
        }
    } catch (error) {
        console.error(error);
    }
}

window.initMap = async function () {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 1,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        clickableIcons: false,
        mapId: "e60f79603853719",
    });

    map.addListener('click', async (event) => {
        selectedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };

        if (marker) {
            marker.setMap(null);
        }

        marker = new google.maps.Marker({
            position: selectedLocation,
            map: map,
            title: 'selected Location',
        });
        var city = await findClosestCity(selectedLocation);
        console.log(city)
        await runSearch(city)
    });

};

await loadGoogleMapsAPI();
const app = new Vue({
    el: '#app',
    data: {
        city: '',
        predictions: [],
        hasInput: false,
        selectedLocation: [],
        mapInstance: null,
        isMapViewOpen: false,
        combinedData: [],
        isMapViewOpen: false,
        packingSummary: {},
    },
    methods: {
        search: search,
        updateSearchQuery: updateSearchQuery,
        selectCity: selectCity,
        clearPredictions: clearPredictions,
        handleInputChange: handleInputChange,
        getFiveDayCityForecast: getFiveDayCityForecast,
        findClosestCity: findClosestCity,
        runSearch: async function (city) {
            this.predictions = [];
            this.selectedLocation = await this.selectCity(city);
            this.city = this.selectedLocation[2];
            this.combinedData = await this.getFiveDayCityForecast(this.selectedLocation[0], this.selectedLocation[1]);
            this.calculatePackingSummary();
        },
        openMapView() {
            this.isMapViewOpen = !this.isMapViewOpen;

            const mapElement = document.getElementById('map');

            if (mapElement) {
                mapElement.style.display = this.isMapViewOpen ? 'block' : 'none';
            }
        },
        calculatePackingSummary() {
            let coldWeatherDays = 0;
            let mildWeatherDays = 0;
            let hotWeatherDays = 0;

            for (const forecast of this.combinedData) {

                if (forecast.weatherType === "Cold") {
                    coldWeatherDays++;
                } else if (forecast.weatherType === "Mild") {
                    mildWeatherDays++;
                } else if (forecast.weatherType === "Hot") {
                    hotWeatherDays++;
                }
            }

            const umbrellaNeeded = this.combinedData.some((forecast) => forecast.itRains);
            const maskCount = this.combinedData.filter((forecast) => forecast.needMask).length;

            this.packingSummary = {
                coldWeatherDays,
                mildWeatherDays,
                hotWeatherDays,
                umbrellaNeeded,
                maskCount,
            };
        },

        selectTopPrediction() {
            if (this.predictions.length > 0) {
                const topPrediction = this.predictions[0];
                this.runSearch(topPrediction);
            }
        },

    },
});

window.runSearch = async function (city) {
    app.runSearch(city);
};