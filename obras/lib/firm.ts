// v1 es de una sola firma. Todas las consultas se filtran por este id
// y toda fila nueva se crea con él. Cuando exista multi-firma, esto se
// reemplaza por el id de la firma de la sesión.
export const FIRM_ID = process.env.DEFAULT_FIRM_ID ?? "firm_default";
