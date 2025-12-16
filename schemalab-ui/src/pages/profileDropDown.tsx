import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Space } from 'antd';
import type { DropdownProps, MenuProps } from 'antd';
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth, PasswordResetType, UpdateName } from '../contexts/auth-context';

interface FormState {
    first_name: string,
    last_name: string,
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
}

export const ProfileDropDown = () => {
    const { setSettings, user, logout } = useAuth();

    const onMenuClick: MenuProps["onClick"] = ({ key }) => {
        switch (key) {
            case "1":
                break;
            case "2":
                setSettings(true);
                break;
            case "3":
                logout();
                break;
        }
    }

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: user?.name,
        },
        {
            key: '2',
            label: 'Settings',
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
        },
    ];


    return (
        <Dropdown 
            menu={{
                items,
                onClick: onMenuClick,
            }}
            placement="bottomLeft">
            <Button>
                <Space>
                    {user?.name}
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>

    )
}