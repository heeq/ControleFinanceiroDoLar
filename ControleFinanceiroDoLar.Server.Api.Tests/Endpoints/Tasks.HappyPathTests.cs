using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;
using ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Endpoints;

// Fluxos principais “funciona”: Create → GetById → Update → Delete(com asserções de contrato + persistência)
//Endpoints/Tasks/Tasks.CrudHappyPathTests.cs
//create → get → patch → delete(fluxos felizes + persistência)

public class TasksHappyPathTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory = factory;


    [Fact]
    public async Task TasksHappyPathTests_Create_ReturnsCreated_UserDailyTaskResponse()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var payload = new CreateUserTaskRequest
        {
            Title = $"Task-{Guid.NewGuid():N}",
            TaskDate = DateOnly.FromDateTime(DateTime.Now).ToString("dd-MM-yyyy")
        };

        var result = await clientA.PostAsJsonAsync("/api/Tasks", payload);
        Assert.Equal(HttpStatusCode.Created, result.StatusCode);
        Assert.Equal("application/json", result.Content.Headers.ContentType!.MediaType);
        Assert.NotNull(result.Headers.Location); // vem no location qual o id do recurso criado

        var content = await result.Content.ReadFromJsonAsync<UserTaskResponse>(TestJson.Default);
        Assert.NotNull(content);
        Assert.NotEqual(Guid.Empty, content.Id);
        Assert.Contains($"/api/Tasks/{content.Id}", result.Headers.Location!.ToString(), StringComparison.OrdinalIgnoreCase);
        Assert.Equal(payload.TaskDate, content.TaskDate.ToString("dd-MM-yyyy"));
        Assert.Equal(payload.Title, content.Title);
    }





    [Fact]
    public async Task TasksHappyPathTests_GetById_ReturnsOK_UserDailyTaskDto()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        // Arrange
        var title = $"Task-{Guid.NewGuid():N}";
        var date = DateOnly.FromDateTime(DateTime.Now).ToString("dd-MM-yyyy");
        var taskId = await TasksApiSeed.CreateTaskAsync(clientA,
            title: title,
            taskDate: date);

        // Assert
        var result = await clientA.GetAsync($"/api/Tasks/{taskId}");
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);

        var content = await result.Content.ReadFromJsonAsync<UserDailyTaskDto>(TestJson.Default);
        Assert.NotNull(content);
        Assert.Equal(title, content.title);
        Assert.Equal(date, content.taskDate?.ToString("dd-MM-yyyy"));
    }



    //Se o seu CustomWebApplicationFactory usa um banco compartilhado(mesmo container/mesma base)
    //e o xUnit estiver rodando testes em paralelo, você pode ter intermitência.
    [Fact]
    public async Task TasksHappyPathTests_Get_AllTasksTrue_ReturnOK_ListUserDailyTaskDto()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var baseDate = DateOnly.FromDateTime(DateTime.UtcNow);

        // Arrange: cria 10 tasks com title/date únicos e guarda as chaves para validar depois
        var createdKeys = new HashSet<string>(StringComparer.Ordinal);
        for (int i = 0; i < 10; i++)
        {
            var title = $"Task-{Guid.NewGuid():N}";
            var taskDate = baseDate.AddDays(i).ToString("dd-MM-yyyy");

            _ = await TasksApiSeed.CreateTaskAsync(clientA, title: title, taskDate: taskDate);

            // chave "title|date" para não depender de Id no DTO da listagem
            createdKeys.Add($"{title}|{taskDate}");
        }

        var result = await clientA.GetAsync($"/api/Tasks/?allDates=true");
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        Assert.Equal("application/json", result.Content.Headers.ContentType!.MediaType);


        var content = await result.Content.ReadFromJsonAsync<List<UserDailyTaskDto>>(TestJson.Default);
        Assert.NotNull(content);

        // Monta o set retornado, sem assumir ordenação
        var returnedKeys = new HashSet<string>(StringComparer.Ordinal);
        foreach (var dto in content)
        {
            var dtoDate = dto.taskDate?.ToString("dd-MM-yyyy");
            
            Assert.False(string.IsNullOrWhiteSpace(dto.title));
            Assert.False(string.IsNullOrWhiteSpace(dtoDate)); // ta nullable la mas nao deveria

            returnedKeys.Add($"{dto.title}|{dtoDate}");
        }

        foreach(var key in createdKeys)
            Assert.Contains(key, returnedKeys);
    }



        [Fact]
    public async Task TasksHappyPathTests_Delete_ReturnsNoContent()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var taskId = await TasksApiSeed.CreateTaskAsync(clientA,
            title: $"Task-{Guid.NewGuid():N}",
            taskDate: DateOnly.FromDateTime(DateTime.Now).ToString("dd-MM-yyyy"));

        var result = await clientA.DeleteAsync($"/api/Tasks/{taskId}");
        Assert.Equal(HttpStatusCode.NoContent, result.StatusCode);

        //var content = await result.Content.ReadAsStringAsync();
        //Assert.Empty(content);
    }




    //        validação de campos opcionais
    //garantia de imutabilidade de Id
    //regras de data/ título
    //concorrência(ETag / version) se você tiver isso

    [Fact]
    public async Task TasksHappyPathTests_Patch_ReturnsOK_UserDailyTaskDto()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        // Arrange: cria task
        var originalTitle = $"Task-{Guid.NewGuid():N}";
        var originalDate = DateOnly.FromDateTime(DateTime.UtcNow).ToString("dd-MM-yyyy");
        //var originalStatus = UserDailyTaskStatus.Completed;

        var taskId = await TasksApiSeed.CreateTaskAsync(
            clientA,
            title: originalTitle,
            taskDate: originalDate);

        // PATCH: alterando title e status, mas mantendo a data original para validar imutabilidade
        var newTitle = $"Task-{Guid.NewGuid():N}";
        var newStatus = UserDailyTaskStatus.Aborted;

        // Placeholder do request (ajuste para o seu contrato real se for diferente)
        var patchPayLoad = new UpdateUserTaskRequest
        {
            Status = newStatus, // não quero alterar o status
            Title = newTitle,
        };

        // Act
        var patchResult = await clientA.PatchAsJsonAsync($"/api/Tasks/{taskId}", patchPayLoad);

        // Assert (resposta do PATCH)
        Assert.Equal(HttpStatusCode.OK, patchResult.StatusCode);
        Assert.Equal("application/json", patchResult.Content.Headers.ContentType!.MediaType);

        var content = await patchResult.Content.ReadFromJsonAsync<UserDailyTaskDto>(TestJson.Default);
        Assert.NotNull(content);

        Assert.Equal(newTitle, content.title);
        Assert.Equal(newStatus, content.status);
        Assert.Equal(originalDate, content.taskDate?.ToString("dd-MM-yyyy"));
        

        // Assert (persistência): GET depois do PATCH
        var getResult = await clientA.GetAsync($"/api/Tasks/{taskId}");
        Assert.Equal(HttpStatusCode.OK, getResult.StatusCode);

        var reloadedContent = await getResult.Content.ReadFromJsonAsync<UserDailyTaskDto>(TestJson.Default);
        Assert.NotNull(reloadedContent);

        Assert.Equal(newTitle, reloadedContent.title);
        Assert.Equal(newTitle, reloadedContent.title);
        Assert.Equal(newStatus, reloadedContent.status);
        Assert.Equal(originalDate, reloadedContent.taskDate?.ToString("dd-MM-yyyy"));
    }
}