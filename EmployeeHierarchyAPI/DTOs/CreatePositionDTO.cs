using System.ComponentModel.DataAnnotations;

namespace EmployeeHierarchyAPI.DTOs
{
    public class CreatePositionDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public Guid? ParentId { get; set; }
    }
}