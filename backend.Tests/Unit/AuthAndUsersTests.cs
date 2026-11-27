using ClinicBooking.Controllers;
using ClinicBooking.DTOs;
using ClinicBooking.Models;
using ClinicBooking.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using static ClinicBooking.Tests.TestData;

namespace ClinicBooking.Tests.Unit;

public class AuthAndUsersTests
{
    private class FakeTokens : ITokenService
    {
        public TokenResult CreateToken(StaffUser user) => new($"token-for-{user.Id}", DateTime.UtcNow.AddHours(1));
    }

    private readonly AppDbContext _db = CreateDb();
    private readonly PasswordHasher<StaffUser> _hasher = new();

    public AuthAndUsersTests()
    {
        AddUser(1, "admin@example.com", "secret123", Roles.Admin);
        AddUser(2, "desk@example.com", "deskpass1", Roles.Staff);
    }

    private void AddUser(int id, string email, string password, string role)
    {
        var user = new StaffUser { Id = id, Email = email, FullName = email.Split('@')[0], Role = role };
        user.PasswordHash = _hasher.HashPassword(user, password);
        _db.Users.Add(user);
        _db.SaveChanges();
    }

    private AuthController Auth() => new(_db, _hasher, new FakeTokens());
    private UsersController Users(int asUserId = 1) => new UsersController(_db, _hasher).WithUser(asUserId, Roles.Admin);

    // ---------- Login ----------
    [Fact]
    public async Task Login_ignores_case_and_spaces_in_email()
    {
        var result = await Auth().Login(new LoginRequestDto { Email = "  ADMIN@example.com ", Password = "secret123" });

        var body = Assert.IsType<LoginResponseDto>(Assert.IsType<OkObjectResult>(result.Result).Value);
        Assert.Equal("token-for-1", body.Token);
        Assert.Equal(Roles.Admin, body.User.Role);
    }

    [Theory]
    [InlineData("admin@example.com", "wrong")]     // wrong password
    [InlineData("nobody@example.com", "secret123")] // unknown email
    public async Task Failed_login_returns_401_with_the_same_message(string email, string password)
    {
        var result = await Auth().Login(new LoginRequestDto { Email = email, Password = password });

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
        Assert.Contains("Invalid email or password", unauthorized.Value!.ToString());
    }

    [Fact]
    public async Task Me_returns_401_when_the_account_was_deleted() =>
        Assert.IsType<UnauthorizedObjectResult>((await Auth().WithUser(99, Roles.Staff).Me()).Result);

