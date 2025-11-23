# Vault Policy for Database Administration
# Constitutional Shrinkage Platform

# Allow managing database connections
path "database/config/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow managing database roles
path "database/roles/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow rotating database root credentials
path "database/rotate-root/*" {
  capabilities = ["update"]
}

# Allow reading all database credentials (admin only)
path "database/creds/*" {
  capabilities = ["read"]
}

# Allow managing static database credentials
path "database/static-creds/*" {
  capabilities = ["read"]
}

path "database/static-roles/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow managing database leases
path "sys/leases/lookup/database/*" {
  capabilities = ["read", "list"]
}

path "sys/leases/revoke/database/*" {
  capabilities = ["update"]
}

path "sys/leases/revoke-force/database/*" {
  capabilities = ["update"]
}

# Allow reading database secrets
path "secret/data/database/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow managing encryption keys for data at rest
path "transit/keys/database-encryption" {
  capabilities = ["create", "read", "update"]
}

path "transit/encrypt/database-encryption" {
  capabilities = ["update"]
}

path "transit/decrypt/database-encryption" {
  capabilities = ["update"]
}

# Allow key rotation
path "transit/keys/database-encryption/rotate" {
  capabilities = ["update"]
}

# Allow renewing own token
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Allow looking up own token
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
