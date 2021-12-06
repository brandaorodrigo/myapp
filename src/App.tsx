import TagManager from 'react-gtm-module';
import { BrowserRouter } from 'react-router-dom';

import 'antd/dist/antd.css';

import { ConfigProvider } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';

TagManager.initialize({
    gtmId: 'GTM-M45KTGJ',
});

const Layout = (): React.ReactElement => <></>;

const App = (): React.ReactElement => (
    <ConfigProvider locale={ptBR}>
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    </ConfigProvider>
);

export default App;
