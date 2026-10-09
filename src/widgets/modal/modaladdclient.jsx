import PropTypes from "prop-types";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import AjoutClient from "../form/ajoutclient";
import AppModal from "./app-modal";

/* Modale « Ajouter un client » — gabarit partagé. */
export function Modaladdclient({ handletoast }) {
  return (
    <AppModal
      libelle="Ajouter un client"
      Icone={UserPlusIcon}
      Forme={AjoutClient}
      propsForme={{ handletoast }}
    />
  );
}

Modaladdclient.propTypes = {
  handletoast: PropTypes.func,
};

export default Modaladdclient;
