import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import Sidebar from "./composant/layout/Sidebar";
import Navbar from "./composant/layout/Navbar";
import Produit from "./composant/dashboard/Produit";
import Commande from "./composant/dashboard/Commande";
import Utilisateur from "./composant/dashboard/Utilisateur";
import Paiements from "./composant/dashboard/Paiements";
import Login from "./composant/authentification/Login";
import "./assets/css/styles.css";

// Route protégée (pour utilisateurs connectés)
function PrivateRoute({ component: Component }) {
  const isAuthenticated = !!localStorage.getItem("user");
  return isAuthenticated ? (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Component />
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace /> // "replace" empêche l'ajout dans l'historique
  );
}

PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
};

// Route publique (pour utilisateurs non connectés)
function PublicRoute({ component: Component }) {
  const isAuthenticated = !!localStorage.getItem("user");
  return isAuthenticated ? (
    <Navigate to="/produit" replace /> // Redirige vers /produit si connecté
  ) : (
    <Component />
  );
}

PublicRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
};

function App() {
  return (
    <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<PublicRoute component={Login} />} />
        <Route path="/login" element={<PublicRoute component={Login} />} />

        {/* Routes protégées */}
        <Route path="/utilisateur" element={<PrivateRoute component={Utilisateur} />} />
        <Route path="/produit" element={<PrivateRoute component={Produit} />} />
        <Route path="/commande" element={<PrivateRoute component={Commande} />} />
        <Route path="/paiements" element={<PrivateRoute component={Paiements} />} />
      </Routes>
    </StyleSheetManager>
  );
}

export default App;