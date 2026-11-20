import { BackButton } from "@/shared/ui"

export interface TermsPolicyViewProps {
  referer?: string
}

export function TermsPolicyView({ referer }: TermsPolicyViewProps) {
  return (
    <>
      <BackButton href={referer || "/"} label="Powróć" position="fixed" />

      <main className="mx-auto max-w-3xl px-4 py-12 text-foreground">
        <h1 className="mb-6 text-3xl font-bold">
          Warunki korzystania z ProjectCollab
        </h1>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            1. Postanowienia ogólne
          </h2>
          <p className="mb-2">
            Na potrzeby niniejszych Warunków korzystania przyjmuje się
            następujące znaczenie pojęć:
          </p>
          <ul className="mb-2 ml-4 list-inside list-decimal">
            <li>
              <span className="font-semibold">ProjectCollab</span> – aplikacja
              webowa stanowiąca projekt edukacyjny realizowany w ramach pracy
              dyplomowej pt. „PLATFORMA DO ZARZĄDZANIA PROJEKTAMI Z INTEGRACJĄ
              METODOLOGII AGILE”.
            </li>
            <li>
              <span className="font-semibold">Administrator</span> – osoba
              fizyczna będąca autorem i administratorem ProjectCollab.
            </li>
            <li>
              <span className="font-semibold">Użytkownik</span> – osoba
              korzystająca z ProjectCollab w zakresie przewidzianym niniejszymi
              Warunkami.
            </li>
          </ul>
          <p className="mb-2">
            Niniejsze Warunki korzystania określają zasady korzystania z
            ProjectCollab stanowiącej projekt edukacyjny realizowany w ramach
            pracy dyplomowej.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            2. Charakter ProjectCollab
          </h2>
          <p className="mb-2">
            ProjectCollab ma charakter demonstracyjny, testowy i edukacyjny.
          </p>
          <p className="mb-2">
            ProjectCollab nie jest przeznaczona do wykorzystania produkcyjnego i
            nie gwarantuje ciągłości działania, dostępności ani poprawności
            prezentowanych danych.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            3. Dostęp do ProjectCollab
          </h2>
          <p className="mb-2">
            Dostęp do ProjectCollab możliwy jest po utworzeniu konta użytkownika
            lub za pośrednictwem zewnętrznych dostawców uwierzytelniania
            (Google, Microsoft). Korzystanie z ProjectCollab odbywa się zgodnie
            z jej przeznaczeniem edukacyjnym i testowym.
          </p>
          <p className="mb-2">
            Administrator zastrzega sobie prawo do ograniczenia lub cofnięcia
            dostępu do ProjectCollab w dowolnym momencie.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            4. Obowiązki użytkownika
          </h2>
          <p className="mb-2">
            Użytkownik zobowiązany jest do korzystania z ProjectCollab zgodnie z
            jej przeznaczeniem, wyłącznie w celach testowych i edukacyjnych.
            Wszelkie działania niezgodne z tym przeznaczeniem są zabronione.
          </p>
          <p className="mb-2">
            Zabronione jest podejmowanie działań mogących zakłócić
            funkcjonowanie ProjectCollab lub naruszyć jej integralność.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">5. Odpowiedzialność</h2>
          <p className="mb-2">Administrator nie ponosi odpowiedzialności za:</p>
          <ul className="mb-2 ml-4 list-inside list-disc">
            <li>przerwy w działaniu ProjectCollab,</li>
            <li>utratę danych,</li>
            <li>
              skutki wykorzystania ProjectCollab w sposób niezgodny z jej
              przeznaczeniem.
            </li>
          </ul>
          <p className="mb-2">
            Korzystanie z ProjectCollab odbywa się na wyłączne ryzyko
            użytkownika.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">6. Usługi zewnętrzne</h2>
          <p className="mb-2">
            Administrator nie ponosi odpowiedzialności za funkcjonowanie usług
            zewnętrznych, z którymi ProjectCollab może się integrować, ani za
            skutki wynikające z regulaminów tych usług.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">
            7. Postanowienia końcowe
          </h2>
          <p className="mb-2">
            W sprawach nieuregulowanych niniejszymi Warunkami korzystania
            zastosowanie mają odpowiednie przepisy prawa powszechnie
            obowiązującego.
          </p>
        </section>
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-muted-foreground">
        Warunki korzystania z ProjectCollab – wersja z dnia 14.12.2025 r.
      </footer>
    </>
  )
}
