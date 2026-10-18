import { getTenantContext } from '@/lib/tenant';
import { getUserProfile } from '@/features/profile/queries';
import { PageHeader } from '@/components/shared/page-header';
import { User as UserIcon } from 'lucide-react';
import { ProfileView } from '@/components/profile/profile-view';

export default async function ProfilePage() {
  const { session, site } = await getTenantContext();
  const profileData = await getUserProfile(session.userId, site.id);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserIcon}
        title="My Profile & Account Settings"
        description="Manage your personal details, login credentials, and practice role"
      />

      <ProfileView userId={session.userId} profileData={profileData} />
    </div>
  );
}
