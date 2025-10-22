import { LayoutGrid, Users, BarChart3, Calendar, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: LayoutGrid,
    title: 'Quadros Personalizáveis',
    description: 'Crie quadros adaptados às suas necessidades com visualizações flexíveis e intuitivas.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Users,
    title: 'Colaboração em Equipe',
    description: 'Trabalhe em conjunto, compartilhe atualizações e mantenha todos sincronizados.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: BarChart3,
    title: 'Relatórios Visuais',
    description: 'Acompanhe o progresso com gráficos e dashboards em tempo real.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Calendar,
    title: 'Gestão de Prazos',
    description: 'Organize cronogramas, defina marcos e nunca perca um prazo importante.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Zap,
    title: 'Automações',
    description: 'Automatize tarefas repetitivas e economize horas de trabalho manual.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    icon: Shield,
    title: 'Segurança Avançada',
    description: 'Seus dados protegidos com criptografia e controles de acesso robustos.',
    color: 'from-red-500 to-red-600'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Recursos Poderosos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar projetos e equipes em um só lugar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1 group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
