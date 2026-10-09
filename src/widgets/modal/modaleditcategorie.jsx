import PropTypes from "prop-types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import ModifieCategorie from "../form/modifiecategorie";
import AppModal from "./app-modal";

/* Modale « Modifier la catégorie » — gabarit partagé. */
export function Modaleditcategorie({ handletoast, categorieId }) {
  return (
    <AppModal
      libelle="Modifier la catégorie"
      Icone={PencilSquareIcon}
      Forme={ModifieCategorie}
      propsForme={{ handletoast, categorieId: categorieId }}
      iconeSeul
    />
  );
}

Modaleditcategorie.propTypes = {
  handletoast: PropTypes.func,
  categorieId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Modaleditcategorie;
