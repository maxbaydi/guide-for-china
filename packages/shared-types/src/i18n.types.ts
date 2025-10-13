/**
 * Supported languages in the application
 */
export enum Language {
  RU = 'ru',
  ZH = 'zh',
}

/**
 * Translation namespaces
 */
export enum TranslationNamespace {
  COMMON = 'common',
  ERRORS = 'errors',
  VALIDATION = 'validation',
}

/**
 * Type-safe translation keys for common namespace
 */
export type CommonTranslationKey =
  | 'app.name'
  | 'app.description'
  | 'auth.login'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'auth.displayName'
  | 'auth.confirmPassword'
  | 'auth.forgotPassword'
  | 'auth.alreadyHaveAccount'
  | 'auth.dontHaveAccount'
  | 'dictionary.search'
  | 'dictionary.searchPlaceholder'
  | 'dictionary.noResults'
  | 'dictionary.loading'
  | 'dictionary.character'
  | 'dictionary.pinyin'
  | 'dictionary.translation'
  | 'dictionary.examples'
  | 'dictionary.definitions'
  | 'dictionary.traditional'
  | 'dictionary.simplified'
  | 'subscription.free'
  | 'subscription.basic'
  | 'subscription.premium'
  | 'subscription.upgradeToPremium'
  | 'subscription.currentPlan'
  | 'subscription.choosePlan'
  | 'subscription.limitReached'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.back'
  | 'common.next'
  | 'common.submit'
  | 'common.confirm';

/**
 * Type-safe translation keys for errors namespace
 */
export type ErrorTranslationKey =
  | 'validation.required'
  | 'validation.invalidEmail'
  | 'validation.passwordTooShort'
  | 'validation.passwordsDoNotMatch'
  | 'validation.invalidCredentials'
  | 'auth.userNotFound'
  | 'auth.emailAlreadyExists'
  | 'auth.unauthorized'
  | 'auth.tokenExpired'
  | 'auth.invalidToken'
  | 'subscription.limitExceeded'
  | 'subscription.paymentFailed'
  | 'subscription.subscriptionNotFound'
  | 'subscription.alreadySubscribed'
  | 'server.internalError'
  | 'server.serviceUnavailable'
  | 'server.badRequest';

/**
 * Type-safe translation keys for validation namespace
 */
export type ValidationTranslationKey =
  | 'string.min'
  | 'string.max'
  | 'string.email'
  | 'string.url'
  | 'number.min'
  | 'number.max'
  | 'number.positive'
  | 'number.integer'
  | 'required'
  | 'invalid';

/**
 * Union type of all translation keys
 */
export type TranslationKey =
  | CommonTranslationKey
  | ErrorTranslationKey
  | ValidationTranslationKey;

/**
 * Translation options for interpolation
 */
export interface TranslationOptions {
  [key: string]: string | number;
}

