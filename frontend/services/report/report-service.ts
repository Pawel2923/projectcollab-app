import {
  clientApiCall,
  clientApiDelete,
  clientApiGet,
} from "@/services/fetch/client-api-service";
import type { Collection } from "@/types/api/collection";
import type { Report } from "@/types/api/report";
import type { Result } from "@/utils/result";

import type { AppError } from "../error/app-error";

export async function getReports(
  projectId: number,
): Promise<Result<Collection<Report>, AppError>> {
  return clientApiGet<Collection<Report>>(`/projects/${projectId}/reports`);
}

export async function generateReport(
  projectId: number,
  type: string,
  format: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<Result<Report, AppError>> {
  return clientApiCall<Report>("/reports/generate", {
    method: "POST",
    body: {
      projectId,
      type,
      format,
      dateFrom,
      dateTo,
    },
  });
}

export async function deleteReport(
  reportId: number,
): Promise<Result<null, AppError>> {
  return clientApiDelete<null>(`/reports/${reportId}`);
}
