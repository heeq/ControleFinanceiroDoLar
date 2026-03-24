using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;
using ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;
using System.Net;
using System.Net.Http.Json;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Endpoints;

//Endpoints/Tasks/Tasks.AuthTests.cs
//1 teste por endpoint: anônimo → 401

public class TasksAuthTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory = factory;

    [Fact]
    public async Task TasksAuthTests_Get_ReturnsUnauthorized_WhenAnonymous()
    {
        using var clientA = TestClientFactory.CreateAnonymous(_factory);

        var resp = await clientA.GetAsync("/api/Tasks");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task TasksAuthTests_GetById_ReturnsUnauthorized_WhenAnonymous()
    {
        using var client = TestClientFactory.CreateAnonymous(_factory);
        var resp = await client.GetAsync($"/api/Tasks/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task TasksAuthTests_Post_ReturnsUnauthorized_WhenAnonymous()
    {
        using var clientA = TestClientFactory.CreateAnonymous(_factory);

        var resp = await clientA.PostAsJsonAsync("/api/Tasks", new { });
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task TasksAuthTests_Patch_ReturnsUnauthorized_WhenAnonymous()
    {
        using var client = TestClientFactory.CreateAnonymous(_factory);
        var resp = await client.PatchAsJsonAsync($"/api/Tasks/{Guid.NewGuid()}",
            new {  });
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task TasksAuthTests_Delete_ReturnsUnauthorized_WhenAnonymous()
    {
        using var client = TestClientFactory.CreateAnonymous(_factory);
        var resp = await client.DeleteAsync($"/api/Tasks/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }
}