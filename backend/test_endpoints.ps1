$ErrorActionPreference = 'Stop'

function Out-Result($k, $v) { Write-Output ("$k=" + $v) }

$base = 'http://localhost:5000/api'

# Health
$health = Invoke-RestMethod -Uri "$base/health" -Method Get
Out-Result 'health' $health.status

# Logins for all dashboards
$admin    = Invoke-RestMethod -Uri "$base/user/auth/login" -Method Post -ContentType 'application/json' -Body (@{ email='admin@kamioi.com';   name='Admin';   account_type='admin'   } | ConvertTo-Json)
$user     = Invoke-RestMethod -Uri "$base/user/auth/login" -Method Post -ContentType 'application/json' -Body (@{ email='user@test.com';     name='User';    account_type='user'    } | ConvertTo-Json)
$family   = Invoke-RestMethod -Uri "$base/user/auth/login" -Method Post -ContentType 'application/json' -Body (@{ email='family@kamioi.com'; name='Family';  account_type='family'  } | ConvertTo-Json)
$business = Invoke-RestMethod -Uri "$base/user/auth/login" -Method Post -ContentType 'application/json' -Body (@{ email='business@kamioi.com';name='Business';account_type='business'} | ConvertTo-Json)

Out-Result 'adminLogin'    $admin.success
Out-Result 'userLogin'     $user.success
Out-Result 'familyLogin'   $family.success
Out-Result 'businessLogin' $business.success

$admHdr = @{ Authorization = ('Bearer ' + $admin.token) }

# User (defaults to user_id=1 if not provided)
$userMe        = Invoke-RestMethod -Uri "$base/user/auth/me" -Method Get
$userTx        = Invoke-RestMethod -Uri "$base/user/transactions" -Method Get
$userPortfolio = Invoke-RestMethod -Uri "$base/user/portfolio" -Method Get

Out-Result 'user.me'        $userMe.success
Out-Result 'user.tx'        $userTx.success
Out-Result 'user.portfolio' $userPortfolio.success

# Family (defaults to user_id=2)
$familyMe      = Invoke-RestMethod -Uri "$base/family/auth/me" -Method Get
$familyRoundup = Invoke-RestMethod -Uri "$base/family/roundups/total" -Method Get

Out-Result 'family.me'      $familyMe.success
Out-Result 'family.roundup' $familyRoundup.success

# Business (defaults to user_id=3)
$businessMe    = Invoke-RestMethod -Uri "$base/business/auth/me" -Method Get
$businessAna   = Invoke-RestMethod -Uri "$base/business/analytics" -Method Get

Out-Result 'business.me'    $businessMe.success
Out-Result 'business.ana'   $businessAna.success

# Admin-protected GETs
$adminTx       = Invoke-RestMethod -Uri "$base/admin/transactions"        -Headers $admHdr -Method Get
$adminMappings = Invoke-RestMethod -Uri "$base/admin/llm-center/mappings" -Headers $admHdr -Method Get
$adminSchema   = Invoke-RestMethod -Uri "$base/admin/database/schema"     -Headers $admHdr -Method Get
$adminStats    = Invoke-RestMethod -Uri "$base/admin/database/stats"      -Headers $admHdr -Method Get

Out-Result 'admin.tx'       $adminTx.success
Out-Result 'admin.mappings' $adminMappings.success
Out-Result 'admin.schema'   $adminSchema.success
Out-Result 'admin.stats'    $adminStats.success

# Utility POSTs
$lookup        = Invoke-RestMethod -Uri "$base/lookup/ticker" -Method Post -ContentType 'application/json' -Body (@{ merchant_name='Starbucks' } | ConvertTo-Json)
$submitMapping = Invoke-RestMethod -Uri "$base/mappings/submit" -Method Post -ContentType 'application/json' -Body (@{ merchant_name='Starbucks'; ticker='SBUX'; confidence=0.9 } | ConvertTo-Json)
$submitTxn     = Invoke-RestMethod -Uri "$base/transactions"    -Method Post -ContentType 'application/json' -Body (@{ user_id=1; amount=12.34; merchant='Test Cafe'; category='Food & Dining'; description='Latte' } | ConvertTo-Json)

Out-Result 'lookup'         $lookup.success
Out-Result 'submitMapping'  $submitMapping.success
Out-Result 'submitTxn'      $submitTxn.success
