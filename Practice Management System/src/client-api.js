import { supabase } from './supabase.js'

const clientFields = 'id, nombre, apellido, telefono, email, notas, estado, created_at, updated_at'
const sessionFields = 'id, client_id, fecha, hora_inicio, duracion_minutos, estado, notas, created_at, updated_at'

function databaseError(error) {
  return new Error(error.message || 'No se pudo completar la operación.')
}

export async function listClients() {
  const { data, error } = await supabase.schema('practice_management')
    .from('clients')
    .select(clientFields)
    .order('apellido', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) throw databaseError(error)
  return data
}

export async function createClient(client) {
  const { data, error } = await supabase.schema('practice_management')
    .from('clients')
    .insert(client)
    .select(clientFields)
    .single()

  if (error) throw databaseError(error)
  return data
}

export async function updateClient(id, client) {
  const { data, error } = await supabase.schema('practice_management')
    .from('clients')
    .update(client)
    .eq('id', id)
    .select(clientFields)
    .single()

  if (error) throw databaseError(error)
  return data
}

export async function listClientSessions(clientId) {
  const { data, error } = await supabase.schema('practice_management')
    .from('sessions')
    .select(sessionFields)
    .eq('client_id', clientId)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false })

  if (error) throw databaseError(error)
  return data
}

export async function createSession(session) {
  const { data, error } = await supabase.schema('practice_management')
    .from('sessions')
    .insert(session)
    .select(sessionFields)
    .single()

  if (error) throw databaseError(error)
  return data
}

export async function updateSession(id, session) {
  const { data, error } = await supabase.schema('practice_management')
    .from('sessions')
    .update(session)
    .eq('id', id)
    .select(sessionFields)
    .single()

  if (error) throw databaseError(error)
  return data
}
