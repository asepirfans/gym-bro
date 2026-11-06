CREATE TABLE IF NOT EXISTS "bodyWeight" (
  id serial PRIMARY KEY,
  userid text NOT NULL,
  recordedon date NOT NULL,
  weight numeric(6,2) NOT NULL,
  createdat timestamp NOT NULL DEFAULT now(),
  CONSTRAINT body_weight_positive CHECK (weight > 0 AND weight <= 1000)
);
CREATE UNIQUE INDEX IF NOT EXISTS body_weight_user_date ON "bodyWeight" (userid, recordedon);
