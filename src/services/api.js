import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erreur API:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Fonctions pour Produit
export const getAllProduits = () => api.get("/produit/tous");
export const ajouterProduit = (produit) => api.post("/produit/ajouter", produit);
export const modifierProduit = (id, produit) => api.put(`/produit/modifier/${id}`, produit); // Correction ici
export const supprimerProduit = (id) => api.delete(`/produit/supprimer/${id}`); // Correction ici

// Fonctions pour Paiement
export const getAllPaiements = () => api.get("/paiement/tous");
export const ajouterPaiement = (paiement) => api.post("/paiement/ajouter", paiement);
export const modifierPaiement = (id, paiement) => api.put(`/paiement/${id}`, paiement);
export const supprimerPaiement = (id) => api.delete(`/paiement/${id}`);

export default api;