namespace FacturasAPI.Models;

public class Factura
{
    public int FacturaID { get; set; }
    public int ClienteID { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Monto { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}
