using ClinicBooking.Auth;
using ClinicBooking.DTOs;
using ClinicBooking.Models;
using ClinicBooking.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace ClinicBooking.Controllers
{
    /// <summary>
    /// Login and the logged-in user's own account.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        public const string LoginRateLimitPolicy = "login";

        private readonly AppDbContext _context;
        private readonly IPasswordHasher<StaffUser> _hasher;
        private readonly ITokenService _tokenService;

        // Used when the email is unknown, so a failed login takes the same time either way
        // and does not reveal which emails exist.
        private static readonly Lazy<string> DummyHash =
            new(() => new PasswordHasher<StaffUser>().HashPassword(new StaffUser(), Guid.NewGuid().ToString()));

        public AuthController(AppDbContext context, IPasswordHasher<StaffUser> hasher, ITokenService tokenService)
        {
            _context = context;
            _hasher = hasher;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Logs in a staff user and returns a JWT access token.
        /// </summary>
        /// <remarks>Limited to 5 attempts per minute per IP address.</remarks>
        /// <response code="200">Returns the token and the user</response>
        /// <response code="401">Invalid email or password</response>
        /// <response code="429">Too many login attempts</response>
        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting(LoginRateLimitPolicy)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto dto)
        {
            var email = StaffUser.NormalizeEmail(dto.Email ?? "");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                _hasher.VerifyHashedPassword(new StaffUser(), DummyHash.Value, dto.Password ?? "");
                return Unauthorized(new { Message = "Invalid email or password." });
            }

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password ?? "");
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { Message = "Invalid email or password." });

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = _hasher.HashPassword(user, dto.Password!);
                await _context.SaveChangesAsync();
            }

            var token = _tokenService.CreateToken(user);

            return Ok(new LoginResponseDto
            {
                Token = token.Token,
                ExpiresAt = token.ExpiresAt,
                User = UsersController.ToReadDto(user)
            });
        }

        /// <summary>
        /// Returns the logged-in user.
        /// </summary>
        /// <response code="200">Returns the user</response>
        /// <response code="401">Not logged in, or the account no longer exists</response>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserReadDto>> Me()
        {
            var user = await CurrentUser();
            if (user == null)
                return Unauthorized(new { Message = "Account not found." });

            return Ok(UsersController.ToReadDto(user));
        }

        /// <summary>
        /// Changes the logged-in user's own password.
        /// </summary>
        /// <response code="200">Password changed</response>
        /// <response code="400">Current password is wrong or the new password is too short</response>
        /// <response code="401">Not logged in</response>
        [HttpPut("password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var user = await CurrentUser();
            if (user == null)
                return Unauthorized(new { Message = "Account not found." });

            if (_hasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword ?? "") == PasswordVerificationResult.Failed)
                return BadRequest(new { Message = "Current password is incorrect." });

            if ((dto.NewPassword ?? "").Length < AdminSeeder.MinimumPasswordLength)
                return BadRequest(new { Message = $"New password must be at least {AdminSeeder.MinimumPasswordLength} characters." });

            user.PasswordHash = _hasher.HashPassword(user, dto.NewPassword!);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Password changed." });
        }

        private async Task<StaffUser?> CurrentUser()
        {
            var id = User.FindFirst(AppClaims.UserId)?.Value;
            if (!int.TryParse(id, out var userId))
                return null;

            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}
