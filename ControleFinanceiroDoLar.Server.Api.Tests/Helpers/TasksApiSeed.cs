using ControleFinanceiroDoLar.Server.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using ControleFinanceiroDoLar.Server.Controllers.DTOs;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;

public static class TasksApiSeed
{
    // evitar colocar pra apagar coisas aqui
    // serve pra Retornar dados úteis pro teste (ex: Id, DTO desserializado, response).

    //Objetivo: criar uma task “de forma real” (passa pelo controller), e te devolve o id.
    public static async Task<Guid> CreateTaskAsync(HttpClient client, string title, string? taskDate = null)
    {
        var req = new CreateUserTaskRequest { Title = title, TaskDate = taskDate };
        var resp = await client.PostAsJsonAsync("/api/tasks", req);
        resp.EnsureSuccessStatusCode();

        var body = await resp.Content.ReadFromJsonAsync<UserTaskResponse>();
        return body!.Id;
    }

    public static async Task<Guid> CreateTaskForUserAsync(HttpClient client, string title, string? taskDate = null)
    {
        var req = new CreateUserTaskRequest { Title = title, TaskDate = taskDate };
        var resp = await client.PostAsJsonAsync("/api/tasks", req);
        resp.EnsureSuccessStatusCode();

        var body = await resp.Content.ReadFromJsonAsync<UserTaskResponse>();
        return body!.Id;
    }
}