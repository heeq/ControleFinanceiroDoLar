using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;
using ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Endpoints;

public class TransactionsHappyPathTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory = factory;

    [Fact]
    public async Task TransactionsHappyPathTests_CreateExpense_ReturnsCreated_TransactionDto()
    {
        using var clientA = TestClientFactory.CreateAnonymous(_factory);

        var rnd = new Random();
        int age = rnd.Next(18, 80);
        var peopleId = await GeneralApiSeed.CreatePeopleAsync(clientA, $"Person-{Guid.NewGuid():N}", age);

        var categoryId = await GeneralApiSeed.CreateCategoryAsync(clientA, $"Category-{Guid.NewGuid():N}", CategoryPurpose.Expense);

        var payload = new CreateTransactionRequest
        {
            Description = $"Transaction-{Guid.NewGuid():N}",
            Type = TransactionType.Expense,
            Amount = 123.45M,
            CategoryId = categoryId.ToString(),
            PeopleId = peopleId.ToString()
        };

        var result = await clientA.PostAsJsonAsync("/api/transaction", payload);

        Assert.Equal(HttpStatusCode.Created, result.StatusCode);
        Assert.Equal("application/json", result.Content.Headers.ContentType!.MediaType);
        Assert.NotNull(result.Headers.Location); // vem no location qual o id do recurso criado

        var content = await result.Content.ReadFromJsonAsync<TransactionDto>(TestJson.Default);
        Assert.NotNull(content);
        Assert.NotEqual(Guid.Empty, content.id);
        Assert.Equal(payload.Description, content.description);
        Assert.Equal(payload.Type, content.type);
        Assert.Equal(payload.Amount, content.amount);
        Assert.Equal(payload.CategoryId, content.categoryId.ToString());
        Assert.Equal(payload.PeopleId, content.peopleId.ToString());
    }
    [Fact]
    public async Task TransactionsHappyPathTests_DeletePeople_ShouldDeleteAllTransactions()
    {
        using var client = TestClientFactory.CreateAnonymous(_factory);

        var rnd = new Random();
        int age = rnd.Next(18, 80);

        var peopleId = await GeneralApiSeed.CreatePeopleAsync(client, $"Person-{Guid.NewGuid():N}", age);
        var categoryId = await GeneralApiSeed.CreateCategoryAsync(client, $"Category-{Guid.NewGuid():N}", CategoryPurpose.Expense);

        decimal amount = rnd.Next(1, 500);

        var transactionId_A = await GeneralApiSeed.CreateTransactionAsync(
            client,
            amount,
            "Descricao A",
            categoryId,
            peopleId,
            TransactionType.Expense
        );

        age = rnd.Next(18, 80);
        var transactionId_B = await GeneralApiSeed.CreateTransactionAsync(
            client,
            amount,
            "Descricao B",
            categoryId,
            peopleId,
            TransactionType.Expense
        );

        var result = await client.DeleteAsync($"/api/people/{peopleId}");
        Assert.Equal(HttpStatusCode.NoContent, result.StatusCode);

        var transactionGet_A = await client.GetAsync($"/api/transaction/{transactionId_A}");
        var transactionGet_B = await client.GetAsync($"/api/transaction/{transactionId_B}");
        
        Assert.Equal(HttpStatusCode.NotFound, transactionGet_A.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, transactionGet_B.StatusCode);
    }
}