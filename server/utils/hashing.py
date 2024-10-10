import bcrypt


def hashPassword(plainPassword: str) -> bytes:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plainPassword.encode("utf-8"), salt)
    return hashed


def verifyPassword(plainPassword: str, hashedPassword: bytes) -> bool:
    return bcrypt.checkpw(plainPassword.encode("utf-8"), hashedPassword)
