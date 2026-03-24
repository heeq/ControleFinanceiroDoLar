using ControleFinanceiroDoLar.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace ControleFinanceiroDoLar.Server.Controllers.DTOs;


public sealed record LoginRequest
{
    [Required, EmailAddress]
    public required string Login { get; set; }

    [Required]
    public required string Password { get; set; }

    public bool? RememberMe { get; set; } = false;
}

public sealed record RegisterRequest
{
    [Required]
    public string Name { get; set; }

    [Required, EmailAddress]
    public string Login { get; set; }

    [Required]
    public string Password { get; set; }

}

public sealed record LoginResponse
{
    [Required]
    public string Name { get; set; }

    [Required, EmailAddress]
    public string Login { get; set; }

    public bool? RememberMe { get; set; }
}