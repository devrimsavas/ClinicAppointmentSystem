using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using ClinicBooking.Auth;
using ClinicBooking.Controllers;
using ClinicBooking.Models;
using ClinicBooking.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Prevent cycles when entities with navigation properties are serialized
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// DbContext injection with MySQL (Oracle's provider)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Database connection string is missing");
    options.UseMySQL(connectionString);
});

// Appointment booking rules (TimeProvider makes "now" replaceable in tests)
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<AppointmentValidator>();

// ---------- Authentication (JWT) ----------
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
if (Encoding.UTF8.GetByteCount(jwtOptions.Key) < JwtOptions.MinimumKeyLength)
    throw new InvalidOperationException(
        $"Jwt:Key is missing or shorter than {JwtOptions.MinimumKeyLength} characters. See appsettings.json.sample.txt.");

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddSingleton<ITokenService, JwtTokenService>();
builder.Services.AddSingleton<IPasswordHasher<StaffUser>, PasswordHasher<StaffUser>>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Keep claim names exactly as written in the token ("sub", "role", ...)
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = AppClaims.Name,
            RoleClaimType = AppClaims.Role,
        };
    });

// Secure by default: every endpoint requires a logged-in user
// unless it is explicitly marked [AllowAnonymous] or has its own [Authorize(Roles = ...)].
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// Brute-force protection for login: 5 attempts per minute per IP address
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(AuthController.LoginRateLimitPolicy, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

// ---------- Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Clinic Appointment Booking API",
        Description = "ASP.NET Core Web API for managing medical clinics, doctors, patients, and appointments."
    });

    // Enable XML comments
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

    // "Authorize" button: paste the token from POST /api/Auth/login
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Paste the token from POST /api/Auth/login (without the \"Bearer \" prefix)."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// CORS (development setting)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});

var app = builder.Build();

// Create the first admin if there are no users yet
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    // In Docker the database starts empty: apply EF Core migrations on startup when enabled.
    // Off by default, so local development and tests keep using "dotnet ef database update".
    if (app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
    {
        logger.LogInformation("Applying database migrations...");
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
    }

    try
    {
        await AdminSeeder.SeedAsync(
            scope.ServiceProvider.GetRequiredService<AppDbContext>(),
            scope.ServiceProvider.GetRequiredService<IPasswordHasher<StaffUser>>(),
            app.Configuration,
            logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Admin seeding failed. Has the database been migrated (dotnet ef database update)?");
    }
}

app.UseCors("AllowAll");

// Swagger in development, or when turned on explicitly (e.g. Swagger__Enabled=true in Docker)
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Swagger:Enabled"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
public partial class Program { } // makes Program visible to WebApplicationFactory in the integration tests
