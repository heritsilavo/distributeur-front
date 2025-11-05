"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";

interface Boisson {
  idBoisson: number;
  nomBoisson: string;
  prixBoisson: number;
  quantiteDispo: number;
}

export default function BoissonsPage() {
  const [boissons, setBoissons] = useState<Boisson[]>([]);
  const [selected, setSelected] = useState<Boisson | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    nomBoisson: "",
    prixBoisson: 0,
    quantiteDispo: 0,
  });

  const load = () =>
    fetch("http://localhost:8080/api/v1/beverages")
      .then((r) => r.json())
      .then(setBoissons);

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const method = selected ? "PUT" : "POST";
    const url = selected
      ? `http://localhost:8080/api/v1/beverages/${selected.idBoisson}`
      : "http://localhost:8080/api/v1/beverages";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([form]),
    });

    setShowForm(false);
    setSelected(null);
    setForm({ nomBoisson: "", prixBoisson: 0, quantiteDispo: 0 });
    load();
  };

  const del = async (id: number) => {
    if (confirm("Supprimer cette boisson ?")) {
      await fetch(`http://localhost:8080/api/v1/beverages/${id}`, {
        method: "DELETE",
      });
      load();
    }
  };

  const openForm = (b?: Boisson) => {
    if (b) {
      setSelected(b);
      setForm({
        nomBoisson: b.nomBoisson,
        prixBoisson: b.prixBoisson,
        quantiteDispo: b.quantiteDispo,
      });
    } else {
      setSelected(null);
      setForm({ nomBoisson: "", prixBoisson: 0, quantiteDispo: 0 });
    }
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                Gestion des Boissons
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gérez votre inventaire de boissons
              </p>
            </div>
            <button
              onClick={() => openForm()}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Ajouter une boisson
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nom de la boisson
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Prix unitaire
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Quantité disponible
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {boissons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Aucune boisson enregistrée
                    </td>
                  </tr>
                ) : (
                  boissons.map((b) => (
                    <tr
                      key={b.idBoisson}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {b.nomBoisson}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        {b.prixBoisson.toLocaleString()} Ar
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.quantiteDispo === 0
                            ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            : b.quantiteDispo < 10
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                              : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            }`}
                        >
                          {b.quantiteDispo} unités
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openForm(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                            Modifier
                          </button>
                          <button
                            onClick={() => del(b.idBoisson)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 rounded-md transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selected ? "Modifier la boisson" : "Nouvelle boisson"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                    Nom de la boisson
                  </label>
                  <input
                    placeholder="Ex: Coca-Cola, Eau minérale..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={form.nomBoisson}
                    onChange={(e) => setForm({ ...form, nomBoisson: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                    Prix unitaire (Ar)
                  </label>
                  <input
                    placeholder="0"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={form.prixBoisson}
                    onChange={(e) => setForm({ ...form, prixBoisson: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                    Quantité disponible
                  </label>
                  <input
                    placeholder="0"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={form.quantiteDispo}
                    onChange={(e) =>
                      setForm({ ...form, quantiteDispo: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={save}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selected ? "Enregistrer les modifications" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}