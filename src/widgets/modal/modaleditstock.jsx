import PropTypes from "prop-types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import ModifieStock from "../form/modifiestock";
import AppModal from "./app-modal";

/* Modale « Modifier le stock » — gabarit partagé. */
export function ModaleditStock({ handletoast, StockId }) {
  return (
    <AppModal
      libelle="Modifier le stock"
      Icone={PencilSquareIcon}
      Forme={ModifieStock}
      propsForme={{ handletoast, StockId: StockId }}
      iconeSeul
    />
  );
}

ModaleditStock.propTypes = {
  handletoast: PropTypes.func,
  StockId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ModaleditStock;
