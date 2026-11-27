using ClinicBooking.Models;

namespace ClinicBooking.Services
{
    public record TokenResult(string Token, DateTime ExpiresAt);

    /// <summary>
    /// Creates access tokens for logged-in staff users.
    /// </summary>
    public interface ITokenService
    {
        TokenResult CreateToken(StaffUser user);
    }
}
