import React from 'react';
import {
    Redirect,
    Route,
    Switch,
    useLocation,
    withRouter,
} from 'react-router-dom';

import Forgot from 'pages/auth/forgot';
import Login from 'pages/auth/login';
import Reset from 'pages/auth/reset';
import Example from 'pages/example';

const Routes: React.FC = () => {
    const { pathname, search } = useLocation();

    return (
        <Switch>
            <Route component={Login} exact path="/" />
            <Route component={Forgot} exact path="/forgot" />
            <Route component={Reset} path="/reset/:hash?" />
            <Route component={Example} exact path="/example" />
            <Route
                render={() => <Redirect to={`/?url=${pathname + search}`} />}
            />
        </Switch>
    );
};

export default withRouter(Routes);
