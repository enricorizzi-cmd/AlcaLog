-- Tabella per le push subscriptions degli utenti
CREATE TABLE IF NOT EXISTS notifiche_push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- Unique constraint su user_id e endpoint usando CREATE UNIQUE INDEX
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_user_endpoint 
ON notifiche_push_subscriptions(user_id, (subscription->>'endpoint'));

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON notifiche_push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON notifiche_push_subscriptions(active) WHERE active = TRUE;

-- RLS policies
ALTER TABLE notifiche_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Utenti possono leggere solo le proprie subscriptions
CREATE POLICY "Utenti possono leggere le proprie subscriptions" ON notifiche_push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Utenti possono inserire solo le proprie subscriptions
CREATE POLICY "Utenti possono inserire le proprie subscriptions" ON notifiche_push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Utenti possono modificare solo le proprie subscriptions
CREATE POLICY "Utenti possono modificare le proprie subscriptions" ON notifiche_push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Utenti possono eliminare solo le proprie subscriptions
CREATE POLICY "Utenti possono eliminare le proprie subscriptions" ON notifiche_push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

