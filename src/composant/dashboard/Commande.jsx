import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Modal, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#193072",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "12px",
      padding: "8px",
    },
  },
  cells: {
    style: {
      fontSize: "11px",
      padding: "6px",
    },
  },
  table: {
    style: {
      maxHeight: "300px",
      overflowX: "hidden",
    },
  },
  tableWrapper: {
    style: {
      width: "100%",
      overflowX: "hidden",
    },
  },
};

function Commande() {
  const [commandes, setCommandes] = useState([]);
  const [produitsCommande, setProduitsCommande] = useState([]);
  const [produits, setProduits] = useState([]); // Liste des produits pour la combobox
  const [error, setError] = useState(null);
  const [searchCommande, setSearchCommande] = useState("");
  const [searchProduit, setSearchProduit] = useState("");
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [originalIdProduit, setOriginalIdProduit] = useState(null); // Ajoute cet état

  // États pour le modal d'ajout de Commande
  const [showModalCommande, setShowModalCommande] = useState(false);

  // États pour le modal d'ajout de plusieurs CommandeProduit
  const [showModalProduit, setShowModalProduit] = useState(false);
  const [newCommandeProduits, setNewCommandeProduits] = useState([
    { idCommande: "", idProduit: "", quantite: "" },
  ]); // Tableau pour stocker toutes les entrées
  const [searchProduitInputs, setSearchProduitInputs] = useState([""]); // Pour les recherches dans les combobox
  const [currentPage, setCurrentPage] = useState(0); // Page actuelle (0-based index)

  // États pour le modal de modification de CommandeProduit
  const [showModalModifierProduit, setShowModalModifierProduit] =
    useState(false);
  const [editCommandeProduit, setEditCommandeProduit] = useState({
    idCommande: "",
    idProduit: "",
    quantite: "",
  });
  const [searchProduitEditInput, setSearchProduitEditInput] = useState(""); // Pour la recherche dans le modal de modification

  useEffect(() => {
    fetchCommandes();
    fetchAllCommandeProduits();
    fetchProduits(); // Charger la liste des produits
  }, []);

  useEffect(() => {
    const filtered = commandes.filter(
      (commande) =>
        commande.idCommande.toString().includes(searchCommande) ||
        (commande.acheteur?.idUtilisateur?.toString() || "Inconnu").includes(
          searchCommande
        ) ||
        (commande.dateCommande
          ? new Date(commande.dateCommande).toLocaleString()
          : "-"
        ).includes(searchCommande) ||
        (commande.statut || "Inconnu")
          .toString()
          .toLowerCase()
          .includes(searchCommande.toLowerCase())
    );
    // Trier par idCommande en ordre ascendant
    filtered.sort((a, b) => a.idCommande - b.idCommande);
    setFilteredCommandes(filtered);
  }, [searchCommande, commandes]);

  useEffect(() => {
    // Filtrer les produitsCommande pour ne garder que ceux liés aux commandes EN_COURS
    const commandesEnCoursIds = new Set(
      commandes.filter((c) => c.statut === "EN_COURS").map((c) => c.idCommande)
    );
    const filtered = produitsCommande.filter(
      (produit) =>
        commandesEnCoursIds.has(produit.idCommande) &&
        (produit.idCommande.toString().includes(searchProduit) ||
          (produit.produit?.nom || produit.idProduit || "Inconnu")
            .toLowerCase()
            .includes(searchProduit.toLowerCase()) ||
          produit.quantite.toString().includes(searchProduit))
    );
    // Trier par idCommande, puis par idProduit en ordre ascendant
    filtered.sort((a, b) => {
      if (a.idCommande !== b.idCommande) {
        return a.idCommande - b.idCommande; // Tri par idCommande
      }
      return a.idProduit - b.idProduit; // Si idCommande est identique, tri par idProduit
    });
    setFilteredProduits(filtered);
  }, [searchProduit, produitsCommande, commandes]);

  const fetchCommandes = async () => {
    try {
      console.log("Début de fetchCommandes");
      const response = await axios.get(
        "http://localhost:9090/api/commande/toutes"
      );
      console.log("Réponse brute de /api/commande/toutes:", response.data);
      const commandesEnCours = response.data.filter(
        (commande) => commande.statut === "EN_COURS"
      );
      setCommandes(commandesEnCours || []);
      setFilteredCommandes(commandesEnCours || []);
      setError(null);
    } catch (err) {
      console.error("Erreur dans fetchCommandes:", err);
      setError(
        "Impossible de charger les commandes : " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const fetchAllCommandeProduits = async () => {
    try {
      console.log("Début de fetchAllCommandeProduits");
      const response = await axios.get(
        "http://localhost:9090/api/commande-produit/tous"
      );
      console.log(
        "Réponse brute de /api/commande-produit/tous:",
        response.data
      );
      setProduitsCommande(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Erreur dans fetchAllCommandeProduits:", err);
      setError(
        "Impossible de charger les produits : " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9090/api/produit/tous"
      );
      console.log("Réponse brute de /api/produit/tous:", response.data);
      setProduits(response.data || []);
    } catch (err) {
      console.error("Erreur dans fetchProduits:", err);
    }
  };

  // Gestion de l'ajout de Commande
  const handleAjoutCommande = () => {
    setShowModalCommande(true);
  };

  const handleCloseModalCommande = () => {
    setShowModalCommande(false);
  };

  const handleSubmitCommande = async () => {
    try {
      // 🔹 Récupérer l'ID utilisateur connecté depuis le localStorage
      const userId = localStorage.getItem("userId");
      console.log("🧠 userId trouvé dans le localStorage :", userId);
      // ✅ Vérification ajoutée ici :
      if (!userId) {
        Swal.fire({
          title: "Erreur",
          text: "Aucun utilisateur connecté. Veuillez vous reconnecter.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return; // 🔥 stoppe complètement la fonction
      }

      // 🔹 Construire l'objet commande automatiquement
      const commandeToAdd = {
        acheteur: { idUtilisateur: parseInt(userId) },
      };

      // 🩷 Option B — pour voir ce que tu envoies :
      console.log("📦 Commande envoyée au backend :", commandeToAdd);

      const response = await axios.post(
        "http://localhost:9090/api/commande/ajouter",
        commandeToAdd
      );

      if (response.data.statut === "EN_COURS") {
        setCommandes([...commandes, response.data]);
        setFilteredCommandes([...filteredCommandes, response.data]);
      }

      handleCloseModalCommande();

      Swal.fire({
        title: "Succès !",
        text: "La commande a été ajoutée avec succès.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout de la commande :", err);
      Swal.fire({
        title: "Erreur",
        text:
          "Impossible d'ajouter la commande : " +
          (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Gestion de l'ajout de plusieurs CommandeProduit
  const handleAjoutProduit = () => {
    setShowModalProduit(true);
    setCurrentPage(0); // Réinitialiser à la première page
  };

  const handleCloseModalProduit = () => {
    setShowModalProduit(false);
    setNewCommandeProduits([{ idCommande: "", idProduit: "", quantite: "" }]);
    setSearchProduitInputs([""]);
    setCurrentPage(0); // Réinitialiser la page
  };

  const handleAddNextPage = () => {
    const newProduits = [...newCommandeProduits];
    newProduits[currentPage] = {
      idCommande: newCommandeProduits[currentPage].idCommande || "",
      idProduit: newCommandeProduits[currentPage].idProduit || "",
      quantite: newCommandeProduits[currentPage].quantite || "",
    };
    newProduits.push({ idCommande: "", idProduit: "", quantite: "" });
    setNewCommandeProduits(newProduits);
    setSearchProduitInputs([...searchProduitInputs, ""]);
    setCurrentPage(currentPage + 1);
  };

  const handleChangeProduit = (value) => {
    const newSearchInputs = [...searchProduitInputs];
    newSearchInputs[currentPage] = value;
    setSearchProduitInputs(newSearchInputs);

    const selectedProduit = produits.find(
      (p) => p.nom.toLowerCase() === value.toLowerCase()
    );
    const newProduits = [...newCommandeProduits];
    if (selectedProduit) {
      newProduits[currentPage].idProduit = selectedProduit.idProduit.toString();
    }
    setNewCommandeProduits(newProduits);
  };

  const handleChangeField = (field, value) => {
    const newProduits = [...newCommandeProduits];
    newProduits[currentPage][field] = value;
    setNewCommandeProduits(newProduits);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    const newProduits = [...newCommandeProduits];
    newProduits[currentPage] = {
      idCommande: newCommandeProduits[currentPage].idCommande || "",
      idProduit: newCommandeProduits[currentPage].idProduit || "",
      quantite: newCommandeProduits[currentPage].quantite || "",
    };
    setNewCommandeProduits(newProduits);
    if (currentPage < newCommandeProduits.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSubmitProduit = async () => {
    try {
      // Valider la page actuelle avant soumission
      const newProduits = [...newCommandeProduits];
      newProduits[currentPage] = {
        idCommande: newCommandeProduits[currentPage].idCommande || "",
        idProduit: newCommandeProduits[currentPage].idProduit || "",
        quantite: newCommandeProduits[currentPage].quantite || "",
      };
      setNewCommandeProduits(newProduits);

      // Filtrer les entrées valides
      const validProduits = newCommandeProduits.filter(
        (p) => p.idCommande && p.idProduit && p.quantite
      );

      if (validProduits.length === 0) {
        Swal.fire({
          title: "Erreur",
          text: "Veuillez remplir au moins une ligne avec des valeurs valides.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      const produitsToAdd = validProduits.map((p) => ({
        idCommande: parseInt(p.idCommande),
        idProduit: parseInt(p.idProduit),
        quantite: parseInt(p.quantite),
      }));

      const response = await axios.post(
        "http://localhost:9090/api/commande-produit/ajouter/multiple",
        produitsToAdd
      );

      setProduitsCommande([...produitsCommande, ...response.data]);
      setFilteredProduits([...filteredProduits, ...response.data]);

      handleCloseModalProduit();

      Swal.fire({
        title: "Succès !",
        text: `${response.data.length} produits ont été ajoutés avec succès.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout des produits :", err);
      Swal.fire({
        title: "Erreur",
        text:
          "Impossible d'ajouter les produits : " +
          (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Gestion de la modification d'un CommandeProduit
  const handleModifierProduit = (idCommande, idProduit) => {
    const produitToEdit = produitsCommande.find(
      (p) => p.idCommande === idCommande && p.idProduit === idProduit
    );
    if (produitToEdit) {
      setEditCommandeProduit({
        idCommande: produitToEdit.idCommande,
        idProduit: produitToEdit.idProduit,
        quantite: produitToEdit.quantite,
      });
      setSearchProduitEditInput(
        produits.find((p) => p.idProduit === produitToEdit.idProduit)?.nom || ""
      ); // Pré-remplir avec le nom du produit
      setShowModalModifierProduit(true);
      setOriginalIdProduit(idProduit); // Stocker l'ancien idProduit
    }
  };

  const handleCloseModalModifierProduit = () => {
    setShowModalModifierProduit(false);
    setEditCommandeProduit({
      idCommande: "",
      idProduit: "",
      quantite: "",
    });
    setSearchProduitEditInput(""); // Réinitialiser la recherche
  };

  const handleSubmitModifierProduit = async () => {
    try {
      console.log("Modification en cours...");
      console.log("Ancien ID Produit :", originalIdProduit); // Utilise originalIdProduit au lieu de editCommandeProduit.oldIdProduit
      console.log("Nouveau ID Produit :", editCommandeProduit.idProduit);
      console.log("Quantité :", editCommandeProduit.quantite);

      const produitToUpdate = {
        idCommande: parseInt(editCommandeProduit.idCommande),
        idProduit: parseInt(editCommandeProduit.idProduit),
        quantite: parseInt(editCommandeProduit.quantite),
      };

      const url = `http://localhost:9090/api/commande-produit/modifier/${editCommandeProduit.idCommande}/${originalIdProduit}`;
      console.log("URL de la requête :", url);

      const response = await axios.put(url, produitToUpdate);

      console.log("Réponse reçue :", response.data);

      // Mettre à jour l'état : supprimer l'ancien enregistrement et ajouter le nouveau
      setProduitsCommande((prevProduits) =>
        prevProduits
          .filter(
            (p) =>
              !(
                p.idCommande === editCommandeProduit.idCommande &&
                p.idProduit === originalIdProduit
              )
          )
          .concat(response.data)
      );

      setFilteredProduits((prevFiltres) =>
        prevFiltres
          .filter(
            (p) =>
              !(
                p.idCommande === editCommandeProduit.idCommande &&
                p.idProduit === originalIdProduit
              )
          )
          .concat(response.data)
      );
      handleCloseModalModifierProduit();

      Swal.fire({
        title: "Succès !",
        text: "Le produit a été modifié avec succès.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Erreur lors de la modification :", err);
      console.error(
        "Détails de l'erreur :",
        err.response ? err.response.data : err
      );

      Swal.fire({
        title: "Erreur",
        text:
          "Impossible de modifier le produit : " +
          (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSupprimerCommande = (idCommande) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Vous allez supprimer la commande ${idCommande}. Cette action est irréversible !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:9090/api/commande/supprimer/${idCommande}`)
          .then(() => {
            setCommandes(commandes.filter((c) => c.idCommande !== idCommande));
            setFilteredCommandes(
              filteredCommandes.filter((c) => c.idCommande !== idCommande)
            );
            Swal.fire(
              "Supprimé !",
              "La commande a été supprimée avec succès.",
              "success"
            );
          })
          .catch((err) => {
            console.error("Erreur lors de la suppression :", err);
            Swal.fire(
              "Erreur",
              "Impossible de supprimer la commande : " + err.message,
              "error"
            );
          });
      }
    });
  };

  // Gestion de la suppression d'un CommandeProduit
  const handleSupprimerProduit = (idCommande, idProduit) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Vous allez supprimer le produit (Commande ID: ${idCommande}, Produit ID: ${idProduit}). Cette action est irréversible !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `http://localhost:9090/api/commande-produit/supprimer/${idCommande}/${idProduit}`
          )
          .then(() => {
            setProduitsCommande(
              produitsCommande.filter(
                (p) => p.idCommande !== idCommande || p.idProduit !== idProduit
              )
            );
            setFilteredProduits(
              filteredProduits.filter(
                (p) => p.idCommande !== idCommande || p.idProduit !== idProduit
              )
            );
            Swal.fire(
              "Supprimé !",
              "Le produit a été supprimé avec succès.",
              "success"
            );
          })
          .catch((err) => {
            console.error("Erreur lors de la suppression :", err);
            Swal.fire(
              "Erreur",
              "Impossible de supprimer le produit : " + err.message,
              "error"
            );
          });
      }
    });
  };

  const colonnesCommande = [
    {
      name: "ID",
      selector: (row) => row.idCommande || "",
      sortable: true,
      style: { textAlign: "center" },
      width: "50px",
      center: true,
    },
    {
      name: "Date",
      selector: (row) =>
        row.dateCommande ? new Date(row.dateCommande).toLocaleString() : "-",
      sortable: true,
      style: { textAlign: "center" },
      center: true,
    },
    {
      name: "Caissier",
      selector: (row) => row.acheteur?.idUtilisateur || "Inconnu",
      sortable: true,
      style: { textAlign: "center" },
      center: true,
    },
    {
      name: "Statut",
      selector: (row) => row.statut || "Inconnu",
      sortable: true,
      style: { textAlign: "center" },
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleSupprimerCommande(row.idCommande)}
            title="Supprimer"
          >
            <FaTrash />
          </Button>
        </div>
      ),
      style: { textAlign: "center", width: "80px" },
      center: true,
    },
  ];

  const colonnesProduit = [
    {
      name: "ID Com",
      selector: (row) => row.idCommande || "",
      sortable: true,
      style: { textAlign: "center" },
      center: true,
    },
    {
      name: "Produit",
      selector: (row) => row.produit?.nom || row.idProduit || "Inconnu",
      sortable: true,
      style: { textAlign: "center" },
      center: true,
    },
    {
      name: "Quantité",
      selector: (row) => row.quantite || 0,
      sortable: true,
      style: { textAlign: "center" },
      center: true,
    },
    {
      name: "Prix Total",
      selector: (row) => row.prixTotal || 0,
      sortable: true,
      style: { textAlign: "center" },
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <Button
            variant="warning"
            size="sm"
            className="me-1"
            onClick={() => handleModifierProduit(row.idCommande, row.idProduit)}
            title="Modifier"
          >
            <FaEdit />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              handleSupprimerProduit(row.idCommande, row.idProduit)
            }
            title="Supprimer"
          >
            <FaTrash />
          </Button>
        </div>
      ),
      style: { textAlign: "center", width: "80px" },
      center: true,
    },
  ];

  return (
    <div className="container mt-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Commandes en cours</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Liste des commandes</h6>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleAjoutCommande}
                >
                  <FaPlus /> Ajouter une commande
                </Button>
              </div>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Rechercher dans les commandes..."
                value={searchCommande}
                onChange={(e) => setSearchCommande(e.target.value)}
              />
              <DataTable
                columns={colonnesCommande}
                data={filteredCommandes}
                pagination
                paginationPerPage={10}
                customStyles={customStyles}
                noDataComponent="Aucune commande en cours"
              />
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">
                  Tous les produits des commandes en cours
                </h6>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleAjoutProduit}
                >
                  <FaPlus /> Ajouter des produits
                </Button>
              </div>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Rechercher dans les produits..."
                value={searchProduit}
                onChange={(e) => setSearchProduit(e.target.value)}
              />
              <DataTable
                columns={colonnesProduit}
                data={filteredProduits}
                pagination
                paginationPerPage={10}
                customStyles={customStyles}
                noDataComponent="Aucun produit disponible pour les commandes en cours"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal pour ajouter une commande */}
      <Modal show={showModalCommande} onHide={handleCloseModalCommande}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une commande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            L’utilisateur connecté sera automatiquement associé à cette
            commande.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModalCommande}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmitCommande}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour ajouter plusieurs produits à une commande */}
      <Modal show={showModalProduit} onHide={handleCloseModalProduit}>
        <Modal.Header closeButton>
          <Modal.Title>
            Ajout de produit - Page {currentPage + 1} sur{" "}
            {newCommandeProduits.length}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {currentPage >= 0 && currentPage < newCommandeProduits.length && (
              <div>
                <Form.Group controlId="formIdCommande">
                  <Form.Label>ID Commande</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Entrez l'ID de la commande"
                    value={newCommandeProduits[currentPage].idCommande}
                    onChange={(e) =>
                      handleChangeField("idCommande", e.target.value)
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formIdProduit" className="mt-2">
                  <Form.Label>Produit</Form.Label>
                  <input
                    type="text"
                    list="produitList"
                    className="form-control"
                    placeholder="Recherchez ou sélectionnez un produit..."
                    value={searchProduitInputs[currentPage]}
                    onChange={(e) => handleChangeProduit(e.target.value)}
                    required
                  />
                  <datalist id="produitList">
                    {produits.map((produit) => (
                      <option key={produit.idProduit} value={produit.nom} />
                    ))}
                  </datalist>
                </Form.Group>
                <Form.Group controlId="formQuantite" className="mt-2">
                  <Form.Label>Quantité</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Entrez la quantité"
                    value={newCommandeProduits[currentPage].quantite}
                    onChange={(e) =>
                      handleChangeField("quantite", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModalProduit}
            className="me-2"
          >
            Annuler
          </Button>
          <Button
            variant="secondary"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="me-2"
          >
            <FaArrowLeft /> Précédent
          </Button>
          <Button
            variant="primary"
            onClick={handleNextPage}
            disabled={currentPage === newCommandeProduits.length - 1}
            className="me-2"
          >
            <FaArrowRight /> Suivant
          </Button>
          <Button
            variant="success"
            onClick={handleAddNextPage}
            className="me-2"
          >
            <FaPlus /> Ajouter un autre produit
          </Button>
          <Button variant="primary" onClick={handleSubmitProduit}>
            Terminer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour modifier un produit à une commande */}
      <Modal
        show={showModalModifierProduit}
        onHide={handleCloseModalModifierProduit}
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifier un produit dans la commande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formIdCommandeModifier">
              <Form.Label>ID Commande</Form.Label>
              <Form.Control
                type="number"
                value={editCommandeProduit.idCommande}
                disabled // Non modifiable, car c'est une clé primaire
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formIdProduitModifier">
              <Form.Label>Produit</Form.Label>
              <input
                type="text"
                list="produitEditList"
                className="form-control"
                placeholder="Recherchez ou sélectionnez un produit..."
                value={searchProduitEditInput}
                onChange={(e) => {
                  setSearchProduitEditInput(e.target.value);
                  const selectedProduit = produits.find(
                    (p) => p.nom.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (selectedProduit) {
                    setEditCommandeProduit({
                      ...editCommandeProduit,
                      idProduit: selectedProduit.idProduit.toString(),
                    });
                  }
                }}
                required
              />
              <datalist id="produitEditList">
                {produits.map((produit) => (
                  <option key={produit.idProduit} value={produit.nom} />
                ))}
              </datalist>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formQuantiteModifier">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez la nouvelle quantité"
                value={editCommandeProduit.quantite}
                onChange={(e) =>
                  setEditCommandeProduit({
                    ...editCommandeProduit,
                    quantite: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModalModifierProduit}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmitModifierProduit}>
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Commande;
