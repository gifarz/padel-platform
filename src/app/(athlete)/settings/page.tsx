import { getMyProfileForEdit } from '@/server/queries'
import { SettingsForm } from '@/components/athlete/settings-form'
import { ChangePasswordForm } from '@/components/change-password-form'

export default async function SettingsPage() {
  const profile = await getMyProfileForEdit()
  if (!profile) return null

  return (
    <div>
      <h1 className="d text-5xl sm:text-7xl">
        Pengaturan<br /><span className="text-accent">profil.</span>
      </h1>
      <SettingsForm
        city={profile.city ?? ''}
        bio={profile.bio}
        dominantHand={profile.dominantHand}
        preferredPosition={profile.preferredPosition}
      />
      <ChangePasswordForm />
    </div>
  )
}
