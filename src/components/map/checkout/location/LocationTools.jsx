import React from 'react';
import LocationMarker from './tools/LocationMarker';
import LocationPopup from './tools/LocationPopup';
import LocationTooltip from './tools/LocationTooltip';

const LocationTools = ({ informations, locationTooltip, locationPopup, isRelaypoint, setLocationTooltip, setLocationPopup, setViewport, setIsRelaypoint, onClear, updatePosition }) => {
    return (
        <>
            <LocationMarker
                position={ informations.position } 
                informations={ informations } 
                isRelaypoint={ isRelaypoint } 
                setTooltip={ setLocationTooltip } 
                setPopup={ setLocationPopup }
            />
            <LocationTooltip 
                location={ locationTooltip } 
                informations={ informations } 
                isRelaypoint={ isRelaypoint }
            />
            <LocationPopup
                location={ locationPopup } 
                informations={ informations } 
                setViewport={ setViewport } 
                setPopup={ setLocationPopup } 
                onClear={ onClear } 
                setIsRelaypoint={ setIsRelaypoint } 
                isRelaypoint={ isRelaypoint } 
                updatePosition={ updatePosition } 
            />
        </>
    );
}
 
export default LocationTools;