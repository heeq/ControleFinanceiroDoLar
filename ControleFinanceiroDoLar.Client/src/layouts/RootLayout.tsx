import { NavLink, Outlet } from "react-router-dom";

export default function RootLayout() {
    return (
        <section>
            <header className="top-nav">
                <nav className="item-holder">
                    <NavLink to="/">Dashboard</NavLink>
                    <NavLink to="/transactions">Transações</NavLink>
                </nav>
            </header>

            <main className="page-content">
                <Outlet />
            </main>
        </section>
    );
}