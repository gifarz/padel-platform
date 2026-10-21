-- Indexes for the hot lookups added in the bug-fix pass.
CREATE INDEX IF NOT EXISTS "Match_competitionId_round_idx" ON "Match"("competitionId", "round");
CREATE INDEX IF NOT EXISTS "Match_nextMatchId_idx" ON "Match"("nextMatchId");
CREATE INDEX IF NOT EXISTS "CompetitionParticipant_competitionId_status_idx" ON "CompetitionParticipant"("competitionId", "status");
CREATE INDEX IF NOT EXISTS "CompetitionParticipant_athleteId_idx" ON "CompetitionParticipant"("athleteId");
CREATE INDEX IF NOT EXISTS "CompetitionParticipant_partnerId_idx" ON "CompetitionParticipant"("partnerId");
