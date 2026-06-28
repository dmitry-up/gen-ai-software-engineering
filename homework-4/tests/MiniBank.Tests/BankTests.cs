using MiniBank;
using Xunit;

namespace MiniBank.Tests;

// Covers the BUG-001 fix in Bank.Withdraw / Transfer.
public sealed class BankTests
{
    private static Bank BankWith(string id, decimal balance)
    {
        var bank = new Bank();
        bank.OpenAccount(id, balance);
        return bank;
    }

    [Fact]
    public void Withdraw_AmountEqualsBalance_DrainsToZero()
    {
        var bank = BankWith("ACC-1", 100m);

        bank.Withdraw("ACC-1", 100m);

        Assert.Equal(0m, bank.GetBalance("ACC-1"));
    }

    [Fact]
    public void Withdraw_AmountExceedsBalance_ThrowsAndLeavesBalanceUnchanged()
    {
        var bank = BankWith("ACC-1", 100m);

        Assert.Throws<InvalidOperationException>(() => bank.Withdraw("ACC-1", 100.01m));
        Assert.Equal(100m, bank.GetBalance("ACC-1"));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Withdraw_NonPositiveAmount_Throws(decimal amount)
    {
        var bank = BankWith("ACC-1", 100m);

        Assert.Throws<ArgumentException>(() => bank.Withdraw("ACC-1", amount));
    }

    [Fact]
    public void Transfer_InsufficientFunds_MovesNoMoney()
    {
        var bank = new Bank();
        bank.OpenAccount("FROM", 50m);
        bank.OpenAccount("TO", 0m);

        Assert.Throws<InvalidOperationException>(() => bank.Transfer("FROM", "TO", 75m));
        Assert.Equal(50m, bank.GetBalance("FROM"));
        Assert.Equal(0m, bank.GetBalance("TO"));
    }

    [Fact]
    public void Transfer_SufficientFunds_MovesMoney()
    {
        var bank = new Bank();
        bank.OpenAccount("FROM", 50m);
        bank.OpenAccount("TO", 0m);

        bank.Transfer("FROM", "TO", 30m);

        Assert.Equal(20m, bank.GetBalance("FROM"));
        Assert.Equal(30m, bank.GetBalance("TO"));
    }
}
