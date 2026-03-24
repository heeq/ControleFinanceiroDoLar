using ControleFinanceiroDoLar.Server.Controllers;
using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;
using ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using System.Net;
using System.Net.Http.Json;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Endpoints;

//Endpoints/Tasks/Tasks.SecurityIsolationTests.cs
//A cria, B tenta acessar → 404
//    UserA cria, UserB tenta GET/PATCH/DELETE → 404 (ou o que sua API definir)

public class TasksSecurityIsolationTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory = factory;

    [Fact]
    public async Task TasksSecurityIsolationTests_GetById_AnotherUserTask_ReturnNotFound()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);
        using var clientB = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserB);

        //Arrange
        var taskId = await TasksApiSeed.CreateTaskAsync(clientA, $"Task-{Guid.NewGuid():N}");

        // Assert
        var result = await clientB.GetAsync($"/api/Tasks/{taskId}");
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }


    [Fact]
    public async Task TasksSecurityIsolationTests_Delete_AnotherUserTask_ReturnNotFound()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);
        using var clientB = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserB);

        //Arrange
        var taskId = await TasksApiSeed.CreateTaskAsync(clientA, $"Task-{Guid.NewGuid():N}");

        // Assert
        var result = await clientB.DeleteAsync($"/api/Tasks/{taskId}");
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }


    [Fact]
    public async Task TasksSecurityIsolationTests_Patch_AnotherUserTask_ReturnNotFound()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);
        using var clientB = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserB);

        //Arrange
        var taskId = await TasksApiSeed.CreateTaskAsync(clientA, $"Task-{Guid.NewGuid():N}");

        var newTitle = $"Task-{Guid.NewGuid():N}";
        var newStatus = UserDailyTaskStatus.Aborted;

        // Placeholder do request (ajuste para o seu contrato real se for diferente)
        var patchPayLoad = new UpdateUserTaskRequest
        {
            Status = newStatus,
            Title = newTitle,
        };

        // Assert
        var result = await clientB.PatchAsJsonAsync($"/api/Tasks/{taskId}", patchPayLoad);
        Assert.Equal(HttpStatusCode.NotFound, result.StatusCode);
    }
}