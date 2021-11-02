import TagManager from 'react-gtm-module';
import { BrowserRouter } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';

import 'antd/dist/antd.css';

import Routes from './Routes';

TagManager.initialize({
    gtmId: 'GTM-M45KTGJ',
});

export default function App(): React.ReactElement {
    return (
        <ConfigProvider locale={ptBR}>
            <BrowserRouter>
                <Routes />
            </BrowserRouter>
        </ConfigProvider>
    );
}
