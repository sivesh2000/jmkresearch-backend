#!/bin/bash
# Production setup script

echo "Setting up production environment..."

# Create logs directory
mkdir -p logs

# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation (10MB max size)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Make health check script executable
chmod +x health-check.sh

echo "Setup complete!"
echo "To add health check to crontab, run:"
echo "crontab -e"
echo "Then add: */2 * * * * /path/to/your/app/health-check.sh"