# Vault Policy for API Gateway Service
# Constitutional Shrinkage Platform

# Allow reading database credentials
path "database/creds/api-gateway" {
  capabilities = ["read"]
}

# Allow reading API keys and secrets
path "secret/data/api-gateway/*" {
  capabilities = ["read", "list"]
}

# Allow reading shared secrets
path "secret/data/shared/*" {
  capabilities = ["read"]
}

# Allow using transit encryption for sensitive data
path "transit/encrypt/api-gateway" {
  capabilities = ["update"]
}

path "transit/decrypt/api-gateway" {
  capabilities = ["update"]
}

# Allow reading JWT signing keys
path "secret/data/jwt/*" {
  capabilities = ["read"]
}

# Allow reading TLS certificates
path "pki/issue/api-gateway" {
  capabilities = ["create", "update"]
}

# Allow reading CA certificate
path "pki/cert/ca" {
  capabilities = ["read"]
}

# Deny access to other service secrets
path "secret/data/auth-service/*" {
  capabilities = ["deny"]
}

path "secret/data/security-service/*" {
  capabilities = ["deny"]
}

# Allow renewing own token
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Allow looking up own token
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
