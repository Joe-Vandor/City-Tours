import React, { useState, useEffect } from 'react'
import AutoComplete from '../AutoComplete';
import Types, { TypesArr } from './Types';
import { NearByDiv, NearbyLi } from './PlaceElement';
import img from '../../../assets/image-not-available.png'


export default function NearByPlaces(props) {
  const { map } = props
  const [placesNearByArr, setPlacesNearByArr] = useState(/**type @Array */ [])
  const [placeToRequest, setPlaceToRequest] = useState( );
  const [typesSelectedList, setTypesSelectedList] = useState(['restaurant','museum','park','store'])

  function searchNearbyButton() {
    setPlaceToRequest(props.selected)
  }

  function search() {
    let request = {
      location: placeToRequest,
      radius: '500',
      //TYPES OF PLACES TO LOOK FOR. CURRENTLY SET TO ONLY RESTAURANTS
      type: [typesSelectedList]
    };
    //eslint-disable-next-line no-undef
    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }
  
  function callback(results, status) {
    //eslint-disable-next-line no-undef
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      setPlacesNearByArr(results)
    }
  }
  

  useEffect(() => {
    map && search();

  }, [placeToRequest,typesSelectedList])

  return (
    

    <NearByDiv>
      <Types 
      selectedList={typesSelectedList}
      setSelectedList={setTypesSelectedList}/>
      <button className = "reset-button" onClick = {searchNearbyButton}>Search Nearby</button>
      <button className = "reset-button" onClick = {props.handlePage}> My Trips</button>
      {/* <AutoComplete changeLocationSelected={setPlaceToRequest} /> */}
      <ul className='List-nearby'>
        
      { 
      Object.keys(placesNearByArr).map((place, i) => (
        i<10 &&
          <NearbyLi key={i} className="place-card">
              <button onClick={()=>props.searchResultButton(placesNearByArr[place])}>See Landmark details</button>
              <img src={placesNearByArr[place].icon} width='8%' height='3%'/>
              { placesNearByArr[place].name }
              <img src={
                placesNearByArr[place].photos!=null ? placesNearByArr[place].photos[0].getUrl() : img}
                 width='50%' alt={placesNearByArr[place].name}/>
          </NearbyLi>
      )) 
  }  
      </ul>
      
    
    </NearByDiv>
  )
}
