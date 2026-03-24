
import React, { useEffect, useState, useRef } from 'react';
import { AlertDialog } from "radix-ui";
import { TrashIcon } from "@radix-ui/react-icons";
import SelectField from "../../components/SelectField/SelectField";
import { format } from "date-fns";
import "./Dashboard.css";
import { TrashButton } from '../../ui/TrashButton/TrashButton';
import { ConfirmDialog } from '../../ui/ConfirmDialog/ConfirmDialog';


import { sleep } from "../../utils/sleep"; // ajuste o caminho conforme a pasta

import { DatePickerField } from "../../components/DatePickerField/DatePickerField";

const taskStatus = [
    { value: "Pending", label: "Não Iniciado", color: "#6b7280" },
    { value: "InProgress", label: "Em Execução", color: "#2563eb" },
    { value: "Completed", label: "Concluído", color: "#16a34a" },
    { value: "Aborted", label: "Desistência", color: "#dc2626" },
];

function Dashboard() {
    //console.log("1. Componente Renderiza");

    const [userInfo, setUserInfo] = useState(null); // useState({});  é truthy em javascript, sempre true
    const [loadingUser, setLoadingUser] = useState(true);
    const [userError, setUserError] = useState(null);

    //Regra: qualquer código que altera algo fora do componente React (DOM, API, localStorage, etc.) 
    // deve estar dentro de um useEffect
    // toda vez que o componente renderiza, o que está fora do useEffect executa
    useEffect(() => {
        //console.log("2. UseEffect pra pegar o USER (deve rodar só uma vez!)");

        let cancelled = false;

        const user = localStorage.getItem("user")
        if (!user) {
            alert('ERRO');
            //console.log("erro");
            //direcionar pra login
            return;
        }

        //alert('a');

        async function check() {
            const minMs = 1200;
            const start = Date.now();

            //alert('b');

            try {
                fetch("api/SecureWebSite/home/" + user, {
                    method: "GET",
                    credentials: "include" //cookies
                }).then(response => response.json()).then(data => {
                    //console.log("Dados recebidos fecth do USER: ", data);
                    const userData = data.userInfo || {};
                    if (!cancelled) {
                        setUserInfo(userData);
                    }

                }).catch(error => {
                    //console.log("Error: " + error)
                    setUserError(error.message || "Erro ao carregar usuário");
                    setUserInfo(null);
                }).finally(() => {
                    //setLoadingUser(false);
                    ///alert('b');
                });
            } catch (err) {
                if (!cancelled) {
                    //setIsLogged(false);
                    //localStorage.removeItem("user");
                    console.log("Error dashboard: ", err);
                }
            } finally {
                const elapsed = Date.now() - start;
                const remaining = Math.max(0, minMs - elapsed);

                await sleep(remaining);

                if (!cancelled) setLoadingUser(false);
            }




        }

        check();

        return () => {
            cancelled = true;
        };

    }, []);

    useEffect(() => {
        //console.log("3. UseEffect pra mudar o TITLE (deve rodar só quando mudar o USER!)"); 
        if (userInfo) {
            const userName = userInfo.name || userInfo.Name || '';
            document.title = `RR - Bem vindo${userName ? `, ${userName}` : ''}`;
        } else {
            document.title = 'RR - Bem Vindo';
        }
    }, [userInfo]); //Executa APENAS quando userInfo mudar

    const [tasks, setTasks] = useState([]);
    //const [statusByTaskId, setStatusByTaskId] = useState({});

    const [loadingTasks, setLoadingTasks] = useState(false);
    const [tasksError, setTasksError] = useState(null);

    // Salva tarefas ao alterar o status ou titulo
    const [savingByTaskId, setSavingByTaskId] = useState({});
    const [saveErrorByTaskId, setSaveErrorByTaskId] = useState({});

    const [savedByTaskId, setSavedByTaskId] = useState({});
    const saveTimersRef = useRef({});

    //zera timers
    useEffect(() => {
        // CLEANUP: roda quando o componente desmonta
        return () => {
            Object.values(saveTimersRef.current).forEach(clearTimeout);
            saveTimersRef.current = {};
        };
    }, []);

    async function handleTaskChange(taskId, newStatus, newTitle) {
        // guarda o valor anterior (pra rollback se der erro)
        const prevStatus = (tasks.find(t => t.id === taskId)?.status ?? "Pending");
        const prevTitle = (tasks.find(t => t.id === taskId)?.title ?? "");

        // 1) atualiza UI imediatamente (otimista)

        //setStatusByTaskId(prev => ({ ...prev, [taskId]: newStatus }));
        setTasks(prev => prev.map(t => (t.id == taskId ? { ...t, title: newTitle, status: newStatus } : t)));

        setSavingByTaskId(prev => ({ ...prev, [taskId]: true }));
        setSaveErrorByTaskId(prev => ({ ...prev, [taskId]: null }));

        try {
            const resp = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, title: newTitle }),
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(txt || `HTTP ${resp.status}`);
            }

            markSaved(taskId);
        } catch (err) {
            // 2) rollback se falhar
            setTasks(prev => prev.map(t => (t.id == taskId ? { ...t, title: prevTitle, status: prevStatus } : t)));
            //setStatusByTaskId(prev => ({ ...prev, [taskId]: prevStatus }));
            setSaveErrorByTaskId(prev => ({ ...prev, [taskId]: err.message || "Erro ao salvar" }));
        } finally {
            setSavingByTaskId(prev => ({ ...prev, [taskId]: false }));
        }
    }



    function markSaved(taskId) {
        // cancela timer anterior dessa mesma task (se existir)
        if (saveTimersRef.current[taskId]) {
            clearTimeout(saveTimersRef.current[taskId]);
        }

        // mostra a setinha
        setSavedByTaskId(prev => ({ ...prev, [taskId]: true }));

        // agenda sumir em 3s
        saveTimersRef.current[taskId] = setTimeout(() => {
            setSavedByTaskId(prev => {
                const copy = { ...prev };
                delete copy[taskId];
                return copy;
            });
            delete saveTimersRef.current[taskId];
        }, 3000);
    }

    //console.log("4. Renderizando.. userInfo atual: ", userInfo);


    // Muda a tarefa de acordo ao dia
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        // Mostra loading só se demorar um pouco (evita "flash")
        if (!loadingTasks) {
            setShowLoading(false);
            return;
        }

        const t = setTimeout(() => setShowLoading(true), 150);
        return () => clearTimeout(t);
    }, [loadingTasks]);

    useEffect(() => {
        if (!userInfo || !selectedDate) return;

        const controller = new AbortController();

        async function load() {
            setLoadingTasks(true);
            setTasksError(null);

            try {
                const dateParam = format(selectedDate, "dd-MM-yyyy"); // recomendo ISO
                const resp = await fetch(`/api/tasks?date=${encodeURIComponent(dateParam)}`, {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal,
                });

                if (!resp.ok) {
                    const txt = await resp.text().catch(() => "");
                    throw new Error(txt || `HTTP ${resp.status}`);
                }

                const data = await resp.json();
                const list = Array.isArray(data) ? data : [];

                setTasks(list);
            } catch (e) {
                if (e.name !== "AbortError") setTasksError(e.message || "Erro ao carregar tarefas");
            } finally {
                setLoadingTasks(false);
            }
        }

        load();
        return () => controller.abort();
    }, [userInfo, selectedDate]);

    const inputAdicionarRef = useRef(null);

    async function handleAddButton() {
        const title = inputAdicionarRef.current?.value?.trim() ?? "";
        const taskDate = format(selectedDate, "dd-MM-yyyy"); // recomendo ISO

        if (!title) return;

        try {
            const resp = await fetch(`/api/tasks`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, taskDate }),
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                console.error('resp: ' + txt);
                throw new Error(txt || `HTTP ${resp.status}`);
            }

            const createdTask = await resp.json(); // precisa ler o body
            setTasks(prev => [...prev, createdTask]);
        } catch (err) {
            //setSaveErrorByTaskId(prev => ({ ...prev, [taskId]: err.message || "Erro ao salvar" }));
            console.error('catch: ' + err);
        } finally {
            //setSavingByTaskId(prev => ({ ...prev, [taskId]: false }));
            //setTasks(prev => prev.map(...t, resp.data);
        }


        inputAdicionarRef.current.value = "";
        inputAdicionarRef.current.focus();
    }

    const [deletingByTaskId, setDeletingByTaskId] = useState({}); // { [id]: true }
    const [deleteErrorByTaskId, setDeleteErrorByTaskId] = useState({}); // { [id]: "msg" }

    async function onDelete(id) {
        if (!id) return;
        if (deletingByTaskId[id]) return;

        setDeletingByTaskId((prev) => ({ ...prev, [id]: true }));
        setDeleteErrorByTaskId((prev) => ({ ...prev, [id]: null }));

        try {
            const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

            if (!res.ok) {
                // tenta pegar mensagem do backend (json ou texto)
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

            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (e) {
            setDeleteErrorByTaskId((prev) => ({
                ...prev,
                [id]: e?.message || "Erro ao excluir tarefa",
            }));
        } finally {
            setDeletingByTaskId((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    }


    return (
        <section className="page">
            <br />
            <header>
                <h1 style={{ color: "darkred" }}>Bem Vindo ao Rastreador de Rotina </h1>
            </header>

            {loadingUser ? (
                <div className="page">Carregando usuário...</div>
            ) : userInfo ? (
                <div>
                    <br />

                    <div className="layout-colunas">
                        <div className="coluna coluna-1">
                            <h2>Lista de Tarefas:</h2>

                            <div className="taskAdd">
                                <input ref={inputAdicionarRef} type="text" placeholder="Escreva a tarefa aqui" />
                                <button type="button" onClick={handleAddButton}>Adicionar</button>
                            </div>

                            <br /><br />

                            {tasksError ? (
                                <div style={{ color: "darkred" }}>Erro: {tasksError}</div>
                            ) : null}

                            {/*Mantém a tabela sempre montada para evitar "piscar" */}
                            <div className={`tasksWrap ${showLoading ? "isLoading" : ""}`}>
                                {showLoading ? <div className="loadingOverlay">Carregando tarefas...</div> : null}

                                <table className="tasksTable">
                                    <colgroup>
                                        <col className="colNum" />
                                        <col className="colTask" />
                                        <col className="colStatus" />
                                        <col className="colAction" />
                                    </colgroup>

                                    <thead>
                                        <tr>
                                            <th>Nº</th>
                                            <th>Tarefa</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tasks.length === 0 && !tasksError ? (
                                            <tr>
                                                <td colSpan={3}>
                                                    {selectedDate ? "Nenhuma tarefa para esta data." : "Nenhuma tarefa."}
                                                </td>
                                            </tr>
                                        ) : null}

                                        {tasks.map((t, index) => {
                                            const id = t.id;
                                            const taskName = t.title ?? '';
                                            const status = t.status ?? "Pending";

                                            return (
                                                <tr key={id}>
                                                    <td>{index + 1}</td>

                                                    <td>
                                                        <input
                                                            style={{ fontSize: "14px" }}
                                                            type="text"
                                                            value={taskName}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                handleTaskChange(id, status, val);
                                                            }}
                                                        />
                                                    </td>

                                                    <td>
                                                        <SelectField
                                                            label=""
                                                            value={status}
                                                            onChange={(val) => handleTaskChange(id, val, taskName)}
                                                            options={taskStatus}
                                                            size="sm"
                                                            showChecked={!!savedByTaskId?.[id]}
                                                            disabled={!!savingByTaskId[id]}
                                                        />

                                                        {saveErrorByTaskId[id] ? (
                                                            <div style={{ color: "darkred", fontSize: 12 }}>
                                                                {saveErrorByTaskId[id]}
                                                            </div>
                                                        ) : null}
                                                    </td>

                                                    <td>
                                                        <ConfirmDialog
                                                            trigger={<TrashButton title="Excluir tarefa" ariaLabel="Excluir tarefa" isLucideIcon />}
                                                            title="Você tem certeza?"
                                                            description={
                                                                <>
                                                                    Essa ação não poderá ser desfeita. Isso apagará totalmente a tarefa:
                                                                    <br />
                                                                    <br />
                                                                    <strong>{taskName}</strong>
                                                                </>
                                                            }
                                                            confirmText="Sim, Deletar Tarefa"
                                                            onConfirm={() => onDelete(id)}
                                                            isLoading={!!deletingByTaskId?.[id]}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="coluna coluna-2">
                                <DatePickerField value={selectedDate} onChange={(d) => { setSelectedDate(d) }} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="warning">
                    <div>Acesso proibido</div>
                </div>
            )}
        </section>
    );
}

export default Dashboard;