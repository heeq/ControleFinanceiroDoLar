using ControleFinanceiroDoLar.Server.Models;

namespace ControleFinanceiroDoLar.Server.Controllers.DTOs;

public class UpdateCategoryRequest
{
    public string Description { get; set; }

    public CategoryPurpose Purpose { get; set; }
}