using Microsoft.AspNetCore.Mvc;
using FacturasAPI.Services;

namespace FacturasAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasController : ControllerBase
{
    private readonly IFacturaService _facturaService;
    private readonly ILogger<FacturasController> _logger;

    public FacturasController(IFacturaService facturaService, ILogger<FacturasController> logger)
    {
        _facturaService = facturaService;
        _logger = logger;
    }

     /// Obtiene todas las facturas de un cliente específico (excluyendo anuladas)
    /// <param name="clienteId">ID del cliente</param>
    /// <returns>Lista de facturas del cliente</returns>
    [HttpGet("cliente/{clienteId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetFacturasByCliente(int clienteId)
    {
        try
        {
            if (clienteId <= 0)
            {
                _logger.LogWarning("ClienteId inválido: {ClienteId}", clienteId);
                return BadRequest(new { error = "El ID del cliente debe ser mayor a 0" });
            }

            var response = await _facturaService.GetFacturasByClienteIdAsync(clienteId);

            if (response.TotalFacturas == 0)
            {
                return NotFound(new { error = $"No se encontraron facturas para el cliente {clienteId}" });
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar la solicitud de facturas para el cliente {ClienteId}", clienteId);
            return StatusCode(500, new { error = "Error interno del servidor al procesar la solicitud" });
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "API de Facturas funcionando correctamente", timestamp = DateTime.UtcNow });
    }
}
