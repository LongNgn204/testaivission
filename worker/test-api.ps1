# Test Worker API với PowerShell

Write-Host "`n🚀 Testing Vision Coach Worker API`n" -ForegroundColor Cyan

$baseUrl = "http://127.0.0.1:8787"

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health Check OK" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Version: $($health.version)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n⚠️  Make sure worker is running: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Login
Write-Host "`n2️⃣ Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    name = "Test User"
    age = 25
    phone = "0912345678"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    if ($loginResponse.success) {
        Write-Host "✅ Login Successful" -ForegroundColor Green
        Write-Host "   User ID: $($loginResponse.user.id)" -ForegroundColor Gray
        Write-Host "   Name: $($loginResponse.user.name)" -ForegroundColor Gray
        $token = $loginResponse.user.token
        Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ Login Failed: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Verify Token
Write-Host "`n3️⃣ Testing Token Verification..." -ForegroundColor Yellow
$verifyBody = @{
    token = $token
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify" -Method POST -Body $verifyBody -ContentType "application/json"
    if ($verifyResponse.success) {
        Write-Host "✅ Token Valid" -ForegroundColor Green
        Write-Host "   User: $($verifyResponse.user.name)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Token Invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Verify Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Save Test Result
Write-Host "`n4️⃣ Testing Save Test Result..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$testBody = @{
    testType = "snellen"
    testData = @{
        leftEye = "20/20"
        rightEye = "20/25"
    }
    score = 95
    duration = 120
} | ConvertTo-Json

try {
    $saveResponse = Invoke-RestMethod -Uri "$baseUrl/api/tests/save" -Method POST -Body $testBody -Headers $headers
    if ($saveResponse.success) {
        Write-Host "✅ Test Result Saved" -ForegroundColor Green
        Write-Host "   Test ID: $($saveResponse.testResult.id)" -ForegroundColor Gray
        Write-Host "   Score: $($saveResponse.testResult.score)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Save Failed: $($saveResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Save Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Test History
Write-Host "`n5️⃣ Testing Get Test History..." -ForegroundColor Yellow
try {
    $historyResponse = Invoke-RestMethod -Uri "$baseUrl/api/tests/history?limit=10" -Method GET -Headers @{ "Authorization" = "Bearer $token" }
    if ($historyResponse.success) {
        Write-Host "✅ History Retrieved" -ForegroundColor Green
        Write-Host "   Total: $($historyResponse.total) tests" -ForegroundColor Gray
        Write-Host "   Retrieved: $($historyResponse.history.Count) tests" -ForegroundColor Gray
    } else {
        Write-Host "❌ Get History Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Get History Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Logout
Write-Host "`n6️⃣ Testing Logout..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" -Method POST -Headers @{ "Authorization" = "Bearer $token" }
    if ($logoutResponse.success) {
        Write-Host "✅ Logout Successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Logout Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Logout Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 All Tests Completed!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
