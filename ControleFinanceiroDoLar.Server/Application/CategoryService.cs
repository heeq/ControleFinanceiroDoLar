using Microsoft.EntityFrameworkCore;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Data;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Utils;

namespace ControleFinanceiroDoLar.Server.Application;

public class CategoryService(ApplicationDbContext db) : ICategoryService
{
    private readonly ApplicationDbContext _db = db;

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest req, CancellationToken ct)
    {
        if (req is null) throw new ArgumentNullException(nameof(req));

        if (req.Description is null) throw new ArgumentException("Descrição é necessária.");

        var description = req.Description.Trim();
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Descrição não pode ser vazia.");

        req.Description = description; // com Trim()

        var newCategory = new Category
        {
            Description = req.Description,
            Purpose = req.Purpose
        };

        _db.Categories.Add(newCategory); // nao traz beneficio o assincrono, nao faz I/O com banco, só trackeia
        await _db.SaveChangesAsync(ct);

        return new CategoryDto
        {
            id = newCategory.Id,
            description = newCategory.Description,
            purpose = newCategory.Purpose
        };
    }

    public async Task<IReadOnlyList<CategoryDto>> ListAsync(string? description, CategoryPurpose? purpose, CancellationToken ct = default)
    {
        var query = _db.Categories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(description))
            query = query.Where(x => x.Description.ToLower().Contains(description.ToLower()));

        if (purpose.HasValue)
            query = query.Where(x => x.Purpose == purpose.Value);

        return await query
            .OrderBy(x => x.Description)
            .Select(x => new CategoryDto
            {
                id = x.Id,
                description = x.Description,
                purpose = x.Purpose
            })
            .ToListAsync(ct);
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid categoryId, CancellationToken ct)
    {
        if (!categoryId.IsValidAndNotEmpty())
            throw new ArgumentException("ID da categoria inválido");

        return await _db.Categories.AsNoTracking()
            .Where(x => x.Id == categoryId)
            .Select(x => new CategoryDto { id = x.Id, description = x.Description, purpose = x.Purpose })
            .SingleOrDefaultAsync(ct);
    }

    public async Task<bool> DeleteAsync(Guid categoryId, CancellationToken ct)
    {
        var affected = await _db.Categories
            .Where(x => x.Id == categoryId)
            .ExecuteDeleteAsync(ct);

        return affected > 0;
    }
}