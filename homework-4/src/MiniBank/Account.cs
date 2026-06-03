namespace MiniBank;

/// <summary>
/// A single in-memory bank account. Balance mutation is intentionally
/// restricted to the <see cref="Bank"/> aggregate via internal methods.
/// </summary>
public sealed class Account
{
    public string Id { get; }

    public decimal Balance { get; private set; }

    public Account(string id, decimal openingBalance = 0m)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Account id is required.", nameof(id));

        Id = id;
        Balance = openingBalance;
    }

    internal void Credit(decimal amount) => Balance += amount;

    internal void Debit(decimal amount) => Balance -= amount;
}
