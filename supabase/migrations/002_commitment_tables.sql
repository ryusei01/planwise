-- コミットメント機能用テーブル（メザミー風）
-- ID: DB_MIGRATION_COMMITMENT_001

-- 目標コミットメントテーブル
CREATE TABLE IF NOT EXISTS goal_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0), -- 金額（円）
  currency TEXT NOT NULL DEFAULT 'JPY',
  threshold_percent INTEGER NOT NULL DEFAULT 100 CHECK (threshold_percent >= 0 AND threshold_percent <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'failed', 'cancelled')),
  stripe_payment_intent_id TEXT, -- Stripe事前認証用
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evaluated_at TIMESTAMPTZ
);

-- ペナルティ請求テーブル
CREATE TABLE IF NOT EXISTS penalty_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID NOT NULL REFERENCES goal_commitments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'JPY',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'charged', 'refunded', 'waived')),
  actual_completion_percent REAL NOT NULL,
  stripe_charge_id TEXT,
  charged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_goal_commitments_goal_id ON goal_commitments(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_commitments_user_id ON goal_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_commitments_status ON goal_commitments(status);
CREATE INDEX IF NOT EXISTS idx_penalty_charges_commitment_id ON penalty_charges(commitment_id);
CREATE INDEX IF NOT EXISTS idx_penalty_charges_user_id ON penalty_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_penalty_charges_status ON penalty_charges(status);

-- RLS ポリシー
ALTER TABLE goal_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalty_charges ENABLE ROW LEVEL SECURITY;

-- 自分のコミットメントのみ閲覧・作成可能
CREATE POLICY "Users can view own commitments" ON goal_commitments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own commitments" ON goal_commitments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitments" ON goal_commitments
  FOR UPDATE USING (auth.uid() = user_id);

-- 自分のペナルティのみ閲覧可能
CREATE POLICY "Users can view own penalties" ON penalty_charges
  FOR SELECT USING (auth.uid() = user_id);

-- コミットメント評価用RPC
CREATE OR REPLACE FUNCTION evaluate_commitment(p_commitment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_commitment goal_commitments;
  v_goal goals;
  v_total_tasks INTEGER;
  v_done_tasks INTEGER;
  v_completion_percent REAL;
  v_result JSON;
BEGIN
  -- コミットメント取得
  SELECT * INTO v_commitment FROM goal_commitments WHERE id = p_commitment_id;
  IF v_commitment IS NULL THEN
    RAISE EXCEPTION 'Commitment not found';
  END IF;

  -- 目標取得
  SELECT * INTO v_goal FROM goals WHERE id = v_commitment.goal_id;
  IF v_goal IS NULL THEN
    RAISE EXCEPTION 'Goal not found';
  END IF;

  -- タスク数計算
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'done')
  INTO v_total_tasks, v_done_tasks
  FROM tasks
  WHERE plan_id = v_goal.current_plan_id;

  -- 完了率計算
  IF v_total_tasks > 0 THEN
    v_completion_percent := (v_done_tasks::REAL / v_total_tasks::REAL) * 100;
  ELSE
    v_completion_percent := 100; -- タスクなしは達成とみなす
  END IF;

  -- 評価
  IF v_completion_percent >= v_commitment.threshold_percent THEN
    -- 達成
    UPDATE goal_commitments
    SET status = 'achieved', evaluated_at = now()
    WHERE id = p_commitment_id;

    v_result := json_build_object(
      'status', 'achieved',
      'completion_percent', v_completion_percent,
      'threshold_percent', v_commitment.threshold_percent,
      'penalty_amount', 0
    );
  ELSE
    -- 未達成 - ペナルティ作成
    UPDATE goal_commitments
    SET status = 'failed', evaluated_at = now()
    WHERE id = p_commitment_id;

    INSERT INTO penalty_charges (
      commitment_id,
      user_id,
      amount,
      currency,
      status,
      actual_completion_percent
    ) VALUES (
      p_commitment_id,
      v_commitment.user_id,
      v_commitment.amount,
      v_commitment.currency,
      'pending',
      v_completion_percent
    );

    v_result := json_build_object(
      'status', 'failed',
      'completion_percent', v_completion_percent,
      'threshold_percent', v_commitment.threshold_percent,
      'penalty_amount', v_commitment.amount
    );
  END IF;

  RETURN v_result;
END;
$$;
