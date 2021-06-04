import React, { useContext, useEffect, useState } from 'react';
import { StaticMap } from 'react-map-gl';
import mapboxgl from "mapbox-gl";
import DeckGL, { IconLayer } from "deck.gl";
import AuthContext from 'src/contexts/AuthContext';
import { shop } from 'src/helpers/checkout';
import TouringActions from 'src/services/TouringActions';
import DeliveryContext from 'src/contexts/DeliveryContext';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const TouringLocation = (props) => {

    const apiToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const Truck = "/assets/img/icon-img/truck.png";
    const initialLocation = shop.coordinates;
    const { tourings, setTourings } = useContext(DeliveryContext);
    const { currentUser, settings, selectedCatalog } = useContext(AuthContext);
    const [defaultView, setDefaultView] = useState({ latitude: initialLocation[0], longitude: initialLocation[1], zoom: 17});
    const [viewport, setViewport] = useState(defaultView);
    const [trucks, setTrucks] = useState([]);

    useEffect(() => fetchTourings(), []);

    const fetchTourings = () => {
        TouringActions
            .getProcessingTourings()
            .then(response => setTourings(response));
    };

    const layers = [
        new IconLayer({
            id: "truck",
            data: tourings,
            pickable: false,
            iconAtlas: Truck,
            iconMapping: { truck: { x: 0, y: 0, width: 512, height: 512 } },
            sizeScale: 50,
            getPosition: d => [d.position[1], d.position[0]],
            getIcon: d => "truck",
            // getAngle: d => 45 + ( * 180) / Math.PI
        })
    ];

    return (
        <>
            <DeckGL initialViewState={ viewport } controller={ true } 
            layers={ layers }
            >
                <StaticMap mapboxApiAccessToken={ apiToken } width="100vw" height="100vh"/>
            </DeckGL>
        </>
    );
}
 
export default TouringLocation;