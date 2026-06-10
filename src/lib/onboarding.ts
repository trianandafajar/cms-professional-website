export function isUserOnboarded(user: {
  isOnboarded?: boolean | null
  onboardingStep?: number | null
} | null | undefined): boolean {
  return Boolean(user?.isOnboarded) || (user?.onboardingStep ?? 0) >= 4
}

export function onboardingRequiredResponse() {
  return Response.json(
    {
      error: 'Complete onboarding before continuing',
      code: 'ONBOARDING_REQUIRED',
      redirect: '/onboarding',
    },
    { status: 403 },
  )
}
