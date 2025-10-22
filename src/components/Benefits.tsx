import { CheckCircle2 } from 'lucide-react';

const benefits = [
  'Aumente a produtividade da equipe em até 30%',
  'Centralize toda a comunicação do projeto',
  'Reduza reuniões desnecessárias',
  'Visualize o progresso em tempo real',
  'Integre com suas ferramentas favoritas',
  'Acesse de qualquer lugar, em qualquer dispositivo'
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Por que escolher o Gerenciador de Tarefas?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Mais de 150.000 equipes confiam em nossa plataforma para organizar o trabalho e alcançar resultados extraordinários.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle2 className="text-green-300 flex-shrink-0 mt-1" size={24} />
                  <span className="text-lg text-white">{benefit}</span>
                </div>
              ))}
            </div>
            <button className="mt-10 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-semibold text-lg shadow-lg hover:shadow-xl">
              Comece Agora Gratuitamente
            </button>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-900 font-semibold">Sprint Planning</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Em Progresso
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-900 font-semibold">Design System</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      Revisão
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-900 font-semibold">Marketing Campaign</span>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                      A Iniciar
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
