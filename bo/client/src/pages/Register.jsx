// src/pages/Register.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    password: '',
    empresa: '',
    rfc: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/'); // Redirigir a la página de inicio o dashboard
    } catch (err) {
      setError('Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-4 pt-24">
      {/* Contenedor principal con mejor distribución */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Columna izquierda - Información de la empresa */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-8 p-8">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-dark dark:text-light">
              Únete a BORDERLESS COMPANY
            </h2>
            <p className="text-lg text-dark/70 dark:text-light/70">
              Descubre un mundo de oportunidades sin fronteras. Conéctate con profesionales de todo el mundo.
            </p>
          </div>
          
          {/* Beneficios */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-dark dark:text-light">Acceso global a oportunidades</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-dark dark:text-light">Red de contactos internacionales</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-dark dark:text-light">Soporte 24/7 multiidioma</span>
            </div>
          </div>
          
          {/* Testimonios */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
            <p className="text-dark/80 dark:text-light/80 italic">
              &ldquo;Borderless me conectó con oportunidades que nunca imaginé. Es increíble la facilidad para trabajar globalmente.&rdquo;
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <div>
                <p className="font-semibold text-dark dark:text-light">María González</p>
                <p className="text-sm text-dark/60 dark:text-light/60">Desarrolladora Frontend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="lg:col-span-7 w-full max-w-2xl lg:max-w-none mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-dark dark:text-light">Crear Cuenta</h1>
            <p className="text-dark/70 dark:text-light/70 mt-2">Únete a nuestra comunidad</p>
          </div>

          {/* Form Card - Ahora más ancho */}
          <div className="bg-white dark:bg-dark/70 rounded-2xl shadow-xl border border-gray-200 dark:border-secondary/20 p-8 backdrop-blur-sm">
            {error && (
              <div className="mb-6 p-4 bg-accent/20 border border-accent/30 rounded-lg">
                <p className="text-accent text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name - Ahora ocupa todo el ancho */}
              <div className="group">
                <label className="block text-sm font-medium text-dark/80 dark:text-light/80 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-dark dark:text-light placeholder-gray-500"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* Address - Ahora ocupa todo el ancho */}
              <div className="group">
                <label className="block text-sm font-medium text-dark/80 dark:text-light/80 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-dark dark:text-light placeholder-gray-500"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                  placeholder="Tu dirección completa"
                />
              </div>

              {/* Contact Fields Row - Mejor distribución en dos columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-dark/80 dark:text-light/80 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-dark dark:text-light placeholder-gray-500"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    placeholder="Tu número de teléfono"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-dark/80 dark:text-light/80 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-dark dark:text-light placeholder-gray-500"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Company and RFC Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-dark/80 dark:text-light/80 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    name="empresa"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-dark dark:text-light placeholder-gray-500"
                    value={form.empresa}
                    onChange={handleChange}
                    placeholder="Nombre de tu empresa (opcional)"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-dark/80 dark:text-light/80 mb-2">
                    RFC
                  </label>
                  <input
                    type="text"
                    name="rfc"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-dark dark:text-light placeholder-gray-500"
                    value={form.rfc}
                    onChange={handleChange}
                    placeholder="RFC (opcional)"
                  />
                </div>
              </div>

              {/* Password - Ahora ocupa todo el ancho */}
              <div className="group">
                <label className="block text-sm font-medium text-dark/80 dark:text-light/80 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-dark dark:text-light placeholder-gray-500"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark"
              >
                Crear Cuenta
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-dark/70 dark:text-light/70">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-primary dark:text-secondary hover:underline font-medium transition-colors duration-200"
                >
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-dark/60 dark:text-light/60">
              Al registrarte, aceptas nuestros términos y condiciones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;