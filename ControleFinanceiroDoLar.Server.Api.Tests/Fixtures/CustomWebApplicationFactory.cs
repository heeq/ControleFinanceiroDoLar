using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ControleFinanceiroDoLar.Server.Data;
using SQLitePCL;

namespace ControleFinanceiroDoLar.Server.IntegrationTests.Fixtures;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private SqliteConnection? _connection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing"); // ?

        builder.ConfigureServices(services =>
        {
            Batteries_V2.Init(); // antes de qualquer uso do SQLite

            // remove o DbContext original (registrado em Program.cs)
            var descriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

            if (descriptor is not null)
                services.Remove(descriptor);

            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            // registra novo dbcontext (para nao utilizar banco original - que por sinal tb é sqlite aqui)
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(_connection));

            //cria o schema do banco
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            db.Database.EnsureCreated();
            // db.Database.Migrate();
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