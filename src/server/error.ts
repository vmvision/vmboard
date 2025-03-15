import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export default class BizError extends Error {
  name = "BizError";

  public readonly code: string;
  public readonly statusCode: number;
  public readonly message: string;

  constructor(code: (typeof BizCodeEnum)[keyof typeof BizCodeEnum]) {
    const [statusCode, message] = BizErrorEnum[code];
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof BizError) {
    return c.json(
      {
        code: err.code,
        message: err.message,
      },
      err.statusCode as ContentfulStatusCode,
    );
  }
  console.error(err);
  return c.json(
    {
      message: "Internal Server Error",
    },
    500,
  );
};

export const BizCodeEnum = {
  AuthFailed: "AUTH_FAILED",
  // VM
  VMNotFound: "VM_NOT_FOUND",

  // Page
  PageNotFound: "PAGE_NOT_FOUND",
  HandleAlreadyExists: "HANDLE_ALREADY_EXISTS",
  HostnameAlreadyExists: "HOSTNAME_ALREADY_EXISTS",
} as const;

export const BizErrorEnum: Record<
  (typeof BizCodeEnum)[keyof typeof BizCodeEnum],
  [statusCode: number, message: string]
> = {
  [BizCodeEnum.AuthFailed]: [401, "Authentication failed"],

  // VM
  [BizCodeEnum.VMNotFound]: [404, "VM not found"],

  // Page
  [BizCodeEnum.PageNotFound]: [404, "Page not found"],
  [BizCodeEnum.HandleAlreadyExists]: [400, "Handle already exists"],
  [BizCodeEnum.HostnameAlreadyExists]: [400, "Hostname already exists"],
} as const;
