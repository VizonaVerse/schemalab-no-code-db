import React from "react";
import "./topbar.scss"; // Import CSS for styling
import { Node, NodeProps } from "reactflow";
import Logo from "../../../assets/schemalab-logo-no-text.svg";
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Switch, Space, Button, Tooltip } from 'antd';
import { useCanvasContext } from "../../../contexts/canvas-context";
import tableAdd from "../../../assets/TableAdd.svg";
import bin from "../../../assets/bin.svg";
import copy from "../../../assets/copy.svg";
import paste from "../../../assets/paste.svg";
import axios from "axios"; // Import axios for HTTP requests

export interface TopBarProps {
    projectName?: string;
}

export const Topbar = ({ projectName }: TopBarProps) => {
    const { mode, setMode, handleCanvasData, nodes, setNodes, deleteSelectedNodes, copySelectedNodes, pasteNodes } = useCanvasContext();

    const saveCanvas = async () => {
        try {
            // Format the canvas data
            const formattedData = handleCanvasData();

            // Send the data to the backend
            await axios.post('http://localhost:6060/api/projects/', {
                name: projectName || "Untitled Project",
                description: "Project description here", // Replace with actual description if available
                data: formattedData, // Send the formatted canvas data
            });

            console.log("Canvas data saved successfully!");
        } catch (error) {
            console.error("Failed to save canvas data:", error);
        }
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
            label: (<a onClick={saveCanvas}>Save</a>) // Call saveCanvas on click
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
            label: 'Close'
        }
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
        </div>
    );
};