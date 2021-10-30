import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';

import { Home, LoggedTemplate, Login, Logout, PublicTemplate } from './Example';
import { StorageProvider, useStorageContext } from './react-storage-state';

import 'antd/dist/antd.css';

export const VERSION = '21.11';

function LoggedRouter() {
    return (
        <LoggedTemplate>
            <Switch>
                <Route component={Home} exact path="/about/:id/:idd" />
                <Route component={Home} exact path="/about/:id" />
                <Route component={Home} exact path="/about" />
                <Route component={Logout} exact path="/logout" />
                <Route component={Home} exact path="/" />
                {/* 404 ---------------------------------------------------- */}
                <Route render={() => <Redirect to="/logout" />} />
            </Switch>
        </LoggedTemplate>
    );
}

function PublicRouter() {
    return (
        <PublicTemplate>
            <Switch>
                <Route component={Login} exact path="/" />
                {/* 404 ---------------------------------------------------- */}
                <Route render={() => <Redirect to="/" />} />
            </Switch>
        </PublicTemplate>
    );
}

function Router() {
    const useStorage = useStorageContext();
    const [token] = useStorage('token');
    return (
        <BrowserRouter>
            {token ? <LoggedRouter /> : <PublicRouter />}
        </BrowserRouter>
    );
}

export default function App(): React.ReactElement {
    return (
        <StorageProvider>
            <ConfigProvider locale={ptBR}>
                <Router />
            </ConfigProvider>
        </StorageProvider>
    );
}
