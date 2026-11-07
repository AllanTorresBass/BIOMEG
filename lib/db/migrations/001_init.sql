-- BIOMEG Stage 6 / V0-25 — initial PostgreSQL schema (Neon).
-- Lives in schema `biomeg` so it does not collide with other apps on the same Neon database.
-- Review before apply. No ORM. Invented catalog sections remain until G1 / Gate C.
-- Money: numeric. Results: text. Control N°: nullable. IVA/IGTF defaults from Gate B.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS biomeg;
SET LOCAL search_path TO biomeg, public;

-- ---------------------------------------------------------------------------
-- Laboratory settings
-- ---------------------------------------------------------------------------
CREATE TABLE laboratory_settings (
  id                          smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name                        text NOT NULL DEFAULT 'BIOMEG Laboratorio Clínico',
  address                     text,
  phones                      text,
  email                       text,
  rif                         text,
  qr_enabled                  boolean NOT NULL DEFAULT false,
  saturday_price_enabled      boolean NOT NULL DEFAULT false,
  discount_limit_percent      numeric(5, 2) NOT NULL DEFAULT 0,
  iva_rate_percent            numeric(5, 2) NOT NULL DEFAULT 16,
  igtf_rate_percent           numeric(5, 2) NOT NULL DEFAULT 3,
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO laboratory_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE bcv_rates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate          numeric(18, 6) NOT NULL,
  effective_on  date NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (effective_on)
);

-- ---------------------------------------------------------------------------
-- Staff identity (V0-26 will wire Argon2id)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username        text NOT NULL UNIQUE,
  display_name    text NOT NULL,
  password_hash   text,
  license_number  text,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id    text PRIMARY KEY,
  label text NOT NULL
);

INSERT INTO roles (id, label) VALUES
  ('administracion', 'Administración'),
  ('bioanalista', 'Bioanalista'),
  ('recepcion', 'Recepción'),
  ('auxiliar', 'Auxiliar')
ON CONFLICT DO NOTHING;

CREATE TABLE user_roles (
  user_id   uuid NOT NULL REFERENCES users (id),
  role_id   text NOT NULL REFERENCES roles (id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE temporary_grants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users (id),
  role_id     text NOT NULL REFERENCES roles (id),
  ends_at     timestamptz NOT NULL,
  motivo      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE staff_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users (id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  workstation     text,
  address         text,
  step_up_until   timestamptz
);

CREATE TABLE staff_sign_in_failures (
  username_key  text NOT NULL,
  address       text NOT NULL,
  failed_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (username_key, address, failed_at)
);

-- ---------------------------------------------------------------------------
-- Clients
-- ---------------------------------------------------------------------------
CREATE TABLE clients (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         text NOT NULL,
  name_key          text NOT NULL,
  cedula_type       text CHECK (cedula_type IS NULL OR cedula_type IN ('V', 'E', 'J', 'G', 'P')),
  cedula_digits     text,
  birth_date        date NOT NULL,
  sex               text CHECK (sex IS NULL OR sex IN ('M', 'F')),
  phone             text,
  email             text,
  verified          boolean NOT NULL DEFAULT false,
  active            boolean NOT NULL DEFAULT true,
  deleted_at        timestamptz,
  version           integer NOT NULL DEFAULT 1,
  created_at        timestamptz NOT NULL DEFAULT now(),
  last_saved_by     text,
  last_saved_at     timestamptz,
  CONSTRAINT clients_cedula_pair CHECK (
    (cedula_type IS NULL AND cedula_digits IS NULL)
    OR (cedula_type IS NOT NULL AND cedula_digits IS NOT NULL)
  )
);

CREATE UNIQUE INDEX clients_cedula_active_uidx
  ON clients (cedula_type, cedula_digits)
  WHERE deleted_at IS NULL AND cedula_type IS NOT NULL AND cedula_digits IS NOT NULL;

CREATE INDEX clients_name_key_idx ON clients (name_key) WHERE deleted_at IS NULL;

CREATE TABLE client_consents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES clients (id),
  channel     text NOT NULL,
  granted_at  timestamptz NOT NULL DEFAULT now(),
  granted_by  text
);

CREATE TABLE client_merges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       uuid NOT NULL REFERENCES clients (id),
  survivor_id     uuid NOT NULL REFERENCES clients (id),
  moved_order_ids uuid[] NOT NULL DEFAULT '{}',
  undone_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      text
);

