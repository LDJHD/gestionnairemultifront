import PropTypes from "prop-types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import ModifieUnit from "../form/modifieunit";
import AppModal from "./app-modal";

/* Modale « Modifier l'unité » — gabarit partagé. */
export function ModaleditUnit({ handletoast, unitId }) {
  return (
    <AppModal
      libelle="Modifier l'unité"
      Icone={PencilSquareIcon}
      Forme={ModifieUnit}
      propsForme={{ handletoast, unitId: unitId }}
      iconeSeul
    />
  );
}

ModaleditUnit.propTypes = {
  handletoast: PropTypes.func,
  unitId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ModaleditUnit;
