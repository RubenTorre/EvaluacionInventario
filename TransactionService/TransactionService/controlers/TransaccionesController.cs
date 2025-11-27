using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionService.Data;
using TransactionService.Dtos;
using TransactionService.Models;


namespace TransactionService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly TransactionDbContext _context;
        private readonly IHttpClientFactory _clientFactory;

        public TransactionsController(TransactionDbContext context, IHttpClientFactory clientFactory)
        {
            _context = context;
            _clientFactory = clientFactory;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
    int page = 1,
    int pageSize = 10,
    string? type = null,
    DateTime? startDate = null,
    DateTime? endDate = null
)
        {
            var query = _context.Transactions.AsQueryable();

            if (!string.IsNullOrEmpty(type))
                query = query.Where(t => t.Type.ToLower() == type.ToLower());

            
            if (startDate.HasValue)
                query = query.Where(t => t.Date.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(t => t.Date.Date <= endDate.Value.Date);

            var totalItems = await query.CountAsync();

           
            var transactionsPage = await query
                .OrderByDescending(t => t.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var client = _clientFactory.CreateClient();
            client.BaseAddress = new Uri("http://localhost:5088");

            var transactionDtos = new List<TransactionDto>();
            foreach (var t in transactionsPage)
            {
                ProductDto? product = null;
                try
                {
                    product = await client.GetFromJsonAsync<ProductDto>($"/api/products/{t.ProductId}");
                }
                catch
                {
                    
                }

                transactionDtos.Add(new TransactionDto
                {
                    Id = t.Id,
                    Date = t.Date,
                    Type = t.Type,
                    ProductId = t.ProductId,
                    ProductName = product?.Name ?? "Producto no disponible",
                    Quantity = t.Quantity,
                    UnitPrice = t.UnitPrice,
                    TotalPrice = t.TotalPrice,
                    Details = t.Details
                });
            }

            return Ok(new
            {
                totalItems,
                page,
                pageSize,
                transactions = transactionDtos
            });
        }


        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var transaction = _context.Transactions.Find(id);

            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        // POST api/transactions
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Transaction transaction)
        {
            if (transaction == null)
                return BadRequest("Transacción inválida");

            if (transaction.Quantity <= 0)
                return BadRequest("La cantidad debe ser mayor que cero");

            if (transaction.UnitPrice <= 0)
                return BadRequest("El precio unitario debe ser mayor que cero");

            if (string.IsNullOrWhiteSpace(transaction.Type) ||
                !(transaction.Type.ToLower() == "compra" || transaction.Type.ToLower() == "venta"))
            {
                return BadRequest("Tipo de transacción inválido. Use 'compra' o 'venta'");
            }

            var client = _clientFactory.CreateClient();
            client.BaseAddress = new Uri("http://localhost:5088"); 

            HttpResponseMessage stockResponse;

            if (transaction.Type.ToLower() == "venta")
            {
                var productResponse = await client.GetAsync($"/api/products/{transaction.ProductId}");
                if (!productResponse.IsSuccessStatusCode)
                    return BadRequest("Producto no encontrado");

                var product = await productResponse.Content.ReadFromJsonAsync<ProductDto>();
                if (product == null)
                    return BadRequest("Producto inválido");

                if (product.Stock < transaction.Quantity)
                {
                    return BadRequest($"No se puede realizar la venta. Stock insuficiente: {product.Stock} disponibles.");
                }

                stockResponse = await client.PostAsJsonAsync(
                    $"/api/products/{transaction.ProductId}/decrement",
                    new { quantity = transaction.Quantity }
                );

                if (!stockResponse.IsSuccessStatusCode)
                {
                    var errorMsg = await stockResponse.Content.ReadAsStringAsync();
                    return BadRequest($"Error al decrementar stock: {errorMsg}");
                }
            }
            else 
            {
                stockResponse = await client.PostAsJsonAsync(
                    $"/api/products/{transaction.ProductId}/increment",
                    new { quantity = transaction.Quantity }
                );

                if (!stockResponse.IsSuccessStatusCode)
                {
                    var errorMsg = await stockResponse.Content.ReadAsStringAsync();
                    return BadRequest($"No se pudo incrementar el stock: {errorMsg}");
                }
            }


            transaction.CreatedAt = DateTime.UtcNow;
            if (transaction.Date == default)
                transaction.Date = DateTime.UtcNow;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Transacción {(transaction.Type.ToLower() == "compra" ? "de compra" : "de venta")} registrada correctamente",
                transactionId = transaction.Id,
                totalPrice = transaction.TotalPrice
            });
        }

        public class StockErrorResponse
        {
            public string Message { get; set; } = "";
            public int Available { get; set; }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var transaction = _context.Transactions.Find(id);

            if (transaction == null)
                return NotFound();

            _context.Remove(transaction);
            _context.SaveChanges();

            return Ok();
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Transaction updatedTransaction)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null) return NotFound("Transacción no encontrada");

            var client = _clientFactory.CreateClient();
            client.BaseAddress = new Uri("http://localhost:5088");

            var productResponse = await client.GetAsync($"/api/products/{updatedTransaction.ProductId}");
            if (!productResponse.IsSuccessStatusCode) return BadRequest("Producto no encontrado");
            var product = await productResponse.Content.ReadFromJsonAsync<ProductDto>();
            if (product == null) return BadRequest("Producto inválido");

            if (transaction.Type.ToLower() == "venta")
            {
                await client.PostAsJsonAsync($"/api/products/{transaction.ProductId}/increment",
                                            new { quantity = transaction.Quantity });

                if (product.Stock < updatedTransaction.Quantity)
                    return BadRequest($"No se puede realizar la venta. Stock insuficiente: {product.Stock} disponibles.");

                await client.PostAsJsonAsync($"/api/products/{updatedTransaction.ProductId}/decrement",
                                             new { quantity = updatedTransaction.Quantity });
            }
            else if (transaction.Type.ToLower() == "compra")
            {
                await client.PostAsJsonAsync($"/api/products/{transaction.ProductId}/decrement",
                                             new { quantity = transaction.Quantity });
            
                await client.PostAsJsonAsync($"/api/products/{updatedTransaction.ProductId}/increment",
                                             new { quantity = updatedTransaction.Quantity });
            }

            transaction.Quantity = updatedTransaction.Quantity;
            transaction.UnitPrice = updatedTransaction.UnitPrice;
            transaction.TotalPrice = updatedTransaction.TotalPrice;
            transaction.Details = updatedTransaction.Details;
            transaction.Type = updatedTransaction.Type;
            transaction.ProductId = updatedTransaction.ProductId;
            transaction.Date = updatedTransaction.Date;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Transacción actualizada correctamente" });
        }

    }
}
