using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;

public static class TestClientFactory
{
    public static HttpClient CreateAnonymous(CustomWebApplicationFactory factory) => factory.CreateClient();

    public static HttpClient CreateAuthenticated(CustomWebApplicationFactory factory, Guid userId)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Test", userId.ToString());
        return client;
    }
}