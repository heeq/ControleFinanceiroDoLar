using ControleFinanceiroDoLar.Server.Models;

namespace ControleFinanceiroDoLar.Server.Controllers.DTOs;

public class CreateTransactionRequest
{
    public string Description { get; set; }

    public TransactionType Type { get; set; }

    public decimal Amount { get; set; } = 0;

    public string CategoryId { get; set; }

    public string PeopleId { get; set; }

    //public Guid PeopleId { get; set; }

    //public Guid CategoryId { get; set; }
}