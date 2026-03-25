using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ControleFinanceiroDoLar.Server.Application;
using ControleFinanceiroDoLar.Server.Data;
using System.Text.Json.Serialization;
using ControleFinanceiroDoLar.Server.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter())); ;

builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPeopleService, PeopleService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "APIs do Controle Financeiro do Lar",
        Version = "v1",
        Description = "Desafio Técnico"
    });
});


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("https://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "APIs do Controle Financeiro do Lar v1");
    });
}

app.UseRouting();
app.UseCors();

//middleware personalizado que força o esquema para HTTPS
//app.Use((context, next) => {
//    context.Request.Scheme = "https";
//    return next();
//});

app.UseMiddleware<ExceptionMiddleware>(); //tratamento de exceções

app.MapGet("/api/test", () => {
    Console.WriteLine("Rota /api/test alcançada!");
    return "Teste OK";
}); // MINIMAL APIs

app.MapControllers();

app.MapFallbackToFile("/index.html"); // se nenhuma rota corresponder (nem API, nem arquivo estático) serve index.html (entrypoint SPA)

app.Run();

public partial class Program { } // necessario para testes de integracao/unitarios