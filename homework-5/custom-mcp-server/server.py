"""Custom FastMCP server for Homework 5.

Exposes the contents of ``lorem-ipsum.md`` both as an MCP **Resource**
(a URI Claude can read from) and as an MCP **Tool** named ``read`` (an
action Claude can call). Both honour a ``word_count`` parameter that
limits how many words are returned (default: 30).

Run with:  python server.py          (stdio transport)
       or:  fastmcp run server.py
"""

from pathlib import Path

from fastmcp import FastMCP

mcp = FastMCP("lorem-ipsum-server")

# lorem-ipsum.md lives next to this file regardless of the working directory.
LOREM_FILE = Path(__file__).parent / "lorem-ipsum.md"
DEFAULT_WORD_COUNT = 30


def _read_words(word_count: int) -> str:
    """Return the first ``word_count`` words of lorem-ipsum.md.

    A non-positive ``word_count`` yields an empty string; requesting more
    words than the file holds simply returns the whole file.
    """
    words = LOREM_FILE.read_text(encoding="utf-8").split()
    return " ".join(words[: max(0, word_count)])


@mcp.resource("lorem://words")
def lorem_default() -> str:
    """Resource: first 30 words of lorem-ipsum.md (the default)."""
    return _read_words(DEFAULT_WORD_COUNT)


@mcp.resource("lorem://words/{word_count}")
def lorem_words(word_count: int) -> str:
    """Resource template: first ``word_count`` words of lorem-ipsum.md."""
    return _read_words(word_count)


@mcp.tool
def read(word_count: int = DEFAULT_WORD_COUNT) -> str:
    """Read text from lorem-ipsum.md, limited to ``word_count`` words.

    Args:
        word_count: How many words to return from the start of the file.
            Defaults to 30.
    """
    return _read_words(word_count)


if __name__ == "__main__":
    mcp.run()
