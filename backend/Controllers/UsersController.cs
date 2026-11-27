using ClinicBooking.Auth;
using ClinicBooking.DTOs;
using ClinicBooking.Models;
using ClinicBooking.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicBooking.Controllers
{
    /// <summary>
    /// Staff account management. Admin only.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Admin)]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<StaffUser> _hasher;

        public UsersController(AppDbContext context, IPasswordHasher<StaffUser> hasher)
        {
            _context = context;
            _hasher = hasher;
        }

        /// <summary>
        /// Retrieves all staff users.
        /// </summary>
        /// <response code="200">Users retrieved successfully</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<UserReadDto>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();

            return Ok(new { users = users.OrderBy(u => u.FullName).Select(ToReadDto) });
        }

        /// <summary>
        /// Creates a staff user.
        /// </summary>
        /// <response code="201">Returns the created user</response>
        /// <response code="400">Invalid data</response>
        /// <response code="409">A user with this email already exists</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserReadDto>> CreateUser([FromBody] UserCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.FullName))
                return BadRequest(new { Message = "Email and full name are required." });

            if (!Roles.IsValid(dto.Role))
                return BadRequest(new { Message = $"Role must be one of: {string.Join(", ", Roles.All)}." });

            if ((dto.Password ?? "").Length < AdminSeeder.MinimumPasswordLength)
                return BadRequest(new { Message = $"Password must be at least {AdminSeeder.MinimumPasswordLength} characters." });

            var email = StaffUser.NormalizeEmail(dto.Email);
            if (await _context.Users.AnyAsync(u => u.Email == email))
                return Conflict(new { Message = "A user with this email already exists." });

            var user = new StaffUser
            {
                Email = email,
                FullName = dto.FullName.Trim(),
                Role = dto.Role,
            };
            user.PasswordHash = _hasher.HashPassword(user, dto.Password!);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, ToReadDto(user));
        }

        /// <summary>
        /// Sets a new password for a user (e.g. when a staff member forgot theirs).
        /// </summary>
        /// <response code="200">Password reset</response>
        /// <response code="400">Password too short</response>
        /// <response code="404">User not found</response>
        [HttpPut("{id}/password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] PasswordResetDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound(new { Message = "User not found." });

            if ((dto.NewPassword ?? "").Length < AdminSeeder.MinimumPasswordLength)
                return BadRequest(new { Message = $"Password must be at least {AdminSeeder.MinimumPasswordLength} characters." });

            user.PasswordHash = _hasher.HashPassword(user, dto.NewPassword!);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Password reset." });
        }

        /// <summary>
        /// Deletes a user. Admins cannot delete themselves or the last admin.
        /// </summary>
        /// <response code="200">User deleted</response>
        /// <response code="400">Tried to delete yourself or the last admin</response>
        /// <response code="404">User not found</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound(new { Message = "User not found." });

            if (User.FindFirst(AppClaims.UserId)?.Value == id.ToString())
                return BadRequest(new { Message = "You cannot delete your own account." });

            if (user.Role == Roles.Admin &&
                !await _context.Users.AnyAsync(u => u.Role == Roles.Admin && u.Id != id))
                return BadRequest(new { Message = "The last admin cannot be deleted." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User deleted." });
        }

        internal static UserReadDto ToReadDto(StaffUser u) => new()
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            Role = u.Role,
            CreatedAt = u.CreatedAt
        };
    }
}
