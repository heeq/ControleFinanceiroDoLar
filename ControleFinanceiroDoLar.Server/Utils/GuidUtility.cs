using System.Security.Claims;

namespace ControleFinanceiroDoLar.Server.Utils;

public static class GuidUtility
{
    public static bool TryGetUserId(this ClaimsPrincipal user, out Guid userId)
        => Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId); // metodo de extensao

    public static bool IsValidAndNotEmpty(this Guid guid) // extensão da classe guid
    {
        var valid = true;
        if (Guid.TryParse(guid.ToString(), out var x) == false) valid = false;

        if (guid == Guid.Empty) valid = false;

        return valid;
    }
}