// src/pages/ProductsPage.tsx

import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard, type Product } from "../components/ProductCard";
import { useDispatch } from "react-redux";
import { pushLog } from "../../../stores/appSlice";
// @ts-ignore
import { FixedSizeList as List } from "react-window";

import { PRODUCT_CONSTANTS } from "../../../constants/appConstants";

const fetchProducts = async (): Promise<Product[]> => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${apiUrl}/products`);
  if (!res.ok) throw new Error("Network response was not ok");

  const rawData = await res.json();
  return rawData.map((item: any) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    category: item.category?.name || PRODUCT_CONSTANTS.DEFAULT_CATEGORY,
    image: Array.isArray(item.images) ? item.images[0] : item.images,
  }));
};

export function ProductsPage() {
  const dispatch = useDispatch();

  const { data: products } = useSuspenseQuery({
    queryKey: ["products"],
    queryFn: async () => {
      dispatch(pushLog("[API]: Fetching fresh products from Platzi API..."));
      return fetchProducts();
    },
  });

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const product = products[index];
    return (
      <div style={{ ...style, paddingBottom: "15px" }}>
        <ProductCard product={product} />
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>
        Live Product Inventory (Virtualized)
      </h2>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <List
          height={600}
          itemCount={products.length}
          itemSize={240}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
