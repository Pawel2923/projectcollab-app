import { isValidTimeString, parseEstimatedTime } from "@/lib/utils/issueUtils";
import type {
  IssueFilterOption,
  IssueSortOption,
} from "@/store/IssuesOptionsContext";

/** Build query params based on sort and filter options */
export function buildQueryParams(
  projectId: string,
  sortOptions: IssueSortOption[],
  filterOptions: IssueFilterOption[],
) {
  const params = new URLSearchParams();
  params.append("projectId", projectId);

  // Add sort options
  if (sortOptions.length > 0) {
    sortOptions.forEach((option) => {
      params.append(`order[${option.sortBy}]`, option.sortOrder);
    });
  }

  // Add filter options
  if (filterOptions.length > 0) {
    filterOptions.forEach((option) => {
      const { field, value, operator } = option;

      console.log("Filter option:", { field, value, operator });

      // Convert priority string values to integers for backend
      let filterValue = value as string;
      if (field === "priority") {
        const priorityMap: Record<string, string> = {
          low: "1",
          medium: "2",
          high: "3",
          critical: "4",
        };
        filterValue = priorityMap[value as string] || (value as string);
      }

      // Convert estimated filter from w/d/h/m to minutes
      if (field === "estimated" && typeof value === "string") {
        const valStr = value.trim();
        if (isValidTimeString(valStr)) {
          filterValue = String(parseEstimatedTime(valStr));
        } else {
          // backend will handle invalid values
          filterValue = valStr;
        }
      }

      if (operator === "partial") {
        // For search filters with partial match - API Platform expects just the field name
        params.append(field, filterValue);
      } else if (operator === "exact") {
        // For exact filters
        params.append(field, filterValue);
      } else if (operator === "before") {
        // For date filters - before
        params.append(`${field}[before]`, filterValue);
      } else if (operator === "after") {
        // For date filters - after
        params.append(`${field}[after]`, filterValue);
      } else if (operator === "gt") {
        // Greater than
        params.append(`${field}[gt]`, filterValue);
      } else if (operator === "lt") {
        // Less than
        params.append(`${field}[lt]`, filterValue);
      } else if (operator === "gte") {
        // Greater than or equal
        params.append(`${field}[gte]`, filterValue);
      } else if (operator === "lte") {
        // Less than or equal
        params.append(`${field}[lte]`, filterValue);
      } else {
        // Default exact match
        params.append(field, filterValue);
      }
    });
  }

  const queryString = params.toString();
  console.log("Built query params:", queryString);
  return queryString;
}
