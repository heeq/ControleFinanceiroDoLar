using ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;

public static class TestClientFactory
{
    // seria necessario para criar clientes autenticados no futuro; vou manter assim
    public static HttpClient CreateAnonymous(CustomWebApplicationFactory factory) => factory.CreateClient();
}