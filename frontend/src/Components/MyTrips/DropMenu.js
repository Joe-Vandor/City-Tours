import React, { useState } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import PropTypes from 'prop-types';

function DropMenu({collection, setCurrent, getLandmarks, ...args }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  
 


  return (
    <div className="d-flex p-5">
      <Dropdown isOpen={dropdownOpen} toggle={toggle} >
        <DropdownToggle caret>12-1-2022 </DropdownToggle>
        <DropdownMenu {...args}>
          <DropdownItem header>Your Itineraries</DropdownItem>
            {collection.map(e => {
          return <DropdownItem id={e.id} key={e.id} onClick = {() => (getLandmarks(e.id), setCurrent(e.name))}>{e.name}</DropdownItem>
        })}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}



export default DropMenu;