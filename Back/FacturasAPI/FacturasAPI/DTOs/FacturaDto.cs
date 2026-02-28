namespace FacturasAPI.DTOs;

public class FacturaDto
{
    public int FacturaID { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Monto { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}

public class FacturasResponse
{
    public int ClienteID { get; set; }
    public List<FacturaDto> Facturas { get; set; } = new();
    public int TotalFacturas { get; set; }
    public decimal MontoTotal { get; set; }
}
