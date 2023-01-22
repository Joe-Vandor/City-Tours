import {Link} from 'react-router-dom'
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import {GoogleMap,
     Marker, 
     useJsApiLoader,  
     Autocomplete,
    DirectionsRenderer} from "@react-google-maps/api";
import React from 'react';
import Landmark from '../Landmark/Landmark';



const center = { lat: 40, lng: -121};

function Home(props) {
 const {isLoaded}= useJsApiLoader({
    googleMapsApiKey: ,
    libraries: ['places'],
 })

const [map, setMap] = React.useState(/**@type google.maps.Map */null)
const [directionsResponse, setDirectionsResponse] = React.useState(null)
const [distance, setDistance] = React.useState('')
const [duration, setDuration] = React.useState('')
const [waypoints, setWaypoints] = React.useState([])
const [markers, setMarkers] = React.useState([])
const [place, setplace] = React.useState([])


const startRef = React.useRef();
const endRef = React.useRef();
const waypointsRef = React.useRef();

function createWaypointRef(){
    markers.forEach(mark =>{
        setplace(
            (current) =>[...current,{location: {lat:  mark.lat, lng: mark.lng}}]
        )
    })

}


async function calculateRoute(){


    if(startRef.current.value === '' || endRef.current.value === '' ){
        return
    }
    //eslint-disable-next-line no-undef
    const directionService = new google.maps.DirectionsService();
    const results = await directionService.route({
        origin:startRef.current.value,
        destination :endRef.current.value,
        waypoints: place,
        //eslint-disable-next-line no-undef
        travelMode:google.maps.TravelMode.DRIVING,
       
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
}

 if(!isLoaded) return <div>Loading...</div>

    return(
        <div className = "home-page">
            <h1 className='home-header'>Home</h1>
            <div className='search-section'>
                <div className='outer-info-panel'>
                    <div className = "info-panel">
                        <Autocomplete>
                        
                        <input placeholder='start' className = "start-text" ref = {startRef} onClick = {(address) => console.log(address)}/>
                        </Autocomplete>
                        <Autocomplete>
                        
                        <input placeholder='middle' className = "start-text" ref = {waypointsRef}/>
                        </Autocomplete>
                        <Autocomplete>
                        <input placeholder='end' className = "start-text" ref = {endRef}/>
                        </Autocomplete>
                        <button className = "reset-button" onClick = {() => map.panTo(center)}>Center Map</button>
                    <button className = "reset-button" onClick = {calculateRoute}>Create Route</button>
                    </div>
                    <Landmark/>
                </div>
            <div className = "map-holder">
                <GoogleMap
                    zoom = {10}
                    center = {center}
                    mapContainerClassName = "map-thing" 
                    onLoad={(map) => {setMap(map)}}
                    onClick = {(event) => {
                            setMarkers( (current)=> [...current, {
                                lat: event.latLng.lat(),
                                lng: event.latLng.lng(),
                                time: new Date(),
                            },
                            ])
                            createWaypointRef();
                    }
                }
                >
                
                    {markers.map(marker => <Marker key = {marker.time.toISOString()}position = {{lat: marker.lat, lng: marker.lng}}/>)}
                    {directionsResponse && <DirectionsRenderer directions = {directionsResponse}/>}
                </GoogleMap>
        </div>
        </div>


        <div className = "map-list">

        </div>
        </div>
    )
}

export default Home;