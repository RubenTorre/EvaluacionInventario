-- Crear la base de datos
CREATE DATABASE InventarioDB;
GO

USE InventarioDB;
GO

-- Crear usuario de SQL Server
CREATE LOGIN Evaluador WITH PASSWORD = 'Evaluacion123!';
GO

-- Dar permisos en la base de datos
CREATE USER Evaluador FOR LOGIN Evaluador;
ALTER ROLE db_owner ADD MEMBER Evaluador;
GO

-- Tabla de Productos
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    Category NVARCHAR(100),
    ImageUrl NVARCHAR(400),
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	UpdatedAt DATETIME2 NULL
	
);
GO

-- Tabla de Transacciones
CREATE TABLE Transactions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Type NVARCHAR(20) NOT NULL, -- "Compra" o "Venta"
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice AS (Quantity * UnitPrice) PERSISTED, -- Calcula automáticamente
    Details NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Transactions_Product FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
GO
ALTER TABLE Products
ADD CONSTRAINT UQ_ProductName UNIQUE (Name);
