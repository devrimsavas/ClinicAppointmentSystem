using System.Security.Claims;
using System.Text;
using ClinicBooking.Auth;
using ClinicBooking.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace ClinicBooking.Services
{
    public class JwtTokenService : ITokenService
    {
        private readonly JwtOptions _options;
        private readonly TimeProvider _timeProvider;

        public JwtTokenService(IOptions<JwtOptions> options, TimeProvider timeProvider)
        {
            _options = options.Value;
            _timeProvider = timeProvider;
        }

        public TokenResult CreateToken(StaffUser user)
        {
            var now = _timeProvider.GetUtcNow().UtcDateTime;
            var expires = now.AddMinutes(_options.ExpiryMinutes);

            var identity = new ClaimsIdentity(new[]
            {
                new Claim(AppClaims.UserId, user.Id.ToString()),
                new Claim(AppClaims.Email, user.Email),
                new Claim(AppClaims.Name, user.FullName),
                new Claim(AppClaims.Role, user.Role),
            });

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Issuer = _options.Issuer,
                Audience = _options.Audience,
                IssuedAt = now,
                NotBefore = now,
                Expires = expires,
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
            };

            var token = new JsonWebTokenHandler().CreateToken(descriptor);
            return new TokenResult(token, expires);
        }
    }
}
