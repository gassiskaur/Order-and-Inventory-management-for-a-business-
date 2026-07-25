"""
Run this once (locally, never as a public endpoint) to create or reset the
single brand-owner login stored in the `auth` collection.

Usage:
    python create_admin.py
"""

import getpass

from auth.auth import set_owner_credentials

if __name__ == "__main__":
    username = input("Choose a username: ").strip()
    password = getpass.getpass("Choose a password: ").strip()
    confirm = getpass.getpass("Confirm password: ").strip()

    if password != confirm:
        print("Passwords do not match. Nothing was saved.")
    else:
        set_owner_credentials(username, password)
        print(f"Login created for username '{username}'.")
