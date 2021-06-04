import React, { useEffect, useState } from 'react';
import mapboxgl from "mapbox-gl";
import ReactMapGL, {GeolocateControl} from "react-map-gl";
import TouringActions from 'src/services/TouringActions';
import { shop } from 'src/helpers/checkout';
import { isDefined } from 'src/helpers/utils';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const TruckLocation = ({ touring, playing }) => {

    let tour = null;
    const refreshDelay = 1;     //seconds
    const apiToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const Truck = "/assets/img/icon-img/self-marker.png";
    const geolocateControlStyle= { right: 10, top: 10 };
    const [defaultView, setDefaultView] = useState({ latitude: 0, longitude: 0, zoom: 9});
    const [viewport, setViewport] = useState(defaultView);
    const [sentPosition, setSentPosition] = useState({position: shop.coordinates, lastSent: null});
    const [opering, setOpering] = useState(false);

    const onGeolocate = positionOptions => {
        const {coords, timestamp} = positionOptions;
        const { latitude, longitude } = coords;
        if (needsUpdate(timestamp) && !opering) {
            setOpering(true);
            TouringActions
                .updateTruckPosition(touring, [latitude, longitude])
                .then(response => {
                    setSentPosition({position: [latitude, longitude], lastSent: timestamp});
                    setOpering(false);
                    console.log("updated");
                    tour = setInterval(() => sendNewPosition(), 4000);
                })
                .catch(error => console.log(error));
        }
    };

    const sendNewPosition = () => {
        const positions = [
            [-21.2738, 55.4447],
            [-21.329519, 55.471617],
            [-21.2641, 55.364],
            [-21.2385, 55.332],
            [-20.8928, 55.4888],
            [-20.9174, 55.526],
            [-21.0443, 55.2291],
            [-21.0711, 55.704],
            [-20.951, 55.6487],
            [-21.1704, 55.2881],
            [-21.2677, 55.3347],
            [-21.1053, 55.2498],
            [-21.0975, 55.2406],
            [-21.2106, 55.5667],
            [-21.2355, 55.542],
            [-21.3447, 55.4843],
            [-21.3103, 55.4707],
            [-21.2743, 55.4491],
            [-21.280855, 55.450831],
            [-21.288796, 55.458421]
        ];
            const i = Math.floor(Math.random() * positions.length);
            setOpering(true);
            TouringActions
                .updateTruckPosition(touring, positions[i])
                .then(response => {
                    setSentPosition({position: positions[i], lastSent: null});
                    setOpering(false);
                })
                .catch(error => console.log(error));
    };

    const needsUpdate = (newTimestamp) => {
        return !isDefined(sentPosition.lastSent) || (newTimestamp - sentPosition.lastSent) / 1000 > refreshDelay;

    }

    return !isDefined(touring) ? <></> : (
        <ReactMapGL {...viewport} width="100vw" height="100vh" onViewportChange={setViewport} mapboxApiAccessToken={ apiToken }>
            <GeolocateControl style={ geolocateControlStyle } positionOptions={{enableHighAccuracy: true}} trackUserLocation={ true } auto onGeolocate={ onGeolocate }/>
        </ReactMapGL>
    );
}
 
export default TruckLocation;