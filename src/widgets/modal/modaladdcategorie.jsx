import PropTypes from "prop-types";
import { TagIcon } from "@heroicons/react/24/outline";
import AjoutCategorie from "../form/ajoutcategorie";
import AppModal from "./app-modal";

/* Modale « Ajouter une catégorie » — gabarit partagé. */
export function Modaladdcategorie({ handletoast }) {
  return (
    <AppModal
      libelle="Ajouter une catégorie"
      Icone={TagIcon}
      Forme={AjoutCategorie}
      propsForme={{ handletoast }}
    />
  );
}

Modaladdcategorie.propTypes = {
  handletoast: PropTypes.func,
};

export default Modaladdcategorie;
