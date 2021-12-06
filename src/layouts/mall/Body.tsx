import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';

import { Layout } from 'antd';
import { RegisterLegacy } from 'components/Legacy';

import HeaderMOS from './Header';
import Menu from './Menu';
import Routes from './Routes';

const { Header, Content, Sider } = Layout;

const Body: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout>
            <Sider
                collapsed={collapsed}
                collapsible
                onCollapse={() => setCollapsed(!collapsed)}
                width={240}
            >
                <Menu />
            </Sider>
            <Layout
                style={{
                    marginLeft: collapsed ? 54 : 240,
                }}
            >
                <Header>
                    <HeaderMOS />
                </Header>
                <Content style={{ position: 'relative' }}>
                    <Routes />
                    <RegisterLegacy />
                </Content>
            </Layout>
        </Layout>
    );
};

export default withRouter(Body);
