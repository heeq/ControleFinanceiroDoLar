using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Models;

namespace ControleFinanceiroDoLar.Server.Application;

public interface ICategoryService
{
    Task<CategoryDto> CreateAsync(CreateCategoryRequest req, CancellationToken ct);

    Task<CategoryDto?> GetByIdAsync(Guid categoryId, CancellationToken ct);
    Task<IReadOnlyList<CategoryDto>> ListAsync(string? description, CategoryPurpose? purpose, CancellationToken ct);
    //Task<bool> DeleteAsync(Guid categoryId, CancellationToken ct);
}