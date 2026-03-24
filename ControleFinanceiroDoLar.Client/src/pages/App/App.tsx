import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from "react-router-dom";

import RootLayout from "../../layouts/RootLayout";
import Dashboard from "../../pages/Dashboard/Dashboard";
import Transactions from "../../pages/TransactionsPage/TransactionsPage";

function NotFound() {
    return <h1>Pagina não encontrada</h1>;
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<RootLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="*" element={<NotFound />} />
        </Route>
    )
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;