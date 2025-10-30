import { useState, useEffect } from "react";
import { getAllProduits, ajouterProduit, modifierProduit, supprimerProduit } from "../../services/api.js";
import DataTable from "react-data-table-component";
import { Modal, Form, Button, Card } from "react-bootstrap";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#193072",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "bold",
    },
  },
  cells: {
    style: {
      fontSize: "14px",
    },
  },
  pagination: {
    style: {
      border: "none",
    },
  },
};

function Produit() {
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModalAjout, setShowModalAjout] = useState(false);
  const [showModalModif, setShowModalModif] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newProduit, setNewProduit] = useState({ nom: "", prix: "", stock: "" });
  const [produitSelectionne, setProduitSelectionne] = useState({
    idProduit: "",
    nom: "",
    prix: "",
    stock: "",
  });

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = () => {
    setLoading(true);
    getAllProduits()
      .then((response) => {
        const sortedProduits = response.data.sort((a, b) => a.idProduit - b.idProduit);
        setProduits(sortedProduits);
        setError(null);
      })
      .catch((err) => {
        console.error("Erreur fetchProduits:", err);
        Swal.fire({
          title: "Erreur",
          text: "Impossible de charger les produits : " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "OK",
        });
      })
      .finally(() => setLoading(false));
  };

  const verifierAdmin = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Vérification Admin",
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Email admin" type="email">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Mot de passe" type="password">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Vérifier",
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          email: document.getElementById("swal-input1").value,
          mdp: document.getElementById("swal-input2").value,
        };
      },
    });

    if (formValues) {
      try {
        const response = await axios.post("http://localhost:9090/api/utilisateur/verifier-admin", {
          email: formValues.email,
          mdp: formValues.mdp,
        });
        return response.data.valid;
      } catch (error) {
        Swal.fire("Erreur", "Erreur lors de la vérification", error);
        return false;
      }
    }
    return false;
  };

  const handleChangeAjout = (e) => {
    setNewProduit({ ...newProduit, [e.target.name]: e.target.value });
  };

  const handleChangeModif = (e) => {
    setProduitSelectionne({ ...produitSelectionne, [e.target.name]: e.target.value });
  };

  const handleSelectProduit = async (produit) => {
    const isAdminValid = await verifierAdmin();
    if (!isAdminValid) {
      Swal.fire("Accès refusé", "Mot de passe admin incorrect ou annulé", "error");
      return;
    }
    setProduitSelectionne({
      idProduit: produit.idProduit,
      nom: produit.nom,
      prix: produit.prix,
      stock: produit.stock,
    });
    setShowModalModif(true);
  };

  const handleCloseAjout = () => {
    setShowModalAjout(false);
    setNewProduit({ nom: "", prix: "", stock: "" });
    setError(null);
  };

  const handleCloseModif = () => {
    setShowModalModif(false);
    setError(null);
  };

  const handleShowAjout = async () => {
    const isAdminValid = await verifierAdmin();
    if (!isAdminValid) {
      Swal.fire("Accès refusé", "Mot de passe admin incorrect ou annulé", "error");
      return;
    }
    setShowModalAjout(true);
  };

  const handleAjouterProduit = () => {
    const produitToAdd = {
      nom: newProduit.nom.trim(),
      prix: parseFloat(newProduit.prix) || 0,
      stock: parseInt(newProduit.stock, 10) || 0,
    };

    if (!produitToAdd.nom || produitToAdd.prix < 0 || produitToAdd.stock < 0) {
      Swal.fire({
        title: "Erreur",
        text: "Veuillez remplir tous les champs avec des valeurs valides (nom non vide, prix et stock >= 0).",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    ajouterProduit(produitToAdd)
      .then(() => {
        Swal.fire({
          title: "Succès !",
          text: "Le produit a été ajouté avec succès.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchProduits();
        handleCloseAjout();
      })
      .catch((err) => {
        console.error("Erreur handleAjouterProduit:", err);
        Swal.fire({
          title: "Erreur",
          text: "Erreur lors de l'ajout du produit : " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  const handleModifierProduit = () => {
    const produitToUpdate = {
      nom: produitSelectionne.nom.trim(),
      prix: parseFloat(produitSelectionne.prix) || 0,
      stock: parseInt(produitSelectionne.stock, 10) || 0,
    };

    if (!produitToUpdate.nom || produitToUpdate.prix < 0 || produitToUpdate.stock < 0) {
      Swal.fire({
        title: "Erreur",
        text: "Veuillez remplir tous les champs avec des valeurs valides (nom non vide, prix et stock >= 0).",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    modifierProduit(produitSelectionne.idProduit, produitToUpdate)
      .then(() => {
        Swal.fire({
          title: "Succès !",
          text: "Le produit a été modifié avec succès.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchProduits();
        handleCloseModif();
      })
      .catch((err) => {
        console.error("Erreur handleModifierProduit:", err.response ? err.response : err);
        Swal.fire({
          title: "Erreur",
          text: "Erreur lors de la modification du produit : " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  const handleSupprimerProduit = async (id) => {
    const isAdminValid = await verifierAdmin();
    if (!isAdminValid) {
      Swal.fire("Accès refusé", "Mot de passe admin incorrect ou annulé", "error");
      return;
    }

    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Vous allez supprimer le produit avec l'ID ${id}. Cette action est irréversible !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        supprimerProduit(id)
          .then(() => {
            Swal.fire({
              title: "Supprimé !",
              text: "Le produit a été supprimé avec succès.",
              icon: "success",
              confirmButtonText: "OK",
            });
            fetchProduits();
          })
          .catch((err) => {
            console.error("Erreur handleSupprimerProduit:", err.response ? err.response : err);
            Swal.fire({
              title: "Erreur",
              text: "Erreur lors de la suppression du produit : " + (err.response?.data?.message || err.message),
              icon: "error",
              confirmButtonText: "OK",
            });
          });
      }
    });
  };

  const columns = [
    { name: "ID", selector: (row) => row.idProduit, sortable: true, center: true },
    { name: "Nom", selector: (row) => row.nom, sortable: true, center: true },
    { name: "Prix", selector: (row) => row.prix, sortable: true, center: true },
    { name: "Stock", selector: (row) => row.stock, sortable: true, center: true },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button variant="warning" size="sm" onClick={() => handleSelectProduit(row)}>
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleSupprimerProduit(row.idProduit)}>
            <FaTrash />
          </Button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <div className="container mt-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <Card>
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Liste des Produits</h5>
          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "200px" }}
            />
            <Button variant="light" onClick={handleShowAjout}>
              <BsPlusCircleFill size={24} className="text-primary" />
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <DataTable
            columns={columns}
            data={produits.filter((p) => p.nom.toLowerCase().includes(searchTerm.toLowerCase()))}
            pagination
            highlightOnHover
            customStyles={customStyles}
            noDataComponent="Aucun produit disponible"
            progressPending={loading}
            progressComponent={<div>Chargement des produits...</div>}
          />
        </Card.Body>
      </Card>

      {/* Modal d'Ajout */}
      <Modal show={showModalAjout} onHide={handleCloseAjout}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Produit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={newProduit.nom}
                onChange={handleChangeAjout}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix</Form.Label>
              <Form.Control
                type="number"
                name="prix"
                value={newProduit.prix}
                onChange={handleChangeAjout}
                step="0.01"
                min="0"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={newProduit.stock}
                onChange={handleChangeAjout}
                min="0"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAjout}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleAjouterProduit}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Modification */}
      <Modal show={showModalModif} onHide={handleCloseModif}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Produit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={produitSelectionne.nom}
                onChange={handleChangeModif}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix</Form.Label>
              <Form.Control
                type="number"
                name="prix"
                value={produitSelectionne.prix}
                onChange={handleChangeModif}
                step="0.01"
                min="0"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={produitSelectionne.stock}
                onChange={handleChangeModif}
                min="0"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModif}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleModifierProduit}>
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Produit;