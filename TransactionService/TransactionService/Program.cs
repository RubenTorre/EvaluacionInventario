using Microsoft.EntityFrameworkCore;
using TransactionService.Data;

var builder = WebApplication.CreateBuilder(args);

// Configuración DbContext
builder.Services.AddDbContext<TransactionDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configuración CORS
builder.Services.AddCors(options =>
    options.AddPolicy("AllowOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    ));

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();


var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Aplicar CORS
app.UseCors("AllowOrigin");

// Habilitar estáticos
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();
