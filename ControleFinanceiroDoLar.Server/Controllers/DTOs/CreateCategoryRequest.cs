using ControleFinanceiroDoLar.Server.Models;

namespace ControleFinanceiroDoLar.Server.Controllers.DTOs;

public class CreateCategoryRequest
{
    public string Description { get; set; }

    public CategoryPurpose Purpose { get; set; }
}