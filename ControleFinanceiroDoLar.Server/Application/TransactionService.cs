using Microsoft.EntityFrameworkCore;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Data;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Utils;

namespace ControleFinanceiroDoLar.Server.Application;

public class TransactionService(ApplicationDbContext db) : ITransactionService
{
    private readonly ApplicationDbContext _db = db;

    public async Task<TransactionDto> CreateAsync(CreateTransactionRequest req, CancellationToken ct)
    {
        if (req is null) throw new ArgumentNullException(nameof(req));

        if (req.Description is null || req.CategoryId is null || req.PeopleId is null) 
            throw new ArgumentException("Descrição é necessária.");

        var description = req.Description.Trim();
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Descrição não pode ser vazia.");

        req.Description = description; // com Trim()

        if (req.Type == TransactionType.Income && req.Amount <= 0)
            throw new ArgumentException("Valor da receita deve ser maior que zero.");

        var newTransaction = new Transaction
        {
            Description = req.Description,
            Type = req.Type,
            Amount = req.Amount,
            CategoryId = Guid.Parse(req.CategoryId),
            PeopleId = Guid.Parse(req.PeopleId)
        };


        _db.Transactions.Add(newTransaction); // nao traz beneficio o assincrono, nao faz I/O com banco, só trackeia
        await _db.SaveChangesAsync(ct);

        return new TransactionDto
        {
            id = newTransaction.Id,
            description = newTransaction.Description,
            amount = newTransaction.Amount,
            type = newTransaction.Type,
            categoryId = newTransaction.CategoryId,
            peopleId = newTransaction.PeopleId
        };
    }

    public async Task<IReadOnlyList<TransactionDto>> ListAsync(Guid? peopleId, string? description, TransactionType? type, CancellationToken ct = default)
    {
        var query = _db.Transactions.AsNoTracking().AsQueryable();

        if (peopleId.HasValue)
            query = query.Where(x => x.PeopleId == peopleId.Value);

        if (!string.IsNullOrWhiteSpace(description))
            query = query.Where(x => x.Description.ToLower().Contains(description.ToLower()));

        if (type.HasValue)
            query = query.Where(x => x.Type == type.Value);

        return await query
            .OrderBy(x => x.Description)
            .Select(x => new TransactionDto
            {
                id = x.Id,
                description = x.Description,
                type = x.Type,
                amount = x.Amount,
                categoryId = x.CategoryId,
                peopleId = x.PeopleId
            })
            .ToListAsync(ct);
    }

    public async Task<TransactionDto?> GetByIdAsync(Guid transactionId, CancellationToken ct)
    {
        if (!transactionId.IsValidAndNotEmpty())
            throw new ArgumentException("ID da transação inválido");

        return await _db.Transactions.AsNoTracking()
            .Where(x => x.Id == transactionId)
            .Select(x => new TransactionDto { id = x.Id, description = x.Description, type = x.Type, amount = x.Amount, 
                                              categoryId = x.CategoryId, peopleId = x.PeopleId })
            .SingleOrDefaultAsync(ct);
    }

    //public async Task<bool> DeleteAsync(Guid categoryId, CancellationToken ct)
    //{
    //    var affected = await _db.Categories
    //        .Where(x => x.Id == categoryId)
    //        .ExecuteDeleteAsync(ct);

    //    return affected > 0;
    //}
}