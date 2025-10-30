import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // Icône utilisateur
import { useState } from "react";
import Swal from "sweetalert2";

function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Récupérer les informations de l'utilisateur depuis localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userName = user.nom || "Utilisateur"; // Nom par défaut si pas de nom

  const handleLogout = () => {
    localStorage.removeItem("user");
    Swal.fire({
      title: "Déconnexion",
      text: "Vous avez été déconnecté avec succès.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      navigate("/login", { replace: true });
    });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/produit">
          SmartCaisse
        </Link>
        <div className="ms-auto d-flex align-items-center">
          {/* Nom de l'utilisateur */}
          <span className="me-2 text-muted">Salut {userName} !</span>

          {/* Icône utilisateur avec dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-link p-0 text-primary"
              onClick={toggleDropdown}
              style={{ textDecoration: "none" }}
            >
              <FaUserCircle size={24} />
            </button>
            {dropdownOpen && (
              <ul
                className="dropdown-menu show"
                style={{ right: 0, left: "auto" }} // Alignement à droite
              >
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;