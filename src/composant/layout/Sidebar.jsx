import { Link } from "react-router-dom";
import { FaBox, FaShoppingCart, FaUser, FaCreditCard, FaBars } from "react-icons/fa";

function Sidebar() {
  return (
    <nav className="sidebar d-flex flex-column bg-dark text-light p-4">
      <div className="d-flex align-items-center mb-4">
        <FaBars className="menu-icon me-2" />
        <h2 className="h5 mb-0">Menu</h2>
      </div>
      <ul className="nav flex-column">
      
        <li className="nav-item">
            <Link className="nav-link text-light d-flex align-items-center" to="/utilisateur">
              <FaUser className="sidebar-icon me-2" /> Utilisateur
            </Link>
        </li>
        
        <li className="nav-item">
          <Link className="nav-link text-light d-flex align-items-center" to="/produit">
            <FaBox className="sidebar-icon me-2" /> Produits
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-light d-flex align-items-center" to="/commande">
            <FaShoppingCart className="sidebar-icon me-2" /> Commandes
          </Link>
        </li>
        
        <li className="nav-item">
          <Link className="nav-link text-light d-flex align-items-center" to="/paiements">
            <FaCreditCard className="sidebar-icon me-2" /> Paiement
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;