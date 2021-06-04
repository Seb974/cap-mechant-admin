import React, { useContext, useEffect, useState } from 'react';
import { StaticMap } from 'react-map-gl'
import DeckGL, { IconLayer } from "deck.gl";
import AuthContext from 'src/contexts/AuthContext';
import destinationPoint from "./destinationPoint";      // lon, lat, distance, bearing
import { shop } from 'src/helpers/checkout';
import * as d3 from "d3";
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const TouringLocation = (props) => {

    const apiToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const Truck = "/assets/img/icon-img/self-marker.png";
    const initialLocation = shop.coordinates;
    const { currentUser, settings, selectedCatalog } = useContext(AuthContext);
    const [defaultView, setDefaultView] = useState({ latitude: 0, longitude: 0, zoom: 9});
    const [viewport, setViewport] = useState(defaultView);
    const [truck, setTruck] = useState({longitude: 55.48027, latitude: -21.065285, velocity: 83.4, bearing: 0});

    // useEffect(() => updatePosition([-21.065285, 55.48027]), []);
    // useEffect(() => updatePosition([truck.latitude, truck.longitude]), [truck]);

    useEffect(() => {
        if (isDefined(selectedCatalog) && Object.keys(selectedCatalog).length > 0 && isDefinedAndNotVoid(selectedCatalog.center)) {
            setDefaultView({ latitude: selectedCatalog.center[0], longitude: selectedCatalog.center[1], zoom: selectedCatalog.zoom});
            setViewport({
                ...viewport, 
                latitude: selectedCatalog.center[0], 
                longitude: selectedCatalog.center[1], 
                zoom: selectedCatalog.zoom
            });
        }
    }, [selectedCatalog]);

    const updatePosition = (position) => {
        const newTruck = {
            latitude: position[0], 
            longitude: position[1], 
            velocity: 83.4,
            bearing: getBearing(position[0], position[1], truck.latitude, truck.longitude),
            interpolatePos: d3.geoInterpolate([truck.longitude, truck.latitude], destinationPoint(position[1], position[0], 83.4, truck.bearing))
        }
    };

    const getBearing = (newLat, newLng, lat = initialLocation[0], lng = initialLocation[1]) => {
        const y = Math.sin(newLng-lng) * Math.cos(newLat);
        const x = Math.cos(lat)*Math.sin(newLat) - Math.sin(lat)*Math.cos(newLat)*Math.cos(newLng-lng);
        const bearing = (Math.atan2(y, x)* 180 / Math.PI + 360) % 360;
        console.log(bearing)
        return bearing;
    };

    const layers = [
        new IconLayer({
            id: "truck",
            data: truck,
            pickable: false,
            iconAtlas: Truck,
            iconMapping: {
                truck: {
                    x: 0,
                    y: 0,
                    width: 512,
                    height: 512
                }
            },
            sizeScale: 20,
            getPosition: d => [d.longitude, d.latitude],
            getIcon: d => "truck",
            getAngle: d => 45 + (d.true_track * 180) / Math.PI
        })
    ];

    
    return (
        <>
            <DeckGL initialViewState={ viewport } controller={ true } 
            layers={ layers }
            >
                <StaticMap mapboxApiAccessToken={ apiToken } />
            </DeckGL>
        </>
    );
}
 
export default TouringLocation;