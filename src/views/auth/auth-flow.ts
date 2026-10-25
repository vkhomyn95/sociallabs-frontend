import type {
  SlbAuthErrors,
  SlbAuthStep,
  SlbLoginPayload,
  SlbMfaMethod,
  SlbRegisterPayload,
} from '@sociallabs/frontend-components'
import { AuthStep, MfaMethod } from '@/stores/auth/types'
import type { AuthFieldErrors, LoginRequest, RegisterRequest } from '@/stores/auth/types'

/**
 * Міст між типами SlbAuthFlow (рядкові union-и та payload-и бібліотеки) і DTO застосунку.
 *
 * Мапи — `Record` по union-у бібліотеки: якщо в SlbAuthFlow з'явиться новий крок
 * чи метод 2FA, тут буде помилка компіляції, а не тихий `undefined` у рантаймі.
 * Payload-и копіюються поле за полем: DTO не залежить від форми подій бібліотеки,
 * а зайві поля (якщо бібліотека їх додасть) не підуть на бекенд.
 */
const FLOW_STEP: Record<SlbAuthStep, AuthStep> = {
  start: AuthStep.START,
  password: AuthStep.PASSWORD,
  register: AuthStep.REGISTER,
  mfa: AuthStep.MFA,
}

const FLOW_MFA_METHOD: Record<SlbMfaMethod, MfaMethod> = {
  totp: MfaMethod.TOTP,
  recovery: MfaMethod.RECOVERY_CODE,
}

export const toAuthStep = (step: SlbAuthStep): AuthStep => FLOW_STEP[step]

export const toMfaMethod = (method: SlbMfaMethod): MfaMethod => FLOW_MFA_METHOD[method]

export const toLoginRequest = (payload: SlbLoginPayload): LoginRequest => ({
  email: payload.email,
  password: payload.password,
  remember: payload.remember,
})

/** Реєстрація одразу запам'ятовує пристрій — у формі реєстрації немає "Remember me". */
export const toRegisterRequest = (payload: SlbRegisterPayload): RegisterRequest => ({
  firstName: payload.firstName,
  lastName: payload.lastName,
  email: payload.email,
  password: payload.password,
  remember: true,
})

/** Поля AuthField збігаються з SlbAuthField, тож об'єкт передається як є. */
export const toFlowErrors = (errors: AuthFieldErrors): SlbAuthErrors => errors
