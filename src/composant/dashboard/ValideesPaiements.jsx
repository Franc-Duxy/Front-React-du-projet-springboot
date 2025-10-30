import { useState, useEffect } from 'react';
import { getCommandesValideesPaiements } from '../../services/api.js';

function ValideesPaiements() {
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    getCommandesValideesPaiements()
      .then(response => setCommandes(response.data))
      .catch(error => console.error('Erreur lors de la récupération des commandes validées:', error));
  }, []);

  return (
    <div>
      <h2>Commandes Validées avec Paiements</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Total</th>
            <th>Date Commande</th>
            <th>Caissier</th>
            <th>ID Paiement</th>
            <th>Montant</th>
            <th>Date Paiement</th>
            <th>Méthode</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map(commande => (
            <tr key={commande.idCommande}>
              <td>{commande.idCommande}</td>
              <td>{commande.total}</td>
              <td>{commande.dateCommande}</td>
              <td>{commande.nomCaissier}</td>
              <td>{commande.idPaiement}</td>
              <td>{commande.montantPaiement}</td>
              <td>{commande.datePaiement}</td>
              <td>{commande.methodePaiement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ValideesPaiements;