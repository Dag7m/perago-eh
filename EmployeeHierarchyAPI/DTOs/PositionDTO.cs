namespace EmployeeHierarchyAPI.DTOs
{
    public class PositionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public string? ParentName { get; set; }
        public List<PositionDto> Children { get; set; } = new List<PositionDto>();
    }
}