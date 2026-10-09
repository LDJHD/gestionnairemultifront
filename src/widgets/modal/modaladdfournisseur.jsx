import PropTypes from "prop-types";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import AjoutFournisseur from "../form/ajoutfournisseur";
import AppModal from "./app-modal";

/* Modale « Ajouter un fournisseur » — gabarit partagé. */
export function Modaladdfournisseur({ handletoast }) {
  return (
    <AppModal
      libelle="Ajouter un fournisseur"
      Icone={BuildingStorefrontIcon}
      Forme={AjoutFournisseur}
      propsForme={{ handletoast }}
    />
  );
}

Modaladdfournisseur.propTypes = {
  handletoast: PropTypes.func,
};

export default Modaladdfournisseur;
