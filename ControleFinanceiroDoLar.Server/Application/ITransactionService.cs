using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Models;

namespace ControleFinanceiroDoLar.Server.Application;

public interface ITransactionService
{
    Task<TransactionDto> CreateAsync(CreateTransactionRequest req, CancellationToken ct);

    Task<TransactionDto?> GetByIdAsync(Guid transactionId, CancellationToken ct);

    Task<IReadOnlyList<TransactionDto>> ListAsync(Guid? peopleId, string? description, TransactionType? type, CancellationToken ct);
}