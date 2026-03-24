using System.ComponentModel.DataAnnotations;

namespace ControleFinanceiroDoLar.Server.Models;

public enum CategoryPurpose
{
    Expense,
    Income,
    Both
}

public class Category
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(400)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public CategoryPurpose Purpose { get; set; }
}
