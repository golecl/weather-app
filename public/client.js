import { clearPredictions, search, selectCity, updateSearchQuery, handleInputChange } from './search.js';
import { getFiveDayCityForecast } from './weather.js';

let map;
let clickedLocation;
let marker;

async function loadGoogleMapsAPI() {
    const script = document.createElement('script');
    script.src = `/getMap/`;
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}

window.initMap = function () {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 1,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        clickableIcons: false,
    });

    map.addListener('click', (event) => {
        clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };

        if (marker) {
            marker.setMap(null);
        }

        marker = new google.maps.Marker({
            position: clickedLocation,
            map: map,
            title: 'Clicked Location',
        });
        console.log('Latitude: ' + clickedLocation.lat);
        console.log('Longitude: ' + clickedLocation.lng);
    });
};
await loadGoogleMapsAPI();
new Vue({
    el: '#app',
    data: {
        city: '',
        predictions: [],
        hasInput: false,
        combinedData: [],
        selectedLocation: [],
        mapInstance: null,
        isMapViewOpen: false,
    },
    methods: {
        search: search,
        updateSearchQuery: updateSearchQuery,
        selectCity: selectCity,
        clearPredictions: clearPredictions,
        handleInputChange: handleInputChange,
        getFiveDayCityForecast: getFiveDayCityForecast,

        runSearch: async function (city) {
            this.selectedLocation = await selectCity(city);
            this.combinedData = await getFiveDayCityForecast(this.selectedLocation[0], this.selectedLocation[1])
        },
    },
    mounted() {
    },
});
