import React from "react";
// useSuspenseQuery is a tool from TanStack Query that handles fetching data
// and automatically tells React to wait (suspend) until the data is ready.
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard, type Product } from "../components/ProductCard";
// Redux tools used to send messages (actions) to our app's global state
import { useDispatch } from "react-redux";
import { pushLog } from "../stores/appSlice";

// ------------------------------------------------------------------
// 1. THE HELPER FUNCTION
// This is a standard JavaScript function. Its only job is to go to a
// specific website URL, grab some product data, and return it.
// It doesn't know anything about React or React Query.
// ------------------------------------------------------------------
const fetchProducts = async (): Promise<Product[]> => {
    // Go to the internet and ask for the data
    const res = await fetch("https://fakestoreapi.com/products");
    
    // If the website is broken or offline, throw an error to stop execution
    if (!res.ok) throw new Error("Network response was not ok");
    
    // Otherwise, convert the response into a readable format (JSON)
    return res.json();
};

export function ProductsPage() {
    // 'dispatch' lets us send actions to our global Redux store.
    // In this case, we'll use it to log a message when we fetch data.
    const dispatch = useDispatch();

    // ------------------------------------------------------------------
    // 2. THE DATA FETCHING MAGIC (React Query)
    // Traditionally in React, you have to write manual code to track if
    // data is loading, if it failed, or if it succeeded.
    //
    // 'useSuspenseQuery' handles all of that for us. Because it uses
    // "Suspense", it literally pauses this entire component from showing
    // on the screen until the data is fully downloaded.
    // (A parent component higher up will usually show a loading spinner meanwhile).
    // ------------------------------------------------------------------
    const { data: products } = useSuspenseQuery({
        // queryKey is like a name tag for this specific data.
        // React Query uses this name tag to save (cache) the data in memory.
        // If we ask for ["products"] again later, it can just give us the saved data instantly!
        queryKey: ["products"],
        
        // queryFn is the actual work we want React Query to do.
        queryFn: async () => {
            // First, log a message to our app's history/console
            dispatch(pushLog("[API]: Fetching fresh products from FakeStore..."));
            // Second, call our helper function to actually get the data
            return fetchProducts();
        },
    });

    // ------------------------------------------------------------------
    // 3. THE USER INTERFACE (HTML/JSX)
    // Because we used 'useSuspenseQuery' above, we don't need to write:
    // "if (loading) show spinner" here.
    // By the time the code reaches line 60, we are 100% guaranteed
    // that the 'products' variable has our data ready to go.
    // ------------------------------------------------------------------
    return (
        <div>
            <h2 style={{ marginBottom: "20px" }}>Live Product Inventory</h2>
            
            {/* A simple CSS grid to display our products side-by-side in neat boxes */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px"
            }}>
                
                {/* We take our list of downloaded products, loop over them (map),
                and for every single item, we create a visual 'ProductCard'.
                */}
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                
            </div>
        </div>
    );
}