using System.ComponentModel.DataAnnotations;

namespace ControleFinanceiroDoLar.Server.Models;

public enum IdempotencyStatus
{
    InProgress = 0,
    Completed = 1,
    Failed = 2
}

public class IdempotencyRecord
{
    [Key]
    public Guid Id { get; set; }

    public string Key { get; set; } = default!;
    public string Endpoint { get; set; } = default!;
    public string UserId { get; set; } = default!;

    public string RequestHash { get; set; } = default!;

    public IdempotencyStatus Status { get; set; }

    public int? ResponseStatusCode { get; set; }
    public string? ResponseBody { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}