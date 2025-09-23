using Microsoft.EntityFrameworkCore;
using EmployeeHierarchyAPI.Models;

namespace EmployeeHierarchyAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Position> Positions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Position>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.Parent)
                      .WithMany(e => e.Children)
                      .HasForeignKey(e => e.ParentId)
                      .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete
                
                entity.HasIndex(e => e.ParentId);
            });
        }
    }
}