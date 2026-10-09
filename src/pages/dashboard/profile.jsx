import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
  ShareIcon,
  HashtagIcon,
  CameraIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";

/** Titre de section avec pastille d'icône. */
function TitreSection({ icone: Icone, titre, sousTitre, ton = "brand" }) {
  const tons = {
    brand: "bg-brand-50 text-brand-600 ring-brand-100",
    accent: "bg-accent-50 text-accent-600 ring-accent-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
  };
  return (
    <div className="flex items-center gap-2.5">
      <span className={`lg-icon-chip h-9 w-9 ring-1 ring-inset ${tons[ton] || tons.brand}`}>
        <Icone className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="font-display text-base font-extrabold text-ink-900">{titre}</p>
        <p className="text-[13px] text-ink-500">{sousTitre}</p>
      </div>
    </div>
  );
}

export function Profile() {
  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      {/* ══════════════ BANDEAU DE COUVERTURE ══════════════ */}
      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-[url('/img/background-image.png')] bg-cover bg-center shadow-card">
        <div className="absolute inset-0 h-full w-full bg-ink-900/70" />
        <div className="absolute inset-0 h-full w-full bg-brand-900/40" />
      </div>

      {/* ══════════════ CARTE DE PROFIL ══════════════ */}
      <Card className="lg-card mx-4 -mt-24 overflow-hidden">
        <CardBody className="p-5">
          {/* Identité + navigation */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar
                src="/img/bruce-mars.jpeg"
                alt="bruce-mars"
                size="xl"
                variant="rounded"
                className="rounded-2xl shadow-lift ring-4 ring-white"
              />
              <div>
                <h1 className="lg-page-title">Richard Davis</h1>
                <p className="lg-page-sub">CEO / Co-Founder</p>
                <span className="lg-badge-brand mt-2">Administrateur</span>
              </div>
            </div>
            <div className="w-full lg:w-96">
              <Tabs value="app">
                <TabsHeader>
                  <Tab value="app">
                    <HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    App
                  </Tab>
                  <Tab value="message">
                    <ChatBubbleLeftEllipsisIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />
                    Message
                  </Tab>
                  <Tab value="settings">
                    <Cog6ToothIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Settings
                  </Tab>
                </TabsHeader>
              </Tabs>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* ── Réglages de la plateforme ── */}
            <div className="lg-card p-5">
              <TitreSection
                icone={Cog6ToothIcon}
                titre="Réglages plateforme"
                sousTitre="Préférences de la plateforme"
              />
              <div className="mt-5 flex flex-col gap-6">
                {platformSettingsData.map(({ title, options }) => (
                  <div key={title}>
                    <p className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      {title}
                    </p>
                    <div className="flex flex-col gap-4">
                      {options.map(({ checked, label }) => (
                        <Switch
                          key={label}
                          id={label}
                          label={label}
                          defaultChecked={checked}
                          labelProps={{
                            className: "text-[13px] font-normal text-ink-600",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Informations du profil (widget partagé) ── */}
            <ProfileInfoCard
              title="Profile Information"
              description="Hi, I'm Alec Thompson, Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (pain avoidance is creating an illusion of equality)."
              details={{
                "first name": "Alec M. Thompson",
                mobile: "(44) 123 1234 123",
                email: "alecthompson@mail.com",
                location: "USA",
                social: (
                  <div className="flex items-center gap-2">
                    {[
                      { Icone: ShareIcon, ton: "hover:bg-brand-50 hover:text-brand-700", libelle: "Facebook" },
                      { Icone: HashtagIcon, ton: "hover:bg-ink-100 hover:text-ink-800", libelle: "X (Twitter)" },
                      { Icone: CameraIcon, ton: "hover:bg-violet-50 hover:text-violet-700", libelle: "Instagram" },
                    ].map(({ Icone, ton, libelle }) => (
                      <span
                        key={libelle}
                        role="img"
                        aria-label={libelle}
                        className={`grid h-8 w-8 place-items-center rounded-lg text-ink-400 ring-1 ring-inset ring-ink-200 transition-colors ${ton}`}
                      >
                        <Icone className="h-4 w-4" />
                      </span>
                    ))}
                  </div>
                ),
              }}
              action={
                <Tooltip content="Edit Profile">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-ink-400" />
                </Tooltip>
              }
            />

            {/* ── Messages (widget partagé) ── */}
            <div>
              <TitreSection
                icone={ChatBubbleLeftEllipsisIcon}
                titre="Messages"
                sousTitre="Conversations récentes"
                ton="accent"
              />
              <ul className="mt-4 flex flex-col gap-4">
                {conversationsData.map((props) => (
                  <MessageCard
                    key={props.name}
                    {...props}
                    action={
                      <button type="button" className="lg-btn-soft lg-btn-sm">
                        reply
                      </button>
                    }
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* ── Projets ── */}
          <div className="mt-10 border-t border-ink-100 pt-6">
            <TitreSection
              icone={HomeIcon}
              titre="Projets"
              sousTitre="Architects design houses"
              ton="violet"
            />
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {projectsData.map(({ img, title, description, tag, route, members }) => (
                <Card key={title} className="lg-card-hover overflow-hidden">
                  <div className="h-44 w-full overflow-hidden bg-ink-100 xl:h-36">
                    <img
                      src={img}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardBody className="p-4">
                    <span className="lg-badge-brand">{tag}</span>
                    <h3 className="mt-2 font-display text-base font-extrabold text-ink-900">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13px] text-ink-500 lg-clamp-2">{description}</p>
                  </CardBody>
                  <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
                    <Link to={route} className="lg-btn-neutral lg-btn-sm">
                      view project
                    </Link>
                    <div className="flex items-center">
                      {members.map(({ img, name }, key) => (
                        <Tooltip key={name} content={name}>
                          <Avatar
                            src={img}
                            alt={name}
                            size="xs"
                            variant="circular"
                            className={`cursor-pointer border-2 border-white ${
                              key === 0 ? "" : "-ml-2.5"
                            }`}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;