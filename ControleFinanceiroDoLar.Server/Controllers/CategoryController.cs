using Microsoft.AspNetCore.Mvc;
using ControleFinanceiroDoLar.Server.Application;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Data;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Utils;
using ControleFinanceiroDoLar.Server.Models;

namespace ControleFinanceiroDoLar.Server.Controllers;


[Route("api/[controller]")]
[ApiController]
public class CategoryController(ICategoryService categoryService, ApplicationDbContext dbContext) : ControllerBase
{
    private readonly ICategoryService _categoryService = categoryService;
    private readonly ApplicationDbContext _db = dbContext;

    // POST /api/category body: { "description": "Alimentação", "purpose": "Expense" }
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest req, CancellationToken ct)
    {
        try
        {
            var created = await _categoryService.CreateAsync(req, ct);
            return CreatedAtAction(nameof(Create), new { id = created.id }, created); // Adiciona o header Location do recurso criado
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }


    // GET /api/category?description=Alimentação&purpose=Expense
    [HttpGet("listAll")] // ideal seria no body
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> ListCategories([FromQuery] string? description, [FromQuery] CategoryPurpose? purpose, CancellationToken ct = default)
    {
        try
        {
            var categoryList = await _categoryService.ListAsync(description, purpose, ct);

            return Ok(categoryList);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }


    // GET /api/people/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PeopleDto>> GetById(Guid id, CancellationToken ct)
    {
        if (!id.IsValidAndNotEmpty())
        {
            ModelState.AddModelError(nameof(id), "O ID da categoria está inválido");
            return ValidationProblem(ModelState);
        }

        try
        {
            var task = await _categoryService.GetByIdAsync(id, ct);
            if (task == null)
                return NotFound("Categoria não encontrada."); // não vai cair aqui, o serviço lança exception, não mostra não haver o recurso

            return Ok(task);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }


    //// DELETE /api/category/{id}
    //[HttpDelete("{id:guid}")]
    //public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    //{
    //    if (!id.IsValidAndNotEmpty())
    //    {
    //        ModelState.AddModelError(nameof(id), "O ID da categoria está inválido");
    //        return ValidationProblem(ModelState);
    //    }
    //    try
    //    {
    //        var deleted = await _categoryService.DeleteAsync(id, ct);

    //        if (!deleted)
    //            return NotFound("Categoria não encontrada.");
    //    }
    //    catch (ArgumentException ex)
    //    {
    //        ModelState.AddModelError("", ex.Message);
    //        return ValidationProblem(ModelState);
    //    }

    //    return NoContent();
    //}
}