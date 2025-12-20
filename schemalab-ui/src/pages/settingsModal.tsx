import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { useAuth, PasswordResetType, UpdateName } from '../contexts/auth-context';
import './authentication/authentication.scss';

interface FormState {
    name: string | undefined,
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
        name: user?.name,
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
        console.log("handleUpdateName::", );
        if (form.newPassword === form.passwordConfirm) {
            if (!form.name) return error("Invalid name entered");
            const nameObj: UpdateName = {
                name: form.name,
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
        if (!form.newPassword || !form.oldPassword || !form.passwordConfirm) {
            return error("One of the password fields was missing.");
        }

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
                className="settings"
            >
                <div className="content">
                    <div className="name-change">
                        <div className="field">
                            <p className="label">Name:</p>
                            <Input className="input" value={form.name} onChange={e => { updateField("name", e.target.value); }} />
                        </div>
                    </div>
                    <div className="reset">
                        <p className="label">Reset password:</p>
                        <Button onClick={() => setReset(true)}>Reset Password</Button>
                    </div>
                </div>
            </Modal>
            <Modal
                title="Reset Password"
                open={reset}
                onOk={() => handlePasswordReset()}
                onCancel={() => setReset(false)}
                confirmLoading={confirmLoading}
            >
                <Input.Password placeholder="old password" value={form.oldPassword} onChange={e => { updateField("oldPassword", e.target.value); }}/>
                <Input.Password placeholder="new password" value={form.newPassword} onChange={e => { updateField("newPassword", e.target.value); }}/>
                <Input.Password placeholder="confirm new password" value={form.passwordConfirm} onChange={e => { updateField("passwordConfirm", e.target.value); }}/>
                <Button onClick={() => handlePasswordReset()}>Reset Password</Button>
            </Modal>
        </>

    )
}