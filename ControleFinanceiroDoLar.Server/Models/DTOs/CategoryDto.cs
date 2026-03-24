namespace ControleFinanceiroDoLar.Server.Models.DTOs
{
    public class CategoryDto 
    {
        public Guid id { get; init; }

        public string description { get; init; }

        public CategoryPurpose purpose { get; init; }
    }
}
