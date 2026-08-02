#!/bin/bash
cat > /home/misssponto-auth/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/deploy_key
  StrictHostKeyChecking no
EOF
chown misssponto-auth:misssponto-auth /home/misssponto-auth/.ssh/config
chmod 600 /home/misssponto-auth/.ssh/config
