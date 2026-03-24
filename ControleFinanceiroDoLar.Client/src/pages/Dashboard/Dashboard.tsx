import React, { useEffect, useState } from "react";
import "./dashboard.css";

type Individual = {
    id: string;
    name: string;
    age: number;
};

type Category = {
    id: string;
    description: string;
    categoryPurpose: string;
};

type Transaction = {
    id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    personId: string;
    categoryId: string;
};

export default function Dashboard() {
    const [people, setPeople] = useState<Individual[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [p, c, t] = await Promise.all([
            fetch("/api/people/listAll").then((r) => r.json()),
            fetch("/api/category/listAll").then((r) => r.json()),
            fetch("/api/transaction/listAll").then((r) => r.json()),
        ]);

        setPeople(p);
        setCategories(c);
        setTransactions(t);
    };

    const calculateTotalsByPerson = () => {
        return people.map((person) => {
            const personTransactions = transactions.filter(
                (t) => t.personId === person.id
            );

            const income = personTransactions
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = personTransactions
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: person.name,
                income,
                expense,
                balance: income - expense,
            };
        });
    };

    const calculateTotalsByCategory = () => {
        return categories.map((category) => {
            const catTransactions = transactions.filter(
                (t) => t.categoryId === category.id
            );

            const income = catTransactions
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = catTransactions
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: category.description,
                income,
                expense,
                balance: income - expense,
            };
        });
    };

    const getGeneralTotals = (data: any[]) => {
        const income = data.reduce((sum, d) => sum + d.income, 0);
        const expense = data.reduce((sum, d) => sum + d.expense, 0);

        return {
            income,
            expense,
            balance: income - expense,
        };
    };

    const personTotals = calculateTotalsByPerson();
    const categoryTotals = calculateTotalsByCategory();

    const generalPersonTotals = getGeneralTotals(personTotals);
    const generalCategoryTotals = getGeneralTotals(categoryTotals);

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            {/* POR PESSOA */}
            <div className="card">
                <h2>Totais por Pessoa</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Pessoa</th>
                            <th>Receitas</th>
                            <th>Despesas</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {personTotals.map((p, i) => (
                            <tr key={i}>
                                <td>{p.name}</td>
                                <td className="income">R$ {p.income.toFixed(2)}</td>
                                <td className="expense">R$ {p.expense.toFixed(2)}</td>
                                <td className="balance">R$ {p.balance.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td className="income">R$ {generalPersonTotals.income.toFixed(2)}</td>
                            <td className="expense">R$ {generalPersonTotals.expense.toFixed(2)}</td>
                            <td className="balance">R$ {generalPersonTotals.balance.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* POR CATEGORIA */}
            <div className="card">
                <h2>Totais por Categoria</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Receitas</th>
                            <th>Despesas</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryTotals.map((c, i) => (
                            <tr key={i}>
                                <td>{c.name}</td>
                                <td className="income">R$ {c.income.toFixed(2)}</td>
                                <td className="expense">R$ {c.expense.toFixed(2)}</td>
                                <td className="balance">R$ {c.balance.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td className="income">R$ {generalCategoryTotals.income.toFixed(2)}</td>
                            <td className="expense">R$ {generalCategoryTotals.expense.toFixed(2)}</td>
                            <td className="balance">R$ {generalCategoryTotals.balance.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}