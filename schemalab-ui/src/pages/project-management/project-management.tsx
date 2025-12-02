import 'antd/dist/reset.css';
import './project-management.scss';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import React, { useState } from "react";
import { message, Modal } from "antd";

interface ProjectCardProps {
    id: number;
    name: string;
    description: string;
    data?: any;
}

const ProjectCard = ({ id, name, description, data, messageApi }: ProjectCardProps & { messageApi: any }) => {
    const navigate = useNavigate();
    const { deleteProject, fetchProjects } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProjectClick = () => {
        if (!isModalOpen) {
            navigate(`/dev/db-designer/${id}`);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        await deleteProject(id);
        messageApi.success("Successfully deleted", 2.5);
        await fetchProjects();
        setIsModalOpen(false);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div
            className={`project-card${isModalOpen ? " modal-open" : ""}`}
            onClick={handleProjectClick}
            style={isModalOpen ? { pointerEvents: "none", opacity: 0.7 } : {}}
        >
            <div className="project-canvas-preview">
                <div className="canvas-placeholder">
                    {data ? (
                        <div className="canvas-miniature">
                            {renderMiniDiagram(data)}
                        </div>
                    ) : (
                        <span>Picture of React Flow</span>
                    )}
                </div>
            </div>
            <div className="project-info-row">
                <h3 className="project-name">{name}</h3>
                <button className="delete-project-btn" onClick={handleDelete} title="Delete project">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="6" y="9" width="1.5" height="6" rx="0.75" fill="currentColor"/>
                        <rect x="9.25" y="9" width="1.5" height="6" rx="0.75" fill="currentColor"/>
                        <rect x="12.5" y="9" width="1.5" height="6" rx="0.75" fill="currentColor"/>
                        <rect x="4" y="6" width="12" height="2" rx="1" fill="currentColor"/>
                        <rect x="7" y="3" width="6" height="2" rx="1" fill="currentColor"/>
                        <rect x="2" y="6" width="16" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                        <rect x="5" y="8" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                </button>
            </div>
            <div className="project-info">
                {description && <p className="project-description">{description}</p>}
            </div>
            <Modal
                title="Delete Project"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete <b>{name}</b>? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

function renderMiniDiagram(data: any) {
    if (!data || !data.data || !data.data.canvas) return <span>No diagram</span>;
    const { tables, relationships } = data.data.canvas;
    return (
        <svg viewBox="0 0 200 150" className="mini-diagram">
            {tables.map((table: any, idx: number) => (
                <rect
                    key={table.id}
                    x={30 + idx * 60}
                    y={40}
                    width="40"
                    height="30"
                    fill="#e0e0e0"
                    stroke="#1976d2"
                    strokeWidth="2"
                    rx="4"
                />
            ))}
            {relationships.map((rel: any, idx: number) => {
                // Find indices of source and target tables
                const sourceIdx = tables.findIndex((t: any) => t.id === rel.source);
                const targetIdx = tables.findIndex((t: any) => t.id === rel.target);

                // Fallback to 0 if not found
                const x1 = 50 + (sourceIdx >= 0 ? sourceIdx : 0) * 60;
                const x2 = 50 + (targetIdx >= 0 ? targetIdx : 0) * 60;

                return (
                    <line
                        key={rel.id}
                        x1={x1}
                        y1={55}
                        x2={x2}
                        y2={55}
                        stroke="#666"
                        strokeWidth="1.5"
                    />
                );
            })}
        </svg>
    );
}

export const ProjectManagement = () => {
    const { projects, loading } = useAuth();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const handleNewProject = () => {
        navigate('/dev/db-designer');
    };

    if (loading) {
        return <div className="loading">Loading projects...</div>;
    }

    return (
        <div className="project-management-page">
            {contextHolder}
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
                        name={
                            project.name ||
                            project.data?.projectName ||
                            project.data?.data?.projectName ||
                            "Untitled"
                        }
                        description={project.description}
                        data={project.data}
                        messageApi={messageApi}
                    />
                ))}
            </div>
        </div>
    );
};