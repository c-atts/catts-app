import toast from "react-hot-toast";
import { z } from "zod";
import { errorWithMessage } from "../types/catts-error";

const errorSchema = z.object({
  response: z.object({
    status: z.number(),
    statusText: z.string(),
  }),
});

export default function errorToast({
  error,
  message,
}: {
  error: unknown;
  message?: string;
}) {
  let _message = message;
  if (!_message) {
    try {
      const _errorWithMessage = errorWithMessage.parse(error);
      _message = _errorWithMessage.message;
    } catch (e) {
      _message = "An error occurred";
    }
  }
  try {
    const _error = errorSchema.parse(error);
    toast.error(
      `${_message}\n${_error.response.status} ${_error.response.statusText}`,
      { position: "bottom-right" },
    );
  } catch (e) {
    console.error(e);
    toast.error(_message, { position: "bottom-right" });
  }
}
