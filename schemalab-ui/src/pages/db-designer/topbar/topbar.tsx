import React, { useState, useEffect } from "react";
import "./topbar.scss"; // Import CSS for styling
import { Node, NodeProps } from "reactflow";
import Logo from "../../../assets/schemalab-logo-no-text.svg";
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Switch, Space, Button, Tooltip, Modal, Input, message } from 'antd';
import { useCanvasContext } from "../../../contexts/canvas-context";
import tableAdd from "../../../assets/TableAdd.svg";
import bin from "../../../assets/bin.svg";
import copy from "../../../assets/copy.svg";
import paste from "../../../assets/paste.svg";
import axios from "axios"; // Import axios for HTTP requests
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from '../../../contexts/auth-context';
import type { MenuProps } from 'antd';

export interface TopBarProps {
    projectName?: string;
}

export const Topbar = ({ projectName }: TopBarProps) => {
    const { mode, setMode, handleCanvasData, nodes, setNodes, deleteSelectedNodes, copySelectedNodes, pasteNodes, setProjectName } = useCanvasContext();
    const { fetchProjects } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputName, setInputName] = useState(projectName); // <-- Use context value
    const [inputDescription, setInputDescription] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { id: projectId } = useParams(); // <-- Get id from URL params

    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (isModalOpen) {
            setInputName(projectName); // Always sync inputName with context when modal opens
        }
    }, [isModalOpen, projectName]);

    const handleSaveClick = () => {
        if (!projectId) {
            setIsModalOpen(true); // Modal will sync inputName via useEffect
        } else {
            handleModalOk(); // Directly save if id exists
        }
    };

    const handleModalOk = async () => {
        if (!inputName || inputName.trim() === "") {
            messageApi.warning("Project name cannot be empty.");
            return;
        }
        try {
            const formattedData = handleCanvasData();
            console.log("Formatted Canvas Data for saving:", formattedData);

            if (projectId) {
                // Update existing project
                console.log("Updating project with ID:", projectId);
                await axios.put(`http://localhost:6060/api/projects/${projectId}/`, {
                    name: inputName,
                    description: inputDescription,
                    data: formattedData,
                });
                messageApi.success("Project updated successfully!");
            } else {
                // Create new project
                await axios.post('http://localhost:6060/api/projects/', {
                    name: inputName,
                    description: inputDescription,
                    data: formattedData,
                });
                messageApi.success("Canvas data saved successfully!");
            }
            setProjectName(inputName || "Untitled Project");
            setIsModalOpen(false);
        } catch (error: any) {
            const backendMsg =
                error?.response?.data?.name?.[0] ||
                error?.response?.data?.description?.[0] ||
                error?.response?.data?.detail ||
                "Failed to save canvas data.";
            messageApi.error(backendMsg);
            setIsModalOpen(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    const items: MenuProps['items'] = [
        {
            key: 1,
            label: (<a>
                New
            </a>)
            // open new tab with new canvas
        },
        {
            key: 2,
            label: (<a onClick={handleSaveClick}>Save</a>) // Open modal on click
        },
        {
            key: 3,
            label: 'Properties'
        },
        {
            key: 4,
            label: (<a onClick={(e) => {
                e.preventDefault();
                handleCanvasData();
            }}>Export</a>)
        },
        {
            key: 5,
            label: (
                <a
                    onClick={async (e) => {
                        e.preventDefault();
                        await fetchProjects();
                        navigate("/projects");
                    }}
                >
                    Close
                </a>
            ),
        },
    ];

    const addTable = () => {
        const offset = 50;

        const lastNode = nodes[nodes.length - 1];

        const newPos = lastNode ? {
            x: lastNode.position.x + offset,
            y: lastNode.position.y + offset,
        } : { x: 250, y: 250 };

        const newId = String(nodes.length + 1)
        const newNode: Node = {
            id: newId,
            type: "tableNode",
            data: { label: `Table ${newId}` },
            position: newPos,
        }

        setNodes((nds) => [...nds, newNode]);
    }

    return (
        <div className="topbar">
            {contextHolder}
            <div className="topbar-start">
                <a href="/home">
                    <img src={Logo} alt="Schemalab Logo" className="logo" />
                </a>

                <div className="project">
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                {projectName || 'Unititled Project'}
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </div>
            </div>
            <div className="topbar-middle">
                <Space direction="vertical">
                    <Switch 
                        checkedChildren="Data" 
                        unCheckedChildren="Build" 
                        checked={mode === "data"}
                        onChange={(checked) => setMode(checked ? "data" : "build")} 
                        className="switch"
                    />
                </Space>
            </div>
            <div className="topbar-end">
                <div className="tools">
                    <Tooltip title="Add Table">
                        <Button type="text" className="tool-btn" onClick={addTable}>
                            <img className="tool-icon--Add" src={tableAdd} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete Selected">
                        <Button type="text" className="tool-btn" onClick={deleteSelectedNodes}>
                            <img className="tool-icon" src={bin} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Copy Selected">
                        <Button type="text" className="tool-btn" onClick={copySelectedNodes}>
                            <img className="tool-icon" src={copy} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Paste Selected">
                        <Button type="text" className="tool-btn" onClick={pasteNodes}>
                            <img className="tool-icon" src={paste} />
                        </Button>
                    </Tooltip>
                    
                </div>
            </div>
            <Modal
                title="Save Project"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Save"
            >
                <Input
                    placeholder="Project Name (alphanumeric, max 20 chars)"
                    maxLength={20}
                    value={inputName}
                    onChange={e => {
                        setInputName(e.target.value);
                        setProjectName(e.target.value); // <-- Update context immediately
                    }}
                    style={{ marginBottom: 12 }}
                />
                {/* <Input
                    placeholder="Description (alphanumeric, max 200 chars)"
                    maxLength={200}
                    value={inputDescription}
                    onChange={e => setInputDescription(e.target.value)}
                /> */}
            </Modal>
        </div>
    );
};