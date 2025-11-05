"use client";

import { TypeBoisson } from "@/types/Boisson";
import { useEffect, useState } from "react";

export function EcranListeBoisson() {
    const [boissons, setBoissons] = useState<TypeBoisson[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    async function loadBoissons() {
        setLoading(true);
        const url = "http://localhost:8080/api/v1/beverages";
        const response = await fetch(url);
        const data: TypeBoisson[] = await response.json();
        setBoissons(data);
        setLoading(false);
    }

    useEffect(() => {
        loadBoissons();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 p-4 rounded shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Liste des Boissons</h2>
                <ul>
                    {boissons.map((boisson) => (
                        <li key={boisson.idBoisson} className="mb-2 p-2 border-b border-gray-300">
                            <span className="font-semibold">{boisson.nomBoisson}</span> - 
                            <span className="text-green-600 ml-2">{boisson.prixBoisson.toFixed(2)} €</span> - 
                            <span className="text-gray-600 ml-2">Disponible: {boisson.quantiteDispo}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}