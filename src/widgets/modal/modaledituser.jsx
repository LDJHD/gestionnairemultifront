import PropTypes from "prop-types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Modifieuser from "../form/modifieuser";
import AppModal from "./app-modal";

/* Modale « Modifier l'utilisateur » — gabarit partagé. */
export function Modaledituser({ handletoast, userId }) {
  return (
    <AppModal
      libelle="Modifier l'utilisateur"
      Icone={PencilSquareIcon}
      Forme={Modifieuser}
      propsForme={{ handletoast, userId: userId }}
      iconeSeul
    />
  );
}

Modaledituser.propTypes = {
  handletoast: PropTypes.func,
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Modaledituser;
