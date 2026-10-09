import PropTypes from "prop-types";
import { PlusIcon } from "@heroicons/react/24/outline";
import AjoutProduit from "../form/ajoutproduit";
import AppModal from "./app-modal";

/* Modale « Ajouter un produit » — gabarit partagé. */
export function Modal({ handletoast }) {
  return (
    <AppModal
      libelle="Ajouter un produit"
      Icone={PlusIcon}
      Forme={AjoutProduit}
      propsForme={{ handletoast }}
      taille="xl"
    />
  );
}

Modal.propTypes = {
  handletoast: PropTypes.func,
};

export default Modal;
