import { z } from 'zod'

const envSchema = z.object({
  // Supabase - Required for Phase 1
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Stripe - Optional until Phase 4
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email - Optional until Phase 4
  RESEND_API_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  // Skip validation during build time for placeholder values
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    // During build, allow placeholder values
    if (isBuildTime) {
      console.warn('Environment validation skipped during build')
      return process.env as unknown as Env
    }

    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    throw new Error(`\n❌ Environment validation failed:\n${errors}\n\nPlease check your .env.local file.\n`)
  }

  return result.data
}

export const env = validateEnv()
