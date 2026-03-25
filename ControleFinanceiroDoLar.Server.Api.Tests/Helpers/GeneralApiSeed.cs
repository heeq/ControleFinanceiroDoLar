using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using System.Net.Http.Json;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;

public static class GeneralApiSeed
{
    //Objetivo: criar uma pessoa (passa pelo controller) e devolve o id.
    public static async Task<Guid> CreatePeopleAsync(HttpClient client, string name, int age)
    {
        var req = new CreatePeopleRequest { Name = name, Age = age };
        var resp = await client.PostAsJsonAsync("/api/people", req);
        resp.EnsureSuccessStatusCode();

        var body = await resp.Content.ReadFromJsonAsync<PeopleDto>(TestJson.Default);
        return body!.id;
    }


    public static async Task<Guid> CreateCategoryAsync(HttpClient client, string description, CategoryPurpose purpose)
    {
        var req = new CreateCategoryRequest { Description = description, Purpose = purpose };
        var resp = await client.PostAsJsonAsync("/api/category", req);
        resp.EnsureSuccessStatusCode();

        var body = await resp.Content.ReadFromJsonAsync<CategoryDto>(TestJson.Default);
        return body!.id;
    }

    public static async Task<Guid> CreateTransactionAsync(HttpClient client, decimal amount, string description, Guid categoryId, Guid peopleId, TransactionType type)
    {
        var req = new CreateTransactionRequest
        {
            Amount = amount,
            Description = description,
            CategoryId = categoryId.ToString(),
            PeopleId = peopleId.ToString(),
            Type = type
        };

        var resp = await client.PostAsJsonAsync("/api/transaction", req);
        resp.EnsureSuccessStatusCode();

        var body = await resp.Content.ReadFromJsonAsync<TransactionDto>(TestJson.Default);
        return body!.id;
    }
}