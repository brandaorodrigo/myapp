import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import {
    Home,
    Login,
    Logout,
    PrivateLayout,
    PublicLayout,
} from '../Pages/pages';

const Routes = (): React.ReactElement => {
    useLocation();

    const token = localStorage.getItem('x-access-token');

    return (
        <>
            {token ? (
                <PrivateLayout>
                    <Switch>
                        <Route component={Home} exact path="/" />
                        <Route component={Home} exact path="/about" />
                        <Route component={Home} exact path="/about/:id" />
                        <Route component={Home} exact path="/about/:id/:idd" />
                        <Route component={Home} exact path="/own" />
                        <Route component={Logout} exact path="/logout" />
                        <Route render={() => <Redirect to="/logout" />} />
                    </Switch>
                </PrivateLayout>
            ) : (
                <PublicLayout>
                    <Switch>
                        <Route component={Login} exact path="/" />
                        <Route component={Logout} exact path="/logout" />
                        {/* <Route component={Forgot} exact path="/forgot" /> */}
                        {/* <Route component={Reset} path="/reset/:hash?" /> */}
                        {/* <Route component={SignUp} path="/signup/:hash?" /> */}
                        <Route render={() => <Redirect to="/" />} />
                    </Switch>
                </PublicLayout>
            )}
        </>
    );
};

export default Routes;
