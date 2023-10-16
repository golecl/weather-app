export function search() {
    if (this.city) {
        this.selectCity(this.city);
    }
}

export function updateSearchQuery(query) {
    console.log("input detected: " + query)
    this.predictions = [];
    if (query.length > 0) {
        console.log("if client: " + `/getPlacePredictions/${query}`)
        fetch(`/getPlacePredictions/${query}`)
            .then((response) => response.json())
            .then((data) => {
                this.predictions = data.predictions;
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

export async function selectCity(city) {
    const placeId = city.place_id;
    var response = await fetch(`/getPlaceDetails/${placeId}`);
    var data = await response.json();
    const latitude = data.geometry.location.lat;
    const longitude = data.geometry.location.lng;
    
    const addressComponents = data.address_components;
    let cityName, country;
    
    for (const component of addressComponents) {
        if (component.types.includes('locality')) {
            cityName = component.long_name;
        } else if (component.types.includes('country')) {
            country = component.long_name;
        }
    }
    const placeName = `${cityName}, ${country}`;

    return [latitude, longitude, placeName];
}



export function clearPredictions() {
    this.predictions = [];
}

export function handleInputChange() {
    if (!this.city) {
        this.clearPredictions();
    }
    this.hasInput = this.city.length > 0;
}