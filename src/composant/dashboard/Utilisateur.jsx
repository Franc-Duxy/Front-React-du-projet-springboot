import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Modal, Form, Button, Card } from "react-bootstrap";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const Utilisateur = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState({
    idUtilisateur: null,
    nom: "",
    email: "",
    mdp: "",
    role: "CAISSIER",
  });

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get("http://localhost:9090/api/utilisateur/tous");
      const sortedData = response.data.sort((a, b) => a.idUtilisateur - b.idUtilisateur);
      setUtilisateurs(sortedData);
      setFilteredUtilisateurs(sortedData);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Impossible de charger les utilisateurs";
      Swal.fire("Erreur", errorMessage, "error");
      console.error("Erreur fetchUtilisateurs:", error);
    }
  };

  useEffect(() => {
    const filtered = utilisateurs.filter(
      (utilisateur) =>
        utilisateur.nom.toLowerCase().includes(search.toLowerCase()) ||
        utilisateur.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUtilisateurs(filtered);
  }, [search, utilisateurs]);

  // Vérifier le mot de passe admin avant une action
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
        return response.data.valid; // true si admin valide, false sinon
      } catch (error) {
        Swal.fire("Erreur", "Erreur lors de la vérification", error);
        return false;
      }
    }
    return false; // Annulé ou invalide
  };

  // Ouvrir le modal après vérification admin
  const handleShowModal = async (utilisateur = null) => {
    const isAdminValid = await verifierAdmin();
    if (!isAdminValid) {
      Swal.fire("Accès refusé", "Mot de passe admin incorrect ou annulé", "error");
      return;
    }

    if (utilisateur) {
      setIsEdit(true);
      setCurrentUtilisateur({ ...utilisateur, mdp: "" });
    } else {
      setIsEdit(false);
      setCurrentUtilisateur({ idUtilisateur: null, nom: "", email: "", mdp: "", role: "CAISSIER" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUtilisateur((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:9090/api/utilisateur/modifier/${currentUtilisateur.idUtilisateur}`,
          currentUtilisateur
        );
        Swal.fire("Succès", "Utilisateur modifié avec succès", "success");
      } else {
        await axios.post("http://localhost:9090/api/utilisateur/ajouter", currentUtilisateur);
        Swal.fire("Succès", "Utilisateur ajouté avec succès", "success");
      }
      fetchUtilisateurs();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Une erreur est survenue";
      Swal.fire("Erreur", errorMessage, "error");
    }
  };

  const handleDelete = async (id) => {
    const isAdminValid = await verifierAdmin();
    if (!isAdminValid) {
      Swal.fire("Accès refusé", "Mot de passe admin incorrect ou annulé", "error");
      return;
    }

    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://localhost:9090/api/utilisateur/supprimer/${id}`);
          Swal.fire("Supprimé", response.data.message || "Utilisateur supprimé avec succès", "success");
          fetchUtilisateurs();
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Impossible de supprimer l'utilisateur";
          Swal.fire("Erreur", errorMessage, "error");
          console.error("Erreur handleDelete:", error);
        }
      }
    });
  };

  const columns = [
    { name: "ID", selector: (row) => row.idUtilisateur, sortable: true, sortField: "idUtilisateur" },
    { name: "Nom", selector: (row) => row.nom, sortable: true, sortField: "nom" },
    { name: "Email", selector: (row) => row.email, sortable: true, sortField: "email" },
    { name: "Rôle", selector: (row) => row.role, sortable: true, sortField: "role" },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <FaEdit
            className="text-primary me-2"
            style={{ cursor: "pointer" }}
            onClick={() => handleShowModal(row)}
          />
          <FaTrash
            className="text-danger"
            style={{ cursor: "pointer" }}
            onClick={() => handleDelete(row.idUtilisateur)}
          />
        </>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3>Gestion des Utilisateurs</h3>
          <Button variant="success" onClick={() => handleShowModal()}>
            <BsPlusCircleFill className="me-2" /> Ajouter Utilisateur
          </Button>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form.Group>
          <DataTable
            columns={columns}
            data={filteredUtilisateurs}
            pagination
            highlightOnHover
            striped
            defaultSortFieldId={1}
            defaultSortAsc={true}
            noDataComponent="Aucun utilisateur trouvé"
          />
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Modifier Utilisateur" : "Ajouter Utilisateur"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={currentUtilisateur.nom}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={currentUtilisateur.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="mdp"
                value={currentUtilisateur.mdp}
                onChange={handleInputChange}
                placeholder={isEdit ? "Laissez vide pour ne pas modifier" : ""}
                required={!isEdit}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rôle</Form.Label>
              <Form.Select
                name="role"
                value={currentUtilisateur.role}
                onChange={handleInputChange}
              >
                <option value="CAISSIER">Caissier</option>
                <option value="ADMIN">Admin</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">
              {isEdit ? "Modifier" : "Ajouter"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Utilisateur;