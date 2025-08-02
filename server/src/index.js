// server/src/index.js
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const { pool } = require('./config/db.js');

// Rutas principales
const authRoutes = require('./routes/auth.js');
const ordersRoutes = require('./routes/orders.js');
const paymentsRoutes = require('./routes/payments.js');
const clientPaymentsRoutes = require('./routes/clientPayments.js');
const configRoutes = require('./routes/config.js');
const contactRoutes = require('./routes/contact.js');
const usersRoutes = require('./routes/users.js');
const quotesRoutes = require('./routes/quotes.js');
const notificationsRoutes = require('./routes/notifications.js');
const dashboardRoutes = require('./routes/dashboard.js');
const clientDashboardRoutes = require('./routes/clientDashboard.js');
const projectsRoutes = require('./routes/projects.js');
const statsRoutes = require('./routes/stats.js');
const invoicesRoutes = require('./routes/invoices.js');
const integrationsRoutes = require('./routes/integrations.js');
const securityRoutes = require('./routes/security.js');
const configurationRoutes = require('./routes/configuration.js');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Render: configurar confianza en proxy
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Sesiones con MySQLStore
const sessionStore = new MySQLStore({
  expiration: 1000 * 60 * 60 * 24 * 7, // 7 días
  createDatabaseTable: false,
  clearExpired: true,
  checkExpirationInterval: 900000,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

// Configuración CORS
const corsOptions = {
  origin: function (origin, callback) {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowedOrigins = isProduction
      ? ['https://borderlesstechno.com', 'https://www.borderlesstechno.com', 'https://salas-taupe.vercel.app']
      : ['http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:5173'];

    if (!origin) return callback(null, true);
    if (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Seguridad en producción
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  const rateLimit = require('express-rate-limit');
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: req => req.path === '/api/health'
  }));
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Morgan logging middleware
if (process.env.NODE_ENV === 'production') {
  // Formato combinado para producción con información completa
  app.use(morgan('combined', {
    skip: (req, res) => {
      // Skip logging para endpoints de health check y assets estáticos
      return req.path === '/api/health' || req.path.startsWith('/favicon');
    }
  }));
} else {
  // Formato dev para desarrollo con colores
  app.use(morgan('dev'));
}

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/client-payments', clientPaymentsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/contacto', contactRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', dashboardRoutes);
app.use('/api/client', clientDashboardRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/configuration', configurationRoutes);

// Ruta de estado de la API
app.get('/api/health', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.json({
    message: `API Borderless Techno - ${isProduction ? 'Production' : 'Development'}`,
    version: '1.0.0',
    status: 'active',
    environment: isProduction ? 'production' : 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.json({
    message: `API Borderless Techno - ${isProduction ? 'Production' : 'Development'}`,
    version: '1.0.0',
    status: 'active',
    environment: isProduction ? 'production' : 'development',
    frontend: 'https://borderlesstechno.com'
  });
});

// Integraciones al iniciar
const integrationsService = require('./services/integrationsService.js');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);

  setTimeout(async () => {
    try {
      console.log('🔄 Sincronizando integraciones automáticamente...');
      const results = await integrationsService.syncIntegrations();
      console.log(`✅ Integraciones sincronizadas: ${results.created} creadas, ${results.updated} actualizadas`);
      if (results.errors.length > 0) {
        console.log('⚠️ Errores en sincronización:', results.errors);
      }
    } catch (error) {
      console.log('❌ Error sincronizando integraciones:', error.message);
      console.error(error);
    }
  }, 1000);
});

module.exports = app;
