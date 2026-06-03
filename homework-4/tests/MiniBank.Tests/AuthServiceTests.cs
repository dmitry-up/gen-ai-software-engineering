using MiniBank;
using Xunit;

namespace MiniBank.Tests;

// Covers the SEC-001 fix in AuthService (key injection + constant-time compare).
// Keys are injected via the constructor so tests never read or mutate the real
// environment variable (Repeatable / Independent).
public sealed class AuthServiceTests
{
    private const string Key = "test-key-abc-123";

    [Fact]
    public void Authenticate_CorrectKey_ReturnsTrue()
    {
        var auth = new AuthService(Key);

        Assert.True(auth.Authenticate(Key));
    }

    [Fact]
    public void Authenticate_WrongKey_ReturnsFalse()
    {
        var auth = new AuthService(Key);

        Assert.False(auth.Authenticate("test-key-abc-124"));
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Authenticate_NullOrEmptyProvidedKey_ReturnsFalse(string? provided)
    {
        var auth = new AuthService(Key);

        Assert.False(auth.Authenticate(provided!));
    }

    [Fact]
    public void Constructor_EmptyKey_Throws()
    {
        Assert.Throws<InvalidOperationException>(() => new AuthService(""));
    }
}
