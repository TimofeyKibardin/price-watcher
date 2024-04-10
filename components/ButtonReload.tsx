"use client"

import { getAllProducts } from "@/lib/actions";

async function handleSubmit(e: any) {
    e.preventDefault();
    const allProducts = await getAllProducts();
    // window.location.reload();

  }

export default function ReloadButton() {
  return <button className="searchbar-btn" onClick={handleSubmit}>Перезагрузить список</button>;
}
