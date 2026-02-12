import type { Collection } from "@/types/api/collection";
import type { Report } from "@/types/api/report";

import type { AppError } from "../types/errors";
import { Ok, type Result } from "../types/result";
import { apiDelete, apiGet, apiPost } from "../utils/apiClient";
import { toErrorResult } from "../utils/errorHandler";

export async function getReports(
  projectId: number,
): Promise<Result<Collection<Report>, AppError>> {
  try {
    const response = await apiGet<Collection<Report>>(
      `/projects/${projectId}/reports`,
    );

    if (response.status !== 200) {
      return toErrorResult(response.error, "getReports");
    }

    if (!response.data) {
      return toErrorResult("No data returned", "getReports");
    }

    return Ok(response.data);
  } catch (error) {
    return toErrorResult(error, "getReports");
  }
}

export async function generateReport(
  projectId: number,
  type: string,
  format: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<Result<Report, AppError>> {
  try {
    const response = await apiPost<Report>("/reports/generate", {
      projectId,
      type,
      format,
      dateFrom,
      dateTo,
    });

    if (response.status !== 201) {
      return toErrorResult(response.error, "generateReport");
    }

    if (!response.data) {
      return toErrorResult("No data returned", "generateReport");
    }

    return Ok(response.data);
  } catch (error) {
    return toErrorResult(error, "generateReport");
  }
}

export async function deleteReport(
  reportId: number,
): Promise<Result<null, AppError>> {
  try {
    const response = await apiDelete<null>(`/reports/${reportId}`);

    if (response.status !== 204) {
      return toErrorResult(response.error, "deleteReport");
    }

    return Ok(null);
  } catch (error) {
    return toErrorResult(error, "deleteReport");
  }
}
