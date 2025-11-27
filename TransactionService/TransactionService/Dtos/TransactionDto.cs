namespace TransactionService.Dtos
{
    public class TransactionDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; } = null!;
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!; // nuevo campo
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Details { get; set; }
    }
}
