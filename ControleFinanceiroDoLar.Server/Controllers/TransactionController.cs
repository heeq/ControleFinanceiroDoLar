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
public class TransactionController(ITransactionService transactionService, ApplicationDbContext dbContext) : ControllerBase
{
    private readonly ITransactionService _transactionService = transactionService;
    private readonly ApplicationDbContext _db = dbContext;

    // POST /api/transaction body: { "description": "Alimentação", "purpose": "Expense" }
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionRequest req, CancellationToken ct)
    {
        try
        {
            var created = await _transactionService.CreateAsync(req, ct);
            return CreatedAtAction(nameof(Create), new { id = created.id }, created); // Adiciona o header Location do recurso criado
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }


    // GET /api/transaction?description=Alimentação&purpose=Expense
    [HttpGet("listAll")]
    public async Task<ActionResult<IReadOnlyList<TransactionDto>>> ListTransactions([FromQuery] Guid? peopleId, 
                                [FromQuery] string? description, [FromQuery] TransactionType? type, CancellationToken ct = default)
    {
        try
        {

            var transactionList = await _transactionService.ListAsync(peopleId, description, type, ct);
            return Ok(transactionList);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }


    // GET /api/transaction/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransactionDto>> GetById(Guid id, CancellationToken ct)
    {
        if (!id.IsValidAndNotEmpty())
        {
            ModelState.AddModelError(nameof(id), "O ID da transação está inválido");
            return ValidationProblem(ModelState);
        }

        try
        {
            var task = await _transactionService.GetByIdAsync(id, ct);
            if (task == null)
                return NotFound("Transação não encontrada."); // não vai cair aqui, o serviço lança exception, não mostra não haver o recurso

            return Ok(task);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError("", ex.Message);
            return ValidationProblem(ModelState);
        }
    }


    //// DELETE /api/transaction/{id}
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
    //        var deleted = await _transactionService.DeleteAsync(id, ct);

    //        if (!deleted)
    //            return NotFound("Transação não encontrada.");
    //    }
    //    catch (ArgumentException ex)
    //    {
    //        ModelState.AddModelError("", ex.Message);
    //        return ValidationProblem(ModelState);
    //    }

    //    return NoContent();
    //}
}