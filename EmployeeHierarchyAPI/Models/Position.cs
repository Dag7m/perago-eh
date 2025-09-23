using System.ComponentModel.DataAnnotations;

namespace EmployeeHierarchyAPI.Models
{
    public class Position
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public Guid? ParentId { get; set; }
        
        // Navigation properties
        public Position? Parent { get; set; }
        public ICollection<Position> Children { get; set; } = new List<Position>();
    }
}