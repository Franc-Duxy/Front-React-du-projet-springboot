import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../../assets/css/authentification.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ état pour voir/masquer
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:9090/api/utilisateur/login", {
        email,
        mdp: password,
      });

      if (response.data.success) {
        const utilisateur = response.data.utilisateur;

        localStorage.setItem("user", JSON.stringify(utilisateur));
        localStorage.setItem("userId", utilisateur.id);
        localStorage.setItem("userRole", utilisateur.role);
        localStorage.setItem("userName", utilisateur.nom);

        Swal.fire({
          title: "Connexion réussie",
          text: `Bienvenue, ${utilisateur.nom} !`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/produit");
        });
      } else {
        throw new Error(response.data.message || "Identifiants incorrects");
      }
    } catch (error) {
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
              {/* Champ email */}
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

              {/* Champ mot de passe */}
              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"} // 👁️ bascule ici
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)} // 🔁 toggle
                    tabIndex={-1}
                  >
                    {showPassword ? "🔒" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
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
