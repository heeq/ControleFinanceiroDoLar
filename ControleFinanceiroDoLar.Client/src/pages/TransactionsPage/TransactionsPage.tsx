import React, { useRef, useEffect, useState } from "react";
import "./TransactionsPage.css";
import { ConfirmDialog } from '../../ui/ConfirmDialog/ConfirmDialog.jsx';
import { TrashButton } from '../../ui/TrashButton/TrashButton.jsx';

type Person = {
    id: string;
    name: string;
    age: number;
};

type Category = {
    id: string;
    description: string;
    purpose: string;
};

export default function Transactions() {
    const [people, setPeople] = useState<Person[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [selectedPersonId, setSelectedPersonId] = useState<string | "new">("");
    const [newPersonName, setNewPersonName] = useState("");
    const [newPersonAge, setNewPersonAge] = useState<number>(0);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | "new">("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryPurpose, setNewCategoryPurpose] = useState<"Income" | "Expense" | "Both">("Expense");

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [type, setType] = useState<"Income" | "Expense">("Expense");

    const selectPeopleRef = useRef<HTMLSelectElement>(null);
    function getSelectedPeopleText() {
        const text = selectPeopleRef.current?.selectedOptions[0].text;
        return text;
    }


    useEffect(() => {
        fetchData();
    }, []); // só roda uma vez (montagem do componente)

    const fetchData = async () => {
        try {

            const [peopleResult, categoriesResult] = await Promise.all([
                fetch("/api/people/listAll"),
                fetch("/api/category/listAll"),
            ]);

            if (!peopleResult.ok) throw new Error("Erro ao carregar pessoas.");
            if (!categoriesResult.ok) throw new Error("Erro ao carregar categorias.");

            const [peopleResponse, categoriesResponse] = await Promise.all([
                peopleResult.json(),
                categoriesResult.json(),
            ]);

            setPeople(peopleResponse);
            setCategories(categoriesResponse);
        } catch (err) {
            const msg = err instanceof Error
                ? err.message
                : String(err);

            throw new Error("Erro ao carregar dados: " + msg);
        }
    };

    const getSelectedPersonAge = () => {
        if (selectedPersonId === "new") return newPersonAge;

        const person = people.find((p) => p.id === selectedPersonId);
        return person?.age || 200;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPersonId) {
            alert("Selecione uma pessoa antes de continuar.");
            return;
        }
        if (!selectedCategoryId) {
            alert("Selecione uma categoria antes de continuar.");
            return;
        }

        let personId = selectedPersonId;
        let categoryId = selectedCategoryId;


        // validar se categoria cabe no tipo de transacao
        if (selectedCategoryId !== "new") {
            const selectedCategory = categories.find(c => c.id === selectedCategoryId);

            if (!selectedCategory) {
                alert("Categoria inválida.");
                return;
            }

            const purpose = selectedCategory.purpose; // Income, Expense ou Both

            if (purpose !== "Both" && purpose !== type) {
                alert(`Categoria do tipo ${purpose} não permite transações do tipo ${type}.`);
                return;
            }
        }


        const age = getSelectedPersonAge()
        if (age < 18 && type === "Income") {
            alert("Menor de idade só pode ter despesas."); /*  triste =(  */
            return;
        }

        try {

            if (selectedPersonId === "new") {
                const res = await fetch("/api/people", { // se tiver selecionado 'new', cria a pessoa
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: newPersonName,
                        age: newPersonAge,
                    }),
                });

                const created = await res.json();
                personId = created.id;
            }


            if (selectedCategoryId === "new") {
                const res = await fetch("/api/category", { // se tiver new, cria a categoria
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        Description: newCategoryName,
                        Purpose: newCategoryPurpose
                    }),
                });

                const created = await res.json();
                categoryId = created.id;
            }

            // criar transação
            await fetch("/api/Transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    amount,
                    type,
                    PeopleId: personId,
                    categoryId,
                }),
            });

            alert("Transação criada!");

            // voltando para valores default
            setSelectedPersonId(""); // esse aqui talvez pudesse ser bom deixar
            setSelectedCategoryId("");
            setNewPersonName("");
            setNewPersonAge(0);
            setNewCategoryName("");
            setNewCategoryPurpose("Expense");
            setDescription("");
            setAmount(0);
            setType("Expense");

            fetchData();
        } catch (err) {
            console.error(err);
            alert("Erro ao criar transação");
        }
    };


    const handleTrashButtonClick = () => {
        if (!selectedPersonId) {
            alert("Selecione uma pessoa para excluir.");
            return;
        }
    }

    async function onPeopleDelete(id: string) {
        if (!id) return;

        try {
            const res = await fetch(`/api/people/${id}`, { method: "DELETE" });

            if (!res.ok) {
                let msg = `Falha ao excluir (HTTP ${res.status})`;
                try {
                    const contentType = res.headers.get("content-type") || "";
                    if (contentType.includes("application/json")) {
                        const data = await res.json();
                        msg = data?.message || msg;
                    } else {
                        const text = await res.text();
                        if (text) msg = text;
                    }
                } catch { }
                throw new Error(msg);
            }
            else {
                alert("Excluido com Sucesso!");
            }
        } catch (e) {

        } finally {
        }
    }

    return (
        <div className="content">
            <h1>Transações</h1>

            <div className="container">
                <h2>Nova Transação</h2>

                <form onSubmit={handleSubmit}>
                    <label>Pessoa</label>
                    <div>
                        <select
                            ref={selectPeopleRef}
                            value={selectedPersonId}
                            onChange={(e) =>
                                setSelectedPersonId(
                                    e.target.value === "new" ? "new" : e.target.value
                                )}>
                            <option value="">Selecione</option>
                            {people.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.age})
                                </option>
                            ))}
                            <option value="new">Novo usuário</option>
                        </select>

                        {selectedPersonId ? (
                            <ConfirmDialog
                                trigger={<TrashButton title="Excluir Indivíduo" isLucideIcon />}
                                title="Você tem certeza?"
                                description={
                                    <>
                                        Essa ação não poderá ser desfeita. Isso apagará o indivíduo e todas as suas transações associadas:
                                        <br />
                                        <br />
                                        <strong>{getSelectedPeopleText()}</strong>
                                    </>
                                }
                                confirmText="Sim, Deletar Indivíduo"
                                onConfirm={() => onPeopleDelete(selectedPersonId)}
                            />
                        ) : (
                        <TrashButton
                            title="Excluir Indivíduo"
                            isLucideIcon
                            onClick={() => alert("Selecione uma pessoa para excluir.")}
                        />
                        )}

                    </div>

                    {selectedPersonId === "new" && (
                        <>
                            <input
                                placeholder="Nome"
                                value={newPersonName}
                                onChange={(e) => setNewPersonName(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Idade"
                                onChange={(e) => setNewPersonAge(Number(e.target.value))}
                            />
                        </>
                    )}

                    <label>Categoria</label>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) =>
                            setSelectedCategoryId(
                                e.target.value === "new" ? "new" : e.target.value
                            )
                        }
                    >
                        <option value="">Selecione</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.purpose === 'Income' && '(Receita) '}
                                {c.purpose === 'Expense' && '(Despesa) '}
                                {c.purpose === 'Both' && '(Ambos) '}
                                {c.description}
                            </option>
                        ))}
                        <option value="new">Nova categoria</option>
                    </select>

                    {selectedCategoryId === "new" && (
                        <>
                            <input
                                placeholder="Nome da categoria"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />

                            <label>Tipo da categoria</label>
                            <select
                                value={newCategoryPurpose}
                                onChange={(e) => setNewCategoryPurpose(e.target.value as any)}
                            >
                                <option value="Income">Receita</option>
                                <option value="Expense">Despesa</option>
                                <option value="Both">Ambos</option>
                            </select>
                        </>
                    )}

                    <input
                        placeholder="Descrição"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <label>Valor</label>
                    <input style={{ marginTop: '0px' }}
                        type="number"
                        placeholder="Valor"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />

                    <label>Tipo da transação</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)}>
                        <option value="Expense">Despesa</option>
                        <option value="Income">Receita</option>
                    </select>

                    <button type="submit">Adicionar</button>
                </form>
            </div>
        </div>
    );
}