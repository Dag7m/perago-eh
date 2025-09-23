using EmployeeHierarchyAPI.DTOs;

namespace EmployeeHierarchyAPI.Services
{
    public interface IPositionService
    {
        Task<PositionDto> CreatePositionAsync(CreatePositionDto createDto);
        Task<PositionDto?> GetPositionByIdAsync(Guid id);
        Task<List<PositionDto>> GetAllPositionsAsync();
        Task<List<PositionDto>> GetPositionHierarchyAsync();
        Task<List<PositionDto>> GetChildrenAsync(Guid parentId);
        Task<PositionDto?> UpdatePositionAsync(Guid id, CreatePositionDto updateDto);
        Task<bool> DeletePositionAsync(Guid id);
        Task<bool> DeletePositionCascadeAsync(Guid id);
        Task<bool> DeletePositionWithReassignmentAsync(Guid id);
    }
}
