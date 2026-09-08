// Configuración de los tres directorios firm-wide.
// El "kind" es también el segmento de URL (/clientes, /proveedores, /personal).

export type DirectoryKind = "clientes" | "proveedores" | "personal";

type DirectoryMeta = {
  /** Modelo de Prisma correspondiente. */
  model: "client" | "supplier" | "employee";
  /** Etiqueta de navegación (plural). */
  navLabel: string;
  /** Título de la lista. */
  listTitle: string;
  /** Singular, para botones y encabezados de formulario. */
  singular: string;
  /** Artículo para textos ("el proveedor", "la persona"). */
  article: "el" | "la";
  /** Texto del estado vacío. */
  emptyText: string;
  /** Texto del botón de alta. */
  addLabel: string;
};

export const DIRECTORY: Record<DirectoryKind, DirectoryMeta> = {
  clientes: {
    model: "client",
    navLabel: "Clientes",
    listTitle: "Clientes",
    singular: "cliente",
    article: "el",
    emptyText: "Todavía no hay clientes cargados.",
    addLabel: "Nuevo cliente",
  },
  proveedores: {
    model: "supplier",
    navLabel: "Proveedores",
    listTitle: "Proveedores",
    singular: "proveedor",
    article: "el",
    emptyText: "Todavía no hay proveedores cargados.",
    addLabel: "Nuevo proveedor",
  },
  personal: {
    model: "employee",
    navLabel: "Personal",
    listTitle: "Personal",
    singular: "integrante del personal",
    article: "el",
    emptyText: "Todavía no hay personal cargado.",
    addLabel: "Nuevo integrante",
  },
};

export const DIRECTORY_KINDS = Object.keys(DIRECTORY) as DirectoryKind[];

export function isDirectoryKind(value: string): value is DirectoryKind {
  return value in DIRECTORY;
}
