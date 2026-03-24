import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { useState, useEffect } from "react"
import { NavLink, Outlet } from "react-router-dom";
import authService from "../../services/authService"
import { authContext } from "../../contexts/authContext";

import ProtectedRoutes from './ProtectedRoutes'
import Dashboard from '../../Pages/Dashboard/Dashboard';
import Admin from '../../Pages/Admin/Admin';
import Login from '../../Pages/Login/Login';
import Register from '../../Pages/Register/Register';
import ProductList from '../../Pages/ProductList/ProductList';

import RootLayout from "../../layouts/RootLayout";

import './App.css';
export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<RootLayout />}>
            <Route element={<ProtectedRoutes />}>
                <Route index element={<Dashboard />} />
                <Route path="home" element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="admin" element={<Admin />} />
                <Route path="pages/productlist/productlist" element={<ProductList />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="*" element={<div><h1>Not Found</h1></div>} />
        </Route>
    )
);

function App() {
    const [isLogged, setIsLogged] = useState(null); // null = ainda checando

    useEffect(() => {
        console.log("App montou");
        return () => console.log("App desmontou");
    }, []);

    useEffect(() => {
        console.log("Entrou no useEffect do App.jsx");
        let cancelled = false;

        (async () => {
            const isAuthenticated = await authService.checkAuth();
            if (!cancelled) {
                setIsLogged(isAuthenticated); // causa nova renderização (porém sem useEffect)
                console.log(`Setando que está logado ou que não está: ${isAuthenticated}`);
            }
        })();

        return () => { cancelled = true; };
    }, []); // só roda UMA vez APÓS a PRIMEIRA renderização

    const handleLogout = async () => {
        await authService.logout();
        setIsLogged(false);
    };

    console.log("Verificou se if isLogged");
    if (isLogged === null) {
        console.log("Renderizou Carregando");
        // opcional: renderiza um menu neutro/loader
        return (
            <div className="waiting-page">
                <div style={{ color: "white" }}>Waiting APP...</div>
            </div>
        );
    }

    console.log("Renderizou Navbar");
    return (
        <authContext.Provider value={{ isLogged, setIsLogged }}>
            <RouterProvider router={router} />
        </authContext.Provider>
    );
}

export default App;