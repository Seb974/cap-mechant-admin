import React from 'react';
import Field from '../forms/Field';
import Map from '../map/Map';

const initialPosition = [-21.329519, 55.471617];
const initialInformations = { phone: '', address: '', address2: '', zipcode: '', city: '', position: initialPosition};

const AddressPanel = ({ informations, onInformationsChange, onPositionChange, errors }) => {

    const onChange = ({ currentTarget }) => {
        onInformationsChange({...informations, [currentTarget.name]: currentTarget.value});
    };

    const updatePosition = suggestion => {
        const { lat, lng } = suggestion.latlng;
        const zipcode = JSON.stringify([lat, lng]) !== JSON.stringify(informations.position) ? suggestion.postcodes[0] : '';
        const city = JSON.stringify([lat, lng]) !== JSON.stringify(informations.position) ? suggestion.city : '';
        const address = JSON.stringify([lat, lng]) !== JSON.stringify(informations.position) ? suggestion.value : '';
        onPositionChange({position: [lat, lng], address, zipcode, city});
    };

    return (
        <>
            <Map informations={ informations } updatePosition={ updatePosition } initialPosition={ initialPosition }/>
            <div className="row">
                <div className="col-md-12">
                    <Field
                        name="address2"
                        label=" "
                        value={ informations.address2 }
                        onChange={ onChange }
                        placeholder="N° d'appart, digicode..."
                        error={ errors.address2 }
                    />
                </div>
            </div>
            <div className="row mb-5">
                <div className="col-md-6">
                    <Field 
                        name="zipcode"
                        label=" "
                        value={ informations.zipcode }
                        onChange={ onChange }
                        placeholder="Code postal"
                        error={ errors.zipcode }
                    />
                </div>
                <div className="col-md-6">
                    <Field
                        name="city"
                        label=" "
                        value={ informations.city }
                        onChange={ onChange }
                        placeholder="Ville"
                        error={ errors.city }
                    />
                </div>
            </div>
        </>
    );
}

AddressPanel.getInitialPosition = () => {
    return initialPosition;
}

AddressPanel.getInitialInformations = () => {
    return initialInformations;
}
 
export default AddressPanel;