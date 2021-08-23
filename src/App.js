import './scss/style.scss';
import './assets/css/input-number.css';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import DataProvider from './data/dataProvider/dataProvider';
import AdminRoute from './components/route/AdminRoute';
import PrivateRoute from './components/route/PrivateRoute';
import 'mapbox-gl/dist/mapbox-gl.css';
import './i18n';


const loading = (
    <div className="pt-3 text-center">
        <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
)

// Containers
const TheLayout = React.lazy(() => import('./containers/TheLayout'));

// Email App
const TheEmailApp = React.lazy(() => import('./views/apps/email/TheEmailApp'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const DeliveryNote = React.lazy(() => import('./views/components/deliveries/deliveryNote'));
const PackagePlan = React.lazy(() => import('./views/components/preparations/packagePlan'));

const App = () => {

    return (
        <DataProvider>
            <HashRouter>
                <React.Suspense fallback={loading}>
                    <Switch>
                        <Route exact path="/login" name="Login Page" component={ Login } />
                        <Route exact path="/register" name="Register Page" component={ Register } />
                        <Route exact path="/404" name="Page 404" component={ Page404 } />
                        <Route exact path="/500" name="Page 500" component={ Page500 } />
                        <Route path="/apps/email" name="Email App" component={ TheEmailApp } />
                        <AdminRoute path="/components/deliveries/:id" name="DeliveryNote" component={ DeliveryNote } />
                        <AdminRoute path="/components/parcels/:id" name="PackagePlan" component={ PackagePlan } />
                        <AdminRoute path="/" name="Home" component={ TheLayout } />
                    </Switch>
                </React.Suspense>
            </HashRouter>
        </DataProvider>
    );
}

export default App;
