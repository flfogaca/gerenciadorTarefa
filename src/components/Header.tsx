import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Gerenciador de Tarefas</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Recursos</a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefícios</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Preços</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contato</a>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Login
            </Link>
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Começar Grátis
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Recursos</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefícios</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Preços</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contato</a>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-left">
                Login
              </Link>
              <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Começar Grátis
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
