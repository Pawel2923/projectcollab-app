export function getStatusName(
  status?: "created" | "started" | "completed" | string,
) {
  switch (status) {
    case "created":
      return "Utworzone";
    case "completed":
      return "Zakończone";
    default:
      return "Nieznany status";
  }
}
