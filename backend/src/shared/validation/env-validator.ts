import Joi from 'joi';

const WEAK_SECRETS = [
  'your-super-secret-jwt-key-here-change-in-production',
  'your-super-secret-refresh-key-here-change-in-production',
  'gestorpro_jwt_secret_key_2024_development_only_change_in_production',
  'gestorpro_refresh_secret_key_2024_development_only_change_in_production',
  'gestorpro_session_secret_2024_development_only_change_in_production',
  'your-session-secret-here-change-in-production',
  'secret',
  'jwt_secret',
  'change_me',
  '123456',
];

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  
  PORT: Joi.number().default(3001),
  
  DATABASE_URL: Joi.string().required().messages({
    'string.empty': 'DATABASE_URL é obrigatório',
    'any.required': 'DATABASE_URL é obrigatório',
  }),
  
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET deve ter no mínimo 32 caracteres',
    'any.required': 'JWT_SECRET é obrigatório',
  }),
  
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_REFRESH_SECRET deve ter no mínimo 32 caracteres',
    'any.required': 'JWT_REFRESH_SECRET é obrigatório',
  }),
  
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000,http://localhost:5173'),
  
  BCRYPT_ROUNDS: Joi.number().min(10).max(15).default(12),
  
  SESSION_SECRET: Joi.string().min(32).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM: Joi.string().email().optional(),
  
  REDIS_URL: Joi.string().optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
  
  MAX_FILE_SIZE: Joi.number().default(10485760),
  UPLOAD_PATH: Joi.string().default('./uploads'),
  
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  SENTRY_DSN: Joi.string().optional(),
  
  ENABLE_REGISTRATION: Joi.boolean().default(true),
  ENABLE_EMAIL_VERIFICATION: Joi.boolean().default(false),
  ENABLE_PASSWORD_RESET: Joi.boolean().default(true),
  ENABLE_TWO_FACTOR_AUTH: Joi.boolean().default(false),
  
  DISABLE_AUTO_MIGRATE: Joi.boolean().default(false),
}).unknown(true);

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (error) {
    result.isValid = false;
    result.errors = error.details.map((detail) => detail.message);
  }

  const isProduction = process.env['NODE_ENV'] === 'production';

  if (isProduction) {
    const jwtSecret = process.env['JWT_SECRET'] || '';
    const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'] || '';
    const sessionSecret = process.env['SESSION_SECRET'] || '';

    if (WEAK_SECRETS.some((weak) => jwtSecret.toLowerCase().includes(weak.toLowerCase()))) {
      result.isValid = false;
      result.errors.push('JWT_SECRET contém um valor padrão/fraco. Use um secret forte em produção.');
    }

    if (WEAK_SECRETS.some((weak) => jwtRefreshSecret.toLowerCase().includes(weak.toLowerCase()))) {
      result.isValid = false;
      result.errors.push('JWT_REFRESH_SECRET contém um valor padrão/fraco. Use um secret forte em produção.');
    }

    if (sessionSecret && WEAK_SECRETS.some((weak) => sessionSecret.toLowerCase().includes(weak.toLowerCase()))) {
      result.isValid = false;
      result.errors.push('SESSION_SECRET contém um valor padrão/fraco. Use um secret forte em produção.');
    }

    if (!process.env['SENTRY_DSN']) {
      result.warnings.push('SENTRY_DSN não configurado. Erros não serão reportados ao Sentry.');
    }

    const allowedOrigins = process.env['ALLOWED_ORIGINS'] || '';
    if (allowedOrigins.includes('localhost')) {
      result.warnings.push('ALLOWED_ORIGINS contém localhost. Remova para produção.');
    }
  }

  if (!process.env['SMTP_HOST'] || !process.env['SMTP_USER']) {
    result.warnings.push('Configuração de email (SMTP) não encontrada. Emails não serão enviados.');
  }

  if (!process.env['REDIS_URL'] && !process.env['REDIS_HOST']) {
    result.warnings.push('Redis não configurado. Cache será desabilitado.');
  }

  return result;
}

export function ensureValidEnvironment(): void {
  const validation = validateEnvironment();

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Avisos de configuração:');
    validation.warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  if (!validation.isValid) {
    console.error('❌ Erros críticos de configuração:');
    validation.errors.forEach((error) => console.error(`   - ${error}`));
    
    if (process.env['NODE_ENV'] === 'production') {
      console.error('\n🚫 Aplicação não pode iniciar em produção com configuração inválida.');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Executando em modo desenvolvimento com configuração incompleta.');
    }
  } else {
    console.log('✅ Configuração de ambiente validada com sucesso.');
  }
}



