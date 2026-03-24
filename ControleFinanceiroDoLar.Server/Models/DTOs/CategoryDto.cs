namespace ControleFinanceiroDoLar.Server.Models.DTOs
{
    public class PeopleDto // DTO segue o padrão JSONIFICADO, com camel case
    {
        public Guid id { get; init; }

        public string name { get; init; }

        public int age { get; init; }
    }
}
