import { useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';

import {
    AppstoreOutlined,
    MailOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

const { SubMenu } = Menu;

export default function MosMenu(): React.ReactElement {
    const { pathname } = useLocation();
    const history = useHistory();

    const path = pathname.split('/');

    const open = `/${path[1]}${path[2] ? `/${path[2]}` : ''}`;

    const [openKeys, setOpenKeys] = useState<string[]>(
        path[1] ? [path[1]] : []
    );

    const hidden = (name: string) => {
        console.log(name);
        return true;
    };

    const collapsed = false;

    return (
        <Menu
            inlineCollapsed={collapsed}
            mode="inline"
            onClick={({ key }) => history.push(key)}
            onOpenChange={(keys: string[]) =>
                setOpenKeys([keys[keys.length - 1]])
            }
            openKeys={openKeys}
            selectedKeys={[open]}
            style={{ width: 256 }}
            // theme="dark"
        >
            <SubMenu
                icon={<MailOutlined />}
                key="lost-found"
                title="Navigation One"
            >
                <Menu.ItemGroup key="/lost-found-group" title="Lost And Found">
                    <Menu.Item key="/lost-found">control</Menu.Item>
                    <Menu.Item key="/lost-found/form">add</Menu.Item>
                    <Menu.Item key="/lost-found/form/33">edit</Menu.Item>
                </Menu.ItemGroup>
                <Menu.ItemGroup key="g2" title="Item 2">
                    <Menu.Item key="3">
                        <NavLink to="/lost-found/form/44">Option 3</NavLink>
                    </Menu.Item>

                    <Menu.Item key="4">Option 4</Menu.Item>
                </Menu.ItemGroup>
            </SubMenu>
            {hidden('ACCESS-INSTOREVIEW') && (
                <SubMenu
                    icon={<AppstoreOutlined />}
                    key="sub2"
                    title="ACCESS-INSTOREVIEW"
                >
                    <Menu.Item key="5">Option 5</Menu.Item>
                    <Menu.Item key="/lost-found/form/556665">
                        Option 6
                    </Menu.Item>
                    <Menu.Item key="/own3">OWNNNNNNNNNNNNNNNN</Menu.Item>
                    <SubMenu key="sub3" title="Submenu">
                        <Menu.Item key="8">Option 8</Menu.Item>
                    </SubMenu>
                </SubMenu>
            )}
            <SubMenu
                icon={<SettingOutlined />}
                key="sub4"
                title="Navigation Three"
            >
                <Menu.Item key="9">Option 9</Menu.Item>
                <Menu.Item key="10">Option 10</Menu.Item>
                <Menu.Item key="11">Option 11</Menu.Item>
                <Menu.Item key="12">Option 12</Menu.Item>
            </SubMenu>
        </Menu>
    );
}
