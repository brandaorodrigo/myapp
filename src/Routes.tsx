import { mosPermission, mosSigned } from 'react-mos-core/mos-api';
import { Route as DefaultRoute, Redirect, RouteProps, Switch, useLocation } from 'react-router-dom';

import { Home, Login, Logout, Lost1, Lost2, Lost3 } from 'pages/pages';

const Route: React.FC<RouteProps & { allow?: boolean }> = ({ allow = true, ...rest }) => (allow ? <DefaultRoute {...rest} /> : <Redirect to="/403" />);

const Routes = (): React.ReactElement => {
    const { pathname, search } = useLocation();
    return (
        <>
            {mosSigned() ? (
                <Switch>
                    <Route component={Home} exact path="/" />
                    <Route component={Home} exact path="/own2" />
                    <Route component={Home} exact path="/own3" />
                    <Route component={Home} exact path="/own4" />
                    <Route allow={mosPermission.mall('ACCESS-INSTOREVIEW')} component={Lost3} exact path="/lost-found/form/:id?" />
                    <Route allow={mosPermission.mall('ACCESS-VIPROOM')} component={Lost2} exact path="/lost-found/:id" />
                    <Route allow={mosPermission.mall('ACCESS-VIPROOM')} component={Lost1} exact path="/lost-found" />
                    <Route allow={mosPermission.mall('ACCESS-VIPROOM')} component={Home} exact path="/about/:id/:idd" />
                    <Route component={Home} exact path="/own" />
                    <Route component={Logout} exact path="/logout" />
                    <Route exact path="/404" render={() => <h1>404</h1>} />
                    <Route exact path="/403" render={() => <h1>403</h1>} />
                    <Route render={() => <Redirect to="/404" />} />
                </Switch>
            ) : (
                <Switch>
                    <Route component={Login} exact path="/" />
                    <Route component={Login} exact path="/forgot" />
                    <Route component={Login} path="/reset/:hash?" />
                    <Route component={Login} path="/signup/:hash?" />
                    <Route render={() => <Redirect to={`/?url=${pathname + search}`} />} />
                </Switch>
            )}
        </>
    );
};

export default Routes;
