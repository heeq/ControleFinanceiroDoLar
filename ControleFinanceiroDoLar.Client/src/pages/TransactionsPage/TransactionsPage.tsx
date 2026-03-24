import React, { useRef, useEffect, useState } from "react";
import "./TransactionsPage.css";
import { ConfirmDialog } from '../../ui/ConfirmDialog/ConfirmDialog.jsx';
import { TrashButton } from '../../ui/TrashButton/TrashButton.jsx';
import * as AlertDialog from "@radix-ui/react-alert-dialog";

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

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [type, setType] = useState<"income" | "expense">("expense");

    const selectPeopleRef = useRef<HTMLSelectElement>(null);
    function getSelectedPeopleText() {
        const text = selectPeopleRef.current?.selectedOptions[0].text;
        return text;
    }


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [p, c] = await Promise.all([
            fetch("/api/people/listAll").then((r) => r.json()),
            fetch("/api/category/listAll").then((r) => r.json()),
        ]);

        setPeople(p);
        setCategories(c);
    };

    const getSelectedPersonAge = () => {
        if (selectedPersonId === "new") return newPersonAge;

        const person = people.find((p) => p.id === selectedPersonId);
        return person?.age || 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let personId = selectedPersonId;
        let categoryId = selectedCategoryId;

        // 🔴 REGRA MENOR DE IDADE
        const age = getSelectedPersonAge();
        if (age < 18 && type === "income") {
            alert("Menor de idade só pode ter despesas.");
            return;
        }

        try {
            // criar pessoa se necessário
            if (selectedPersonId === "new") {
                const res = await fetch("/api/people", {
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

            // criar categoria se necessário
            if (selectedCategoryId === "new") {
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: newCategoryName,
                    }),
                });

                const created = await res.json();
                categoryId = created.id;
            }

            // criar transação
            await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    amount,
                    type,
                    personId,
                    categoryId,
                }),
            });

            alert("Transação criada!");

            // reset simples
            setDescription("");
            setAmount(0);
            setType("expense");

            fetchData();
        } catch (err) {
            console.error(err);
            alert("Erro ao criar transação");
        }
    };


    const [successOpen, setSuccessOpen] = useState(false);

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
            setSuccessOpen(true);

        } catch (e: any) {
            console.log("Erro inesperado");
        }
    }

    return (
        <>
            <AlertDialog.Root open={successOpen} onOpenChange={(v) => {
                setSuccessOpen(v);
                if (!v) window.location.reload(); // atualiza página ao fechar
            }}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="AlertDialogOverlay" />
                    <AlertDialog.Content className="AlertDialogContent">
                        <AlertDialog.Title>Excluído!</AlertDialog.Title>
                        <AlertDialog.Description>
                            O registro foi removido com sucesso.
                        </AlertDialog.Description>
                        <AlertDialog.Action asChild>
                            <button className="Button blue">OK</button>
                        </AlertDialog.Action>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>

            <AlertDialog.Root open="{!!errorMessage}" onOpenChange={(v) => !v && setErrorMessage("")}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="AlertDialogOverlay" />
                    <AlertDialog.Content className="AlertDialogContent">
                        <AlertDialog.Title>Falha ao excluir</AlertDialog.Title>
                        <AlertDialog.Description>
                            "Erro ao excluir usuário""
                        </AlertDialog.Description>
                        <AlertDialog.Action asChild>
                            <button className="Button red">OK</button>
                        </AlertDialog.Action>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>
        </>
    );
}

    return (
        <div className="container">
            <h2>Nova Transação</h2>

            <form onSubmit={handleSubmit}>
                {/* PESSOA */}

                <label>Pessoa</label>
                <div>
                    <select
                        ref={selectPeopleRef}
                        value={selectedPersonId}
                        onChange={(e) =>
                            setSelectedPersonId(
                                e.target.value === "new" ? "new" : e.target.value
                            )
                        }>
                        <option value="">Selecione</option>
                        {people.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.age})
                            </option>
                        ))}
                        <option value="new">Novo usuário</option>
                    </select>

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

                {/* CATEGORIA */}
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
                            {c.description}
                        </option>
                    ))}
                    <option value="new">Nova categoria</option>
                </select>

                {selectedCategoryId === "new" && (
                    <input
                        placeholder="Nome da categoria"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                )}

                {/* DADOS DA TRANSAÇÃO */}
                <input
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Valor"
                    onChange={(e) => setAmount(Number(e.target.value))}
                />

                <select value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                </select>

                <button type="submit">Adicionar</button>
            </form>
        </div>
    );
}