# Diagrama de Arquitectura y Flujo de Datos

## 1. Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  page.tsx (Container Component)                           │  │
│  │    - Estado (facturas, loading, error)                    │  │
│  │    - Lógica de fetch                                      │  │
│  │    - Manejo de errores                                    │  │
│  └──────────────┬───────────────────────┬────────────────────┘  │
│                 │                       │                        │
│  ┌──────────────▼──────────┐  ┌────────▼──────────────────┐    │
│  │  FacturasSearch.tsx     │  │  FacturasTable.tsx        │    │
│  │  - Input ClienteID      │  │  - Tabla de facturas      │    │
│  │  - Validación           │  │  - Filtro por monto       │    │
│  │  - Botón buscar         │  │  - Estados (badges)       │    │
│  └─────────────────────────┘  └───────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP GET /api/facturas/cliente/{id}
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (.NET Core API)                        │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  CONTROLLERS LAYER                                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  FacturasController                                  │  │  │
│  │  │  - Validación de parámetros                          │  │  │
│  │  │  - Manejo de HTTP (200, 400, 404, 500)              │  │  │
│  │  │  - Logging de requests                               │  │  │
│  │  └──────────────────────┬──────────────────────────────┘  │  │
│  └─────────────────────────┼──────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────▼──────────────────────────────────┐  │
│  │  SERVICES LAYER                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  FacturaService                                      │  │  │
│  │  │  - Lógica de negocio                                 │  │  │
│  │  │  - Transformación Modelo → DTO                       │  │  │
│  │  │  - Cálculos agregados (total, suma)                 │  │  │
│  │  │  - Logging de operaciones                            │  │  │
│  │  └──────────────────────┬──────────────────────────────┘  │  │
│  └─────────────────────────┼──────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────▼──────────────────────────────────┐  │
│  │  REPOSITORY LAYER                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  FacturaRepository                                   │  │  │
│  │  │  - Abstracción de datos                              │  │  │
│  │  │  - Filtrado (ClienteID, Estado != 'Anulada')        │  │  │
│  │  │  - Ordenamiento (Fecha DESC)                         │  │  │
│  │  │  - Datos en memoria (mock)                           │  │  │
│  │  └──────────────────────┬──────────────────────────────┘  │  │
│  └─────────────────────────┼──────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────▼──────────────────────────────────┐  │
│  │  MODELS / DTOs                                             │  │
│  │  - Factura (Modelo de dominio)                             │  │
│  │  - FacturaDto (Modelo de API)                              │  │
│  │  - FacturasResponse (Respuesta estructurada)               │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Flujo de Datos Detallado

### Request Flow (Usuario busca facturas)

```
1. USUARIO
   ├─ Ingresa ClienteID: 1
   ├─ Click en "Buscar Facturas"
   └─ Espera respuesta
        ↓
2. FRONTEND (page.tsx)
   ├─ handleSearch(1)
   ├─ setIsLoading(true)
   ├─ setError(null)
   └─ fetch('http://localhost:5000/api/facturas/cliente/1')
        ↓
3. NETWORK
   ├─ HTTP GET Request
   ├─ Headers: { Content-Type: application/json }
   └─ URL: /api/facturas/cliente/1
        ↓
4. BACKEND - FacturasController
   ├─ Recibe request
   ├─ Valida: clienteId > 0 ? ✓
   ├─ Llama: _facturaService.GetFacturasByClienteIdAsync(1)
   └─ Log: "Procesando solicitud para cliente 1"
        ↓
5. BACKEND - FacturaService
   ├─ Llama: _repository.GetFacturasByClienteIdAsync(1)
   ├─ Recibe List<Factura>
   ├─ Transforma a List<FacturaDto>
   ├─ Calcula agregados (total, suma)
   └─ Retorna FacturasResponse
        ↓
6. BACKEND - FacturaRepository
   ├─ Filtra: _facturas.Where(f => f.ClienteID == 1)
   ├─ Excluye: && f.Estado != "Anulada"
   ├─ Ordena: .OrderByDescending(f => f.Fecha)
   └─ Retorna: 4 facturas
        ↓
7. BACKEND - Response
   ├─ HTTP 200 OK
   ├─ Content-Type: application/json
   └─ Body: {
         "clienteID": 1,
         "facturas": [...],
         "totalFacturas": 4,
         "montoTotal": 7850.75
      }
        ↓
8. FRONTEND - Receive Response
   ├─ setFacturas(data.facturas)
   ├─ setMontoTotal(data.montoTotal)
   ├─ setIsLoading(false)
   └─ Renderiza FacturasTable
        ↓
9. UI - Display
   ├─ Muestra tabla con 4 facturas
   ├─ Badge de color por estado
   ├─ Monto total: $7,850.75
   └─ Filtro de monto disponible
```

