import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { DbDesigner } from "./pages/db-designer/db-designer";
import { ProjectManagement } from "./pages/project-management/project-management";

export default function Router() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/projects" element={<ProjectManagement />} />
                    <Route path="/dev/db-designer" element={<DbDesigner example="" />} />
                    <Route path="/" />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}