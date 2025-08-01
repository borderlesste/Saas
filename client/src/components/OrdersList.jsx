import { useState, useEffect } from 'react';
import { getClientOrders, updateClientOrderStatus } from '../api/axios';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import LoadingSpinner from './LoadingSpinner';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye, 
  Pause, 
  Play,
  X,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const OrdersList = () => {
  const { success, error: showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Cargar pedidos
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getClientOrders();
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setOrders(response.data || []);
      }
    } catch (err) {
      setError('Error al cargar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.servicio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || order.estado?.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Manejar acciones en pedidos
  const handleOrderAction = async (orderId, action) => {
    try {
      setActionLoading(true);
      let response;
      
      if (action === 'cancel') {
        response = await updateClientOrderStatus(orderId, { status: 'cancelado' });
      } else if (action === 'resume') {
        response = await updateClientOrderStatus(orderId, { status: 'activo' });
      }

      if (response?.data?.success) {
        success(`Pedido ${action === 'cancel' ? 'cancelado' : 'reanudado'} exitosamente`);
        fetchOrders(); // Recargar pedidos
      } else {
        showError(response?.data?.message || 'Error al procesar la acción');
      }
    } catch (err) {
      showError('Error al procesar la acción');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Obtener icono según el estado
  const getStatusIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en_proceso':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'nuevo':
      case 'confirmado':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'cancelado':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'en_pausa':
        return <Pause className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Obtener color del badge según el estado
  const getStatusBadge = (estado) => {
    const statusConfig = {
      'nuevo': { variant: 'secondary', text: 'Nuevo' },
      'confirmado': { variant: 'default', text: 'Confirmado', className: 'bg-blue-100 text-blue-800' },
      'en_proceso': { variant: 'default', text: 'En Proceso', className: 'bg-yellow-100 text-yellow-800' },
      'completado': { variant: 'default', text: 'Completado', className: 'bg-green-100 text-green-800' },
      'cancelado': { variant: 'destructive', text: 'Cancelado' },
      'en_pausa': { variant: 'secondary', text: 'En Pausa' }
    };

    const config = statusConfig[estado?.toLowerCase()] || { variant: 'secondary', text: estado || 'Desconocido' };
    
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon(estado)}
        <Badge 
          variant={config.variant} 
          className={config.className}
        >
          {config.text}
        </Badge>
      </div>
    );
  };

  // Obtener color de prioridad
  const getPriorityBadge = (prioridad) => {
    const priorityConfig = {
      'baja': { color: 'bg-green-500', text: 'Baja' },
      'normal': { color: 'bg-yellow-500', text: 'Normal' },
      'alta': { color: 'bg-orange-500', text: 'Alta' },
      'urgente': { color: 'bg-red-500', text: 'Urgente' }
    };

    const config = priorityConfig[prioridad?.toLowerCase()] || { color: 'bg-gray-500', text: prioridad || 'Normal' };
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
        <span className="text-sm">{config.text}</span>
      </div>
    );
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
        <span className="ml-2">Cargando pedidos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <X className="w-12 h-12 mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          Reintentar
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="en_pausa">En Pausa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {filteredOrders.length} pedidos encontrados
        </div>
      </Card>

      {/* Lista de pedidos */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No se encontraron pedidos</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.numero_pedido || `#${order.id}`}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{order.servicio || order.descripcion}</div>
                      {order.servicio && order.descripcion && (
                        <div className="text-sm text-gray-500 truncate">{order.descripcion}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.estado)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(order.prioridad)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.total ? formatCurrency(order.total) : 'Por definir'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(order.fecha_pedido || order.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(order.fecha_entrega_estimada)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={showOrderDetail && selectedOrder?.id === order.id}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetail(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Pedido {order.numero_pedido || `#${order.id}`}
                            </DialogTitle>
                          </DialogHeader>
                          <OrderDetailModal 
                            order={selectedOrder}
                            onClose={() => {
                              setShowOrderDetail(false);
                              setSelectedOrder(null);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      {/* Acciones según estado */}
                      {order.estado?.toLowerCase() === 'en_proceso' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderAction(order.id, 'cancel')}
                          disabled={actionLoading}
                          title="Pausar pedido"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {order.estado?.toLowerCase() === 'en_pausa' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderAction(order.id, 'resume')}
                          disabled={actionLoading}
                          title="Reanudar pedido"
                          className="bg-green-50 hover:bg-green-100"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {(['nuevo', 'confirmado'].includes(order.estado?.toLowerCase())) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOrderAction(order.id, 'cancel')}
                          disabled={actionLoading}
                          title="Cancelar pedido"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Componente modal para detalles de pedido
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getStatusIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'en_proceso':
        return <Clock className="w-6 h-6 text-blue-500" />;
      case 'nuevo':
      case 'confirmado':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'cancelado':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'en_pausa':
        return <Pause className="w-6 h-6 text-gray-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(order.estado)}
          <div>
            <h3 className="text-lg font-semibold">{order.servicio || order.descripcion}</h3>
            <p className="text-sm text-gray-500">Estado: {order.estado}</p>
          </div>
        </div>
        <Badge className="text-lg px-3 py-1">
          {order.numero_pedido || `#${order.id}`}
        </Badge>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Información del Pedido</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Servicio:</strong> {order.servicio || 'No especificado'}</div>
            <div><strong>Prioridad:</strong> {order.prioridad || 'Normal'}</div>
            <div><strong>Estado:</strong> {order.estado}</div>
            <div><strong>Fecha del Pedido:</strong> {formatDate(order.fecha_pedido || order.created_at)}</div>
            <div><strong>Fecha de Entrega:</strong> {formatDate(order.fecha_entrega_estimada)}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Información Financiera</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Valor Total:</strong> {order.total ? formatCurrency(order.total) : 'Por definir'}</div>
            <div><strong>Creado:</strong> {formatDate(order.created_at)}</div>
            <div><strong>Última Actualización:</strong> {formatDate(order.updated_at)}</div>
          </div>
        </div>
      </div>

      {/* Descripción detallada */}
      <div>
        <h4 className="font-semibold mb-3">Descripción</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm">{order.descripcion || 'Sin descripción disponible'}</p>
        </div>
      </div>

      {/* Notas adicionales */}
      {order.notas && (
        <div>
          <h4 className="font-semibold mb-3">Notas</h4>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm">{order.notas}</p>
          </div>
        </div>
      )}

      {/* Acciones del modal */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose} variant="outline">
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default OrdersList;