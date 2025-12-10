import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from "react-router";
import { Spin, Result } from 'antd';
import { FullError } from "../utils/full-error";
import { FullSuccess } from "../utils/full-success";
import { GET, POST, DELETE, Services } from "../utils/communication";

export type LoginType = {
    email: string;
    password: string;
    // remember_me?: boolean | undefined;
}

export type RegisterType = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export type PasswordResetType = {
    password_old: string;
    password_new: string;
}

export type PasswordLinkType = {
    email: string;
}

export type passwordResetConfirm = {
        new_password: string
    }

interface ProviderProps {
    user: string | null,
    token: string,
    login(data: LoginType): void,
    register(data: RegisterType): void,
    logout(): void,
    resetPasswordAuthenticated(data: PasswordResetType): void;
    resetPasswordConfirmation(data: passwordResetConfirm): void;
    requestPasswordReset(data: PasswordLinkType): void;
    projects: Project[];
    loading: boolean;
    fetchProjects: () => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
}

interface Project {
    id: number;
    name: string;
    description: string;
    data?: any;
    created_at: string;
    updated_at: string;
}

interface Tokens {
    access: string;
    refresh: string;
}

interface AuthUser {
    id: number;
    username: string;
    email: string;
}

const AuthContext = createContext<ProviderProps>({
    user: null,
    token: '',
    login: () => { },
    register: () => { },
    logout: () => { },
    resetPasswordAuthenticated: () => { },
    resetPasswordConfirmation: () => { },
    requestPasswordReset: () => { },
    projects: [],
    loading: false,
    fetchProjects: async () => Promise.resolve(),
    deleteProject: async () => Promise.resolve(),
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const storedInfo = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null
    const [user, setUser] = useState<string | null>(storedInfo?.email)
    const [token, setToken] = useState(storedInfo?.token || '');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [percent, setPercent] = useState<number>(0);
    const navigate = useNavigate();

    const incrementPercent = () => {
        if (percent >= 100) {
            let ptg = percent;
            ptg += 25;
            setPercent(ptg);
        }
    }

    const endPercent = () => {
        setPercent(0);
    }

    interface loginResult {
        token: string;
    }

    const checkAuth = async () => {
        try {
            await GET(
                Services.AUTH,
                "/me"
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    const login = async (data: LoginType) => {
        setLoading(true);

        // send the request to auth service
        try {
            const response = await POST<loginResult>(
                Services.AUTH,
                "/login/",
                "Login Request",
                data
            );
            const token = response.data.data.token;
            incrementPercent();

            setTimeout(() => {
                const obj = { ...data, token: token }
                setUser(data.email);

                incrementPercent();

                setToken(token);

                incrementPercent();

                localStorage.setItem('user', JSON.stringify(obj));
                navigate('/projects');

                incrementPercent();
                endPercent();
                setLoading(false);
            }, 1000);
        } catch (error) {
            endPercent();
            setLoading(false);
            displayError();
        }
    }

    interface registerResult {
        token: string;
    }

    const register = async (data: RegisterType) => {
        setLoading(true);
        incrementPercent();
        // send the request to auth service
        try {
            const response = await POST<registerResult>(
                Services.AUTH,
                "/register",
                "Register Request",
                { data }
            );
            incrementPercent();            

            setTimeout(() => {
                incrementPercent();
                navigate('/login');
                incrementPercent();
                endPercent();
                setLoading(false);
            }, 1000);
        } catch (error) {
            endPercent();
            setLoading(false);
            displayError();
        }
    }

    const logout = async () => {
        try {
            setLoading(true);
            incrementPercent();
            const response = await POST(
                Services.AUTH,
                "/logout",
                "Logout Request",
            );
            incrementPercent();
            setUser(null);
            incrementPercent();
            setToken('');
            localStorage.removeItem('user');
            incrementPercent();
            endPercent();
            setLoading(false);
        } catch (error) {
            endPercent();
            setLoading(false);
            displayError();
        }
    }

    const resetPasswordAuthenticated = async (data: PasswordResetType) => {
        try {
            setLoading(true);
            incrementPercent();
            const auth = await checkAuth();
            if (auth) {
                const response = await POST(
                Services.AUTH,
                "/password/change",
                "Change Password Request",
                { data }
            );
            incrementPercent();
            incrementPercent();
            navigate('/project');
            incrementPercent();
            endPercent();
            setLoading(false);
            // success
            }
        } catch (error) {
            // not successful
            endPercent();
            setLoading(false);
            displayError();
        }
    }

    const requestPasswordReset = async (data: PasswordLinkType) => {
        try {
            setLoading(true);
            incrementPercent();
            const auth = await checkAuth();
            if (!auth) {
                const response = await POST(
                Services.AUTH,
                "/password-reset/",
                "Reset Password Request",
                { data }
            );
            incrementPercent();
            incrementPercent();
            displaySuccess({ 
                title: "Password Reset Link Sent", 
                subTitle: "Password reset link was sent successfully. Please follow the instructions on the email.",
                buttonLabel: "Login",
                buttonURL: "/login"
            })
            incrementPercent();
            endPercent();
            setLoading(false);
            // success
            }
        } catch (error) {
            // not successful
            endPercent();
            setLoading(false);
            displayError();
        }
    }

    const resetPasswordConfirmation = async (data: passwordResetConfirm) => {
        try {
            setLoading(true);
            incrementPercent();
            const auth = await checkAuth();
            if (!auth) {
                const response = await POST(
                Services.AUTH,
                "/password-reset/confirm",
                "Reset Password Request",
                { data }
            );
            incrementPercent();
            incrementPercent();
            displaySuccess({ 
                title: "Password Reset Successfully", 
                subTitle: "Password has been reset successfully. Reset could take a few minutes to take effect.",
                buttonLabel: "Login",
                buttonURL: "/login"
            })
            incrementPercent();
            endPercent();
            setLoading(false);
            // success
            }
        } catch (error) {
            // not successful
            endPercent();
            setLoading(false);
            displayError();
        }
    }

    interface successProps {
        title: string;
        subTitle: string;
        buttonLabel: string;
        buttonURL: string;
    }

    const displaySuccess = ({ title, subTitle, buttonLabel, buttonURL}: successProps) => {
        return <FullSuccess title={title} subTitle={subTitle} buttonLabel={buttonLabel} buttonURL={buttonURL} />
    }

    const displayError = () => {
        return <FullError />;
    }

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await GET(Services.MANAGEMENT, '/api/projects/');
            setProjects(response.data as unknown as Project[]);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id: number): Promise<void> => {
        await DELETE(Services.MANAGEMENT, `/api/projects/${id}/`);
        await fetchProjects();
    };

    useEffect(() => {
        fetchProjects();
    }, []);


    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, projects, loading, fetchProjects, deleteProject, resetPasswordAuthenticated, requestPasswordReset, resetPasswordConfirmation }}>
            <Spin spinning={loading} percent={percent} fullscreen />
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
