import PropTypes from "prop-types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Modifieclient from "../form/modifieclient";
import AppModal from "./app-modal";

/* Modale « Modifier le client » — gabarit partagé. */
export function Modaleditclient({ handletoast, ClientId }) {
  return (
    <AppModal
      libelle="Modifier le client"
      Icone={PencilSquareIcon}
      Forme={Modifieclient}
      propsForme={{ handletoast, ClientId: ClientId }}
      iconeSeul
    />
  );
}

Modaleditclient.propTypes = {
  handletoast: PropTypes.func,
  ClientId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Modaleditclient;
