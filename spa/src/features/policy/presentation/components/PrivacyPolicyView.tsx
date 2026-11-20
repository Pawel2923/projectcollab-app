import { BackButton } from "@/shared/ui"
import { m } from "@/paraglide/messages"

export interface PrivacyPolicyViewProps {
  referer?: string
}

export function PrivacyPolicyView({ referer }: PrivacyPolicyViewProps) {
  return (
    <>
      <BackButton
        href={referer || "/"}
        label={m.common_back()}
        position="fixed"
      />

      <main className="mx-auto max-w-3xl px-4 py-12 text-foreground">
        <h1 className="mb-6 text-3xl font-bold">{m.policy_privacy_title()}</h1>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec1_title()}
          </h2>
          <p className="mb-2">
            {m.policy_privacy_sec1_p1_before()}
            <span className="font-semibold">ProjectCollab</span>
            {m.policy_privacy_sec1_p1_thesis()}
          </p>
          <p className="mb-2">{m.policy_privacy_sec1_p2()}</p>
          <div className="mb-2">
            <span className="font-semibold">
              {m.policy_privacy_sec1_admin_label()}
            </span>{" "}
            <span className="text-muted-foreground italic">Paweł Poremba</span>
            <br />
            <span className="font-semibold">
              {m.policy_privacy_sec1_email_label()}
            </span>{" "}
            <span className="text-muted-foreground italic">
              projectcollab@nis-lab.com
            </span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec2_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec2_intro()}</p>
          <ul className="mb-2 ml-4 list-inside list-disc">
            <li>{m.policy_privacy_sec2_item1()}</li>
            <li>{m.policy_privacy_sec2_item2()}</li>
            <li>{m.policy_privacy_sec2_item3()}</li>
            <li>{m.policy_privacy_sec2_item4()}</li>
            <li>{m.policy_privacy_sec2_item5()}</li>
          </ul>
          <p className="mb-2">{m.policy_privacy_sec2_ip_info()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec3_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec3_intro()}</p>
          <ul className="mb-2 ml-4 list-inside list-disc">
            <li>{m.policy_privacy_sec3_item1()}</li>
            <li>{m.policy_privacy_sec3_item2()}</li>
            <li>{m.policy_privacy_sec3_item3()}</li>
            <li>{m.policy_privacy_sec3_item4()}</li>
            <li>{m.policy_privacy_sec3_item5()}</li>
          </ul>
          <p className="mb-2">{m.policy_privacy_sec3_no_marketing()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec4_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec4_intro()}</p>
          <ul className="mb-2 ml-4 list-inside list-disc">
            <li>{m.policy_privacy_sec4_item1()}</li>
            <li>{m.policy_privacy_sec4_item2()}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec5_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec5_intro()}</p>
          <ul className="mb-2 ml-4 list-inside list-disc">
            <li>Google,</li>
            <li>Microsoft.</li>
          </ul>
          <p className="mb-2">{m.policy_privacy_sec5_third_parties()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec6_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec6_p1()}</p>
          <p className="mb-2">{m.policy_privacy_sec6_p2()}</p>
          <p className="mb-2">{m.policy_privacy_sec6_p3()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec7_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec7_p1()}</p>
          <p className="mb-2">{m.policy_privacy_sec7_p2()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec8_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec8_intro()}</p>
          <ul className="mb-2 ml-4 list-inside list-disc">
            <li>{m.policy_privacy_sec8_item1()}</li>
            <li>{m.policy_privacy_sec8_item2()}</li>
            <li>{m.policy_privacy_sec8_item3()}</li>
            <li>{m.policy_privacy_sec8_item4()}</li>
          </ul>
          <p className="mb-2">{m.policy_privacy_sec8_contact()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec9_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec9_p1()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_privacy_sec10_title()}
          </h2>
          <p className="mb-2">{m.policy_privacy_sec10_p1()}</p>
        </section>
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-muted-foreground">
        {m.policy_privacy_footer()}
      </footer>
    </>
  )
}
