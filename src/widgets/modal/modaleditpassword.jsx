import PropTypes from "prop-types";
import { KeyIcon } from "@heroicons/react/24/outline";
import Modifiepassword from "../form/modifiepassword";
import AppModal from "./app-modal";

/* Modale « Modifier le mot de passe » — gabarit partagé. */
export function Modaleditpassword({ handletoast, userId }) {
  return (
    <AppModal
      libelle="Modifier le mot de passe"
      Icone={KeyIcon}
      Forme={Modifiepassword}
      propsForme={{ handletoast, userId: userId }}
      iconeSeul
    />
  );
}

Modaleditpassword.propTypes = {
  handletoast: PropTypes.func,
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Modaleditpassword;
