#!/usr/bin/env bash
# 可选 legacy：Portfolio env 口令 Cookie（W3）；运维主路径已改 ChatBI DB token + local_chatbi_access_token_gen.py
set -euo pipefail

gen_one() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    python3 -c "import secrets; print(secrets.token_hex(32))"
  fi
}

V="$(gen_one)"
A="$(gen_one)"

cat <<EOF
# 粘贴到 Vercel / 本地 .env.local（禁止提交 Git）
PORTFOLIO_VISITOR_SECRET=${V}
PORTFOLIO_VISITOR_ADMIN_SECRET=${A}

# visitor TTL 72h · visitor-admin TTL 24h（由 BFF session Cookie Max-Age 实现）
# 重新运行本脚本会生成新值；旧秘钥作废，须重新 unlock
EOF
