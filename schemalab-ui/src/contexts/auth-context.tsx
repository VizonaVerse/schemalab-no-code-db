import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GET, DELETE, Services } from '../utils/communication';

interface Project {
    id: number;
    name: string;
    description: string;
    data?: any; // <-- Add this line
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: any;
    projects: Project[];
    loading: boolean;
    fetchProjects: () => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const response = await GET(Services.MANAGEMENT, '/api/projects/');
            setProjects(response.data as unknown as Project[]);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const deleteProject = async (id: number) => {
        await DELETE(Services.MANAGEMENT, `/api/projects/${id}/`);
        // Optionally, refetch projects or remove from state
    };

    useEffect(() => {
        // Initialize user and fetch projects
        fetchProjects().finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, projects, loading, fetchProjects, deleteProject }}>
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