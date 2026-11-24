import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WidgetRender from "../components/WidgetRender";

const API = import.meta.env.VITE_API_URL;

export default function WidgetView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/v1/widget/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.erreur || "Widget introuvable");
        setData(json);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, [id]);

  if (chargement)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-500">Chargement…</p>
      </div>
    );

  if (erreur)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{erreur}</p>
      </div>
    );

  const contenu =
    typeof data.contenu === "string" ? JSON.parse(data.contenu || "{}") : data.contenu || {};

  return (
    <WidgetRender
      titre={data.titre}
      type={data.type}
      template={contenu.template}
      secteur={contenu.secteur}
      champs={contenu.champs || []}
      boutiqueNom={contenu.boutique_nom || data.titre || "Boutique"}
      onPrint={() => window.print()}
    />
  );
}
