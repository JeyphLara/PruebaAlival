<<<<<<< HEAD
# API de Facturas - Backend

API REST desarrollada en .NET 10 / C# para la gestión de consultas de facturas.

## Tecnologías

- .NET 10.0
- ASP.NET Core Web API
- C# 13
- Patrón Repository
- Inyección de Dependencias

## Ejecutar el proyecto

```bash
cd FacturasAPI
dotnet restore
dotnet run
```

La API estará disponible en `http://localhost:5000`

## Endpoints

### Obtener facturas por cliente
```
GET /api/facturas/cliente/{clienteId}
```

**Respuesta exitosa (200):**
```json
{
  "clienteID": 1,
  "facturas": [
    {
      "facturaID": 1001,
      "fecha": "2026-01-28T00:00:00",
      "monto": 1500.50,
      "estado": "Pagada",
      "descripcion": "Servicios de consultoría"
    }
  ],
  "totalFacturas": 4,
  "montoTotal": 7850.75
}
```

**Errores:**
- `400 Bad Request` - ClienteID inválido
- `404 Not Found` - Cliente sin facturas
- `500 Internal Server Error` - Error del servidor

### Health Check
```
GET /api/facturas/health
```

## Arquitectura

```
FacturasAPI/
├── Controllers/        # Endpoints REST
│   └── FacturasController.cs
├── Services/          # Lógica de negocio
│   └── FacturaService.cs
├── Repositories/      # Acceso a datos
│   └── FacturaRepository.cs
├── Models/            # Entidades de dominio
│   └── Factura.cs
└── DTOs/              # Objetos de transferencia
    └── FacturaDto.cs
```

## Características

- Arquitectura en capas
-  Inyección de dependencias
- Manejo de errores robusto
- Logging estructurado
- CORS configurado
- Validaciones de entrada
- Datos en memoria

## Datos de Prueba

- Cliente 1: 4 facturas
- Cliente 2: 3 facturas
- Cliente 3: 2 facturas



----------



detallo las decisiones técnicas tomadas durante la migración del sistema legado ASP clásico a una arquitectura moderna basada en .NET y React.

## 1. Arquitectura Backend (.NET)

### 1.1 Patrón de Capas

**Decisión**: Implementar arquitectura en capas con separación clara de responsabilidades.

**Estructura**:
```
Controllers → Services → Repositories → Data
```

**Justificación**:
- **Mantenibilidad**: Cada capa tiene una responsabilidad única (SRP)
- **Testabilidad**: Las capas pueden probarse de forma independiente
- **Escalabilidad**: Fácil agregar nuevas funcionalidades sin afectar otras capas
- **Migración**: Facilita la futura integración con EF Core o cualquier ORM

**Implementación**:
- `Controllers`: Validación de entrada, manejo de HTTP, mapeo de respuestas
- `Services`: Lógica de negocio, transformaciones, cálculos agregados
- `Repositories`: Abstracción de acceso a datos, simulación en memoria

### 1.2 Inyección de Dependencias

**Decisión**: Usar el contenedor DI nativo de .NET.

```csharp
builder.Services.AddScoped<IFacturaRepository, FacturaRepository>();
builder.Services.AddScoped<IFacturaService, FacturaService>();
```

**Justificación**:
- **Desacoplamiento**: Las dependencias se inyectan, no se crean
- **Testing**: Permite inyectar mocks/stubs en tests
- **Configuración centralizada**: Todas las dependencias en Program.cs
- **Lifetime management**: Control del ciclo de vida (Scoped, Singleton, Transient)

**Lifetime elegido**: `Scoped`
- Crea una instancia por request HTTP
- Evita problemas de concurrencia
- Ideal para operaciones de base de datos

### 1.3 DTOs (Data Transfer Objects)

**Decisión**: Separar modelos de dominio de modelos de API.

**Beneficios**:
- **Versionado**: Cambios en la DB no afectan la API
- **Seguridad**: Solo se exponen campos necesarios
- **Optimización**: Se pueden agregar campos calculados
- **Documentación**: Contratos claros de API

**Ejemplo**:
```csharp
// Modelo de dominio (interno)
public class Factura { ... }

// DTO (expuesto en API)
public class FacturaDto { ... }
public class FacturasResponse { ... }
```

### 1.4 Manejo de Errores

**Decisión**: Implementar manejo centralizado con respuestas HTTP semánticas.

