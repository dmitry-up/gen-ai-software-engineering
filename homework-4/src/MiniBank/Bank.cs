namespace MiniBank;

/// <summary>
/// In-memory bank that owns the accounts and the money-movement operations.
/// </summary>
public sealed class Bank
{
    private readonly Dictionary<string, Account> _accounts = new();

    public Account OpenAccount(string id, decimal openingBalance = 0m)
    {
        var account = new Account(id, openingBalance);
        _accounts[id] = account;
        return account;
    }

    public Account GetAccount(string id)
    {
        if (!_accounts.TryGetValue(id, out var account))
            throw new KeyNotFoundException($"Account '{id}' was not found.");

        return account;
    }

    public decimal GetBalance(string id) => GetAccount(id).Balance;

    public void Deposit(string id, decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive.", nameof(amount));

        GetAccount(id).Credit(amount);
    }

    public void Withdraw(string id, decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive.", nameof(amount));

        var account = GetAccount(id);
        if (amount > account.Balance)
            throw new InvalidOperationException(
                $"Insufficient funds in account '{id}': balance {account.Balance}, requested {amount}.");

        account.Debit(amount);
    }

    public void Transfer(string fromId, string toId, decimal amount)
    {
        Withdraw(fromId, amount);
        Deposit(toId, amount);
    }
}
