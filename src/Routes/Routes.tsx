import { Redirect, Switch, useLocation } from 'react-router-dom';

import { Home, Login, Logout } from '../Pages/pages';
import Route from './Route';

const Routes = (): React.ReactElement => {
    useLocation();
    return (
        <Switch>
            <Route authorized component={Home} exact path="/home" />
            <Route
                authorized
                component={Home}
                exact
                path="/store"
                permission="UPDATE-STORE"
            />
            <Route authorized component={Home} exact path="/about/:id" />
            <Route authorized component={Home} exact path="/about/:id/:idd" />
            <Route
                authorized
                component={Home}
                exact
                path="/own"
                permission="ACCESS-INMALVIEW2"
            />
            <Route authorized component={Logout} exact path="/logout" />
            <Route component={Login} exact path="/" />
            <Route component={Logout} exact path="/logout" />
            {/* <Route component={Forgot} exact path="/forgot" /> */}
            {/* <Route component={Reset} path="/reset/:hash?" /> */}
            {/* <Route component={SignUp} path="/signup/:hash?" /> */}

            <Route authorized exact path="/404" render={() => <div>404</div>} />
            <Route authorized exact path="/403" render={() => <div>403</div>} />

            <Route render={() => <Redirect to="/404" />} />
        </Switch>
    );
};

export default Routes;
