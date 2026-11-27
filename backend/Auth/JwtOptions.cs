namespace ClinicBooking.Auth
{
    /// <summary>
    /// JWT settings, bound from the "Jwt" configuration section.
    /// The key must never be committed: use appsettings.json (git-ignored), user-secrets or environment variables.
    /// </summary>
    public class JwtOptions
    {
        public const string SectionName = "Jwt";
        public const int MinimumKeyLength = 32;

        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = "ClinicBooking";
        public string Audience { get; set; } = "ClinicBooking";
        public int ExpiryMinutes { get; set; } = 60;
    }

    /// <summary>
    /// Claim names written into the token. Inbound claim mapping is turned off,
    /// so the API reads exactly these names back.
    /// </summary>
    public static class AppClaims
    {
        public const string UserId = "sub";
        public const string Email = "email";
        public const string Name = "name";
        public const string Role = "role";
    }
}
