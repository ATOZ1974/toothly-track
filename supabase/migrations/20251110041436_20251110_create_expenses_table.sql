/*
  # Create expenses and transactions tables

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `description` (text)
      - `amount` (decimal)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text: 'income' or 'expense')
      - `description` (text)
      - `amount` (decimal)
      - `date` (date)
      - `source` (text: 'treatment' or 'manual')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only view/manage their own expenses and transactions
    - Income from treatments auto-created, expenses manually added
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  description text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
