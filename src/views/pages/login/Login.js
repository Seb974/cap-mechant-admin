import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CInputGroup, CRow } from '@coreui/react'
import AuthContext from 'src/contexts/AuthContext'
import Field from 'src/components/forms/Field'
import AuthActions from 'src/services/AuthActions'

const Login = ({ history }) => {

  const { setIsAuthenticated } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({username: '', password: ''});
    const [error, setError] = useState("");

  const handleChange = ({currentTarget}) => {
      setCredentials({...credentials, [currentTarget.name]: currentTarget.value});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    AuthActions.authenticate(credentials)
               .then(response => {
                   setError("");
                   setIsAuthenticated(true);
                   history.push('/');
                })
               .catch(error => {
                   console.log(error);
                   setError("Paramètres de connexion invalides")
                });
}

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="8">
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={ handleSubmit }>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <Field
                          name="username"
                          label=" "
                          value={ credentials.username }
                          onChange={ handleChange }
                          placeholder="Adresse email de connexion"
                          type="email"
                          error={error}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <Field
                          name="password"
                          label=" "
                          value={ credentials.password }
                          onChange={ handleChange }
                          type="password"
                          placeholder="Mot de passe"
                      />
                    </CInputGroup>
                    <CRow>
                        <CCol xs="6">
                          <CButton type="submit" color="primary" className="px-4">Se connecter</CButton>
                        </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua.</p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>Register Now!</CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