**Códigos de estado**:
- `200 OK`: Consulta exitosa
- `400 Bad Request`: Parámetros inválidos
- `404 Not Found`: Cliente sin facturas
- `500 Internal Server Error`: Errores inesperados

**Logging**:
- `LogInformation`: Operaciones normales
- `LogWarning`: Validaciones fallidas
- `LogError`: Excepciones no controladas

### 1.5 CORS (Cross-Origin Resource Sharing)

**Decisión**: Configurar CORS explícito para desarrollo.

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

**En producción se debería**:
- Restringir a dominios específicos
- Deshabilitar `AllowAnyHeader` y especificar headers permitidos
- Implementar rate limiting
- Agregar autenticación

### 1.6 Simulación de Datos vs Entity Framework

**Decisión actual**: Datos en memoria para simplificar la prueba.

**Migración a EF Core** (futura):
```csharp
// 1. Instalar paquetes
// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
// dotnet add package Microsoft.EntityFrameworkCore.Tools

// 2. Crear DbContext
public class FacturasDbContext : DbContext {
    public DbSet<Factura> Facturas { get; set; }
}

// 3. Configurar en Program.cs
builder.Services.AddDbContext<FacturasDbContext>(options =>
    options.UseSqlServer(connectionString));

// 4. Actualizar Repository
public class FacturaRepository : IFacturaRepository {
    private readonly FacturasDbContext _context;
    
    public async Task<IEnumerable<Factura>> GetFacturasByClienteIdAsync(int clienteId) {
        return await _context.Facturas
            .Where(f => f.ClienteID == clienteId && f.Estado != "Anulada")
            .OrderByDescending(f => f.Fecha)
            .ToListAsync();
    }
}
```


## Parte 3: Preguntas Teóricas

### 1. Seguridad: Implementación de Autenticación y Autorización

Para asegurar que solo usuarios autenticados de la compañía puedan consultar facturas, implementaría un sistema de autenticación basado en JWT combinado con OAuth 2.0 / OpenID Connect. En el backend .NET, utilizaría `Microsoft.AspNetCore.Authentication.JwtBearer` para validar tokens en cada request, agregando el middleware `[Authorize]` en los controladores. Los tokens incluirían claims específicos del usuario (ID, roles, permisos) y tendrían expiración corta (15-30 min) con refresh tokens para renovación segura.

Adicionalmente, implementaría Role-Based Access Control (RBAC) para controlar qué usuarios pueden ver qué facturas. Por ejemplo, un vendedor solo vería facturas de sus clientes asignados, mientras que un administrador tendría acceso completo. En el frontend, almacenaría el token en memoria (no localStorage por seguridad XSS) y lo enviaría en el header `Authorization: Bearer <token>` de cada petición. Para protección adicional, habilitaría CORS restrictivo, HTTPS obligatorio, rate limiting, y logging de auditoría de todos los accesos a datos sensibles.

### 2. Integración ERP: Estrategias para Consultas Pesadas

Para integrar con un ERP corporativo donde las consultas son pesadas y evitar tiempos de espera excesivos en el frontend, implementaría una arquitectura de caché multinivel combinada con procesamiento asíncrono. Primero, utilizaría Redis como caché distribuida en .NET para almacenar resultados de consultas frecuentes con TTL (Time To Live) inteligente basado en la volatilidad de los datos. Para consultas en tiempo real no cacheables, implementaría el patrón CQRS (Command Query Responsibility Segregation) con una base de datos de lectura optimizada (read model) sincronizada desde el ERP mediante eventos.

Segundo, para consultas extremadamente pesadas, usaría procesamiento asíncrono con colas de mensajes (Azure Service Bus o RabbitMQ): el frontend solicita el reporte, recibe un job ID inmediatamente, y luego consulta el estado vía polling o WebSockets hasta que esté listo. En .NET implementaría esto con Hangfire o Azure Functions. Además, aplicaría paginación server-side, lazy loading, y compresión Gzip/Brotli para reducir payload. En el frontend Next.js, utilizaría Suspense boundaries y skeleton screens para mejorar la percepción de velocidad, y consideraría Incremental Static Regeneration (ISR) para datos que no cambian constantemente.
=======
# PruebaAlival
Repositorio para alojar el back y Front de la prueba tecnica realizada para la empresa Alimentos del Valle.
>>>>>>> 3c27344c963f769dffc9c74c9b89b4766ead8681
