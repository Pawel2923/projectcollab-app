/**
 * Symfony validation constraint codes mapping to Polish messages
 * Based on common Symfony validation constraints
 */
export const symfonyValidationMessages: Record<string, string> = {
  // NotBlank, NotNull
  "c1051bb4-d103-4f74-8988-acbcafc7fdc3": "To pole jest wymagane.",
  "ad32d13f-c3d4-423b-909a-857b961eb720": "Wartość nie może być pusta.",

  // Email
  "bd79c0ab-ddba-46cc-a703-a7a4b08de310": "Adres email jest nieprawidłowy.",

  // Length
  "d94b19cc-114f-4f44-9cc4-4138e80a87b9":
    "Wartość jest zbyt krótka. Minimalna długość to {{ limit }} znaków.",
  "9ff3fdc4-b214-49db-8718-39c315e33d45":
    "Wartość jest zbyt długa. Maksymalna długość to {{ limit }} znaków.",

  // Unique
  "23bd9dbf-6b9b-41cd-a99e-4844bcf3077f": "Ta wartość jest już używana.", // Generic fallback - context-specific translations handled in translateSymfonyValidation()

  // Range
  "2d28afcb-e32e-45fb-a815-01c431a86a69":
    "Wartość powinna być większa lub równa {{ min }}.",
  "8b179ce1-0539-4bd6-8b5a-6e4f96b4dd0e":
    "Wartość powinna być mniejsza lub równa {{ max }}.",

  // Choice
  "8e179f1b-97aa-4560-a02f-2a8b42e49df7": "Wybrana wartość jest nieprawidłowa.",

  // Type
  "ba785a8c-82cb-4283-967c-3cf342181b40": "Wartość ma nieprawidłowy typ.",

  // Regex
  "de1e3db3-5ed4-4941-aae4-59f3667cc3a3":
    "Wartość nie pasuje do wymaganego wzorca.",

  // DateTime
  "1a9da513-2640-4f84-9b6a-4d99dcddc628": "Data/czas jest nieprawidłowa.",
  "27c93479-5b0e-49d7-b9f1-88d359f0b50c": "Wartość nie jest prawidłową datą.",

  // GreaterThan, GreaterThanOrEqual
  "778b7ae0-84d3-481a-9dec-35fdb64b1d78":
    "Wartość powinna być większa niż {{ compared_value }}.",
  "52b50dc6-f8a5-4d7f-8c27-c7d0ecdcd398":
    "Wartość powinna być większa lub równa {{ compared_value }}.",

  // LessThan, LessThanOrEqual
  "079d7420-2d13-460c-8756-de810eeb37d2":
    "Wartość powinna być mniejsza niż {{ compared_value }}.",
  "ee1a5261-5c2c-4a6c-b0c7-82b7e3e8d5c3":
    "Wartość powinna być mniejsza lub równa {{ compared_value }}.",

  // Url
  "57c2f299-1154-4870-89bb-ef3b1f5ad229": "URL jest nieprawidłowy.",

  // Positive, PositiveOrZero
  "e09e52d0-b549-4ba1-8b4e-420abedb3c0f": "Wartość powinna być dodatnia.",
  "b0a7edf6-670f-4e5d-a92d-5c5d18eb6d1d":
    "Wartość powinna być dodatnia lub równa zero.",

  // Negative, NegativeOrZero
  "535e4f9f-05c7-43c8-8d3f-a25b3e7c8d0a": "Wartość powinna być ujemna.",
  "8d3cc3f3-5df5-4e5e-9e7e-e7e5d6d8d9da":
    "Wartość powinna być ujemna lub równa zero.",
};
