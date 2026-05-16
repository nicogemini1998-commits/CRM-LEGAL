-- ============================================================
-- IURALEX by Cliender — Seed de datos iniciales
-- Ejecutar después de las migraciones
-- ============================================================

-- Usuario administrador principal: Nicolas (Cliender)
-- Email: nicolas@cliender.com | Password: Master123
INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'nicolas@cliender.com',
  '$2b$12$MyI0/f4ifgAp2znrpguP0eiDfSUkLge5kR6aRAerauoLlQcbI9kUy',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Perfil del administrador
INSERT INTO user_profiles (id, full_name, organization, gdpr_consent, gdpr_consent_date, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Nicolas — Cliender',
  'Cliender',
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  organization = EXCLUDED.organization,
  updated_at = NOW();

-- Templates de contratos predefinidos (5 tipos core de IURALEX)
INSERT INTO contract_templates (name, description, prompt_template, fields, category, is_active)
VALUES
  (
    'NDA - Acuerdo de Confidencialidad',
    'Acuerdo de no divulgación bilateral para proteger información confidencial entre empresas o particulares.',
    'Genera un contrato NDA completo conforme a la legislación española (Código Civil art. 1.255 y Ley de Secretos Empresariales 1/2019). Partes: {{parte_reveladora}} y {{parte_receptora}}. Objeto: {{objeto_confidencial}}. Duración: {{duracion}} años. Penalización: {{penalizacion}} euros. Jurisdicción: {{jurisdiccion}}.',
    '[
      {"name": "parte_reveladora", "label": "Parte que revela información", "type": "text", "required": true},
      {"name": "parte_receptora", "label": "Parte que recibe información", "type": "text", "required": true},
      {"name": "objeto_confidencial", "label": "Descripción de la información confidencial", "type": "textarea", "required": true},
      {"name": "duracion", "label": "Duración (años)", "type": "number", "required": true, "default": "3"},
      {"name": "penalizacion", "label": "Penalización por incumplimiento (€)", "type": "number", "required": false},
      {"name": "jurisdiccion", "label": "Jurisdicción/Tribunales", "type": "text", "required": true, "default": "Madrid"}
    ]',
    'Confidencialidad',
    true
  ),
  (
    'Contrato de Compraventa',
    'Contrato de compraventa de bienes muebles o inmuebles conforme al Código Civil español.',
    'Genera un contrato de compraventa completo conforme al Código Civil español (art. 1.445 y ss.). Vendedor: {{vendedor}} (NIF: {{nif_vendedor}}). Comprador: {{comprador}} (NIF: {{nif_comprador}}). Bien: {{descripcion_bien}}. Precio: {{precio}} euros. Forma de pago: {{forma_pago}}. Fecha de entrega: {{fecha_entrega}}.',
    '[
      {"name": "vendedor", "label": "Nombre completo del vendedor", "type": "text", "required": true},
      {"name": "nif_vendedor", "label": "NIF/CIF del vendedor", "type": "text", "required": true},
      {"name": "comprador", "label": "Nombre completo del comprador", "type": "text", "required": true},
      {"name": "nif_comprador", "label": "NIF/CIF del comprador", "type": "text", "required": true},
      {"name": "descripcion_bien", "label": "Descripción del bien", "type": "textarea", "required": true},
      {"name": "precio", "label": "Precio de venta (€)", "type": "number", "required": true},
      {"name": "forma_pago", "label": "Forma de pago", "type": "select", "options": ["Efectivo", "Transferencia bancaria", "Cheque bancario", "Plazos"], "required": true},
      {"name": "fecha_entrega", "label": "Fecha de entrega", "type": "date", "required": true}
    ]',
    'Civil / Mercantil',
    true
  ),
  (
    'Contrato de Arrendamiento',
    'Contrato de arrendamiento de vivienda o local de negocio conforme a la LAU.',
    'Genera un contrato de arrendamiento completo conforme a la Ley de Arrendamientos Urbanos (LAU 29/1994) y sus modificaciones. Arrendador: {{arrendador}}. Arrendatario: {{arrendatario}}. Inmueble: {{descripcion_inmueble}}. Renta mensual: {{renta}} euros. Duración: {{duracion}} años. Tipo: {{tipo_arrendamiento}}. Fianza: {{fianza}} mensualidades.',
    '[
      {"name": "arrendador", "label": "Nombre del arrendador", "type": "text", "required": true},
      {"name": "arrendatario", "label": "Nombre del arrendatario", "type": "text", "required": true},
      {"name": "descripcion_inmueble", "label": "Descripción del inmueble", "type": "textarea", "required": true},
      {"name": "renta", "label": "Renta mensual (€)", "type": "number", "required": true},
      {"name": "duracion", "label": "Duración del contrato (años)", "type": "number", "required": true, "default": "1"},
      {"name": "tipo_arrendamiento", "label": "Tipo", "type": "select", "options": ["Vivienda habitual", "Uso distinto de vivienda", "Local de negocio"], "required": true},
      {"name": "fianza", "label": "Fianza (número de mensualidades)", "type": "number", "required": true, "default": "1"}
    ]',
    'Arrendamientos',
    true
  ),
  (
    'Contrato de Préstamo',
    'Contrato de préstamo entre particulares o empresas conforme al Código Civil.',
    'Genera un contrato de préstamo completo conforme al Código Civil español (art. 1.740 y ss.). Prestamista: {{prestamista}}. Prestatario: {{prestatario}}. Capital: {{capital}} euros. Interés anual: {{interes}}%. Plazo: {{plazo}} meses. Forma de devolución: {{forma_devolucion}}.',
    '[
      {"name": "prestamista", "label": "Nombre del prestamista", "type": "text", "required": true},
      {"name": "prestatario", "label": "Nombre del prestatario", "type": "text", "required": true},
      {"name": "capital", "label": "Capital prestado (€)", "type": "number", "required": true},
      {"name": "interes", "label": "Tipo de interés anual (%)", "type": "number", "required": true, "default": "0"},
      {"name": "plazo", "label": "Plazo de devolución (meses)", "type": "number", "required": true},
      {"name": "forma_devolucion", "label": "Forma de devolución", "type": "select", "options": ["Cuotas mensuales", "Al vencimiento", "Cuotas trimestrales"], "required": true}
    ]',
    'Civil / Mercantil',
    true
  ),
  (
    'Contrato de Prestación de Servicios',
    'Contrato de prestación de servicios profesionales entre autónomos o empresas.',
    'Genera un contrato de prestación de servicios profesionales conforme al Código Civil español y Estatuto de los Trabajadores Autónomos (Ley 20/2007). Prestador: {{prestador}} (NIF: {{nif_prestador}}). Cliente: {{cliente}} (NIF: {{nif_cliente}}). Servicios: {{descripcion_servicios}}. Honorarios: {{honorarios}} euros {{periodicidad_honorarios}}. Duración: {{duracion}}.',
    '[
      {"name": "prestador", "label": "Nombre del prestador de servicios", "type": "text", "required": true},
      {"name": "nif_prestador", "label": "NIF/CIF del prestador", "type": "text", "required": true},
      {"name": "cliente", "label": "Nombre del cliente", "type": "text", "required": true},
      {"name": "nif_cliente", "label": "NIF/CIF del cliente", "type": "text", "required": true},
      {"name": "descripcion_servicios", "label": "Descripción de los servicios", "type": "textarea", "required": true},
      {"name": "honorarios", "label": "Honorarios (€)", "type": "number", "required": true},
      {"name": "periodicidad_honorarios", "label": "Periodicidad", "type": "select", "options": ["mensuales", "por hora", "por proyecto", "trimestrales"], "required": true},
      {"name": "duracion", "label": "Duración del contrato", "type": "text", "required": true, "placeholder": "6 meses / 1 año / indefinido"}
    ]',
    'Servicios',
    true
  )
ON CONFLICT (name) DO NOTHING;

-- Log de auditoria del seed
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'REGISTER',
  'user',
  '00000000-0000-0000-0000-000000000001',
  '{"source": "seed", "product": "IURALEX by Cliender", "note": "Admin user created during initial setup"}'
);
