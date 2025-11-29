import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GET } from '../utils/communication';

interface Project {
    id: number;
    name: string;
    description: string;
    canvas_data?: any;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: any;
    projects: Project[];
    loading: boolean;
    fetchProjects: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const response = await GET('/api/projects/' as any); // cast to any to satisfy GET parameter type
            setProjects(response.data as unknown as Project[]);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    useEffect(() => {
        // Initialize user and fetch projects
        fetchProjects().finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, projects, loading, fetchProjects }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};