import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext"; // ajuste o caminho conforme seu projeto
import authService from "../services/authService";

export default function RootLayout() {
    const { isLogged, setIsLogged } = useAuth();

    const handleLogout = async () => {
        await authService.logout();
        setIsLogged(false);
    };

    return (
        <section>
            <div className="top-nav">
                {isLogged ? (
                    <span className="item-holder">
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/admin">Admin</NavLink>
                        <NavLink to="/pages/productlist/productlist">Lista de produtos</NavLink>
                        <span onClick={handleLogout}>Log Out</span>
                    </span>
                ) : (
                    <span className="item-holder">
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/register">Register</NavLink>
                    </span>
                )}
            </div>

            <Outlet />
        </section>
    );
}