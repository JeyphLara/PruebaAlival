using FacturasAPI.Models;

namespace FacturasAPI.Repositories;

public interface IFacturaRepository
{
    Task<IEnumerable<Factura>> GetFacturasByClienteIdAsync(int clienteId);
    Task<Factura?> GetFacturaByIdAsync(int facturaId);
}

public class FacturaRepository : IFacturaRepository
{
    // Simulación de datos en memoria
    private static readonly List<Factura> _facturas = new()
    {
        new Factura { FacturaID = 1001, ClienteID = 1, Fecha = DateTime.Now.AddDays(-30), Monto = 1500.50m, Estado = "Pagada", Descripcion = "Servicios de consultoría" },
        new Factura { FacturaID = 1002, ClienteID = 1, Fecha = DateTime.Now.AddDays(-20), Monto = 2300.75m, Estado = "Pendiente", Descripcion = "Desarrollo de software" },
        new Factura { FacturaID = 1003, ClienteID = 1, Fecha = DateTime.Now.AddDays(-15), Monto = 850.00m, Estado = "Pagada", Descripcion = "Mantenimiento" },
        new Factura { FacturaID = 1004, ClienteID = 1, Fecha = DateTime.Now.AddDays(-10), Monto = 3200.00m, Estado = "Vencida", Descripcion = "Proyecto especial" },
        new Factura { FacturaID = 1005, ClienteID = 1, Fecha = DateTime.Now.AddDays(-5), Monto = 500.25m, Estado = "Anulada", Descripcion = "Cancelado" },
        
        new Factura { FacturaID = 2001, ClienteID = 2, Fecha = DateTime.Now.AddDays(-25), Monto = 4500.00m, Estado = "Pagada", Descripcion = "Infraestructura" },
        new Factura { FacturaID = 2002, ClienteID = 2, Fecha = DateTime.Now.AddDays(-18), Monto = 1200.50m, Estado = "Pendiente", Descripcion = "Soporte técnico" },
        new Factura { FacturaID = 2003, ClienteID = 2, Fecha = DateTime.Now.AddDays(-8), Monto = 6700.00m, Estado = "Vencida", Descripcion = "Licencias" },
        
        new Factura { FacturaID = 3001, ClienteID = 3, Fecha = DateTime.Now.AddDays(-40), Monto = 890.00m, Estado = "Pagada", Descripcion = "Capacitación" },
        new Factura { FacturaID = 3002, ClienteID = 3, Fecha = DateTime.Now.AddDays(-12), Monto = 1500.00m, Estado = "Pendiente", Descripcion = "Auditoría" },
    };

    public Task<IEnumerable<Factura>> GetFacturasByClienteIdAsync(int clienteId)
    {
        // Filtrar facturas por ClienteID excluyendo las anuladas, ordenadas por fecha descendente
        var facturas = _facturas
            .Where(f => f.ClienteID == clienteId && f.Estado != "Anulada")
            .OrderByDescending(f => f.Fecha)
            .AsEnumerable();

        return Task.FromResult(facturas);
    }

    public Task<Factura?> GetFacturaByIdAsync(int facturaId)
    {
        var factura = _facturas.FirstOrDefault(f => f.FacturaID == facturaId);
        return Task.FromResult(factura);
    }
}
