import "./ProductList.css";
import React, { useRef, useState } from "react";
import CheckoutButton from "./CheckoutButton";
import { sleep } from "../../utils/sleep"; // ajuste o caminho conforme a pasta

/**
 * @typedef {{ total: number, items: { productName: string, quantity: number, price: number }[] }} CreateOrderPayload
 */


function ProductList() {
    const checkoutIdempotencyKeyRef = useRef(null);

    const products = [
        { name: "Camisa", price: 50, displayPrice: "R$ 50,00" },
        { name: "Sapato", price: 120, displayPrice: "R$ 120,00" },
        { name: "Meia", price: 10, displayPrice: "R$ 10,00" },
    ];

    const [cart, setCart] = useState([]);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    function adicionarAoCarrinho(produto) {
        //checkoutIdempotencyKeyRef.current = null; // ✅ carrinho mudou, nova operação

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.name === produto.name);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.name === produto.name ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { name: produto.name, price: produto.price, quantity: 1 }];
        });
    }

    async function handleCheckout() {
        //if (cart.length === 0) return;

        // ✅ gera uma vez por tentativa de checkout
        if (!checkoutIdempotencyKeyRef.current) {
            checkoutIdempotencyKeyRef.current = crypto.randomUUID();
            console.log("Chave de idempotencia criada: " + checkoutIdempotencyKeyRef.current)
        }

        const idemKey = checkoutIdempotencyKeyRef.current;
        console.log("Chave de idempotencia atual: " + idemKey)

        const payload = {
            total: cartTotal,
            items: cart.map((item) => ({
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        // const response = await fetchWithTimeout("/api/orders", { ... }, 8000);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": idemKey
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Pedido criado:", data);
                setCart([]);
                alert("Pedido realizado com sucesso!");

                // ✅ terminou: limpa a key para o próximo checkout ser outra operação
                checkoutIdempotencyKeyRef.current = null;
            } else {
                console.error("Erro ao criar pedido:", response.statusText);
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
        }
    }

    return (
        <div className="container">
            <h2>Lista de Produtos</h2>

            {products.map((p, index) => (
                <div className="item" key={index}>
                    <span>{p.name}</span>
                    <span>{p.displayPrice}</span>
                    <button onClick={() => adicionarAoCarrinho(p)}>Comprar</button>
                </div>
            ))}

            <div style={{ marginTop: "2rem", padding: "1rem", borderTop: "1px solid #ddd" }}>
                <h3>Carrinho</h3>
                {cartItemsCount === 0 ? (
                    <p>Carrinho vazio</p>
                ) : (
                    <div>
                        {cart.map((item, idx) => (
                            <div
                                key={idx}
                                style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}
                            >
                                <span>
                                    {item.name} (x{item.quantity})
                                </span>
                                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <CheckoutButton total={cartTotal} itemsCount={cartItemsCount} onCheckout={handleCheckout} />
            </div>
        </div>
    );
}

export default ProductList;