using System.ComponentModel.DataAnnotations;

namespace ControleFinanceiroDoLar.Server.Models;

public class People
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int Age { get; set; }

}
