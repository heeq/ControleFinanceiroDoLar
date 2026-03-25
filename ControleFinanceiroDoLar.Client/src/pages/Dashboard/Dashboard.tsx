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
    purpose: string;
};

type Transaction = {
    id: string;
    description: string;
    amount: number;
    type: "Income" | "Expense";
    peopleId: string;
    categoryId: string;
};

export default function Dashboard() {
    const [people, setPeople] = useState<Individual[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []); // roda uma unica vez ao renderizar o componente

    //pega todos os individuos, todas as categorias e todas as transacoes 
    // (em um sistema maior iria ter paginação e teria que resolver a questão do N+1)
    const fetchData = async () => {
        try {

            const [peopleResult, categoriesResult, transactionsResult] = await Promise.all([
                fetch("/api/people/listAll"),
                fetch("/api/category/listAll"),
                fetch("/api/transaction/listAll"),
            ]);

            if (!peopleResult.ok) throw new Error("Erro ao carregar pessoas.");
            if (!categoriesResult.ok) throw new Error("Erro ao carregar categorias.");
            if (!transactionsResult.ok) throw new Error("Erro ao carregar transações.");

            const [peopleResponse, categoriesResponse, transactionsResponse] = await Promise.all([
                peopleResult.json(),
                categoriesResult.json(),
                transactionsResult.json()
            ]);

            //console.log(peopleResponse);
            //console.log(categoriesResponse);
            //console.log(transactionsResponse);

            setPeople(peopleResponse);
            setCategories(categoriesResponse);
            setTransactions(transactionsResponse);
        } catch (err) {
            const msg = err instanceof Error
                ? err.message
                : String(err);

            throw new Error("Erro ao carregar dados: " + msg);
        }
    };

    const calcPeopleTotal = () => {
        return people.map((person) => {
            const personTransactions = transactions.filter(
                (t) => t.peopleId === person.id
            );

            const income = personTransactions
                .filter((t) => t.type === "Income")
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = personTransactions
                .filter((t) => t.type === "Expense")
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                id: person.id,
                name: person.name,
                income,
                expense,
                balance: income - expense,
                transactions: personTransactions
            };
        });
    };

    const calcCategoryTotal = () => {
        return categories.map((category) => {
            const catTransactions = transactions.filter(
                (t) => t.categoryId === category.id
            );

            const income = catTransactions
                .filter((t) => t.type === "Income")
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = catTransactions
                .filter((t) => t.type === "Expense")
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

    const peopleTotals = calcPeopleTotal();
    const categoryTotals = calcCategoryTotal();

    const generalPeopleTotals = getGeneralTotals(peopleTotals);
    const generalCategoryTotals = getGeneralTotals(categoryTotals);

    return (
        <div className="content">
            <h1>Dashboard</h1>

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
                        {peopleTotals.map((p, i) => (
                            <tr key={i}>

                                <td style={{ position: "relative" }}>
                                    {p.name}

                                    <button
                                        style={{
                                            marginLeft: 8,
                                            cursor: "pointer",
                                            background: "#007bff",
                                            color: "#fff",
                                            border: "none",
                                            width: 18,
                                            height: 18,
                                            borderRadius: "50%",
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 0
                                        }}
                                        onMouseEnter={() => setHoveredId(p.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        i
                                    </button>

                                    {hoveredId === p.id && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                background: "#fff",
                                                padding: 10,
                                                border: "1px solid #ccc",
                                                borderRadius: 6,
                                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                                zIndex: 999,
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            <strong>Transações:</strong>
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {p.transactions.length === 0 && (
                                                    <li>Nenhuma transação</li>
                                                )}

                                                {p.transactions.map(t => (
                                                    <li key={t.id}>
                                                        {t.description} — {t.type == 'Income' ? 'Receita' : 'Despesa'} - R$ {t.amount.toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </td>

                                <td className="income">R$ {p.income.toFixed(2)}</td> {/*para mostrar decimal*/}
                                <td className="expense">R$ {p.expense.toFixed(2)}</td>
                                <td className="balance">R$ {p.balance.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td className="income">R$ {generalPeopleTotals.income.toFixed(2)}</td>
                            <td className="expense">R$ {generalPeopleTotals.expense.toFixed(2)}</td>
                            <td className="balance">R$ {generalPeopleTotals.balance.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

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