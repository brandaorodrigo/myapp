import { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { useMall } from '__hooks/auth';
import { initialPath } from '__utils/route';
import { CaretDownFilled, CaretUpOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu, Space, Typography } from 'antd';
import { MosEnv } from 'api';
import { Select } from 'components/Form2';

const { Text } = Typography;

const Header: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const { mall, setCurrentMall } = useMall();

    const history = useHistory();
    const location = useLocation();

    // const env = process.env.REACT_APP_URL_API;

    const env = MosEnv();

    const name = localStorage.getItem('name')?.toUpperCase();
    const letter = name ? name.substr(0, 1) : '';

    useEffect(() => {
        // @ts-ignore
        window.movideskLogin &&
            // @ts-ignore
            window.movideskLogin({
                name,
                // email: email,
                // phone: phone,
                stayConnected: false,
                emptySubject: false,
                startChat: false,
            });
    }, [name]);

    const HeaderMenu = (
        <>
            <Menu
                className="ant-header-menu-dropdown"
                defaultSelectedKeys={[`${mall.id}`]}
                mode="inline"
                onMouseLeave={() => setVisible(!visible)}
            >
                <Menu.Item className="user" disabled key="user">
                    {name}
                </Menu.Item>
                <Menu.Item className="mall" disabled key="mall">
                    <Select
                        allowClear={false}
                        defaultValue={mall.id}
                        endpoint="/mos/v1/auth-api/employee-permissions/"
                        onResponse={(response) => response?.malls}
                        onSelect={(key) => {
                            localStorage.setItem('mallId', String(key));
                            setCurrentMall(Number(key));
                            initialPath(location.pathname);
                            history.push('/');
                        }}
                        placeholder="Selecione o shopping"
                        showSearch
                    />
                </Menu.Item>
                <Menu.Item key="config">
                    <Link to="/own">Configurações</Link>
                </Menu.Item>
                <Menu.Item key="logout">
                    <Link to="/logout">Sair</Link>
                </Menu.Item>
            </Menu>
        </>
    );

    return (
        <Dropdown
            className="ant-header-menu"
            overlay={() => HeaderMenu}
            trigger={['click']}
            visible={visible}
        >
            <Space
                onClick={() => {
                    setVisible(!visible);
                }}
                size="small"
            >
                {env !== 'prd' ? (
                    <span
                        className="tag"
                        style={{
                            background:
                                env === 'sandbox'
                                    ? '#e1b853'
                                    : env === 'staging'
                                    ? '#563062'
                                    : '#54bbab',
                        }}
                    >
                        {env}
                    </span>
                ) : (
                    <></>
                )}
                <Avatar size={36}>{letter}</Avatar>
                <Space direction="vertical">
                    <Text>
                        {name}{' '}
                        {visible ? <CaretUpOutlined /> : <CaretDownFilled />}
                    </Text>
                </Space>
            </Space>
        </Dropdown>
    );
};

export default Header;
