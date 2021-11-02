import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import {
    Home,
    Login,
    Logout,
    PrivateLayout,
    PublicLayout,
} from './pages/pages';

export default function Routes() {
    useLocation();
    return (
        <>
            {localStorage.getItem('x-access-token') ? (
                <PrivateLayout>
                    <Switch>
                        <Route component={Home} exact path="/about/:id/:idd" />
                        <Route component={Home} exact path="/about/:id" />
                        <Route component={Home} exact path="/about" />
                        <Route component={Logout} exact path="/logout" />
                        <Route component={Home} exact path="/" />
                        {/* 404 ---------------------------------------------------- */}
                        <Route render={() => <Redirect to="/logout" />} />
                    </Switch>
                </PrivateLayout>
            ) : (
                <PublicLayout>
                    <Switch>
                        <Route component={Login} exact path="/" />
                        {/* 404 ---------------------------------------------------- */}
                        <Route render={() => <Redirect to="/" />} />
                    </Switch>
                </PublicLayout>
            )}
        </>
    );
}
