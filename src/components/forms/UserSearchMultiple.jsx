import React, { useState } from 'react';
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup';
import { CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import UserSearch from 'src/components/forms/UserSearch';
import '../../assets/css/searchBar.css';

const UserSearchMultiple = ({ users, setUsers }) => {

    const handleDelete = e => {
        e.preventDefault();
        setUsers(users.filter(user => user.id !== parseInt(e.currentTarget.id)));
    };

    return (
        <>
            <CRow className="mt-4">
                <CCol xs="12" sm="12" md="6">
                    <UserSearch users={ users } setUsers={ setUsers }/>
                </CCol>
                <CCol xs="12" sm="12" md="6">
                    <Card >
                        <Card.Header className="text-center"><strong>Utilisateurs associés</strong></Card.Header>
                        <ListGroup variant="flush">
                            { users.length <= 0 ? 

                                <ListGroup.Item className="text-center">
                                    <small><i>Aucun utilisateur associé</i></small>
                                </ListGroup.Item>

                              : users.map(user => {
                                return (
                                    <ListGroup.Item key={ user.id } className="d-flex justify-content-between">
                                        <div>{ user.name } <small> - { user.email }</small></div>
                                        <div><a href="#" id={ user.id } onClick={ handleDelete }><CIcon name="cil-trash"/></a></div>
                                    </ListGroup.Item>
                                )})
                            }
                        </ListGroup>
                    </Card>
                </CCol>
            </CRow>
        </>
    );
}
 
export default UserSearchMultiple;