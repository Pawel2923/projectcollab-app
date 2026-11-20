import { BackButton } from "@/shared/ui"
import { m } from "@/paraglide/messages"

export interface TermsPolicyViewProps {
  referer?: string
}

export function TermsPolicyView({ referer }: TermsPolicyViewProps) {
  return (
    <>
      <BackButton
        href={referer || "/"}
        label={m.common_back()}
        position="fixed"
      />

      <main className="mx-auto max-w-3xl px-4 py-12 text-foreground">
        <h1 className="mb-6 text-3xl font-bold">{m.policy_terms_title()}</h1>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_terms_sec1_title()}
          </h2>
          <p className="mb-2">{m.policy_terms_sec1_intro()}</p>
          <ul className="mb-2 ml-4 list-inside list-decimal">
            <li>
              <span className="font-semibold">ProjectCollab</span>{" "}
              {m.policy_terms_sec1_def_projectcollab()}
            </li>
            <li>
              <span className="font-semibold">
                {m.policy_terms_sec1_term_admin()}
              </span>{" "}
              {m.policy_terms_sec1_def_admin()}
            </li>
            <li>
              <span className="font-semibold">
                {m.policy_terms_sec1_term_user()}
              </span>{" "}
              {m.policy_terms_sec1_def_user()}
            </li>
          </ul>
          <p className="mb-2">{m.policy_terms_sec1_summary()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_terms_sec2_title()}
          </h2>
          <p className="mb-2">{m.policy_terms_sec2_p1()}</p>
          <p className="mb-2">{m.policy_terms_sec2_p2()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_terms_sec3_title()}
          </h2>
          <p className="mb-2">{m.policy_terms_sec3_p1()}</p>
          <p className="mb-2">{m.policy_terms_sec3_p2()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_terms_sec4_title()}
          </h2>
          <p className="mb-2">{m.policy_terms_sec4_p1()}</p>
          <p className="mb-2">{m.policy_terms_sec4_p2()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_terms_sec5_title()}
          </h2>
          <p className="mb-2">{m.policy_terms_sec5_intro()}</p>
          <ul className="mb-2 ml-4 list-inside list-disc">
            <li>{m.policy_terms_sec5_item1()}</li>
            <li>{m.policy_terms_sec5_item2()}</li>
            <li>{m.policy_terms_sec5_item3()}</li>
          </ul>
          <p className="mb-2">{m.policy_terms_sec5_outro()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_terms_sec6_title()}
          </h2>
          <p className="mb-2">{m.policy_terms_sec6_p1()}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            {m.policy_terms_sec7_title()}
          </h2>
          <p className="mb-2">{m.policy_terms_sec7_p1()}</p>
        </section>
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-muted-foreground">
        {m.policy_terms_footer()}
      </footer>
    </>
  )
}
