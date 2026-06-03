using MiniBank;
using Xunit;

namespace MiniBank.Tests;

// Covers the BUG-002 fix in InterestCalculator.CalculateSimpleInterest.
public sealed class InterestCalculatorTests
{
    [Theory]
    [InlineData(1000.0, 0.10, 365, 100.0)] // full year at 10% -> 100
    [InlineData(1000.0, 0.05, 73, 10.0)]   // 73/365 of a year at 5% -> 10
    [InlineData(1000.0, 0.05, 0, 0.0)]     // zero days -> 0
    public void CalculateSimpleInterest_KnownInputs_ReturnsExpected(
        double principal, double annualRate, int days, double expected)
    {
        var result = InterestCalculator.CalculateSimpleInterest(
            (decimal)principal, (decimal)annualRate, days);

        Assert.Equal((decimal)expected, result);
    }

    [Fact]
    public void CalculateSimpleInterest_IsNotInflated_RegressionForBug002()
    {
        // Buggy formula returned 180; correct value is 180/365 ≈ 0.4931.
        var result = InterestCalculator.CalculateSimpleInterest(120m, 0.05m, 30);

        Assert.True(result < 1m);
        Assert.Equal(0.49m, Math.Round(result, 2));
    }

    [Theory]
    [InlineData(-1.0, 0.05, 30)]
    [InlineData(100.0, -0.05, 30)]
    [InlineData(100.0, 0.05, -1)]
    public void CalculateSimpleInterest_NegativeArguments_Throw(
        double principal, double annualRate, int days)
    {
        Assert.Throws<ArgumentException>(() =>
            InterestCalculator.CalculateSimpleInterest((decimal)principal, (decimal)annualRate, days));
    }
}
