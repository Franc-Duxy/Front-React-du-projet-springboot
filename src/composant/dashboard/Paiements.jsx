import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Modal, Form, Button, Card } from "react-bootstrap";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaFileInvoice } from "react-icons/fa"; // Icône pour la facture
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import explicite de autoTable

const customStyles = {
  headCells: {
    style: { backgroundColor: "#193072", color: "#fff", fontWeight: "bold" },
  },
  cells: { style: { fontSize: "14px", textAlign: "center" } },
};

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    idCommande: "",
    montant: "",
    methodePaiement: "",
  });

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/paiement/tous");
        setPaiements(response.data);
        setLoading(false);
      } catch (error) {
        setError("Erreur lors de la récupération des paiements");
        setLoading(false);
        console.error("Erreur fetchPaiements:", error);
      }
    };
    fetchPaiements();
  }, []);

  const filteredPaiements = paiements.filter(
    (paiement) =>
      paiement.methodePaiement.toLowerCase().includes(search.toLowerCase()) ||
      paiement.idPaiement.toString().includes(search) ||
      paiement.idCommande.toString().includes(search)
  );

  // Fonction pour générer et télécharger la facture en PDF améliorée
  const generateInvoicePDF = async (idCommande, idPaiement, methodePaiement, datePaiement) => {
    try {
      // Récupérer les produits de la commande
      const response = await axios.get("http://localhost:9090/api/commande-produit/tous");
      const produitsCommande = response.data.filter((p) => p.idCommande === idCommande);

      if (produitsCommande.length === 0) {
        Swal.fire("Erreur", "Aucun produit trouvé pour cette commande", "error");
        return;
      }

      // Créer un nouveau document PDF
      const doc = new jsPDF();

      // Titre de l'application en haut (en bleu)
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(25, 48, 114); // Bleu (RGB: 25, 48, 114)
      doc.text("SmartCaisse", 105, 15, { align: "center" });
      doc.setTextColor(0, 0, 0); // Réinitialiser à noir pour le reste

      // Sous-titre "FACTURE"
      doc.setFontSize(20);
      doc.text("FACTURE", 105, 30, { align: "center" });

      // En-tête
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Numéro de facture : ${idPaiement}`, 20, 45);
      doc.text(`Commande : ${idCommande}`, 20, 55);
      doc.text(`Méthode de paiement : ${methodePaiement}`, 20, 65);
      doc.text(`Date : ${datePaiement || new Date().toLocaleDateString()}`, 20, 75);

      // Tableau des produits avec autoTable (style "striped")
      autoTable(doc, {
        startY: 85,
        head: [["Nom du produit", "Quantité", "Prix Total"]],
        body: produitsCommande.map((produit) => [
          produit.produit?.nom || "Inconnu",
          produit.quantite,
          `${produit.prixTotal} Ar`, // Changement de "€" à "Ar"
        ]),
        theme: "striped", // Style rayé pour une apparence différente
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [25, 48, 114], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 80 }, // Nom du produit
          1: { cellWidth: 40, halign: "center" }, // Quantité
          2: { cellWidth: 40, halign: "right" }, // Prix Total
        },
      });

      // Calcul du total
      const total = produitsCommande.reduce((sum, produit) => sum + produit.prixTotal, 0);
      const finalY = doc.lastAutoTable.finalY + 10;

      // Ligne de séparation
      doc.setLineWidth(0.5);
      doc.line(20, finalY, 190, finalY);

      // Total (avec "MGA")
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Total : ${total.toFixed(2)} MGA`, 190, finalY + 10, { align: "right" });

      // Remerciement en bas
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Merci d'avoir choisi SmartCaisse !", 105, finalY + 25, { align: "center" });

      // Télécharger le PDF
      doc.save(`facture_commande_${idCommande}_paiement_${idPaiement}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      Swal.fire("Erreur", "Impossible de générer la facture", "error");
    }
  };

  const columns = [
    { name: "ID Paiement", selector: (row) => row.idPaiement, center: true, sortable: true },
    { name: "ID Commande", selector: (row) => row.idCommande, center: true, sortable: true },
    { name: "Montant", selector: (row) => row.montant, center: true, sortable: true },
    {
      name: "Date Paiement",
      selector: (row) => row.datePaiement,
      center: true,
      sortable: true,
    },
    { name: "Méthode", selector: (row) => row.methodePaiement, center: true, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <Button
          variant="info"
          size="sm"
          onClick={() => generateInvoicePDF(row.idCommande, row.idPaiement, row.methodePaiement, row.datePaiement)}
          title="Télécharger la facture"
        >
          <FaFileInvoice /> {/* Icône pour la facture */}
        </Button>
      ),
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    try {
      const response = await axios.post(
        "http://localhost:9090/api/paiement/ajouter",
        {
          idCommande: formData.idCommande,
          methodePaiement: formData.methodePaiement,
        }
      );
      setPaiements([...paiements, response.data]);
      setShowAddModal(false);
      setFormData({ idCommande: "", montant: "", methodePaiement: "" });
      Swal.fire("Succès", "Paiement ajouté avec succès", "success");
    } catch (error) {
      Swal.fire("Erreur", "Erreur lors de l'ajout du paiement", "error");
      console.error("Erreur handleAdd:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <Card>
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Liste des paiements</h5>
          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "200px" }}
            />
            <Button variant="light" onClick={() => setShowAddModal(true)}>
              <BsPlusCircleFill size={24} className="text-primary" />
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <DataTable
            columns={columns}
            data={filteredPaiements}
            pagination
            customStyles={customStyles}
          />
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un paiement</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>ID Commande</Form.Label>
                  <Form.Control
                    type="number"
                    name="idCommande"
                    value={formData.idCommande}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Méthode de paiement</Form.Label>
                  <Form.Control
                    type="text"
                    name="methodePaiement"
                    value={formData.methodePaiement}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleAdd}>
                Ajouter
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Paiements;