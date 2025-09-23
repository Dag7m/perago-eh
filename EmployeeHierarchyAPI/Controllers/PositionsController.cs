using Microsoft.AspNetCore.Mvc;
using EmployeeHierarchyAPI.DTOs;
using EmployeeHierarchyAPI.Services;

namespace EmployeeHierarchyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PositionsController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public PositionsController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpPost]
        public async Task<ActionResult<PositionDto>> CreatePosition(CreatePositionDto createDto)
        {
            try
            {
                var position = await _positionService.CreatePositionAsync(createDto);
                return CreatedAtAction(nameof(GetPosition), new { id = position.Id }, position);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PositionDto>> GetPosition(Guid id)
        {
            var position = await _positionService.GetPositionByIdAsync(id);
            if (position == null) return NotFound();
            return position;
        }

        [HttpGet]
        public async Task<ActionResult<List<PositionDto>>> GetAllPositions()
        {
            var positions = await _positionService.GetAllPositionsAsync();
            return positions;
        }

        [HttpGet("hierarchy")]
        public async Task<ActionResult<List<PositionDto>>> GetHierarchy()
        {
            var hierarchy = await _positionService.GetPositionHierarchyAsync();
            return hierarchy;
        }

        [HttpGet("{id}/children")]
        public async Task<ActionResult<List<PositionDto>>> GetChildren(Guid id)
        {
            var children = await _positionService.GetChildrenAsync(id);
            return children;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PositionDto>> UpdatePosition(Guid id, CreatePositionDto updateDto)
        {
            try
            {
                var position = await _positionService.UpdatePositionAsync(id, updateDto);
                if (position == null) return NotFound();
                return position;
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePosition(Guid id)
        {
            try
            {
                var deleted = await _positionService.DeletePositionAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("{id}/cascade")]
        public async Task<IActionResult> DeletePositionCascade(Guid id)
        {
            try
            {
                var deleted = await _positionService.DeletePositionCascadeAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error during cascade delete: {ex.Message}");
            }
        }

        [HttpDelete("{id}/reassign")]
        public async Task<IActionResult> DeletePositionWithReassignment(Guid id)
        {
            try
            {
                var deleted = await _positionService.DeletePositionWithReassignmentAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error during delete with reassignment: {ex.Message}");
            }
        }
    }
}