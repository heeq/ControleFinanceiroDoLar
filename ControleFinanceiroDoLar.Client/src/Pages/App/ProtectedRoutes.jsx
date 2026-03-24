import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";

function ProtectedRoutes() {
    const { isLogged } = useAuth();

    if (isLogged === null) return null; // ou um loader
    return isLogged ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoutes;