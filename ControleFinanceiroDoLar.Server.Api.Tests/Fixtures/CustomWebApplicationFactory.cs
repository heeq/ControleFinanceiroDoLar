using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ControleFinanceiroDoLar.Server.Application;
using ControleFinanceiroDoLar.Server.Data;
using SQLitePCL;
using System.ComponentModel;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{

    private SqliteConnection? _connection;


    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing"); // ?

        builder.ConfigureServices(services =>
        {
            // Remove os serviços de autenticação/autorização existentes
            //var authServiceDescriptors = services
            //    .Where(s => s.ServiceType.Namespace?.StartsWith("Microsoft.AspNetCore.Authentication") ?? false)
            //    .ToList();

            //foreach (var descriptor in authServiceDescriptors)
            //{
            //    services.Remove(descriptor);
            //}


            //Infra: banco e Hosted Service(e-mail diário) — isso pode bagunçar seus testes

            Batteries_V2.Init(); // <- importante: antes de qualquer uso do SQLite

            // 1) Remove o DbContext original (o que sua API registra em Program.cs)
            var descriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

            if (descriptor is not null)
                services.Remove(descriptor);

            // (opcional) se você registrou o próprio AppDbContext como service:
            // var ctxDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(AppDbContext));
            // if (ctxDescriptor is not null) services.Remove(ctxDescriptor);

            // 2) Cria uma conexão SQLite in-memory e MANTÉM ABERTA
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            // 3) Registra o DbContext apontando para a conexão aberta
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(_connection));

            //services.AddScoped<ITasksService, TasksService>();
            //services.AddScoped<IAuthService, AuthService>();

            // 4) Cria o schema do banco
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            db.Database.EnsureCreated();
            // Se você usa migrations e preferir:
            // db.Database.Migrate();


            // Adiciona o esquema de autenticação de teste
            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = "Test";
                    options.DefaultChallengeScheme = "Test";
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });
    }



    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection?.Dispose();
            _connection = null;
        }
    }
}