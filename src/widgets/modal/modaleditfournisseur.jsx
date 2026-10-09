import PropTypes from "prop-types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Modifiefournisseur from "../form/modifiefournisseur";
import AppModal from "./app-modal";

/* Modale « Modifier le fournisseur » — gabarit partagé. */
export function Modaleditfournisseur({ handletoast, fournisseurId }) {
  return (
    <AppModal
      libelle="Modifier le fournisseur"
      Icone={PencilSquareIcon}
      Forme={Modifiefournisseur}
      propsForme={{ handletoast, fournisseurId: fournisseurId }}
      iconeSeul
    />
  );
}

Modaleditfournisseur.propTypes = {
  handletoast: PropTypes.func,
  fournisseurId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Modaleditfournisseur;