-- ---------------------------------------------------------------------------
-- Catalog placeholders (G1 still open — invented structure for Stage 6)
-- ---------------------------------------------------------------------------
CREATE TABLE exam_sections (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code      text NOT NULL UNIQUE,
  name      text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE exams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  section_id  uuid REFERENCES exam_sections (id),
  active      boolean NOT NULL DEFAULT true
);

CREATE TABLE exam_analytes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         uuid NOT NULL REFERENCES exams (id),
  code            text NOT NULL,
  name            text NOT NULL,
  unit_text       text,
  reference_text  text,
  sort_order      integer NOT NULL DEFAULT 0,
  UNIQUE (exam_id, code)
);

CREATE TABLE price_matrix (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id       uuid NOT NULL REFERENCES exams (id),
  price_column  text NOT NULL,
  currency      text NOT NULL CHECK (currency IN ('USD', 'VES')),
  amount        numeric(18, 2),
  UNIQUE (exam_id, price_column, currency)
);

-- ---------------------------------------------------------------------------
-- Registries (minimal)
-- ---------------------------------------------------------------------------
CREATE TABLE physicians (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text NOT NULL,
  active      boolean NOT NULL DEFAULT true
);

CREATE TABLE convenios (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  requires_titular  boolean NOT NULL DEFAULT false,
  active            boolean NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
CREATE TABLE number_counters (
  name          text PRIMARY KEY,
  next_value    bigint NOT NULL DEFAULT 1
);

INSERT INTO number_counters (name, next_value) VALUES
  ('orden', 1),
  ('factura', 1),
  ('nota', 1)
ON CONFLICT DO NOTHING;

CREATE TABLE orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES clients (id),
  state               text NOT NULL CHECK (state IN (
                        'ABIERTA', 'INCOMPLETO', 'LIBERADO', 'EN_CORRECCION', 'ANULADA'
                      )),
  order_number        text NOT NULL UNIQUE,
  convenio_id         uuid REFERENCES convenios (id),
  convenio_name       text,
  titular_name        text,
  physician_id        uuid REFERENCES physicians (id),
  physician_name      text,
  motivo              text,
  fecha_muestra       date,
  fecha_reporte       date,
  bcv_rate            numeric(18, 6) NOT NULL,
  bcv_rate_date       date,
  version             integer NOT NULL DEFAULT 1,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          text
);

CREATE INDEX orders_client_id_idx ON orders (client_id);
CREATE INDEX orders_state_idx ON orders (state);

CREATE TABLE order_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  exam_id         uuid REFERENCES exams (id),
  exam_code       text NOT NULL,
  exam_name       text NOT NULL,
  section_code    text,
  tipo_de_costo   text NOT NULL,
  price_column    text,
  currency        text NOT NULL CHECK (currency IN ('USD', 'VES')),
  price           numeric(18, 2),
  saturday_flag   boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0
);

CREATE INDEX order_lines_order_id_idx ON order_lines (order_id);

-- ---------------------------------------------------------------------------
-- Results
-- ---------------------------------------------------------------------------
CREATE TABLE result_cells (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  order_line_id       uuid REFERENCES order_lines (id),
  section_code        text NOT NULL,
  analyte_code        text NOT NULL,
  value_text          text,
  unit_text           text,
  reference_text      text,
  marca               text,
  source              text CHECK (source IS NULL OR source IN ('teclado', 'equipo')),
  state               text NOT NULL DEFAULT 'VACIO',
  waiting_value_text  text,
  version             integer NOT NULL DEFAULT 1,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, section_code, analyte_code)
);

CREATE INDEX result_cells_order_id_idx ON result_cells (order_id);

-- ---------------------------------------------------------------------------
-- Issues / reports
-- ---------------------------------------------------------------------------
CREATE TABLE issues (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders (id),
  state           text NOT NULL CHECK (state IN ('VIGENTE', 'REEMPLAZADO')),
  token_hash      text,
  file_key        text,
  header_snapshot jsonb NOT NULL DEFAULT '{}',
  issued_at       timestamptz NOT NULL DEFAULT now(),
  issued_by       text
);

CREATE INDEX issues_order_id_idx ON issues (order_id);

