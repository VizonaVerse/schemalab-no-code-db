import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { useAuth, PasswordResetType, UpdateName } from '../contexts/auth-context';

interface FormState {
    first_name: string,
    last_name: string,
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
}


export const SettingsModal = () => {
    const { settings, setSettings, updateName, resetPasswordAuthenticated, user } = useAuth();
    const [reset, setReset] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    // Data for inputs
    const [form, setForm] = useState<FormState>({
        first_name: "",
        last_name: "",
        oldPassword: "",
        newPassword: "",
        passwordConfirm: "",
    });

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    // fetch the name
    useEffect(() => {

    })

    const handleNameUpdate = async () => {
        if (form.newPassword === form.passwordConfirm) {
            const nameObj: UpdateName = {
                first_name: form.first_name,
                last_name: form.last_name,
                // remember_me: form.remember_me,
            }
            await updateName(nameObj);
            setConfirmLoading(false);
            success("Changes have applied successful");
            return setSettings(false);
        }
        error("Error occurred.");
    }

    const handlePasswordReset = async () => {
        setConfirmLoading(true);
        if (form.newPassword === form.passwordConfirm) {
            const passwordObj: PasswordResetType = {
                password_old: form.oldPassword,
                password_new: form.newPassword,
                // remember_me: form.remember_me,
            }
            await resetPasswordAuthenticated(passwordObj);
            setConfirmLoading(false);
            return success("Password reset successful");
        }
        error("Passwords do not match or old password is incorrect");
        setConfirmLoading(false);
    }

    const success = (message: string) => {
        messageApi.open({
            type: 'success',
            content: 'This is a success message',
        });
    };

    const error = (message: string) => {
        messageApi.open({
            type: 'error',
            content: 'This is an error message',
        });
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Settings"
                centered
                open={settings}
                onOk={() => handleNameUpdate()}
                onCancel={() => setSettings(false)}
                width={1000}
            >
                {/* <Input disabled value={}/> */}
                {/* <Input value={}/>
                <Input value={}/> */}
                <Button onClick={() => setReset(true)}>Reset Password</Button>
            </Modal>
            <Modal
                title="Reset Password"
                open={reset}
                onOk={() => handlePasswordReset()}
                onCancel={() => setReset(false)}
                confirmLoading={confirmLoading}
            >
                <Input placeholder="old password" value={form.oldPassword} />
                <Input placeholder="new password" value={form.newPassword}/>
                <Input placeholder="confirm new password" value={form.passwordConfirm}/>
                <Button onClick={() => handlePasswordReset()}>Reset Password</Button>
            </Modal>
        </>

    )
}