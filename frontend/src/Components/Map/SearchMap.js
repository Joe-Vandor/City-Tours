import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap, Marker, useLoadScript, DirectionsRenderer
  // , Autocomplete, InfoWindow, , Circle, MarkerClusterer 
} from "@react-google-maps/api";
import Places from "./Places";
import NearByPlaces from "./NearByPlaces/NearByPlaces";
import Itinerary from "./Itinerary";
import { object } from "prop-types";
import DropMenu from '../MyTrips/DropMenu'
import Landmark from "../Landmark/Landmark";
import LandmarkStatus from "../Landmark/LandmarkStatus"

// let LatLngLiteral = window.google.maps.LatLngLiteral;
// let DirectionsResult = window.google.maps.DirectionsResult;
// let MapOptions = window.google.maps.MapOptions;

export default function SearchMap(props) {

  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState()

  const [selectedPoint, setSelectedPoint] = useState();
  const [startingPoint, setStartingPoint] = useState();
  const [markerPosition, setMarkerPosition] = useState(selectedPoint);
  const [map, setMap] = useState();
  const mapRef = useRef();
  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [longitude]);
  const onLoad = useCallback((map) => (mapRef.current = map, setMap(map)), []);
  const [itineraryToRender, SetItineraryToRender] = useState(/**  type @Array */[])
  const [listOfPlacesInRoute, setListOfPlacesInRoute] = useState(/** type @Array */[])

  const API_BASE = "http://localhost:8081/";
  const API_ITINERARY = 'itineraries/'
  const API_LANDMARKS = 'landmarks/'

  const [directionsResponse, setDirectionsResponse] = React.useState(null)
  const [itineraryId, setItineraryId] = useState(null);
  const [addresses, setAddresses] = useState([]);


  const [current, setCurrent] = React.useState(null)
  const [ready, setReady] = React.useState(false)
  const [collection, setCollection] = React.useState([{
                                                      id: 1,
                                                      name: "12-1-2022"
                                                      },
                                                      {
                                                      id: 2,
                                                      name: "joe1",
                                                      },
                                                      {
                                                      id: 3,
                                                      name: "joe2"
                                                      }])

  let landmarks;
  if(ready){
      landmarks = current.map((landmark) => 
                              <div>
                              <Landmark 
                              id = {landmark.id}
                              name = {landmark.name} 
                              address = {landmark.address} 
                              type ={landmark.type}
                              pic = {landmark.pic}
                              availability = {landmark.availability}
                              />
                              
                              </div> )
  }

  let header;
  if(current != null){
  header = <div>{current}</div>
  }

  const [distance, setDistance] = React.useState('')
  const [duration, setDuration] = React.useState('')










  function sendItinerary(date, startingLandmarkId) {
    let itineraryObject = {
      date: date,
      userId: 1,
      startingLandmarkId: startingLandmarkId
    }

    console.log(itineraryId)

    if (itineraryId === null) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itineraryObject)
      };

      let returnId = fetch(API_BASE + API_ITINERARY, requestOptions)
        .then(res => res.json())
        .then(setItineraryId(returnId))
    }

    else {
      itineraryObject = {
        date: date,
        userId: null,
        startingLandmarkId: startingLandmarkId
      }

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itineraryObject)
      };

      fetch(API_BASE + API_LANDMARKS + itineraryId, requestOptions)
        .then(res => res.json())
    }
  }

  function getLandmarks(itineraryId) {
    fetch(API_BASE + API_LANDMARKS + itineraryId)
      .then(res => res.json())
      .then(landmarks => {
        setAddresses((current) => [...current, { location: landmarks.address }])
      }
      );
  }

  let start;
  let end;
  let addressArray;
  function handleAddress() {
    let lastIndex = addresses.length() - 1;
    end = addresses[lastIndex];
    start = addresses.shift();
    setAddresses(addresses.pop())
  }


  function routeHelper(list){

    if (list.length<=2){
      return {
        origin: list[0],
        destination: list[list.length-1]
      }
    }
    else{
      object = []

      for (let i=1; i<list.length-1; i++){
        object.push({location: list[i] })
      }
      
      return{
        origin: list[0],
        destination: list[list.length-1],
        waypoints: object
      }

    }
  }

  async function calculateRoute() {
    //eslint-disable-next-line no-undef
    const directionService = new google.maps.DirectionsService();
    const results = await directionService.route({
     ...routeHelper(listOfPlacesInRoute),
      //eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,

    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

  console.log(itineraryToRender)
  //Setting map to user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude);
      setLongitude(pos.coords.longitude);
    });
  })

  function panToCenter() {
    map.panTo(selectedPoint);
    setMarkerPosition(selectedPoint)
  }

  function panToStarting() {
    map.panTo(startingPoint);
    setMarkerPosition(startingPoint)
  }

  function setStartingClick() {
    setStartingPoint(selectedPoint);
    console.log(startingPoint)
  }

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDFuFtVTMN3kHm2IOr9oMW20l8HwvnhAEY",
    libraries: ['places'],
  })
 
  const [isMyTrips, setIsMyTrips] = useState(false);

  function changeMyTrips(){
    setIsMyTrips(!isMyTrips)
  }

  if (!isLoaded) return <div>Loading...</div>

  if(!isMyTrips)
  return (
    <div className="container">
      {/* <NearByPlaces map={map} /> */}
      
      <div className="controls">
        <Places
          map={map}
          handleCenterClick={panToCenter}
          handleStartingClick={panToStarting}
          setStartingPoint={setStartingClick}
          setSelectedPoint={(position) => {
            setSelectedPoint(position);
            mapRef.current?.panTo(position);
          }}
          setMarker={(position) => {
            setMarkerPosition(position);
          }
          }
          sendItinerary={
            // (date, startingLandmarkId) => (
            sendItinerary
            // (date, startingLandmarkId))
          }

          itineraryId={itineraryId}
          setList={SetItineraryToRender}
          setListToCreateRoute={setListOfPlacesInRoute}
          handlePage = {changeMyTrips}
        />
        
      </div>

      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          onLoad={onLoad}>

          <Marker position={markerPosition} />
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
        <Itinerary 
        list={itineraryToRender}
        calculateRoute={calculateRoute}
        />

      </div>
    </div>
  )
  
  return(
    <div className='trips-outer-container'>

        <div className = 'trips-header'>
            <h1>Your Routes</h1>
                {header}
                <DropMenu collection = {collection} setCurrent = {setCurrent} getLandmarks = {getLandmarks}/>
                <button onClick = {changeMyTrips}> home</button>
                
        </div>

        <div className='trips-inner-container'>
        
            <div className = 'directions-outer-container'>
                <div className = 'directions-inner-container'>
                   <p> Route distance: {distance}</p>
                  <br/>
                   <p>Route duration: {duration}</p> 
                </div>
        
                <div className = 'directions-map-container'>
                <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          onLoad={onLoad}>

          <Marker position={markerPosition} />
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
                </div>

                <div className = 'places-outer-container'>
                
                    <div className = 'places-inner-container'>
                    <ul>{itineraryToRender.map((place,key) => <li key={key}>{place}</li>)}</ul>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
    )


}