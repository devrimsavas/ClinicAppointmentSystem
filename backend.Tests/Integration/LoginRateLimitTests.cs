using System.Net;
using System.Net.Http.Json;

namespace ClinicBooking.Tests.Integration;

/// <summary>Uses its own factory, so the rate limiter starts empty and other tests are not affected.</summary>
public class LoginRateLimitTests
{
    [Fact]
    public async Task Sixth_login_attempt_within_a_minute_returns_429()
    {
        await using var factory = new ApiFactory();
        var client = factory.CreateClient();
        var attempt = () => client.PostAsJsonAsync("/api/auth/login", new { email = "nobody@example.com", password = "wrong-password" });

        for (var i = 0; i < 5; i++)
            Assert.Equal(HttpStatusCode.Unauthorized, (await attempt()).StatusCode);

        Assert.Equal(HttpStatusCode.TooManyRequests, (await attempt()).StatusCode);
    }
}
