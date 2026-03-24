using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;
using ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;
using System.Net;
using System.Net.Http.Json;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Endpoints;

//Title vazio, >200, Patch sem campos, datas inválidas etc. (todos os 400)
//required/maxlength/date inválida/patch vazio etc.

public class TasksValidationTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory = factory;


    [Fact]
    public async Task TasksValidationTests_Patch_InvalidStatus_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var taskId = await TasksApiSeed.CreateTaskAsync(clientA, $"Task-{Guid.NewGuid():N}");

        var payload = new UpdateUserTaskRequest
        {
            Title = "randomString",
            Status = (Models.UserDailyTaskStatus)999
        };

        var result = await clientA.PatchAsJsonAsync($"/api/Tasks/{taskId}", payload);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }

    // MAIS IMPORTANTE POIS NÃO DEPENDE DE DATA ANNOTATIONS
    [Fact]
    public async Task TasksValidationTests_Patch_EmptyPayload_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var taskId = await TasksApiSeed.CreateTaskAsync(clientA, $"Task-{Guid.NewGuid():N}");

        var payload = new UpdateUserTaskRequest
        {
        };

        var result = await clientA.PatchAsJsonAsync($"/api/Tasks/{taskId}", payload);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task TasksValidationTests_Patch_MoreThan200Chars_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var taskId = await TasksApiSeed.CreateTaskAsync(clientA, $"Task-{Guid.NewGuid():N}");

        string randomString = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 201)
            .Select(s => s[Random.Shared.Next(s.Length)]).ToArray());

        var payload = new UpdateUserTaskRequest
        {
            Title = randomString,
            Status = Models.UserDailyTaskStatus.Aborted
        };

        var result = await clientA.PatchAsJsonAsync($"/api/Tasks/{taskId}", payload);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }


    [Fact]
    public async Task TasksValidationTests_Create_NullTitle_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var payload = new CreateUserTaskRequest
        {
            TaskDate = DateOnly.FromDateTime(DateTime.Now).ToString("dd-MM-yyyy")
        };

        var result = await clientA.PostAsJsonAsync("/api/Tasks", payload);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task TasksValidationTests_Create_EmptyTitle_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var payload = new CreateUserTaskRequest
        {
            Title = "",
            TaskDate = DateOnly.FromDateTime(DateTime.Now).ToString("dd-MM-yyyy")
        };

        var result = await clientA.PostAsJsonAsync("/api/Tasks", payload);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task TasksValidationTests_Create_MoreThan200Chars_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        string randomString = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 201)
            .Select(s => s[Random.Shared.Next(s.Length)]).ToArray());

        var payload = new CreateUserTaskRequest
        {
            Title = randomString,
            TaskDate = DateOnly.FromDateTime(DateTime.Now).ToString("dd-MM-yyyy")
        };

        var result = await clientA.PostAsJsonAsync("/api/Tasks", payload);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }


    [Fact]
    public async Task TasksValidationTests_Create_InvalidDate_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var payload = new CreateUserTaskRequest
        {
            Title = "randomString",
            TaskDate = DateOnly.FromDateTime(DateTime.Now).ToString("dd/MM/yyyy")
        };

        var result = await clientA.PostAsJsonAsync("/api/Tasks", payload);
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
    }


    [Fact]
    public async Task TasksValidationTests_GetById_NonExistentId_ReturnsNotFound()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var nonExistentId = Guid.NewGuid();

        var result = await clientA.GetAsync($"/api/Tasks/{nonExistentId}");
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }

    [Fact]
    public async Task TasksValidationTests_GetById_InvalidId_ReturnsNotFound()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var result = await clientA.GetAsync($"/api/Tasks/abc");
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }



    [Fact]
    public async Task TasksValidationTests_Get_InvalidDate_ReturnsBadRequest()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var result1 = await clientA.GetAsync($"/api/Tasks?date=16/02/2026");
        var result2 = await clientA.GetAsync($"/api/Tasks?date=2026/02/16");
        var result3 = await clientA.GetAsync($"/api/Tasks?date=2026-02-30"); // data impossivel
        Assert.Equal(HttpStatusCode.BadRequest, result1.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, result2.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, result3.StatusCode);
    }


    [Fact]
    public async Task TasksValidationTests_Delete_NonExistentId_ReturnsNotFound()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var nonExistentId = Guid.NewGuid();

        var result = await clientA.DeleteAsync($"/api/Tasks/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }

    [Fact]
    public async Task TasksValidationTests_Delete_InvalidId_ReturnsNotFound()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var nonExistentId = Guid.NewGuid();

        var result = await clientA.DeleteAsync($"/api/Tasks/abc");
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }
}
