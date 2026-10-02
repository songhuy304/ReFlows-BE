export const ERROR_CODE = {
  FORBIDDEN: 'error.user.forbidden',
  NOT_FOUND: 'error.user.not-found',
  INVALID_CREDENTIALS: 'error.user.invalid-credentials',
  ALREADY_EXISTS: 'error.user.already-exists',
  EMAIL_PROVIDER_CONFLICT: 'error.user.email-provider-conflict',
  PASSWORD_SAME: 'error.user.password-same',
  OLD_PASSWORD_INCORRECT: 'error.user.old-password-incorrect',

  TOKEN_INVALID: 'error.auth.token-invalid', // token sai format / verify fail
  TOKEN_EXPIRED: 'error.auth.token-expired', // hết hạn
  TOKEN_MISSING: 'error.auth.token-missing', // không gửi token
  TOKEN_UNAUTHORIZED: 'error.auth.unauthorized', // không đủ quyền / không hợp lệ

  WORKFLOW_NOT_FOUND: 'error.workflow.not-found',
  WORKFLOW_FORBIDDEN: 'error.workflow.forbidden',
  WORKFLOW_CHAT_LAST_MESSAGE_NOT_USER:
    'error.workflow.chat-last-message-not-user',
  WORKFLOW_AI_INVALID_RESPONSE: 'error.workflow.ai-invalid-response',
};
