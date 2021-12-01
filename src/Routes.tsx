import { useEffect } from 'react';
import mosApi, { mosSigned } from 'react-mos-core/mos-api';
import {
    Route as DefaultRoute,
    Redirect,
    RouteProps,
    Switch,
    useLocation,
} from 'react-router-dom';

import { Home, Login, Logout, Lost1, Lost2, Lost3 } from 'pages/pages';

// react-router-dom/Route don't have a hidden prop
const Route: React.FC<RouteProps & { hidden?: boolean }> = ({
    hidden = false,
    ...rest
}) => (hidden ? <Redirect to="/403" /> : <DefaultRoute {...rest} />);

const Export = (): React.ReactElement => {
    const { pathname, search } = useLocation();

    const {};
    useEffect(() => {
        if (mosSigned()) {
            mosApi('/mos-store/v1/auth-api/employee-permissions', {
                cache: true,
            }).then((response) => {
                console.log(response);
            });
        }
    }, [storeId]);

    const hidden = (name: string) => {
        console.log(name);
        return true;
    };

    return (
        <>
            {mosSigned() ? (
                <Switch>
                    <Route component={Home} exact path="/" />
                    <Route component={Home} exact path="/own2" />
                    <Route component={Home} exact path="/own3" />
                    <Route component={Home} exact path="/own4" />
                    <Route
                        component={Lost3}
                        exact
                        hidden={hidden('ACCESS-INSTOREVIEW')}
                        path="/lost-found/form/:id?"
                    />
                    <Route
                        component={Lost2}
                        exact
                        hidden={hidden('ACCESS-VIPROOM')}
                        path="/lost-found/:id"
                    />
                    <Route
                        component={Lost1}
                        exact
                        hidden={hidden('ACCESS-VIPROOM')}
                        path="/lost-found"
                    />
                    <Route
                        component={Home}
                        exact
                        hidden={hidden('ACCESS-VIPROOM')}
                        path="/about/:id/:idd"
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
                    <Route component={Login} exact path="/forgot" />
                    <Route component={Login} path="/reset/:hash?" />
                    <Route component={Login} path="/signup/:hash?" />
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

export default Export;
