import { mosAuthenticated, mosPermission } from 'react-mos-core/mosApi';
import {
    Redirect,
    Route,
    RouteProps,
    Switch,
    useLocation,
} from 'react-router-dom';

import { Home, Login, Logout, Lost1, Lost2, Lost3 } from 'Pages/pages';

const PrivateRoute: React.FC<RouteProps & { permission: string }> = ({
    permission: value,
    ...rest
}) => (mosPermission(value) ? <Route {...rest} /> : <Redirect to="/403" />);

const Routes = (): React.ReactElement => {
    const { pathname, search } = useLocation();
    return (
        <>
            {mosPermission('ACCESS-VIPROOM') && (
                <Switch>
                    <Route component={Home} exact path="/own2" />
                    <Route component={Home} exact path="/own3" />
                    <Route component={Home} exact path="/own4" />
                </Switch>
            )}
            {mosAuthenticated() ? (
                <Switch>
                    <Route component={Home} exact path="/" />
                    <PrivateRoute
                        component={Lost3}
                        exact
                        path="/lost-found/form/:id?"
                        permission="ACCESS-VIPROOM"
                    />
                    <PrivateRoute
                        component={Lost2}
                        exact
                        path="/lost-found/:id"
                        permission="ACCESS-VIPROOM"
                    />
                    <PrivateRoute
                        component={Lost1}
                        exact
                        path="/lost-found"
                        permission="ACCESS-VIPROOM"
                    />

                    <PrivateRoute
                        component={Home}
                        exact
                        path="/about/:id/:idd"
                        permission="ACCESS-VIPROOM"
                    />
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
