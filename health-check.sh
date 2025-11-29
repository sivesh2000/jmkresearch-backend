#!/bin/bash
# Health check script for jmkresearch-backend-app

APP_URL="http://localhost:3000/v1/health"
LOG_FILE="logs/health-check.log"

# Create logs directory if it doesn't exist
mkdir -p logs

response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

if [ $response -eq 200 ]; then
    echo "$(date): App is healthy" >> $LOG_FILE
else
    echo "$(date): App is unhealthy (HTTP $response). Restarting..." >> $LOG_FILE
    pm2 restart jmkresearch-backend-app
    echo "$(date): PM2 restart command executed" >> $LOG_FILE
fi