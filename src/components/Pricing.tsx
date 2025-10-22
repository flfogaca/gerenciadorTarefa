import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Básico',
    price: 'Grátis',
    description: 'Perfeito para começar',
    features: [
      'Até 5 membros da equipe',
      '3 quadros',
      '200 MB de armazenamento',
      'Visualizações básicas',
      'Suporte por email'
    ],
    cta: 'Começar Grátis',
    highlighted: false
  },
  {
    name: 'Profissional',
    price: 'R$ 39',
    period: '/mês por usuário',
    description: 'Para equipes em crescimento',
    features: [
      'Membros ilimitados',
      'Quadros ilimitados',
      '20 GB de armazenamento',
      'Todas as visualizações',
      'Automações avançadas',
      'Integrações premium',
      'Suporte prioritário'
    ],
    cta: 'Teste 14 Dias Grátis',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 'Personalizado',
    description: 'Para grandes organizações',
    features: [
      'Tudo do Profissional',
      'Armazenamento ilimitado',
      'Segurança avançada',
      'SLA garantido',
      'Gerente de conta dedicado',
      'Onboarding personalizado',
      'Suporte 24/7'
    ],
    cta: 'Falar com Vendas',
    highlighted: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planos Flexíveis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para sua equipe. Sem taxas ocultas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 ${
                plan.highlighted
                  ? 'ring-4 ring-blue-600 shadow-2xl scale-105 relative'
                  : 'border border-gray-200 shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="text-green-500 flex-shrink-0 mr-3 mt-0.5" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 mt-12">
          Todos os planos incluem 14 dias de teste grátis. Cancele a qualquer momento.
        </p>
      </div>
    </section>
  );
}
