using Microsoft.AspNetCore.Mvc;
using ControleFinanceiroDoLar.Server.Application;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Data;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Utils;

namespace ControleFinanceiroDoLar.Server.Controllers;


[Route("api/[controller]")]
[ApiController]
public class PeopleController(IPeopleService peopleService, ApplicationDbContext dbContext) : ControllerBase
{
    private readonly IPeopleService _peopleService = peopleService;
    private readonly ApplicationDbContext _db = dbContext;

    // POST /api/people body: { "name": "Henrique", "age": "35" }
    [HttpPost]
    public async Task<ActionResult<UserDailyTaskDto>> Create([FromBody] CreatePeopleRequest req, CancellationToken ct)
    {
        try
        {
            var created = await _peopleService.CreateAsync(req, ct);
            return CreatedAtAction(nameof(Create), new { id = created.id }, created); // Adiciona o header Location do recurso criado
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }


    // GET /api/people?name=Henrique&age=35
    [HttpGet("listAll")]
    public async Task<ActionResult<IReadOnlyList<PeopleDto>>> ListPeople([FromQuery] string? name, [FromQuery] int? age, CancellationToken ct = default)
    {

        if (age.HasValue && age.Value <= 0)
        {
            ModelState.AddModelError(nameof(age), "A idade deve ser um número positivo.");
            return ValidationProblem(ModelState);
        }

        try
        {
            var peopleList = await _peopleService.ListAsync(name, age, ct);

            return Ok(peopleList);
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
            ModelState.AddModelError(nameof(id), "O ID do indivíduo está inválido");
            return ValidationProblem(ModelState);
        }

        try
        {
            var task = await _peopleService.GetByIdAsync(id, ct);
            if (task == null)
                return NotFound("Indivíduo não encontrado."); // não vai cair aqui, o serviço lança exception, não mostra não haver o recurso

            return Ok(task);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }



    // DELETE /api/people/{id} .  Body: { "name": "Henrique", "age": "35" }
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<PeopleDto>> Update(Guid id, [FromBody] UpdatePeopleRequest req, CancellationToken ct)
    {
        if (!id.IsValidAndNotEmpty())
        {
            ModelState.AddModelError(nameof(id), "O ID do indivíduo está inválido");
            return ValidationProblem(ModelState);
        }

        try
        {
            var updated = await _peopleService.UpdateAsync(id, req, ct);
            if (updated == null)
                return NotFound("Indivíduo não encontrado.");

            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }



    // DELETE /api/people/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (!id.IsValidAndNotEmpty())
        {
            ModelState.AddModelError(nameof(id), "O ID do indivíduo está inválido");
            return ValidationProblem(ModelState);
        }
        try
        {
            var deleted = await _peopleService.DeleteAsync(id, ct);

            if (!deleted)
                return NotFound("Indivíduo não encontrado.");
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }

        return NoContent();
    }
}