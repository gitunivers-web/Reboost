import { Lock, ShieldCheck } from "lucide-react";

export default function SecuritySection() {
  return (
    <section className="pt-12 bg-gradient-to-r from-[#0f172a]/80 via-[#111827]/80 to-[#071043]/80 text-white rounded-2xl p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="p-4 rounded-lg bg-white/10">
            <Lock className="h-8 w-8 text-white"/>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">Votre sécurité, notre priorité absolue</h2>
            <p className="mt-2 text-gray-200">Chiffrement AES-256, hébergement UE, conformité KYC/AML, authentification multi-facteurs et audits réguliers.</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/6 p-4 rounded-lg" data-testid="card-security-encryption">
                <ShieldCheck className="h-5 w-5 text-white/90"/>
                <p className="mt-2">Chiffrement AES-256</p>
              </div>
              <div className="bg-white/6 p-4 rounded-lg" data-testid="card-security-hosting">
                <p className="mt-6">Hébergement sécurisé UE</p>
              </div>
              <div className="bg-white/6 p-4 rounded-lg" data-testid="card-security-kyc">
                <p className="mt-6">KYC & AML stricts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
