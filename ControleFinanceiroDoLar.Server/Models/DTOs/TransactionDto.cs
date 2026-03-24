namespace ControleFinanceiroDoLar.Server.Models.DTOs
{
    public class TransactionDto // DTO segue o padrão JSONIFICADO, com camel case
    {
        public Guid id { get; init; }

        public string description { get; init; }

        public decimal amount { get; init; } = 0;

        public TransactionType type { get; init; }

        public Guid peopleId { get; init; }

        public Guid categoryId { get; init; }
    }
}
