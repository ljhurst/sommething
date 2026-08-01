-- Migration 022: Track why a bottle left a space (consumed, gift, other)
-- Previously every removal was assumed to be a consumption. This adds a
-- removal_reason so non-consumption removals (given as a gift, broken,
-- corked, etc.) can be recorded without implying the bottle was drunk.

CREATE TYPE removal_reason_type AS ENUM ('consumed', 'gift', 'other');

ALTER TABLE consumptions
  ADD COLUMN removal_reason removal_reason_type NOT NULL DEFAULT 'consumed';
