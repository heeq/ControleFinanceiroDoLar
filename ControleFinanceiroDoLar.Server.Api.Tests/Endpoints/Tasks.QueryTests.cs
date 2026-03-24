using ControleFinanceiroDoLar.Server.Controllers;
using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;
using ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;
using ControleFinanceiroDoLar.Server.Models;
using ControleFinanceiroDoLar.Server.Models.DTOs;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Endpoints;


//ao chamar API, sera que ele ta usando o parâmetro que to passando e trazendo
//resultado baseado nisso

////Sem date → assume “hoje” (se isso for regra mesmo)

//date com formatos aceitos:

//dd-MM-yyyy
//yyyy-MM-dd

//    POST /api/tasks
//201 + Location
//Body desserializa no DTO que você decidiu como contrato(ideal: padronizar)
//Title:

//"  abc  " → retorna/persiste "abc" (trim)
//"" ou whitespace → 400


//200 chars → 400




//TaskDate:

//null → assume hoje
//formatos válidos(os 2)
//inválido → 400


//Persistência: depois do POST, GET { id }
//encontra.




public class TasksQueryTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
     private readonly CustomWebApplicationFactory _factory = factory;

    [Fact]
    public async Task TasksQueryTests_Create_NoDateUsesToday_UserDailyTaskResponse()
    {
        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var payload = new CreateUserTaskRequest
        {
            Title = $"Task-{Guid.NewGuid():N}"
        };

        var result = await clientA.PostAsJsonAsync("/api/Tasks", payload);
        Assert.Equal(HttpStatusCode.Created, result.StatusCode);

        var content = await result.Content.ReadFromJsonAsync<UserTaskResponse>(TestJson.Default);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now).ToString("dd-MM-yyyy"), 
            content.TaskDate.ToString("dd-MM-yyyy"));
    }


    [Fact]
    public async Task TasksQueryTests_Get_NoDateUsesToday_ReturnsOnlyTodayTasks()
    {
        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now).ToString("dd-MM-yyyy");
        var yesterday = DateOnly.FromDateTime(now.AddDays(-1)).ToString("dd-MM-yyyy");

        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);

        var titleToday = "TodayTask_" + Guid.NewGuid().ToString();
        var titleYesterday = "YesterdayTask_" + Guid.NewGuid().ToString();

        await TasksApiSeed.CreateTaskAsync(clientA, title: titleToday, taskDate: today);
        await TasksApiSeed.CreateTaskAsync(clientA, title: titleYesterday, taskDate: yesterday);

        var response = await clientA.GetAsync("/api/Tasks");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var tasks = await response.Content.ReadFromJsonAsync<List<UserDailyTaskDto>>(TestJson.Default);
        Assert.NotNull(tasks);
        //tasks = tasks!; // para tirar warning de possível null, mas como tem assert.notnull, não tem como ser null mesmo

        Assert.Contains(tasks, t => t.title == titleToday);
        Assert.DoesNotContain(tasks, t => t.title == titleYesterday);
    }

    [Fact]
    public async Task TasksQueryTests_Get_AllDatesTrue_ReturnsOnlyCurrentUserTasks()
    {
        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now).ToString("dd-MM-yyyy");
        var yesterday = DateOnly.FromDateTime(now.AddDays(-1)).ToString("dd-MM-yyyy");

        using var clientA = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserA);
        using var clientB = TestClientFactory.CreateAuthenticated(_factory, TestUsers.UserB);

        var titleA1 = "TaskA1_" + Guid.NewGuid().ToString();
        var titleA2 = "TaskA2_" + Guid.NewGuid().ToString();
        var titleB1 = "TaskB1_" + Guid.NewGuid().ToString();
        var titleB2 = "TaskB2_" + Guid.NewGuid().ToString();

        await TasksApiSeed.CreateTaskAsync(clientA, title: titleA1, taskDate: today);
        await TasksApiSeed.CreateTaskAsync(clientA, title: titleA2, taskDate: yesterday);
        await TasksApiSeed.CreateTaskAsync(clientB, title: titleB1, taskDate: today);
        await TasksApiSeed.CreateTaskAsync(clientB, title: titleB2, taskDate: yesterday);

        var response = await clientA.GetAsync("/api/Tasks?allDates=true");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var tasks = await response.Content.ReadFromJsonAsync<List<UserDailyTaskDto>>(TestJson.Default);
        Assert.NotNull(tasks);

        Assert.Contains(tasks, t => t.title == titleA1);
        Assert.Contains(tasks, t => t.title == titleA2);
        Assert.DoesNotContain(tasks, t => t.title == titleB1);
        Assert.DoesNotContain(tasks, t => t.title == titleB2);
    }
}
