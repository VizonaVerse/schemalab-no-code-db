import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import './project-management.scss';

interface ProjectCardProps {
    id: number;
    name: string;
    description: string;
    data?: any;
}

const ProjectCard = ({ id, name, description, data }: ProjectCardProps) => {
    const navigate = useNavigate();

    const handleProjectClick = () => {
        navigate(`/dev/db-designer?project=${id}`);
    };

    return (
        <div className="project-card" onClick={handleProjectClick}>
            <div className="project-canvas-preview">
                <div className="canvas-placeholder">
                    {data ? (
                        <div className="canvas-miniature">
                            <svg viewBox="0 0 200 150" className="mini-diagram">
                                {/* Simple representation of tables */}
                                <rect x="20" y="30" width="60" height="40" fill="#e0e0e0" stroke="#1976d2" strokeWidth="2" rx="4" />
                                <rect x="120" y="30" width="60" height="40" fill="#e0e0e0" stroke="#1976d2" strokeWidth="2" rx="4" />
                                <rect x="70" y="90" width="60" height="40" fill="#e0e0e0" stroke="#1976d2" strokeWidth="2" rx="4" />
                                <line x1="80" y1="50" x2="120" y2="50" stroke="#666" strokeWidth="1.5" />
                                <line x1="100" y1="70" x2="100" y2="90" stroke="#666" strokeWidth="1.5" />
                            </svg>
                        </div>
                    ) : (
                        <span>Picture of React Flow</span>
                    )}
                </div>
            </div>
            <div className="project-info">
                <h3 className="project-name">{name}</h3>
                {description && <p className="project-description">{description}</p>}
            </div>
        </div>
    );
};

export const ProjectManagement = () => {
    const { projects, loading } = useAuth();
    const navigate = useNavigate();

    const handleNewProject = () => {
        navigate('/dev/db-designer');
    };

    if (loading) {
        return <div className="loading">Loading projects...</div>;
    }

    return (
        <div className="project-management-page">
            <header className="projects-header">
                <h1>Projects</h1>
            </header>

            <div className="projects-tabs">
                <button className="tab active">Designs</button>
                <button className="tab">Schemas</button>
                <button className="new-project-btn" onClick={handleNewProject}>
                    + New Project
                </button>
            </div>

            <div className="projects-grid">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        id={project.id}
                        name={project.name}
                        description={project.description}
                        data={project.canvas_data}
                    />
                ))}
            </div>
        </div>
    );
};