# ---------- build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore first, so this layer is cached until the project file changes
COPY backend.csproj ./
RUN dotnet restore backend.csproj

COPY . ./
RUN dotnet publish backend.csproj -c Release -o /app --no-restore

# ---------- runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Booking rules use the clinic's local time (opening hours, "not in the past")
ENV TZ=Europe/Oslo \
    ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app ./

# Built-in non-root user of the .NET images
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll"]
