"""Y · Compression. Python 3.10+, sin dependencias externas."""


def compress(s: str) -> str:
    if not s or any(bit not in "01" for bit in s):
        raise ValueError("Escribe una cadena binaria no vacía.")
    first = s[0]
    last = s[-1]  # En Python, -1 accede al último carácter.
    different = False
    for i in range(1, len(s)):
        if s[i] != first:
            different = True

    # Tres casos exhaustivos; no eliminamos físicamente subcadenas.
    if not different:
        return first
    if first != last:
        return first + last
    other = "1" if first == "0" else "0"
    return first + other + last


if __name__ == "__main__":
    print(compress("0010100"))  # 010
