import { Redirect, Switch, useLocation } from 'react-router-dom';

import { Home, Login, Logout } from '../Pages/pages';
import { Route } from '../react-mos-core';

const Routes = (): React.ReactElement => {
    const { pathname, search } = useLocation();
    return (
        <>
            {localStorage.getItem('x-access-token') ? (
                <Switch>
                    <Route
                        component={Home}
                        exact
                        path="/"
                        permission="ACCESS-VIPROOM"
                    />
                    <Route
                        component={Home}
                        exact
                        path="/store"
                        permission="ACCESS-VIPROOM"
                    />
                    <Route component={Home} exact path="/about/:id" />
                    <Route component={Home} exact path="/about/:id/:idd" />
                    <Route component={Home} exact path="/own" />
                    <Route component={Logout} exact path="/logout" />
                    <Route exact path="/404" render={() => <h1>404</h1>} />
                    <Route exact path="/403" render={() => <h1>403</h1>} />
                    <Route render={() => <Redirect to="/404" />} />
                </Switch>
            ) : (
                <Switch>
                    <Route component={Login} exact path="/" />
                    {/* <Route component={Forgot} exact path="/forgot" /> */}
                    {/* <Route component={Reset} path="/reset/:hash?" /> */}
                    {/* <Route component={SignUp} path="/signup/:hash?" /> */}
                    <Route
                        render={() => (
                            <Redirect to={`/?url=${pathname + search}`} />
                        )}
                    />
                </Switch>
            )}
        </>
    );
};

export default Routes;
