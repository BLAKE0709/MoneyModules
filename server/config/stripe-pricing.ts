// Stripe Price IDs for StudentOS subscription tiers
// Update these with your actual Stripe price IDs from dashboard.stripe.com/products

export const STRIPE_PRICE_IDS = {
  // Student Individual Plans
  STUDENT_BASIC_MONTHLY: process.env.STRIPE_STUDENT_BASIC_MONTHLY || 'price_student_basic_monthly_placeholder',
  STUDENT_PRO_MONTHLY: process.env.STRIPE_STUDENT_PRO_MONTHLY || 'price_student_pro_monthly_placeholder',
  STUDENT_PRO_ANNUAL: process.env.STRIPE_STUDENT_PRO_ANNUAL || 'price_student_pro_annual_placeholder',
  
  // B2B School Plans
  SCHOOL_STARTER: process.env.STRIPE_SCHOOL_STARTER || 'price_school_starter_placeholder',
  SCHOOL_PROFESSIONAL: process.env.STRIPE_SCHOOL_PROFESSIONAL || 'price_school_professional_placeholder',
  SCHOOL_ENTERPRISE: process.env.STRIPE_SCHOOL_ENTERPRISE || 'price_school_enterprise_placeholder',
  
  // Add-on Services
  ADDON_AI_PORTFOLIO: process.env.STRIPE_ADDON_AI_PORTFOLIO || 'price_addon_ai_portfolio_placeholder',
  ADDON_PREMIUM_SCHOLARSHIPS: process.env.STRIPE_ADDON_PREMIUM_SCHOLARSHIPS || 'price_addon_premium_scholarships_placeholder',
} as const;

export const PRICING_TIERS = {
  student: {
    basic: {
      name: 'StudentOS Basic',
      price: 0,
      priceId: null,
      features: [
        'Basic essay analysis',
        'Up to 3 essays per month',
        'Core scholarship matching',
        'Student persona profile'
      ]
    },
    pro: {
      name: 'StudentOS Pro',
      monthlyPrice: 19,
      annualPrice: 190,
      monthlyPriceId: STRIPE_PRICE_IDS.STUDENT_PRO_MONTHLY,
      annualPriceId: STRIPE_PRICE_IDS.STUDENT_PRO_ANNUAL,
      features: [
        'Unlimited essay analysis',
        'AI usage portfolio generation',
        'Premium scholarship database',
        'Advanced writing insights',
        'College readiness scoring',
        'Priority support'
      ]
    }
  },
  school: {
    starter: {
      name: 'School Starter',
      price: 299,
      priceId: STRIPE_PRICE_IDS.SCHOOL_STARTER,
      studentLimit: 100,
      features: [
        'Up to 100 students',
        'Basic analytics dashboard',
        'Counselor portal access',
        'Student progress tracking',
        'Email support'
      ]
    },
    professional: {
      name: 'School Professional',
      price: 899,
      priceId: STRIPE_PRICE_IDS.SCHOOL_PROFESSIONAL,
      studentLimit: 500,
      features: [
        'Up to 500 students',
        'Advanced analytics & reporting',
        'Custom branding',
        'API access',
        'Priority support',
        'Training sessions'
      ]
    },
    enterprise: {
      name: 'School Enterprise',
      price: 2499,
      priceId: STRIPE_PRICE_IDS.SCHOOL_ENTERPRISE,
      studentLimit: null,
      features: [
        'Unlimited students',
        'White-label deployment',
        'Custom integrations',
        'Dedicated success manager',
        'SLA guarantees',
        'Advanced security features'
      ]
    }
  }
} as const;

export function getPriceIdForPlan(category: 'student' | 'school', plan: string, billing?: 'monthly' | 'annual'): string | null {
  if (category === 'student' && plan === 'pro') {
    return billing === 'annual' ? STRIPE_PRICE_IDS.STUDENT_PRO_ANNUAL : STRIPE_PRICE_IDS.STUDENT_PRO_MONTHLY;
  }
  
  if (category === 'school') {
    const schoolPriceIds = {
      starter: STRIPE_PRICE_IDS.SCHOOL_STARTER,
      professional: STRIPE_PRICE_IDS.SCHOOL_PROFESSIONAL,
      enterprise: STRIPE_PRICE_IDS.SCHOOL_ENTERPRISE
    };
    return schoolPriceIds[plan as keyof typeof schoolPriceIds] || null;
  }
  
  return null;
}