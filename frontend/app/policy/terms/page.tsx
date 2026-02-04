import React from "react";

import { BackButton } from "@/components/BackButton";

export default async function TermsOfServicePage({
  searchParams,
}: {
  searchParams: Promise<{ referer?: string }>;
}) {
  const { referer } = await searchParams;

  return (
    <>
      <BackButton href={referer || "/signin"} label="Powróć" position="fixed" />

      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-6">
          Warunki korzystania z ProjectCollab
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            1. Postanowienia ogólne
          </h2>
          <p className="mb-2">
            Na potrzeby niniejszych Warunków korzystania przyjmuje się
            następujące znaczenie pojęć:
          </p>
          <ul className="list-decimal list-inside ml-4 mb-2">
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
          <h2 className="text-xl font-semibold mb-2">
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
          <h2 className="text-xl font-semibold mb-2">
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
          <h2 className="text-xl font-semibold mb-2">
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
          <h2 className="text-xl font-semibold mb-2">5. Odpowiedzialność</h2>
          <p className="mb-2">Administrator nie ponosi odpowiedzialności za:</p>
          <ul className="list-disc list-inside ml-4 mb-2">
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
          <h2 className="text-xl font-semibold mb-2">6. Usługi zewnętrzne</h2>
          <p className="mb-2">
            Administrator nie ponosi odpowiedzialności za funkcjonowanie usług
            zewnętrznych, z którymi ProjectCollab może się integrować, ani za
            skutki wynikające z regulaminów tych usług.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            7. Postanowienia końcowe
          </h2>
          <p className="mb-2">
            W sprawach nieuregulowanych niniejszymi Warunkami korzystania
            zastosowanie mają odpowiednie przepisy prawa powszechnie
            obowiązującego.
          </p>
        </section>
      </main>

      <footer className="max-w-3xl mx-auto px-4 pb-8 text-gray-500 text-sm text-center">
        Warunki korzystania z ProjectCollab – wersja z dnia 14.12.2025 r.
      </footer>
    </>
  );
}
