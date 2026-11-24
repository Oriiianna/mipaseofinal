/** Página de inicio de cada rol después de ingresar. */
export const HOME_BY_ROLE = {
  owner: "/duenio/paseos",
  walker: "/paseador/paseos",
  admin: "/admin",
};

/** Nombre de cada rol para mostrar en pantalla. */
export const ROLE_LABELS = {
  owner: "Dueño",
  walker: "Paseador",
  admin: "Administrador",
};

/** Links de la barra de navegación de cada rol. */
export const NAV_BY_ROLE = {
  owner: [
    { to: "/duenio/paseos", label: "Mis Paseos" },
    { to: "/duenio/mascotas", label: "Mis Mascotas" },
    { to: "/duenio/buscar", label: "Buscar Paseadores" },
  ],
  walker: [
    { to: "/paseador/paseos", label: "Mis Paseos" },
    { to: "/paseador/perfil", label: "Mi Perfil" },
  ],
  admin: [
    { to: "/admin", label: "Panel", end: true },
    { to: "/admin/usuarios", label: "Usuarios" },
    { to: "/admin/paseos", label: "Paseos" },
    { to: "/admin/resenas", label: "Reseñas" },
  ],
};