## 3. Patrones de Diseño Implementados

### 3.1 Repository Pattern

```
┌──────────────────────────────────────┐
│      IFacturaRepository              │
│  (Interfaz/Contrato)                 │
│  ────────────────────────────────    │
│  + GetFacturasByClienteIdAsync()     │
│  + GetFacturaByIdAsync()             │
└──────────────┬───────────────────────┘
               │ implements
               ▼
┌──────────────────────────────────────┐
│      FacturaRepository                │
│  (Implementación Concreta)            │
│  ────────────────────────────────    │
│  - _facturas: List<Factura>          │
│  + GetFacturasByClienteIdAsync()     │
│  + GetFacturaByIdAsync()             │
└──────────────────────────────────────┘

Beneficios:
✓ Abstracción de acceso a datos
✓ Fácil de mockear para testing
✓ Cambio de fuente de datos sin afectar capas superiores
```

### 3.2 Dependency Injection Pattern

```
┌─────────────────────────────────────────────────┐
│  Program.cs (Dependency Container)              │
│  ─────────────────────────────────────────      │
│  builder.Services.AddScoped<IFacturaRepo,       │
│                              FacturaRepo>();    │
│  builder.Services.AddScoped<IFacturaService,    │
│                              FacturaService>(); │
└────────────────────┬────────────────────────────┘
                     │ Resuelve dependencias
                     ▼
┌─────────────────────────────────────────────────┐
│  FacturaService                                  │
│  ──────────────────────────────────────────     │
│  public FacturaService(                          │
│      IFacturaRepository repository,              │
│      ILogger<FacturaService> logger)             │
│  {                                               │
│      _repository = repository;  ← Inyectado     │
│      _logger = logger;          ← Inyectado     │
│  }                                               │
└──────────────────────────────────────────────────┘

Beneficios:
✓ Bajo acoplamiento
✓ Fácil testing con mocks
✓ Control de lifetime (Scoped, Singleton, Transient)
✓ Configuración centralizada
```

### 3.3 DTO Pattern

```
┌─────────────────────────────────────┐
│  Factura (Domain Model)             │
│  ─────────────────────────────      │
│  + FacturaID: int                   │
│  + ClienteID: int                   │
│  + Fecha: DateTime                  │
│  + Monto: decimal                   │
│  + Estado: string                   │
│  + Descripcion: string?             │
│  + InternalField: string  ← Interno │
└─────────────┬───────────────────────┘
              │ Mapeo
              ▼
┌─────────────────────────────────────┐
│  FacturaDto (Transfer Object)       │
│  ─────────────────────────────      │
│  + FacturaID: int                   │
│  + Fecha: DateTime                  │
│  + Monto: decimal                   │
│  + Estado: string                   │
│  + Descripcion: string?             │
│  (Solo campos necesarios para API)  │
└─────────────────────────────────────┘

Beneficios:
✓ Seguridad (no expone campos internos)
✓ Versionado de API independiente del modelo
✓ Optimización (solo datos necesarios)
```

## 4. Estados de la Aplicación Frontend

```
┌─────────────────────────────────────────────────────────┐
│                     INITIAL STATE                        │
│  - facturas: []                                          │
│  - clienteId: null                                       │
│  - isLoading: false                                      │
│  - error: null                                           │
└──────────────────────┬──────────────────────────────────┘
                       │ Usuario ingresa ID y busca
                       ▼
┌─────────────────────────────────────────────────────────┐
│                     LOADING STATE                        │
│  - facturas: []                                          │
│  - clienteId: 1                                          │
│  - isLoading: true   ← Muestra spinner                   │
│  - error: null                                           │
└──────────────┬───────────────────┬──────────────────────┘
               │                   │
        ┌──────▼─────┐      ┌─────▼──────┐
        │  SUCCESS   │      │   ERROR    │
        └──────┬─────┘      └─────┬──────┘
               │                   │
               ▼                   ▼
┌──────────────────────┐  ┌───────────────────────────┐
│   SUCCESS STATE      │  │   ERROR STATE             │
│  - facturas: [...]   │  │  - facturas: []           │
│  - clienteId: 1      │  │  - clienteId: 1           │
│  - isLoading: false  │  │  - isLoading: false       │
│  - error: null       │  │  - error: "Error message" │
│  ─────────────────── │  │  ────────────────────     │
│  Renderiza tabla ✓   │  │  Muestra error ⚠️         │
└──────────────────────┘  └───────────────────────────┘
```

