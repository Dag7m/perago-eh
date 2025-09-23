using Microsoft.EntityFrameworkCore;
using EmployeeHierarchyAPI.Data;
using EmployeeHierarchyAPI.DTOs;
using EmployeeHierarchyAPI.Models;

namespace EmployeeHierarchyAPI.Services
{
    public class PositionService : IPositionService
    {
        private readonly ApplicationDbContext _context;

        public PositionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PositionDto> CreatePositionAsync(CreatePositionDto createDto)
        {
            // Validate parent exists if parentId is provided
            if (createDto.ParentId.HasValue)
            {
                var parentExists = await _context.Positions.AnyAsync(p => p.Id == createDto.ParentId.Value);
                if (!parentExists)
                    throw new ArgumentException("Parent position not found");
            }

            var position = new Position
            {
                Name = createDto.Name,
                Description = createDto.Description,
                ParentId = createDto.ParentId
            };

            _context.Positions.Add(position);
            await _context.SaveChangesAsync();

            return await GetPositionByIdAsync(position.Id) ?? throw new InvalidOperationException();
        }

        public async Task<PositionDto?> GetPositionByIdAsync(Guid id)
        {
            var position = await _context.Positions
                .Include(p => p.Parent)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null) return null;

            return new PositionDto
            {
                Id = position.Id,
                Name = position.Name,
                Description = position.Description,
                ParentId = position.ParentId,
                ParentName = position.Parent?.Name
            };
        }

        public async Task<List<PositionDto>> GetAllPositionsAsync()
        {
            var positions = await _context.Positions
                .Include(p => p.Parent)
                .ToListAsync();

            return positions.Select(p => new PositionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ParentId = p.ParentId,
                ParentName = p.Parent?.Name
            }).ToList();
        }

        public async Task<List<PositionDto>> GetPositionHierarchyAsync()
        {
            var allPositions = await _context.Positions.ToListAsync();
            var rootPositions = allPositions.Where(p => p.ParentId == null).ToList();

            return rootPositions.Select(p => BuildHierarchy(p, allPositions)).ToList();
        }

        private PositionDto BuildHierarchy(Position position, List<Position> allPositions)
        {
            var dto = new PositionDto
            {
                Id = position.Id,
                Name = position.Name,
                Description = position.Description,
                ParentId = position.ParentId
            };

            var children = allPositions.Where(p => p.ParentId == position.Id).ToList();
            dto.Children = children.Select(c => BuildHierarchy(c, allPositions)).ToList();

            return dto;
        }

        public async Task<List<PositionDto>> GetChildrenAsync(Guid parentId)
        {
            var children = await _context.Positions
                .Where(p => p.ParentId == parentId)
                .ToListAsync();

            return children.Select(p => new PositionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ParentId = p.ParentId
            }).ToList();
        }

        public async Task<PositionDto?> UpdatePositionAsync(Guid id, CreatePositionDto updateDto)
        {
            var position = await _context.Positions.FindAsync(id);
            if (position == null) return null;

            // Validate parent exists if parentId is provided
            if (updateDto.ParentId.HasValue)
            {
                var parentExists = await _context.Positions.AnyAsync(p => p.Id == updateDto.ParentId.Value);
                if (!parentExists)
                    throw new ArgumentException("Parent position not found");
                
                // Prevent circular reference
                if (await WouldCreateCircularReference(id, updateDto.ParentId.Value))
                    throw new ArgumentException("Cannot create circular reference");
            }

            position.Name = updateDto.Name;
            position.Description = updateDto.Description;
            position.ParentId = updateDto.ParentId;

            await _context.SaveChangesAsync();
            return await GetPositionByIdAsync(id);
        }

        public async Task<bool> DeletePositionAsync(Guid id)
        {
            var position = await _context.Positions
                .Include(p => p.Children)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null) return false;

            // Check if position has children
            if (position.Children.Any())
                throw new InvalidOperationException("Cannot delete position with children");

            _context.Positions.Remove(position);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> DeletePositionCascadeAsync(Guid id)
        {
            var position = await _context.Positions.FindAsync(id);
            if (position == null) return false;

            // Get all descendant IDs recursively
            var descendantIds = await GetAllDescendantIdsAsync(id);
            
            // Add the position itself to the list
            descendantIds.Add(id);

            // Delete all descendants and the position in a single transaction
            var positionsToDelete = await _context.Positions
                .Where(p => descendantIds.Contains(p.Id))
                .ToListAsync();

            _context.Positions.RemoveRange(positionsToDelete);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> DeletePositionWithReassignmentAsync(Guid id)
        {
            var position = await _context.Positions
                .Include(p => p.Children)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null) return false;

            // If position has children, reassign them to this position's parent
            if (position.Children.Any())
            {
                foreach (var child in position.Children)
                {
                    child.ParentId = position.ParentId; // This could be null if deleting a root position
                }
            }

            // Remove the position
            _context.Positions.Remove(position);
            await _context.SaveChangesAsync();
            
            return true;
        }

        private async Task<List<Guid>> GetAllDescendantIdsAsync(Guid parentId)
        {
            var descendantIds = new List<Guid>();
            var directChildren = await _context.Positions
                .Where(p => p.ParentId == parentId)
                .Select(p => p.Id)
                .ToListAsync();

            foreach (var childId in directChildren)
            {
                descendantIds.Add(childId);
                var childDescendants = await GetAllDescendantIdsAsync(childId);
                descendantIds.AddRange(childDescendants);
            }

            return descendantIds;
        }

        private async Task<bool> WouldCreateCircularReference(Guid positionId, Guid newParentId)
        {
            Guid? currentId = newParentId;
            while (currentId.HasValue)
            {
                if (currentId.Value == positionId) return true;

                var parent = await _context.Positions.FindAsync(currentId.Value);
                currentId = parent?.ParentId;
            }
            return false;
        }
    }
}
