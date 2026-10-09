import PropTypes from "prop-types";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import AjoutStock from "../form/ajoutstock";
import AppModal from "./app-modal";

/* Modale « Ajouter un stock » — gabarit partagé. */
export function Modaladdstock({ handletoast }) {
  return (
    <AppModal
      libelle="Ajouter un stock"
      Icone={ArchiveBoxIcon}
      Forme={AjoutStock}
      propsForme={{ handletoast }}
    />
  );
}

Modaladdstock.propTypes = {
  handletoast: PropTypes.func,
};

export default Modaladdstock;
