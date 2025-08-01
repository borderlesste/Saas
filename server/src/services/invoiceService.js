const { pool } = require('../config/db.js');

const invoiceService = {
  // Obtener todas las facturas (admin) o las facturas de un usuario (cliente)
  async getInvoices(userId, role) {
    let query = `
      SELECT 
        f.id, f.numero_factura, f.cliente_id, f.cliente_nombre, f.cliente_email,
        f.pedido_id, f.pago_id, f.concepto, f.subtotal, f.iva, f.total,
        f.estado, f.fecha_emision, f.fecha_vencimiento, f.metodo_pago,
        f.moneda, f.notas, f.referencia_transferencia, f.created_at, f.updated_at,
        p.descripcion as pedido_descripcion,
        pg.monto as pago_monto, pg.estado as pago_estado
      FROM facturas f
      LEFT JOIN pedidos p ON f.pedido_id = p.id
      LEFT JOIN pagos pg ON f.pago_id = pg.id
    `;
    const params = [];

    if (role !== 'admin') {
      query += ' WHERE f.cliente_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY f.fecha_emision DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Obtener una factura por ID
  async getInvoiceById(id) {
    const [rows] = await pool.query(
      `SELECT 
        f.id, f.numero_factura, f.cliente_id, f.cliente_nombre, f.cliente_email,
        f.pedido_id, f.pago_id, f.concepto, f.subtotal, f.iva, f.total,
        f.estado, f.fecha_emision, f.fecha_vencimiento, f.metodo_pago,
        f.moneda, f.notas, f.referencia_transferencia, f.created_at, f.updated_at,
        p.descripcion as pedido_descripcion,
        pg.monto as pago_monto, pg.estado as pago_estado
       FROM facturas f
       LEFT JOIN pedidos p ON f.pedido_id = p.id
       LEFT JOIN pagos pg ON f.pago_id = pg.id
       WHERE f.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Factura no encontrada');
    }
    return rows[0];
  },

  // Generar número de factura único
  async generateInvoiceNumber() {
    const currentYear = new Date().getFullYear();
    const prefix = `FAC-${currentYear}-`;
    
    // Obtener el último número de factura del año actual
    const [rows] = await pool.query(
      'SELECT numero_factura FROM facturas WHERE numero_factura LIKE ? ORDER BY numero_factura DESC LIMIT 1',
      [`${prefix}%`]
    );
    
    let nextNumber = 1;
    if (rows.length > 0) {
      const lastNumber = rows[0].numero_factura.split('-')[2];
      nextNumber = parseInt(lastNumber) + 1;
    }
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  },

  // Crear una nueva factura
  async createInvoice(invoiceData) {
    const {
      cliente_id, pedido_id, pago_id, concepto, subtotal, iva, total,
      fecha_vencimiento, metodo_pago, moneda = 'MXN', notas, referencia_transferencia
    } = invoiceData;

    // Obtener datos del cliente
    const [clientRows] = await pool.query(
      'SELECT nombre, email FROM usuarios WHERE id = ?',
      [cliente_id]
    );
    
    if (clientRows.length === 0) {
      throw new Error('Cliente no encontrado');
    }

    const cliente_nombre = clientRows[0].nombre;
    const cliente_email = clientRows[0].email;

    // Generar número de factura
    const numero_factura = await this.generateInvoiceNumber();

    const [result] = await pool.query(
      `INSERT INTO facturas (
        numero_factura, cliente_id, cliente_nombre, cliente_email, pedido_id, pago_id,
        concepto, subtotal, iva, total, fecha_vencimiento, metodo_pago, 
        moneda, notas, referencia_transferencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_factura, cliente_id, cliente_nombre, cliente_email, pedido_id, pago_id,
        concepto, subtotal, iva, total, fecha_vencimiento, metodo_pago,
        moneda, notas, referencia_transferencia
      ]
    );
    
    const [newInvoice] = await pool.query('SELECT * FROM facturas WHERE id = ?', [result.insertId]);
    return newInvoice[0];
  },

  // Actualizar una factura
  async updateInvoice(id, invoiceData) {
    const {
      cliente_id, pedido_id, pago_id, concepto, subtotal, iva, total,
      estado, fecha_vencimiento, metodo_pago, moneda, notas, referencia_transferencia
    } = invoiceData;

    // Obtener datos del cliente si se cambió el cliente_id
    let cliente_nombre, cliente_email;
    if (cliente_id) {
      const [clientRows] = await pool.query(
        'SELECT nombre, email FROM usuarios WHERE id = ?',
        [cliente_id]
      );
      
      if (clientRows.length === 0) {
        throw new Error('Cliente no encontrado');
      }
      
      cliente_nombre = clientRows[0].nombre;
      cliente_email = clientRows[0].email;
    }

    const [result] = await pool.query(
      `UPDATE facturas SET 
        cliente_id = COALESCE(?, cliente_id),
        cliente_nombre = COALESCE(?, cliente_nombre),
        cliente_email = COALESCE(?, cliente_email),
        pedido_id = ?,
        pago_id = ?,
        concepto = COALESCE(?, concepto),
        subtotal = COALESCE(?, subtotal),
        iva = COALESCE(?, iva),
        total = COALESCE(?, total),
        estado = COALESCE(?, estado),
        fecha_vencimiento = COALESCE(?, fecha_vencimiento),
        metodo_pago = ?,
        moneda = COALESCE(?, moneda),
        notas = ?,
        referencia_transferencia = ?
       WHERE id = ?`,
      [
        cliente_id, cliente_nombre, cliente_email, pedido_id, pago_id,
        concepto, subtotal, iva, total, estado, fecha_vencimiento,
        metodo_pago, moneda, notas, referencia_transferencia, id
      ]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Factura no encontrada');
    }
    
    const [updatedInvoice] = await pool.query('SELECT * FROM facturas WHERE id = ?', [id]);
    return updatedInvoice[0];
  },

  // Actualizar solo el estado de una factura
  async updateInvoiceStatus(id, estado) {
    const validStates = ['Pendiente', 'Pagada', 'Vencida', 'Cancelada'];
    if (!validStates.includes(estado)) {
      throw new Error('Estado inválido');
    }

    const [result] = await pool.query(
      'UPDATE facturas SET estado = ? WHERE id = ?',
      [estado, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Factura no encontrada');
    }
    
    const [updatedInvoice] = await pool.query('SELECT * FROM facturas WHERE id = ?', [id]);
    return updatedInvoice[0];
  },

  // Eliminar una factura
  async deleteInvoice(id) {
    const [result] = await pool.query('DELETE FROM facturas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Factura no encontrada');
    }
    return { message: `Factura con id ${id} eliminada correctamente` };
  },

  // Generar factura desde un pago
  async generateInvoiceFromPayment(paymentId, invoiceData = {}) {
    // Obtener datos del pago
    const [paymentRows] = await pool.query(
      `SELECT 
        p.id, p.cliente_id, p.pedido_id, p.concepto, p.monto, p.metodo_pago,
        p.referencia_transferencia, c.nombre, c.email
       FROM pagos p
       JOIN usuarios c ON p.cliente_id = c.id
       WHERE p.id = ?`,
      [paymentId]
    );
    
    if (paymentRows.length === 0) {
      throw new Error('Pago no encontrado');
    }
    
    const payment = paymentRows[0];
    
    // Calcular valores de factura (asumiendo IVA del 16%)
    const ivaRate = 0.16;
    const total = payment.monto;
    const subtotal = total / (1 + ivaRate);
    const iva = total - subtotal;
    
    // Fecha de vencimiento: 30 días desde hoy
    const fecha_vencimiento = new Date();
    fecha_vencimiento.setDate(fecha_vencimiento.getDate() + 30);
    
    const newInvoiceData = {
      cliente_id: payment.cliente_id,
      pedido_id: payment.pedido_id,
      pago_id: paymentId,
      concepto: invoiceData.concepto || payment.concepto,
      subtotal: Math.round(subtotal * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      total: total,
      fecha_vencimiento: fecha_vencimiento.toISOString().slice(0, 19).replace('T', ' '),
      metodo_pago: payment.metodo_pago,
      moneda: invoiceData.moneda || 'MXN',
      notas: invoiceData.notas || `Factura generada automáticamente desde el pago ID: ${paymentId}`,
      referencia_transferencia: payment.referencia_transferencia
    };
    
    const newInvoice = await this.createInvoice(newInvoiceData);
    
    // Marcar la factura como pagada si el pago ya está completado
    if (payment.estado === 'Pagado') {
      await this.updateInvoiceStatus(newInvoice.id, 'Pagada');
      const [updatedInvoice] = await pool.query('SELECT * FROM facturas WHERE id = ?', [newInvoice.id]);
      return updatedInvoice[0];
    }
    
    return newInvoice;
  },

  // Verificar facturas vencidas y actualizar su estado
  async updateOverdueInvoices() {
    const [result] = await pool.query(
      `UPDATE facturas 
       SET estado = 'Vencida' 
       WHERE estado = 'Pendiente' 
       AND fecha_vencimiento < NOW()`
    );
    
    return { 
      message: `${result.affectedRows} facturas marcadas como vencidas`,
      count: result.affectedRows 
    };
  }
};

module.exports = { invoiceService };