import {
    Redirect,
    Route,
    RouteProps,
    Switch,
    useLocation,
} from 'react-router-dom';

import { Home, Login, Logout, Lost1, Lost2, Lost3 } from './Pages/pages';
import { auth } from './react-mos-core';

/*
const useFetch = () => {
    const useStorage = useStorageContext();
    const [env, setEnv] = useStorage('env');
    const [token, setToken] = useStorage('x-access-token');
    const [permission, setPermission] = useStorage('permission');
    const [mallId, setMallId] = useStorage('mallId');
    const [storeId, setStoreId] = useStorage('storeId');
};
*/

const PrivateRoute: React.FC<RouteProps & { permission: string }> = ({
    permission,
    ...rest
}) => (auth(permission) ? <Route {...rest} /> : <Redirect to="/403" />);

const Routes = (): React.ReactElement => {
    const { pathname, search } = useLocation();
    return (
        <>
            {localStorage.getItem('x-access-token') && auth('ACCESS-VIPROOM') && (
                <Switch>
                    <Route component={Home} exact path="/own2" />
                    <Route component={Home} exact path="/own3" />
                    <Route component={Home} exact path="/own4" />
                </Switch>
            )}
            {localStorage.getItem('x-access-token') ? (
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
