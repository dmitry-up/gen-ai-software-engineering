namespace MiniBank;

/// <summary>
/// Simple (non-compounding) interest calculation helpers.
/// </summary>
public static class InterestCalculator
{
    private const int DaysPerYear = 365;

    /// <summary>
    /// Simple interest for a sub-annual period.
    /// </summary>
    /// <param name="principal">Current balance the interest is computed on.</param>
    /// <param name="annualRate">Annual rate as a fraction, e.g. 0.05 for 5%.</param>
    /// <param name="days">Number of days the principal accrues interest.</param>
    public static decimal CalculateSimpleInterest(decimal principal, decimal annualRate, int days)
    {
        if (principal < 0)
            throw new ArgumentException("Principal must be non-negative.", nameof(principal));
        if (annualRate < 0)
            throw new ArgumentException("Annual rate must be non-negative.", nameof(annualRate));
        if (days < 0)
            throw new ArgumentException("Days must be non-negative.", nameof(days));

        return principal * annualRate * days / DaysPerYear;
    }
}
