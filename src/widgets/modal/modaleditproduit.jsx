import PropTypes from "prop-types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import ModifieProduit from "../form/modifieproduit";
import AppModal from "./app-modal";

/* Modale « Modifier le produit » — gabarit partagé. */
export function Modaleditproduit({ handletoast, ProductId }) {
  return (
    <AppModal
      libelle="Modifier le produit"
      Icone={PencilSquareIcon}
      Forme={ModifieProduit}
      propsForme={{ handletoast, ProductId: ProductId }}
      taille="xl"
      iconeSeul
    />
  );
}

Modaleditproduit.propTypes = {
  handletoast: PropTypes.func,
  ProductId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Modaleditproduit;
