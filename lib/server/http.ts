import { NextResponse } from "next/server"

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: { code, message } }
  if (details !== undefined) {
    body.error.details = details
  }
  return NextResponse.json(body, { status })
}
