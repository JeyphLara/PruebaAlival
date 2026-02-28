using FacturasAPI.DTOs;
using FacturasAPI.Repositories;

namespace FacturasAPI.Services;

public interface IFacturaService
{
    Task<FacturasResponse> GetFacturasByClienteIdAsync(int clienteId);
}

public class FacturaService : IFacturaService
{
    private readonly IFacturaRepository _repository;
    private readonly ILogger<FacturaService> _logger;

    public FacturaService(IFacturaRepository repository, ILogger<FacturaService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<FacturasResponse> GetFacturasByClienteIdAsync(int clienteId)
    {
        try
        {
            _logger.LogInformation("Obteniendo facturas para el cliente {ClienteId}", clienteId);

            var facturas = await _repository.GetFacturasByClienteIdAsync(clienteId);
            var facturasDto = facturas.Select(f => new FacturaDto
            {
                FacturaID = f.FacturaID,
                Fecha = f.Fecha,
                Monto = f.Monto,
                Estado = f.Estado,
                Descripcion = f.Descripcion
            }).ToList();

            var response = new FacturasResponse
            {
                ClienteID = clienteId,
                Facturas = facturasDto,
                TotalFacturas = facturasDto.Count,
                MontoTotal = facturasDto.Sum(f => f.Monto)
            };

            _logger.LogInformation("Se encontraron {Count} facturas para el cliente {ClienteId}", response.TotalFacturas, clienteId);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener facturas para el cliente {ClienteId}", clienteId);
            throw;
        }
    }
}
