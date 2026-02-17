import { errorCodesMap } from "@/constants/error-codes-map";
import type { ErrorCode } from "@/types/error/error-code";

export function mapStatusToErrorCode(status: number): ErrorCode {
  return errorCodesMap[status] || "UNKNOWN_ERROR";
}
