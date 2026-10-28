using EmptyingMonitor.Api.Mock;
using EmptyingMonitor.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<TerminalSimulation>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

var api = app.MapGroup("/api");

api.MapGet("/flow", (TerminalSimulation sim) => sim.GetFlow());
api.MapGet("/floor", (TerminalSimulation sim) => sim.GetFloor());
api.MapPatch("/containers/urgent", (UrgentUpdate body, TerminalSimulation sim) =>
    body.ContainerNumbers.Count == 0
        ? Results.BadRequest(new { error = "containerNumbers is required" })
        : Results.Ok(new { changed = sim.SetUrgent(body.ContainerNumbers, body.Urgent) }));

api.MapGet("/deals", (string container, TerminalSimulation sim) =>
    sim.GetDeals(container) is { } deals ? Results.Ok(deals) : Results.NotFound());

api.MapGet("/health", () => new { status = "ok", mode = "prototype", store = "in-memory" });

// Single-page app fallback, so a refresh on /floor still lands on the client.
app.MapFallbackToFile("index.html");

app.Run();
