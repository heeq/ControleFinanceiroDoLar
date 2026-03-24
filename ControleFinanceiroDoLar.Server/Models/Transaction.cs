using System.ComponentModel.DataAnnotations;

namespace ControleFinanceiroDoLar.Server.Models;

public enum TransactionType
{
    Expense,
    Income
}

public class Transaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(400)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    [Required]
    public Guid PeopleId { get; set; }

    [Required]
    public Guid CategoryId { get; set; }
}
