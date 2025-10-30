import { useState, useEffect } from 'react';
import { getCommandesEnCours } from '../../services/api.js';

function EnCours() {
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    getCommandesEnCours()
      .then(response => setCommandes(response.data))
      .catch(error => console.error('Erreur lors de la récupération des commandes en cours:', error));
  }, []);

  return (
    <div>
      <h2>Commandes En Cours</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Total</th>
            <th>Date</th>
            <th>Caissier</th>
            <th>Nombre Produits</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map(commande => (
            <tr key={commande.idCommande}>
              <td>{commande.idCommande}</td>
              <td>{commande.total}</td>
              <td>{commande.dateCommande}</td>
              <td>{commande.nomCaissier}</td>
              <td>{commande.nombreProduits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EnCours;