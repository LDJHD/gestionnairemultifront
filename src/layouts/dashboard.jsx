import { Routes, Route } from "react-router-dom";
import { useMaterialTailwindController } from "@/context";
import { Sidenav, DashboardNavbar, Configurator, Footer } from "@/widgets/layout";
import routes from "@/routes";

/* ===========================================================================
   « LE GESTIONNAIRE » — LAYOUT BACK-OFFICE
   Barre latérale 280 px + header collant, contenu fluide jusqu'à 8xl.
   =========================================================================== */

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const { sidenavType } = controller;

  return (
    <div className="min-h-screen bg-transparent">
      <Sidenav
        routes={routes}
        brandImg={sidenavType === "dark" ? "/img/logo-ct.png" : "/image/logo.png"}
      />

      <div className="min-h-screen xl:pl-[280px]">
        <DashboardNavbar />
        <Configurator />

        <main className="mx-auto max-w-8xl px-4 pb-16 sm:px-6 lg:px-8">
          <Routes>
            {routes.map(
              ({ layout, pages }) =>
                layout === "dashboard" &&
                pages.map(({ path, element }) => (
                  <Route exact path={path} element={element} key={path} />
                ))
            )}
          </Routes>

          <div className="mt-10 text-ink-500">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layouts/dashboard.jsx";

export default Dashboard;