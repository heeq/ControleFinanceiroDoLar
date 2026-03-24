using System.Security.Cryptography;
using System.Text;

namespace ControleFinanceiroDoLar.Server.Utils;

public static class HashUtility
{
    public static string Sha256Hex(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}