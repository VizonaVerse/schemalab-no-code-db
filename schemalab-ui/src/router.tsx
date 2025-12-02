import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { DbDesigner } from "./pages/db-designer/db-designer";
import { ProjectManagement } from "./pages/project-management/project-management";
import { CanvasProvider } from "./contexts/canvas-context"; // Import the provider

export default function Router() {
    return (
        <AuthProvider>
            <CanvasProvider> {/* <-- Wrap all routes */}
                <BrowserRouter>
                    <Routes>
                        <Route path="/projects" element={<ProjectManagement />} />
                        <Route path="/dev/db-designer/:id" element={<DbDesigner example="" />} /> {/* For existing projects */}
                        <Route path="/dev/db-designer" element={<DbDesigner example="" />} /> {/* For new projects */}
                        <Route path="/" />
                    </Routes>
                </BrowserRouter>
            </CanvasProvider>
        </AuthProvider>
    );
}