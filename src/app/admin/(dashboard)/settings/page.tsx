import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-leather-900">Settings</h1>
      <SettingsForm
        initial={{
          storeName: settings.storeName,
          ownerEmail: settings.ownerEmail,
          ownerWhatsapp: settings.ownerWhatsapp,
          heroImage: settings.heroImage,
          bank: settings.bank,
          shippingFeeFlat: settings.shippingFeeFlat,
          freeShippingThreshold: settings.freeShippingThreshold
        }}
      />
    </div>
  );
}