import { redirect } from 'next/navigation'

// "Turnamen" is the public-facing term; the canonical route/model stays
// /competitions so we don't break existing links or the Competition model.
export default function TournamentsAlias() {
  redirect('/competitions')
}