    [Fact]
    public async Task Change_password_requires_the_current_password()
    {
        var result = await Auth().WithUser(2, Roles.Staff).ChangePassword(new ChangePasswordDto { CurrentPassword = "wrong", NewPassword = "newpass123" });
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Change_password_rejects_short_passwords()
    {
        var result = await Auth().WithUser(2, Roles.Staff).ChangePassword(new ChangePasswordDto { CurrentPassword = "deskpass1", NewPassword = "short" });
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Change_password_works()
    {
        var result = await Auth().WithUser(2, Roles.Staff).ChangePassword(new ChangePasswordDto { CurrentPassword = "deskpass1", NewPassword = "newpass123" });

        Assert.IsType<OkObjectResult>(result);
        var user = (await _db.Users.FindAsync(2))!;
        Assert.NotEqual(PasswordVerificationResult.Failed, _hasher.VerifyHashedPassword(user, user.PasswordHash, "newpass123"));
    }

    // ---------- Users ----------
    [Fact]
    public async Task Create_user_rejects_unknown_roles() =>
        Assert.IsType<BadRequestObjectResult>((await Users().CreateUser(new UserCreateDto { Email = "a@example.com", FullName = "A", Password = "password1", Role = "Doctor" })).Result);

    [Fact]
    public async Task Create_user_rejects_short_passwords() =>
        Assert.IsType<BadRequestObjectResult>((await Users().CreateUser(new UserCreateDto { Email = "a@example.com", FullName = "A", Password = "123", Role = Roles.Staff })).Result);

    [Fact]
    public async Task Create_user_rejects_duplicate_email_regardless_of_case() =>
        Assert.IsType<ConflictObjectResult>((await Users().CreateUser(new UserCreateDto { Email = "DESK@example.com", FullName = "A", Password = "password1", Role = Roles.Staff })).Result);

    [Fact]
    public async Task Create_user_stores_a_hash_and_a_normalized_email()
    {
        var result = await Users().CreateUser(new UserCreateDto { Email = " New@Example.com ", FullName = " New Person ", Password = "password1", Role = Roles.Staff });

        var dto = Assert.IsType<UserReadDto>(Assert.IsType<CreatedAtActionResult>(result.Result).Value);
        Assert.Equal("new@example.com", dto.Email);
        var stored = (await _db.Users.FindAsync(dto.Id))!;
        Assert.NotEqual("password1", stored.PasswordHash);
        Assert.NotEqual(PasswordVerificationResult.Failed, _hasher.VerifyHashedPassword(stored, stored.PasswordHash, "password1"));
    }

    [Fact]
    public async Task Admin_cannot_delete_own_account() =>
        Assert.IsType<BadRequestObjectResult>(await Users(asUserId: 1).DeleteUser(1));

    [Fact]
    public async Task Last_admin_cannot_be_deleted()
    {
        // e.g. a token that is still valid for an account that was removed meanwhile
        Assert.IsType<BadRequestObjectResult>(await Users(asUserId: 99).DeleteUser(1));
    }

    [Fact]
    public async Task Staff_user_can_be_deleted()
    {
        Assert.IsType<OkObjectResult>(await Users().DeleteUser(2));
        Assert.Null(await _db.Users.FindAsync(2));
    }

    [Fact]
    public async Task Admin_can_reset_a_password()
    {
        Assert.IsType<OkObjectResult>(await Users().ResetPassword(2, new PasswordResetDto { NewPassword = "resetpass1" }));
        var user = (await _db.Users.FindAsync(2))!;
        Assert.NotEqual(PasswordVerificationResult.Failed, _hasher.VerifyHashedPassword(user, user.PasswordHash, "resetpass1"));
    }

    // ---------- Seeder ----------
    private static IConfiguration Config(params (string Key, string Value)[] values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values.Select(v => new KeyValuePair<string, string?>(v.Key, v.Value))).Build();

    [Fact]
    public async Task Seeder_creates_the_first_admin()
    {
        var db = CreateDb();
        await AdminSeeder.SeedAsync(db, _hasher, Config(("SeedAdmin:Email", " Boss@Example.com "), ("SeedAdmin:Password", "longenough1")), NullLogger.Instance);

        var admin = Assert.Single(db.Users);
        Assert.Equal("boss@example.com", admin.Email);
        Assert.Equal(Roles.Admin, admin.Role);
    }

    [Fact]
    public async Task Seeder_does_nothing_without_config()
    {
        var db = CreateDb();
        await AdminSeeder.SeedAsync(db, _hasher, Config(), NullLogger.Instance);
        Assert.Empty(db.Users);
    }

    [Fact]
    public async Task Seeder_refuses_a_short_password()
    {
        var db = CreateDb();
        await AdminSeeder.SeedAsync(db, _hasher, Config(("SeedAdmin:Email", "a@example.com"), ("SeedAdmin:Password", "1234")), NullLogger.Instance);
        Assert.Empty(db.Users);
    }

    [Fact]
    public async Task Seeder_skips_when_users_exist()
    {
        await AdminSeeder.SeedAsync(_db, _hasher, Config(("SeedAdmin:Email", "other@example.com"), ("SeedAdmin:Password", "longenough1")), NullLogger.Instance);
        Assert.Equal(2, _db.Users.Count());
    }
}
