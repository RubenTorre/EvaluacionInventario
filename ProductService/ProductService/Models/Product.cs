    namespace ProductService.Models
    {
        public class Product
        {
            public int Id { get; set; }
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public string? Category { get; set; }
            public string? ImageUrl { get; set; }
            public decimal Price { get; set; }
            public int Stock { get; set; }
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
            public DateTime? UpdatedAt { get; set; }
    }
    }
