using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.dtos;
using ProductService.Models;

namespace ProductService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly InventoryDbContext _db; private readonly IWebHostEnvironment _env;

        public ProductsController(InventoryDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // GET api/products
        [HttpGet]
        public async Task<IActionResult> GetProducts(
            int page = 1,
            int pageSize = 10,
            string? name = null,
            string? category = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? minStock = null,
            int? maxStock = null)
        {
            var query = _db.Products.AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(p => p.Name.Contains(name));

            if (!string.IsNullOrEmpty(category))
                query = query.Where(p => p.Category == category);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            if (minStock.HasValue)
                query = query.Where(p => p.Stock >= minStock.Value);

            if (maxStock.HasValue)
                query = query.Where(p => p.Stock <= maxStock.Value);

            var totalItems = await query.CountAsync();

            var products = await query
                .OrderBy(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalItems,
                page,
                pageSize,
                products
            });
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _db.Products
                                      .Select(p => p.Category)
                                      .Distinct()
                                      .ToListAsync();
            return Ok(categories);
        }


        // POST api/products crear producto
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            bool exists = await _db.Products.AnyAsync(p => p.Name == product.Name);
            if (exists)
                return BadRequest("Ya existe un producto con este nombre.");

            product.CreatedAt = DateTime.UtcNow;
            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
        }


        //subirimagen
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Archivo no encontrado");

            var folderPath = Path.Combine(_env.WebRootPath, "images");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, file.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { imageUrl = $"images/{file.FileName}" });
        }

        // GET api/products/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var product = await _db.Products.FindAsync(id);

            if (product == null)
                return NotFound();

            return Ok(product);
        }
        // PUT api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (product.Stock < 0 || product.Price <= 0)
                return BadRequest("Stock o precio inválido.");

            var existing = await _db.Products.FindAsync(id);
            if (existing == null)
                return NotFound();

            // Validar nombre duplicado
            if (_db.Products.Any(p => p.Name == product.Name && p.Id != id))
                return BadRequest("Ya existe un producto con este nombre.");

            // Actualizar campos
            existing.Name = product.Name;
            existing.Category = product.Category;
            existing.Description = product.Description;
            existing.ImageUrl = product.ImageUrl;
            existing.Price = product.Price;
            existing.Stock = product.Stock;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _db.Products.Remove(product);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/decrement")]
        public async Task<IActionResult> DecrementStock(int id, [FromBody] StockUpdateDto dto)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            if (product.Stock < dto.Quantity)
                return BadRequest(new { message = "Stock insuficiente" });

            product.Stock -= dto.Quantity;
            await _db.SaveChangesAsync();

            return Ok(new { product.Id, product.Stock });
        }

        [HttpPost("{id}/increment")]
        public async Task<IActionResult> IncrementStock(int id, [FromBody] StockUpdateDto dto)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Stock += dto.Quantity;
            await _db.SaveChangesAsync();

            return Ok(new { product.Id, product.Stock });
        }

     


    }
}
