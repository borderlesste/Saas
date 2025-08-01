import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, DollarSign, User, Package, CreditCard, CheckSquare, Hash } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSave, payment, clients, orders }) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (payment) {
      setFormData({
        cliente_id: payment.cliente_id || '',
        tipo: payment.tipo || 'total',
        estado: payment.estado || 'pendiente',
        monto: payment.monto || '',
        moneda: payment.moneda || 'MXN',
        tipo_cambio: payment.tipo_cambio || 1.0000,
        metodo_pago: payment.metodo_pago || 'tarjeta',
        referencia: payment.referencia || '',
        banco_origen: payment.banco_origen || '',
        cuenta_destino: payment.cuenta_destino || '',
        fecha_pago: payment.fecha_pago ? new Date(payment.fecha_pago).toISOString().split('T')[0] : '',
        concepto: payment.concepto || '',
        notas: payment.notas || '',
      });
    } else {
      setFormData({
        cliente_id: '',
        tipo: 'total',
        estado: 'pendiente',
        monto: '',
        moneda: 'MXN',
        tipo_cambio: 1.0000,
        metodo_pago: 'tarjeta',
        referencia: '',
        banco_origen: '',
        cuenta_destino: '',
        fecha_pago: '',
        concepto: '',
        notas: '',
      });
    }
  }, [payment]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al guardar el pago.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {payment ? 'Editar Pago' : 'Crear Nuevo Pago'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <select name="cliente_id" value={formData.cliente_id} onChange={handleChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                  <option value="">Seleccionar Cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <CheckSquare className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                  <option value="anticipo">Anticipo</option>
                  <option value="parcial">Parcial</option>
                  <option value="total">Total</option>
                  <option value="devolucion">Devolución</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <CreditCard className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input type="text" name="concepto" value={formData.concepto} onChange={handleChange} placeholder="Concepto del Pago" required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input type="number" step="0.01" name="monto" value={formData.monto} onChange={handleChange} placeholder="Monto" required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
              </div>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <select name="moneda" value={formData.moneda} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input type="number" step="0.0001" name="tipo_cambio" value={formData.tipo_cambio} onChange={handleChange} placeholder="Tipo de Cambio" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <CreditCard className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                  <option value="paypal">PayPal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="relative">
                <CheckSquare className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                  <option value="pendiente">Pendiente</option>
                  <option value="procesando">Procesando</option>
                  <option value="aplicado">Aplicado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Hash className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input type="text" name="referencia" value={formData.referencia} onChange={handleChange} placeholder="Referencia/No. Transacción" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
              </div>
              <div className="relative">
                <Package className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input type="date" name="fecha_pago" value={formData.fecha_pago} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <CreditCard className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input type="text" name="banco_origen" value={formData.banco_origen} onChange={handleChange} placeholder="Banco Origen" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
              </div>
              <div className="relative">
                <CreditCard className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input type="text" name="cuenta_destino" value={formData.cuenta_destino} onChange={handleChange} placeholder="Cuenta Destino" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
              </div>
            </div>

            <div className="relative">
              <Package className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Notas adicionales (opcional)" rows="3" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"></textarea>
            </div>

          </div>

          <div className="p-6 bg-gray-50 dark:bg-slate-900/50 border-t flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;

PaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  payment: PropTypes.object,
  clients: PropTypes.array.isRequired,
  orders: PropTypes.array.isRequired,
};
