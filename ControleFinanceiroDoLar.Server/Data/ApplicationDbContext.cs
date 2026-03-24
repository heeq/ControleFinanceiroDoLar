using Microsoft.EntityFrameworkCore;
using ControleFinanceiroDoLar.Server.Models;

namespace ControleFinanceiroDoLar.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }


        public DbSet<People> Individual => Set<People>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Transaction> Transactions => Set<Transaction>();

        //public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>(); // tentar implementar se der tempo

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<Transaction>()
                .HasOne<People>()
                .WithMany()
                .HasForeignKey(t => t.PeopleId)
                .OnDelete(DeleteBehavior.Cascade); // Deleta as transações associadas quando uma pessoa é deletada

            modelBuilder.Entity<Transaction>()
                .HasOne<Category>()
                .WithMany()
                .HasForeignKey(t => t.CategoryId);

            //modelBuilder.Entity<IdempotencyRecord>()
            //    .HasIndex(r => new { r.UserId, r.Endpoint, r.Key })
            //    .IsUnique();

            //modelBuilder.Entity<IdempotencyRecord>()
            //    .Property(r => r.RequestHash)
            //    .HasMaxLength(64); // sha256 em hex
        }

    }
}