## 5. Comparación: Sistema Legado vs Nueva Arquitectura

### ANTES (ASP Clásico)

```
┌─────────────────────────────────────────┐
│  Navegador                               │
│  Request → page.asp?id=1                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Servidor ASP Clásico                    │
│  ┌───────────────────────────────────┐  │
│  │  Todo mezclado en un solo archivo │  │
│  │  ─────────────────────────────     │  │
│  │  <%                                │  │
│  │    ' Lógica de negocio            │  │
│  │    ' Acceso a BD (SQL directo)    │  │
│  │    ' Presentación (HTML)          │  │
│  │    ' Todo acoplado                │  │
│  │  %>                                │  │
│  └───────────────────────────────────┘  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Base de Datos                           │
│  Consultas SQL directas                  │
│  (Vulnerable a SQL Injection)            │
└─────────────────────────────────────────┘

❌ Problemas:
- SQL Injection
- Sin separación de responsabilidades
- Difícil de testear
- Sin control de versiones de API
- Credenciales hardcodeadas
- Sin manejo de errores estructurado
```

### AHORA (Arquitectura Moderna)

```
┌─────────────────────────────────────────┐
│  Navegador (React/Next.js)               │
│  SPA con componentes reutilizables       │
└────────────┬────────────────────────────┘
             │
             │ REST API (JSON)
             ▼
┌─────────────────────────────────────────┐
│  Backend (.NET Core)                     │
│  ┌───────────────────────────────────┐  │
│  │  Controllers (HTTP)                │  │
│  ├───────────────────────────────────┤  │
│  │  Services (Business Logic)         │  │
│  ├───────────────────────────────────┤  │
│  │  Repositories (Data Access)        │  │
│  ├───────────────────────────────────┤  │
│  │  Models / DTOs                     │  │
│  └───────────────────────────────────┘  │
└────────────┬────────────────────────────┘
             │
             │ Abstracción
             ▼
┌─────────────────────────────────────────┐
│  Datos (In-Memory / Future: EF Core)     │
│  Queries parametrizadas                  │
│  (Seguro contra SQL Injection)           │
└─────────────────────────────────────────┘

✅ Beneficios:
- Seguro (sin SQL injection)
- Separación de responsabilidades
- Testeable
- Versionado de API
- Configuración externalizada
- Manejo de errores robusto
- Logging estructurado
- Escalable
```

## 6. Flujo de Filtrado Client-Side

```
Usuario muestra todas las facturas (4 facturas)
│
│  [Factura 1: $1,500.50]
│  [Factura 2: $2,300.75]
│  [Factura 3: $850.00]
│  [Factura 4: $3,200.00]
│
▼
Usuario ingresa monto mínimo: $1,000
│
│  useMemo detecta cambio en montoMinimo
│  ↓
│  Ejecuta filtro: facturas.filter(f => f.monto >= 1000)
│  ↓
│  Resultado: 3 facturas
│
▼
UI actualizada (sin llamar al backend)
│
│  [Factura 1: $1,500.50] ✓
│  [Factura 2: $2,300.75] ✓
│  [Factura 3: $850.00]   ✗ (Oculto)
│  [Factura 4: $3,200.00] ✓
│
│  "Mostrando 3 de 4 facturas"
│
✓ Filtrado instantáneo, sin latencia de red
```

## 7. Mejoras Futuras Planificadas

```
ACTUAL                          FUTURO
──────                          ──────

Datos en memoria     ─────►    Entity Framework Core
                                + SQL Server

Sin autenticación    ─────►    JWT + OAuth 2.0
                                + Role-based access

Sin caché            ─────►    Redis
                                + Multi-level caching

Sin paginación       ─────►    Server-side pagination
                                + Lazy loading

CORS permisivo       ─────►    CORS restrictivo
                                + Rate limiting

Logs básicos         ─────►    Application Insights
                                + Structured logging

Sin monitoring       ─────►    Health checks
                                + Prometheus metrics

Sin CI/CD            ─────►    GitHub Actions
                                + Automated deployment
```

Este documento proporciona una visión completa de la arquitectura implementada y el razonamiento detrás de cada decisión técnica.
