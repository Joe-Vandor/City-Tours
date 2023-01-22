import usePlacesAutocomplete, { getGeocode, getLatLng, getDetails } from "use-places-autocomplete"
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox'
import "@reach/combobox/styles.css"
import Landmark from "../Landmark/Landmark";
import { useState } from "react";
import ToggleSwitch from '../ToggleSwitch/ToggleSwtich';
import DatePicker from "react-datepicker"
import NearByPlaces from "./NearByPlaces/NearByPlaces";
import LandmarkStatus from "../Landmark/LandmarkStatus"

export default function Places(props) {
  const [landmarkName, setLandmarkName] = useState();
  const [landmarkType, setLandmarkType] = useState();
  const [landmarkAddress, setlandmarkAddress] = useState();
  const [landmarkPic, setLandmarkPic] = useState();
  const [landmarkDescription, setLandmarkDescription] = useState();
  const [landmarkAvailability, setLandmarkAvailability] = useState();
  const [selectedValue, setSelectedValue] = useState();

  const [date, setDate] = useState(new Date());


  const [currentItin, setCurrentItin] = useState(null)
  const [landmarkId, setLandmarkId] = useState(null)
  const [renderLandmark, setRenderLandmark] = useState(false)
  const API_BASE = "http://localhost:8081/";
  const API_LANDMARKS = 'landmarks/'
  const API_ADDLANDMARK = 'addLandmark'
  const API_ITINERARY = 'itineraries/'


  //does put or post depending on if it existsx
   function sendLandmark() {
    let landmarkObject;
    if (landmarkId === null) {
      landmarkObject = {
        image: "image.img",
        landmarkName: landmarkName,
        address: landmarkAddress,
        type: landmarkType,
        description: "a place",
        availability: null,
      }
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landmarkObject)
      };

      let returnId = fetch(API_BASE + API_LANDMARKS, requestOptions)
        .then(res => res.json())
        .then(setLandmarkId(returnId))

        console.log(landmarkId)
    }

    else {
      landmarkObject = {
        landmarkId: landmarkId,
        image: landmarkPic,
        landmarkName: landmarkName,
        address: landmarkAddress,
        type: landmarkType,
        description: landmarkDescription,
        availability: null,
      }

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landmarkObject)
      };

      fetch(API_BASE + API_LANDMARKS + landmarkId, requestOptions)
        .then(res => res.json())
    }
  }

  function addLandmarkToItinerary(itineraryId) {
    let landmarkToItin = {
      itineraryId: itineraryId,
      landmarkId: landmarkId
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(landmarkToItin)
    };

    fetch(API_BASE + API_ITINERARY + API_ADDLANDMARK, requestOptions)
      .then(res => res.json())
  }




  function getLandmarks(itineraryId) {
    fetch(API_BASE + "/itinerary/" + itineraryId)
      .then(res => res.json())
      .then(landmarks => {
        setCurrentItin(landmarks);
        setRenderLandmark(true);

      }
      );
  }

  let landmarks;
  if (renderLandmark) {
    landmarks = currentItin.map((landmark) =>
      <div>
        <Landmark
          id={landmark.id}
          name={landmark.name}
          address={landmark.address}
          type={landmark.type}
          pic={landmark.pic}
          availability={landmark.availability}
        />
        <LandmarkStatus id={landmark.id} />
      </div>)
  }


  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions
  } = usePlacesAutocomplete();


  const handleSelect = async (value) => {
    setValue(value, false);
    clearSuggestions();

    const results = await getGeocode({ address: value });
    const { lat, lng } = await getLatLng(results[0]);
    props.setSelectedPoint({ lat, lng });
    props.setMarker({ lat, lng });
    submit();
    setSelectedValue({ lat, lng });
  }

  const submit = () => {
    const parameter = {
      placeId: data[0].place_id,
      fields: ["name", "types", "formatted_address", "opening_hours", "photos"],
    };

    getDetails(parameter)
      .then((details) => {
        setLandmarkName(details.name)
        setlandmarkAddress(details.formatted_address)
        setLandmarkType(details.types.join(", "))
        setLandmarkAvailability(details.opening_hours.weekday_text.join(", "))
        setLandmarkPic(details.photos[0].getUrl())
        console.log("Details", details)
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  function searchResultButton(place) {
    const parameter = {
      placeId: place.place_id,
      fields: ["name", "types", "formatted_address", "opening_hours", "photos"],
    };
    getDetails(parameter)
      .then((details) => {
        setLandmarkName(details.name)
        setlandmarkAddress(details.formatted_address)
        setLandmarkType(details.types.join(", "))
        setLandmarkAvailability(details.opening_hours.weekday_text.join(", "))
        setLandmarkPic(details.photos[0].getUrl())
      })
  }

  async function handleStartingPoint() {
    await sendLandmark()
    await (props.sendItinerary(date, landmarkId))
    await (addLandmarkToItinerary(props.itineraryId))
  }

  return (
    <div className = "places-container">
      
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={!ready}
          className="combobox-input"
          placeholder="Enter Search Here"
        />
        
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ place_id, description }) => (
                <ComboboxOption key={place_id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
      
      <div className="searchButtonsBox">
        
        <NearByPlaces handlePage = {props.handlePage} selected={selectedValue} map={props.map} searchResultButton={searchResultButton} />
        
        <div className = "landmark-thingy">
          {/* <button className="reset-button" onClick={props.handleCenterClick}>Center Map</button>
          <button className="reset-button" onClick={handleStartingPoint}>Set As Starting Point</button>
          <button className="reset-button" onClick={props.handleStartingClick}>Starting Point</button> */}

          
          
            
         

          {landmarkName && <Landmark
            name={landmarkName}
            address={landmarkAddress}
            type={landmarkType}
            pic={landmarkPic}
            availability={landmarkAvailability}
            setList={props.setList}
            setListToCreateRoute={props.setListToCreateRoute}
          />}
          <DatePicker selected={date} onChange={date => setDate(date)} />
        </div>
      </div>
    </div>
  )
}