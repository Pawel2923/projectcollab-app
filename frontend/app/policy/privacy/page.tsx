import React from "react";

import { BackButton } from "@/components/BackButton";

export default async function PrivacyPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ referer?: string }>;
}) {
  const { referer } = await searchParams;

  return (
    <>
      <BackButton href={referer || "/signin"} label="Powróć" position="fixed" />

      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-6">Polityka prywatności</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            1. Postanowienia ogólne
          </h2>
          <p className="mb-2">
            Niniejsza Polityka prywatności określa zasady przetwarzania danych
            osobowych w aplikacji webowej{" "}
            <span className="font-semibold">ProjectCollab</span> stanowiącej
            projekt edukacyjny realizowany w ramach pracy dyplomowej pt.
            „PLATFORMA DO ZARZĄDZANIA PROJEKTAMI Z INTEGRACJĄ METODOLOGII AGILE”
            (dalej: „ProjectCollab”).
          </p>
          <p className="mb-2">
            ProjectCollab ma charakter niekomercyjny, demonstracyjny i
            edukacyjny. Nie stanowi ona usługi świadczonej drogą elektroniczną w
            rozumieniu obowiązujących przepisów prawa i nie jest przeznaczona do
            wykorzystania produkcyjnego.
          </p>
          <div className="mb-2">
            <span className="font-semibold">Administrator danych:</span>{" "}
            <span className="italic text-gray-500">Paweł Poremba</span>
            <br />
            <span className="font-semibold">
              Adres e-mail do kontaktu:
            </span>{" "}
            <span className="italic text-gray-500">
              pawelporemba123@gmail.com
            </span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            2. Zakres przetwarzanych danych osobowych
          </h2>
          <p className="mb-2">
            W ramach funkcjonowania ProjectCollab mogą być przetwarzane
            następujące kategorie danych osobowych:
          </p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>adres e-mail użytkownika,</li>
            <li>nazwa użytkownika (login),</li>
            <li>hasło w postaci zaszyfrowanej (hash),</li>
            <li>
              identyfikatory użytkownika pochodzące od zewnętrznych dostawców
              uwierzytelniania (Google, Microsoft),
            </li>
            <li>
              tokeny OAuth umożliwiające dostęp do zewnętrznych usług
              użytkownika, w szczególności kalendarzy.
            </li>
          </ul>
          <p className="mb-2">
            Adres IP użytkownika może być przetwarzany w ramach standardowych
            logów serwera w celach technicznych i bezpieczeństwa, przy czym nie
            jest on utrwalany w bazie danych ProjectCollab.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            3. Cele przetwarzania danych
          </h2>
          <p className="mb-2">
            Dane osobowe przetwarzane są wyłącznie w następujących celach:
          </p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>
              zapewnienie prawidłowego procesu rejestracji i uwierzytelniania
              użytkowników,
            </li>
            <li>
              realizacja logowania lokalnego oraz logowania za pośrednictwem
              zewnętrznych dostawców tożsamości (OAuth),
            </li>
            <li>
              umożliwienie integracji ProjectCollab z usługami zewnętrznymi, w
              szczególności usługami kalendarzowymi,
            </li>
            <li>
              zapewnienie prawidłowego działania, integralności oraz
              bezpieczeństwa ProjectCollab,
            </li>
            <li>
              realizacja celów testowych, demonstracyjnych i dydaktycznych
              związanych z wykonaniem projektu dyplomowego.
            </li>
          </ul>
          <p className="mb-2">
            Dane osobowe nie są wykorzystywane do celów marketingowych,
            analitycznych ani profilowania.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            4. Podstawa prawna przetwarzania
          </h2>
          <p className="mb-2">
            Podstawą prawną przetwarzania danych osobowych jest:
          </p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>
              zgoda użytkownika, o której mowa w art. 6 ust. 1 lit. a RODO,
            </li>
            <li>
              niezbędność przetwarzania do realizacji funkcjonalności
              ProjectCollab, zgodnie z art. 6 ust. 1 lit. b RODO.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            5. Odbiorcy danych i integracje zewnętrzne
          </h2>
          <p className="mb-2">
            ProjectCollab wykorzystuje mechanizmy uwierzytelniania dostarczane
            przez podmioty trzecie:
          </p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Google,</li>
            <li>Microsoft.</li>
          </ul>
          <p className="mb-2">
            Procesy uwierzytelniania oraz integracji z tymi usługami odbywają
            się zgodnie z regulaminami i politykami prywatności tych podmiotów.
            Administrator nie ma wpływu na zakres i sposób przetwarzania danych
            przez wskazanych dostawców.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            6. Pliki cookies i technologie przechowywania danych
          </h2>
          <p className="mb-2">
            ProjectCollab wykorzystuje wyłącznie pliki cookies o charakterze
            technicznym, w tym pliki cookies z atrybutem HTTP-Only, niezbędne do
            prawidłowego funkcjonowania mechanizmów sesji i uwierzytelniania.
          </p>
          <p className="mb-2">
            Dodatkowo ProjectCollab wykorzystuje mechanizmy localStorage
            wyłącznie w celu zapisywania preferencji interfejsu użytkownika. W
            localStorage nie są przechowywane hasła ani tokeny
            uwierzytelniające.
          </p>
          <p className="mb-2">
            ProjectCollab nie stosuje plików cookies analitycznych ani
            marketingowych. Ewentualne pliki cookies pochodzące od Google lub
            Microsoft mogą być zapisywane wyłącznie w ramach ich własnych
            ekranów logowania.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            7. Okres przechowywania danych
          </h2>
          <p className="mb-2">
            Dane osobowe są przechowywane wyłącznie przez okres trwania projektu
            edukacyjnego lub do momentu ich usunięcia przez administratora.
          </p>
          <p className="mb-2">
            Użytkownik nie posiada funkcjonalności samodzielnego usunięcia
            konta. Usunięcie danych następuje na żądanie użytkownika lub na
            podstawie decyzji administratora.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            8. Prawa osoby, której dane dotyczą
          </h2>
          <p className="mb-2">
            Osobie, której dane dotyczą, przysługuje prawo do:
          </p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>dostępu do danych osobowych,</li>
            <li>ich sprostowania,</li>
            <li>usunięcia danych,</li>
            <li>ograniczenia przetwarzania.</li>
          </ul>
          <p className="mb-2">
            W celu realizacji powyższych praw należy skontaktować się z
            administratorem danych.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            9. Lokalny charakter ProjectCollab
          </h2>
          <p className="mb-2">
            ProjectCollab jest uruchamiana wyłącznie w środowisku lokalnym i nie
            jest publicznie dostępna w sieci Internet.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            10. Zmiany polityki prywatności
          </h2>
          <p className="mb-2">
            Administrator zastrzega sobie prawo do zmiany niniejszej Polityki
            prywatności w przypadku zmian funkcjonalnych ProjectCollab lub zmian
            obowiązujących przepisów prawa.
          </p>
        </section>
      </main>

      <footer className="max-w-3xl mx-auto px-4 pb-8 text-gray-500 text-sm text-center">
        Polityka prywatności ProjectCollab – wersja z dnia 14.12.2025 r.
      </footer>
    </>
  );
}
