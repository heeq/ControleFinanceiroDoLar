using Microsoft.EntityFrameworkCore;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Data;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Utils;
using System.Globalization;
using Microsoft.EntityFrameworkCore.Query;

namespace ControleFinanceiroDoLar.Server.Application;

public class PeopleService(ApplicationDbContext db) : IPeopleService
{
    private readonly ApplicationDbContext _db = db;

    public async Task<PeopleDto> CreateAsync(CreatePeopleRequest req, CancellationToken ct)
    {
        if (req is null) throw new ArgumentNullException(nameof(req));

        if (req.Name is null) throw new ArgumentException("Nome é necessário.");

        var name = req.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Nome não pode ser vazio.");

        if (req.Age <= 0)
            throw new ArgumentException("Idade inválida.");

        req.Name = name; // com Trim()

        var newPeople = new People
        {
            Name = req.Name,
            Age = req.Age
        };

        _db.Individual.Add(newPeople); // nao traz beneficio o assincrono, nao faz I/O com banco, só trackeia
        await _db.SaveChangesAsync(ct);

        return new PeopleDto
        {
            id = newPeople.Id,
            name = newPeople.Name,
            age = newPeople.Age
        };
    }

    public async Task<IReadOnlyList<PeopleDto>> ListAsync(string? name, int? age, CancellationToken ct = default)
    {
        var query = _db.Individual.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(x => x.Name.ToLower().Contains(name.ToLower()));

        if (age.HasValue)
            query = query.Where(x => x.Age == age.Value);

        return await query
            .OrderBy(x => x.Name)
            .Select(x => new PeopleDto
            {
                id = x.Id,
                name = x.Name,
                age = x.Age
            })
            .ToListAsync(ct);
    }

    public async Task<PeopleDto?> GetByIdAsync(Guid peopleId, CancellationToken ct)
    {
        if (!peopleId.IsValidAndNotEmpty())
            throw new ArgumentException("ID da pessoa inválido");

        return await _db.Individual.AsNoTracking()
            .Where(x => x.Id == peopleId)
            .Select(x => new PeopleDto { id = x.Id, name = x.Name, age = x.Age })
            .SingleOrDefaultAsync(ct);
    }

    public async Task<PeopleDto?> UpdateAsync(Guid peopleId, UpdatePeopleRequest req, CancellationToken ct) // pode retornar nulo caso nao encontre o recurso
    {
        if (!peopleId.IsValidAndNotEmpty()) throw new ArgumentNullException("ID do indivíduo inválidos");

        if (req is null) throw new ArgumentNullException(nameof(req));

        if (req.Name is null && req.Age is null)
            throw new ArgumentException("Nenhum campo para atualizar foi enviado.");

        var entity = await _db.Individual.SingleOrDefaultAsync(x => x.Id == peopleId, ct);
        if (entity is null) return null; // ou lançar exceção - informar que o recurso nao existe pode não ser a melhor opção

        if (req.Name is not null)
        {
            var name = req.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Nome não pode ser vazio.");

            if (name.Length > GeneralRules.MaxNameLength)
                throw new ArgumentException($"Nome deve ter no máximo {GeneralRules.MaxNameLength} caracteres.");

            entity.Name = name;
        }

        if (req.Age.HasValue)
        {
            if (req.Age < 0)
                throw new ArgumentException("Idade inválida.");

            entity.Age = (int)req.Age;
        }

        await _db.SaveChangesAsync(ct);

        return new PeopleDto
        {
            id = entity.Id,
            name = entity.Name,
            age = entity.Age
        };
    }

    public async Task<bool> DeleteAsync(Guid peopleId, CancellationToken ct)
    {
        var affected = await _db.Individual
            .Where(x => x.Id == peopleId)
            .ExecuteDeleteAsync(ct);

        return affected > 0;
    }
}