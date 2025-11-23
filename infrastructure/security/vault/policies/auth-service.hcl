# Vault Policy for Auth Service
# Constitutional Shrinkage Platform

# Allow reading database credentials
path "database/creds/auth-service" {
  capabilities = ["read"]
}

# Allow full access to auth service secrets
path "secret/data/auth-service/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow reading shared secrets
path "secret/data/shared/*" {
  capabilities = ["read"]
}

# Allow managing JWT signing keys
path "secret/data/jwt/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow transit encryption for tokens
path "transit/encrypt/auth-service" {
  capabilities = ["update"]
}

path "transit/decrypt/auth-service" {
  capabilities = ["update"]
}

# Allow creating transit keys
path "transit/keys/auth-service" {
  capabilities = ["create", "read", "update"]
}

# Allow rotating transit keys
path "transit/keys/auth-service/rotate" {
  capabilities = ["update"]
}

# Allow reading TLS certificates
path "pki/issue/auth-service" {
  capabilities = ["create", "update"]
}

# Allow reading CA certificate
path "pki/cert/ca" {
  capabilities = ["read"]
}

# Allow TOTP management for MFA
path "totp/keys/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "totp/code/*" {
  capabilities = ["read"]
}

# Allow renewing own token
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Allow looking up own token
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
