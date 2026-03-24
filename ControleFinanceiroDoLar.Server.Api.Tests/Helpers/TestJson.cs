using System.Text.Json;
using System.Text.Json.Serialization;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Helpers;

public static class TestJson
{
    public static readonly JsonSerializerOptions Default = Create();

    private static JsonSerializerOptions Create()
    {
        var o = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        o.Converters.Add(new JsonStringEnumConverter());
        return o;
    }
}