using System.Security.Cryptography;
using System.Text;

namespace MiniBank;

/// <summary>
/// Authenticates privileged ("admin") operations against an API key.
/// The key is supplied at construction time (from configuration / environment),
/// never embedded in source.
/// </summary>
public sealed class AuthService
{
    public const string ApiKeyEnvVar = "MINIBANK_ADMIN_API_KEY";

    private readonly byte[] _adminApiKey;

    public AuthService(string? adminApiKey = null)
    {
        var key = adminApiKey ?? Environment.GetEnvironmentVariable(ApiKeyEnvVar);
        if (string.IsNullOrEmpty(key))
            throw new InvalidOperationException(
                $"Admin API key is not configured. Set the '{ApiKeyEnvVar}' environment variable.");

        _adminApiKey = Encoding.UTF8.GetBytes(key);
    }

    public bool Authenticate(string providedApiKey)
    {
        if (string.IsNullOrEmpty(providedApiKey))
            return false;

        var provided = Encoding.UTF8.GetBytes(providedApiKey);
        return CryptographicOperations.FixedTimeEquals(provided, _adminApiKey);
    }
}
