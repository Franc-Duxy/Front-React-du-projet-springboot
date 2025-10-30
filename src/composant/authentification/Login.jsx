import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../../assets/css/authentification.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Tentative de connexion avec:", { email, password });

    try {
      const response = await axios.post("http://localhost:9090/api/utilisateur/login", {
        email,
        mdp: password,
      });

      console.log("Réponse du backend:", response.data);

      if (response.data.success) {
        // 🔹 Extraire l'utilisateur correctement (note: c’est id, pas idUtilisateur)
        const utilisateur = response.data.utilisateur;

        // ✅ Enregistrer les infos utilisateur dans le localStorage
        localStorage.setItem("user", JSON.stringify(utilisateur));
        localStorage.setItem("userId", utilisateur.id); // ✅ Correction ici
        localStorage.setItem("userRole", utilisateur.role);
        localStorage.setItem("userName", utilisateur.nom);

        console.log("🧠 userId enregistré :", utilisateur.id);

        Swal.fire({
          title: "Connexion réussie",
          text: `Bienvenue, ${utilisateur.nom} !`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/produit"); // ou "/commande" selon ta logique
        });
      } else {
        throw new Error(response.data.message || "Identifiants incorrects");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      Swal.fire({
        title: "Erreur",
        text:
          error.response?.data?.message ||
          error.message ||
          "Email ou mot de passe incorrect",
        icon: "error",
        confirmButtonText: "Réessayer",
      });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="col-md-4">
        <div className="card shadow-lg">
          <div className="card-body">
            <h1 className="card-title text-center mb-4">SmartCaisse</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre email"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Connexion
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
