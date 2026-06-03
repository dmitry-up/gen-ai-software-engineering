using MiniBank;

// Tiny demo harness so the pipeline has a runnable entry point.
// Run:  dotnet run --project src/MiniBank.Cli

var bank = new Bank();
bank.OpenAccount("ACC-1", openingBalance: 100m);
bank.OpenAccount("ACC-2", openingBalance: 0m);

Console.WriteLine("=== MiniBank demo ===");
Console.WriteLine($"ACC-1 opening balance: {bank.GetBalance("ACC-1"):C}");

bank.Deposit("ACC-1", 50m);
Console.WriteLine($"ACC-1 after +50 deposit: {bank.GetBalance("ACC-1"):C}");

bank.Transfer("ACC-1", "ACC-2", 30m);
Console.WriteLine($"ACC-1 after -30 transfer: {bank.GetBalance("ACC-1"):C}");
Console.WriteLine($"ACC-2 after +30 transfer: {bank.GetBalance("ACC-2"):C}");

// Attempt to overdraw ACC-2 (only has 30).
try
{
    bank.Withdraw("ACC-2", 1000m);
    Console.WriteLine($"ACC-2 after -1000 withdraw: {bank.GetBalance("ACC-2"):C}");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Overdraft correctly rejected: {ex.Message}");
}

var interest = InterestCalculator.CalculateSimpleInterest(
    principal: bank.GetBalance("ACC-1"),
    annualRate: 0.05m,
    days: 30);
Console.WriteLine($"30-day simple interest on ACC-1 @5%: {interest:C}");

try
{
    var auth = new AuthService();
    var providedKey = Environment.GetEnvironmentVariable("MINIBANK_ADMIN_API_KEY") ?? "wrong-key";
    Console.WriteLine($"Admin authenticated: {auth.Authenticate(providedKey)}");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Admin auth skipped: {ex.Message}");
}
