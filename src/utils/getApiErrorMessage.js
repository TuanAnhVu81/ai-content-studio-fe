export function getApiErrorMessage(error, fallbackMessage) {
  const responseMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail;

  if (Array.isArray(responseMessage)) {
    return responseMessage[0] || fallbackMessage;
  }

  return responseMessage || fallbackMessage;
}
