import { useState, useEffect } from "react";
import { getAllPaiements, ajouterPaiement, modifierPaiement, supprimerPaiement } from "../../services/api.js";
import DataTable from "react-data-table-component";
import { Modal, Form, Button, Card } from "react-bootstrap";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2"; // Ajoute SweetAlert2

const customStyles = {
  headCells: { style: { backgroundColor: "#193072", color: "#fff", fontWeight: "bold" } },
  cells: { style: { fontSize: "14px", textAlign: "center" } }, // Centrer les cellules
};

function Paiement() {
  const [paiements, setPaiements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModalAjout, setShowModalAjout] = useState(false);
  const [showModalModif, setShowModalModif] = useState(false);
  const [error, setError] = useState(null);
  const [newPaiement, setNewPaiement] = useState({ idCommande: "", montant: "" });
  const [paiementSelectionne, setPaiementSelectionne] = useState({ idPaiement: "", idCommande: "", montant: "" });

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = () => {
    getAllPaiements()
      .then((response) => {
        setPaiements(response.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des paiements:", err);
        setError("Impossible de charger les paiements : " + (err.response?.data?.message || err.message));
        Swal.fire({
          title: "Erreur",
          text: "Impossible de charger les paiements : " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  const handleAjouterPaiement = () => {
    const paiementToAdd = {
      idCommande: parseInt(newPaiement.idCommande, 10),
      montant: parseFloat(newPaiement.montant),
    };
    ajouterPaiement(paiementToAdd)
      .then(() => {
        fetchPaiements();
        setShowModalAjout(false);
        setNewPaiement({ idCommande: "", montant: "" });
        Swal.fire({
          title: "Succès !",
          text: "Le paiement a été ajouté avec succès.",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((err) => {
        setError("Erreur lors de l'ajout : " + (err.response?.data?.message || err.message));
        Swal.fire({
          title: "Erreur",
          text: "Erreur lors de l'ajout : " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  const handleModifierPaiement = () => {
    const paiementToUpdate = {
      idCommande: parseInt(paiementSelectionne.idCommande, 10),
      montant: parseFloat(paiementSelectionne.montant),
    };
    modifierPaiement(paiementSelectionne.idPaiement, paiementToUpdate)
      .then(() => {
        fetchPaiements();
        setShowModalModif(false);
        Swal.fire({
          title: "Succès !",
          text: "Le paiement a été modifié avec succès.",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((err) => {
        setError("Erreur lors de la modification : " + (err.response?.data?.message || err.message));
        Swal.fire({
          title: "Erreur",
          text: "Erreur lors de la modification : " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  const handleSupprimerPaiement = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Vous ne pourrez pas récupérer ce paiement après suppression !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        supprimerPaiement(id)
          .then(() => {
            fetchPaiements();
            Swal.fire({
              title: "Supprimé !",
              text: "Le paiement a été supprimé avec succès.",
              icon: "success",
              confirmButtonText: "OK",
            });
          })
          .catch((err) => {
            setError("Erreur lors de la suppression : " + (err.response?.data?.message || err.message));
            Swal.fire({
              title: "Erreur",
              text: "Erreur lors de la suppression : " + (err.response?.data?.message || err.message),
              icon: "error",
              confirmButtonText: "OK",
            });
          });
      }
    });
  };

  const columns = [
    { name: "ID", selector: (row) => row.idPaiement, sortable: true, style: { textAlign: "center" } },
    { name: "Commande ID", selector: (row) => row.commande?.idCommande || row.idCommande, sortable: true, style: { textAlign: "center" } },
    { name: "Montant", selector: (row) => row.montant, sortable: true, style: { textAlign: "center" } },
    { name: "Date", selector: (row) => row.datePaiement, sortable: true, style: { textAlign: "center" } },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2" style={{ justifyContent: "center" }}>
          <Button variant="warning" size="sm" onClick={() => setPaiementSelectionne(row) || setShowModalModif(true)}>
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleSupprimerPaiement(row.idPaiement)}>
            <FaTrash />
          </Button>
        </div>
      ),
      style: { textAlign: "center", width: "150px" }, // Ajusté pour les boutons
    },
  ];

  return (
    <div className="container mt-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <Card>
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Liste des Paiements</h5>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="light" onClick={() => setShowModalAjout(true)}>
              <BsPlusCircleFill size={24} className="text-primary" />
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <DataTable
            columns={columns}
            data={paiements.filter((p) => (p.commande?.idCommande || p.idCommande || "").toString().includes(searchTerm))}
            pagination
            customStyles={customStyles}
            noDataComponent="Aucun paiement disponible"
          />
        </Card.Body>
      </Card>

      <Modal show={showModalAjout} onHide={() => setShowModalAjout(false)}>
        <Modal.Header closeButton><Modal.Title>Ajouter un Paiement</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ID Commande</Form.Label>
              <Form.Control
                type="number"
                value={newPaiement.idCommande}
                onChange={(e) => setNewPaiement({ ...newPaiement, idCommande: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Montant</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={newPaiement.montant}
                onChange={(e) => setNewPaiement({ ...newPaiement, montant: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalAjout(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleAjouterPaiement}>Ajouter</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalModif} onHide={() => setShowModalModif(false)}>
        <Modal.Header closeButton><Modal.Title>Modifier Paiement</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ID Commande</Form.Label>
              <Form.Control
                type="number"
                value={paiementSelectionne.idCommande}
                onChange={(e) => setPaiementSelectionne({ ...paiementSelectionne, idCommande: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Montant</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={paiementSelectionne.montant}
                onChange={(e) => setPaiementSelectionne({ ...paiementSelectionne, montant: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalModif(false)}>Annuler</Button>
          <Button variant="success" onClick={handleModifierPaiement}>Modifier</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Paiement;