-- ---------------------------------------------------------------------------
-- Money
-- ---------------------------------------------------------------------------
CREATE TABLE invoices (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL UNIQUE REFERENCES orders (id),
  factura_number    text NOT NULL UNIQUE,
  control_number    text,
  billing_ci        text,
  billing_name      text,
  billing_address   text,
  subtotal          numeric(18, 2) NOT NULL DEFAULT 0,
  total_exento      numeric(18, 2) NOT NULL DEFAULT 0,
  total_base_imp    numeric(18, 2) NOT NULL DEFAULT 0,
  iva_amount        numeric(18, 2) NOT NULL DEFAULT 0,
  igtf_amount       numeric(18, 2) NOT NULL DEFAULT 0,
  discount_amount   numeric(18, 2) NOT NULL DEFAULT 0,
  discount_percent  numeric(5, 2) NOT NULL DEFAULT 0,
  total_bs          numeric(18, 2) NOT NULL DEFAULT 0,
  total_usd         numeric(18, 2) NOT NULL DEFAULT 0,
  abono             numeric(18, 2) NOT NULL DEFAULT 0,
  resta             numeric(18, 2) NOT NULL DEFAULT 0,
  bcv_rate          numeric(18, 6) NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      uuid NOT NULL REFERENCES invoices (id),
  instrument      text NOT NULL,
  amount          numeric(18, 2) NOT NULL,
  currency        text NOT NULL CHECK (currency IN ('USD', 'VES')),
  bank            text,
  reference       text,
  workstation     text,
  operator_id     uuid REFERENCES users (id),
  paid_at         timestamptz NOT NULL DEFAULT now(),
  reversed_by_id  uuid REFERENCES payments (id),
  motivo          text
);

CREATE INDEX payments_invoice_id_idx ON payments (invoice_id);

CREATE TABLE fiscal_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      uuid NOT NULL REFERENCES invoices (id),
  kind            text NOT NULL CHECK (kind IN ('CREDITO', 'DEBITO')),
  note_number     text NOT NULL UNIQUE,
  control_number  text,
  amount          numeric(18, 2) NOT NULL,
  motivo          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      text
);

CREATE TABLE cash_closes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            text NOT NULL CHECK (kind IN ('caja', 'mensual')),
  user_id         uuid REFERENCES users (id),
  closed_on       date NOT NULL,
  total_usd       numeric(18, 2) NOT NULL DEFAULT 0,
  total_bs        numeric(18, 2) NOT NULL DEFAULT 0,
  bcv_rate        numeric(18, 6),
  resta_open      numeric(18, 2) NOT NULL DEFAULT 0,
  closed_at       timestamptz NOT NULL DEFAULT now(),
  motivo          text
);

CREATE TABLE quotes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid REFERENCES clients (id),
  payload         jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      text
);

-- ---------------------------------------------------------------------------
-- Delivery / portal / verification
-- ---------------------------------------------------------------------------
CREATE TABLE deliveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders (id),
  channel         text NOT NULL,
  destination     text,
  incomplete      boolean NOT NULL DEFAULT false,
  result          text,
  operator_id     uuid REFERENCES users (id),
  sent_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portal_attempts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyed_hash    text NOT NULL,
  address       text NOT NULL,
  attempted_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX portal_attempts_hash_idx ON portal_attempts (keyed_hash, attempted_at);
CREATE INDEX portal_attempts_address_idx ON portal_attempts (address, attempted_at);

CREATE TABLE portal_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_ids      uuid[] NOT NULL,
  display_cedula  text NOT NULL,
  display_name    text NOT NULL,
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE verification_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id      uuid NOT NULL REFERENCES issues (id),
  token_hash    text NOT NULL UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rate_limits (
  bucket_key    text NOT NULL,
  window_start  timestamptz NOT NULL,
  hit_count     integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);

-- ---------------------------------------------------------------------------
-- Audit (hash chain columns; insert-only role is an ops step after review)
-- ---------------------------------------------------------------------------
CREATE TABLE audit_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence          bigserial UNIQUE,
  request_id        uuid NOT NULL,
  severity          text NOT NULL,
  who_user_id       uuid,
  who_display_name  text,
  who_roles         text[] NOT NULL DEFAULT '{}',
  who_session_id    uuid,
  command           text NOT NULL,
  event_name        text NOT NULL,
  record_type       text,
  record_id         text,
  record_state      text,
  server_time       timestamptz NOT NULL DEFAULT now(),
  channel           text NOT NULL,
  workstation       text,
  address           text,
  gesture           text,
  source            text,
  motivo            text,
  table_version     integer,
  row_id            text,
  outcome           text NOT NULL,
  reason            text,
  change_before     jsonb,
  change_after      jsonb,
  change_field      text,
  count             integer,
  period            text,
  row_format        integer NOT NULL DEFAULT 1,
  prior_hash        text,
  row_hash          text
);

CREATE INDEX audit_events_server_time_idx ON audit_events (server_time);
CREATE INDEX audit_events_command_idx ON audit_events (command);
CREATE INDEX audit_events_request_id_idx ON audit_events (request_id);

COMMIT;
