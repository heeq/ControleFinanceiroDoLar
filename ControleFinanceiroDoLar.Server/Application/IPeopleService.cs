using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;

namespace ControleFinanceiroDoLar.Server.Application;

public interface IPeopleService
{
    Task<PeopleDto> CreateAsync(CreatePeopleRequest req, CancellationToken ct);

    Task<PeopleDto> UpdateAsync(Guid peopleId, UpdatePeopleRequest req, CancellationToken ct);

    Task<PeopleDto?> GetByIdAsync(Guid peopleId, CancellationToken ct);
    Task<IReadOnlyList<PeopleDto>> ListAsync(string? name, int? age, CancellationToken ct);

    Task<bool> DeleteAsync(Guid peopleId, CancellationToken ct);
}