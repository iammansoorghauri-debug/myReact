//src/components/ProductCard.tsx

import React from "react";

// The shape of the data coming from FakeStore API
export interface Product {
    id: number;
    title: string;
    price: number;
    category: string;
    image: string;
}

export function ProductCard({ product }: { product: Product }) {
    return (
        <div style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
        }}>
        <div style={{ height: "150px", textAlign: "center", marginBottom: "10px" }}>
            <img src={product.image} alt={product.title} style={{ maxHeight: "100%", maxWidth: "100%" }} />
        </div>
        <h4 style={{ fontSize: "14px", margin: "0 0 10px 0", color: "#333" }}>{product.title}</h4>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>${product.price}</span>
            <span style={{ fontSize: "12px", backgroundColor: "#eee", padding: "4px 8px", borderRadius: "12px" }}>
            {product.category}
            </span>
        </div>
        </div>
    );
}