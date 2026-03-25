using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;
using ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Endpoints;

public class TransactionsValidationTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory = factory;

    [Fact]
    public async Task TransactionsValidationTests_CreateIncome_NegativeAmount_ShouldReturnBadRequest()
    {
        using var clientA = TestClientFactory.CreateAnonymous(_factory);

        var rnd = new Random();
        int age = rnd.Next(18, 80);
        var peopleId = await GeneralApiSeed.CreatePeopleAsync(clientA, $"Person-{Guid.NewGuid():N}", age);

        var categoryId = await GeneralApiSeed.CreateCategoryAsync(clientA, $"Category-{Guid.NewGuid():N}", CategoryPurpose.Expense);

        var payload = new CreateTransactionRequest
        {
            Description = $"Transaction-{Guid.NewGuid():N}",
            Type = TransactionType.Income,
            Amount = -123.45M, // negativo
            CategoryId = categoryId.ToString(),
            PeopleId = peopleId.ToString()
        };

        var result = await clientA.PostAsJsonAsync("/api/transaction", payload);

        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task TransactionsValidationTests_GetById_NotExisting_ShouldReturnNotFound()
    {
        using var clientA = TestClientFactory.CreateAnonymous(_factory);
        var result = await clientA.GetAsync($"/api/transaction/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }
}