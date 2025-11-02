import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { DbDesigner } from "./pages/db-designer/db-designer";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/dev/db-designer" element={<DbDesigner example="" />} />
                <Route path="/"></Route>
            </Routes>
        </BrowserRouter>
    );
}