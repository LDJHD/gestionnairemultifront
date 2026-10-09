import PropTypes from "prop-types";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import AjoutUnit from "../form/ajoutunit";
import AppModal from "./app-modal";

/* Modale « Ajouter une unité » — gabarit partagé. */
export function ModaladdUnit({ handletoast }) {
  return (
    <AppModal
      libelle="Ajouter une unité"
      Icone={SquaresPlusIcon}
      Forme={AjoutUnit}
      propsForme={{ handletoast }}
    />
  );
}

ModaladdUnit.propTypes = {
  handletoast: PropTypes.func,
};

export default ModaladdUnit;
