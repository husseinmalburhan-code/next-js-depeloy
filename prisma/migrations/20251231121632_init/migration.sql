BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Employee] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fullName] NVARCHAR(1000) NOT NULL,
    [jobTitle] NVARCHAR(1000) NOT NULL,
    [department] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    [gender] NVARCHAR(1000),
    [birthDate] NVARCHAR(1000),
    [manager] NVARCHAR(1000),
    [hireDate] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Employee_status_df] DEFAULT 'نشط',
    [salary] FLOAT(53) NOT NULL CONSTRAINT [Employee_salary_df] DEFAULT 0,
    [bankName] NVARCHAR(1000),
    [iban] NVARCHAR(1000),
    [avatar] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Employee_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Employee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Employee_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Attendance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [date] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [checkIn] NVARCHAR(1000),
    [checkOut] NVARCHAR(1000),
    [workHours] FLOAT(53),
    [employeeId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Attendance_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Attendance_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'مشرف',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[Leave] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [startDate] NVARCHAR(1000) NOT NULL,
    [endDate] NVARCHAR(1000) NOT NULL,
    [reason] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Leave_status_df] DEFAULT 'قيد المراجعة',
    [employeeId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Leave_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Leave_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Payroll] (
    [id] INT NOT NULL IDENTITY(1,1),
    [month] NVARCHAR(1000) NOT NULL,
    [basicSalary] FLOAT(53) NOT NULL,
    [deductions] FLOAT(53) NOT NULL,
    [overtimeHours] FLOAT(53) CONSTRAINT [Payroll_overtimeHours_df] DEFAULT 0,
    [overtimePay] FLOAT(53) CONSTRAINT [Payroll_overtimePay_df] DEFAULT 0,
    [bonuses] FLOAT(53) NOT NULL CONSTRAINT [Payroll_bonuses_df] DEFAULT 0,
    [netSalary] FLOAT(53) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Payroll_status_df] DEFAULT 'معلق',
    [employeeId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Payroll_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Payroll_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Custody] (
    [id] INT NOT NULL IDENTITY(1,1),
    [itemName] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [serialNumber] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Custody_status_df] DEFAULT 'في الذمة',
    [receivedDate] DATETIME2 NOT NULL CONSTRAINT [Custody_receivedDate_df] DEFAULT CURRENT_TIMESTAMP,
    [returnedDate] DATETIME2,
    [notes] NVARCHAR(1000),
    [employeeId] INT NOT NULL,
    CONSTRAINT [Custody_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Attendance] ADD CONSTRAINT [Attendance_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Leave] ADD CONSTRAINT [Leave_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Payroll] ADD CONSTRAINT [Payroll_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Custody] ADD CONSTRAINT [Custody_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
