import TagManager from 'react-gtm-module';
import { BrowserRouter } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';

import 'antd/dist/antd.css';

import Routes from './Routes';

TagManager.initialize({
    gtmId: 'GTM-M45KTGJ',
});

const App = (): React.ReactElement => (
    <ConfigProvider locale={ptBR}>
        <BrowserRouter>
            <Routes />
        </BrowserRouter>
    </ConfigProvider>
);

export default App;
