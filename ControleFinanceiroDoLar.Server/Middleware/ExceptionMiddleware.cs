using ControleFinanceiroDoLar.Server.Errors;

namespace ControleFinanceiroDoLar.Server.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    //private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        //_logger = logger;
        //_env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            //_logger.LogError(ex, "An unhandled exception occurred.");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var response = _env.IsDevelopment()
                ? new ApiException(statusCode: context.Response.StatusCode.ToString(), message: ex.Message, details: ex.StackTrace?.ToString())
                : new ApiException(statusCode: context.Response.StatusCode.ToString(), message: ex.Message, details: "Internal Server Error");

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}