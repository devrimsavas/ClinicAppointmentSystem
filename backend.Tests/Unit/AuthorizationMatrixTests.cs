using System.Reflection;
using ClinicBooking.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicBooking.Tests.Unit;

/// <summary>
/// Documents who may call each endpoint, and fails when a new endpoint is added without a decision.
/// "logged-in" means the fallback policy applies (any authenticated user).
/// </summary>
public class AuthorizationMatrixTests
{
    private static readonly Dictionary<string, string> Expected = new()
    {
        ["AppointmentsController.CreateAppointmentWithPatient"] = "public",
        ["AppointmentsController.GetBusySlots"] = "public",
        ["AppointmentsController.GetAppointments"] = "Admin,Staff",
        ["AppointmentsController.GetAppointment"] = "Admin,Staff",
        ["AppointmentsController.CreateAppointment"] = "Admin,Staff",
        ["AppointmentsController.UpdateAppointment"] = "Admin,Staff",
        ["AppointmentsController.DeleteAppointment"] = "Admin,Staff",
        ["PatientsController.GetPatients"] = "Admin,Staff",
        ["PatientsController.GetPatient"] = "Admin,Staff",
        ["PatientsController.CreatePatient"] = "Admin,Staff",
        ["PatientsController.UpdatePatient"] = "Admin,Staff",
        ["PatientsController.DeletePatient"] = "Admin,Staff",
        ["ClinicsController.GetClinics"] = "public",
        ["ClinicsController.GetClinic"] = "public",
        ["ClinicsController.CreateClinic"] = "Admin",
        ["ClinicsController.UpdateClinic"] = "Admin",
        ["ClinicsController.DeleteClinic"] = "Admin",
        ["DoctorsController.GetDoctors"] = "public",
        ["DoctorsController.GetDoctor"] = "public",
        ["DoctorsController.CreateDoctor"] = "Admin",
        ["DoctorsController.UpdateDoctor"] = "Admin",
        ["DoctorsController.DeleteDoctor"] = "Admin",
        ["SpecialitiesController.GetSpecialities"] = "public",
        ["SpecialitiesController.GetSpeciality"] = "public",
        ["SpecialitiesController.CreateSpeciality"] = "Admin",
        ["SpecialitiesController.UpdateSpeciality"] = "Admin",
        ["SpecialitiesController.DeleteSpeciality"] = "Admin",
        ["SearchController.SearchDoctors"] = "public",
        ["AuthController.Login"] = "public",
        ["AuthController.Me"] = "logged-in",
        ["AuthController.ChangePassword"] = "logged-in",
        ["UsersController.GetUsers"] = "Admin",
        ["UsersController.CreateUser"] = "Admin",
        ["UsersController.ResetPassword"] = "Admin",
        ["UsersController.DeleteUser"] = "Admin",
    };

    private static IEnumerable<MethodInfo> AllActions() =>
        typeof(AuthController).Assembly.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract)
            .SelectMany(t => t.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly));

    private static string Access(MethodInfo action)
    {
        if (action.GetCustomAttribute<AllowAnonymousAttribute>() != null) return "public";
        var authorize = action.GetCustomAttribute<AuthorizeAttribute>() ?? action.DeclaringType!.GetCustomAttribute<AuthorizeAttribute>();
        return authorize?.Roles ?? "logged-in";
    }

    public static IEnumerable<object[]> Actions() => AllActions().Select(a => new object[] { $"{a.DeclaringType!.Name}.{a.Name}" });

    [Theory]
    [MemberData(nameof(Actions))]
    public void Every_endpoint_has_the_expected_access(string action)
    {
        Assert.True(Expected.ContainsKey(action), $"{action} is new: decide who may call it and add it to the matrix.");
        var method = AllActions().Single(a => $"{a.DeclaringType!.Name}.{a.Name}" == action);
        Assert.Equal(Expected[action], Access(method));
    }
}
