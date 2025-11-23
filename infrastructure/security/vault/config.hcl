# HashiCorp Vault Configuration
# Constitutional Shrinkage Platform

# Storage backend - using Consul for HA
storage "consul" {
  address = "127.0.0.1:8500"
  path    = "vault/"
  scheme  = "https"

  tls_ca_file   = "/etc/vault/tls/ca.crt"
  tls_cert_file = "/etc/vault/tls/vault.crt"
  tls_key_file  = "/etc/vault/tls/vault.key"
}

# Listener configuration
listener "tcp" {
  address         = "0.0.0.0:8200"
  cluster_address = "0.0.0.0:8201"

  tls_cert_file = "/etc/vault/tls/vault.crt"
  tls_key_file  = "/etc/vault/tls/vault.key"

  tls_min_version = "tls13"

  # Disable TLS for development only
  # tls_disable = true
}

# API address for clients
api_addr = "https://vault.constitutional-shrinkage.internal:8200"
cluster_addr = "https://vault.constitutional-shrinkage.internal:8201"

# UI enabled
ui = true

# Telemetry
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname          = true
}

# Seal configuration (auto-unseal with AWS KMS in production)
seal "awskms" {
  region     = "us-east-1"
  kms_key_id = "alias/vault-unseal-key"
}

# Audit logging
audit {
  type = "file"
  path = "file"
  options = {
    file_path = "/var/log/vault/audit.log"
  }
}

# Max lease TTL
max_lease_ttl = "768h"
default_lease_ttl = "768h"

# Disable mlock for containers
disable_mlock = true

# Cluster name
cluster_name = "constitutional-shrinkage-vault"
