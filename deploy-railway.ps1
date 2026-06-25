Write-Host "=== LaundryKhalaas Railway Deployment ===" -ForegroundColor Cyan

# Step 1: Install Railway CLI
Write-Host "`n[1/6] Installing Railway CLI..." -ForegroundColor Yellow
iwr https://railway.app/install.ps1 | iex

# Step 2: Login
Write-Host "`n[2/6] Logging in to Railway (browser will open)..." -ForegroundColor Yellow
railway login

# Step 3: Commit code
Write-Host "`n[3/6] Committing backend code..." -ForegroundColor Yellow
Set-Location "D:\Projects\LaundryKhalaasPrototype"
git add backend/ docker-compose.yml .env.example .gitignore
git commit -m "feat: FastAPI backend - schema, LLM service, classifier, tests"
git push

# Step 4: Create Railway project
Write-Host "`n[4/6] Creating Railway project (name it: laundrykhalaas-backend)..." -ForegroundColor Yellow
railway init

# Step 5: Deploy
Write-Host "`n[5/6] Deploying backend service..." -ForegroundColor Yellow
railway up --service backend

# Step 6: Run migrations
Write-Host "`n[6/6] Running database migrations..." -ForegroundColor Yellow
railway run --service backend alembic upgrade head

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Go to https://railway.app/dashboard to get your public URL." -ForegroundColor Cyan
Write-Host "Then add PostgreSQL and Redis services in the Railway dashboard." -ForegroundColor Cyan
Read-Host "`nPress Enter to close"
