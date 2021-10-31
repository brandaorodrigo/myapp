import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';

import {
    Home,
    Login,
    Logout,
    PrivateLayout,
    PublicLayout,
} from '../pages/pages';
import {
    StorageProvider,
    useStorageContext,
} from '../utils/react-storage-state';

import 'antd/dist/antd.css';

function PrivateRoutes() {
    return (
        <Switch>
            <Route component={Home} exact path="/about/:id/:idd" />
            <Route component={Home} exact path="/about/:id" />
            <Route component={Home} exact path="/about" />
            <Route component={Logout} exact path="/logout" />
            <Route component={Home} exact path="/" />
            {/* 404 ---------------------------------------------------- */}
            <Route render={() => <Redirect to="/logout" />} />
        </Switch>
    );
}
function PublicRoutes() {
    return (
        <Switch>
            <Route component={Login} exact path="/" />
            {/* 404 ---------------------------------------------------- */}
            <Route render={() => <Redirect to="/" />} />
        </Switch>
    );
}

function Routes() {
    const useStorage = useStorageContext();
    const [token] = useStorage('token');

    return (
        <>
            {token ? (
                <PrivateLayout>
                    <PrivateRoutes />
                </PrivateLayout>
            ) : (
                <PublicLayout>
                    <PublicRoutes />
                </PublicLayout>
            )}
        </>
    );
}

export default function App(): React.ReactElement {
    return (
        <ConfigProvider locale={ptBR}>
            <StorageProvider>
                <BrowserRouter>
                    <Routes />
                </BrowserRouter>
            </StorageProvider>
        </ConfigProvider>
    );
}
