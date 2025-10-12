# Quick script to open Firebase Console for user deletion

Write-Host ""
Write-Host "🔥 OMU Fusion - Firebase User Deletion Helper" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Backup complete: users_backup.json" -ForegroundColor Green
Write-Host "📊 Total users to delete: 5" -ForegroundColor Yellow
Write-Host ""

Write-Host "Users to delete:" -ForegroundColor White
Write-Host "  1. princeyekunya523@gmail.com"
Write-Host "  2. admin@omufusion.com"
Write-Host "  3. swift1gh@gmail.com"
Write-Host "  4. testaccount@gmail.com"
Write-Host "  5. test@example.com"
Write-Host ""

Write-Host "⚠️  WARNING: This will permanently delete these accounts!" -ForegroundColor Red
Write-Host ""

$response = Read-Host "Open Firebase Console to delete users? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🌐 Opening Firebase Console..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Steps to delete:" -ForegroundColor Yellow
    Write-Host "  1. Select all users (checkbox at top)"
    Write-Host "  2. Click the Delete button (trash icon)"
    Write-Host "  3. Confirm deletion"
    Write-Host ""
    
    # Open Firebase Authentication page
    Start-Process "https://console.firebase.google.com/project/omu-fusion/authentication/users"
    
    Start-Sleep -Seconds 2
    
    Write-Host "🗑️  Also clean Firestore data:" -ForegroundColor Yellow
    $openFirestore = Read-Host "Open Firestore to delete user documents? (y/n)"
    
    if ($openFirestore -eq "y" -or $openFirestore -eq "Y") {
        Write-Host "🌐 Opening Firestore Console..." -ForegroundColor Cyan
        Start-Process "https://console.firebase.google.com/project/omu-fusion/firestore/data/~2Fusers"
    }
    
    Write-Host ""
    Write-Host "✅ Done! Remember:" -ForegroundColor Green
    Write-Host "  - Backup saved: users_backup.json" -ForegroundColor White
    Write-Host "  - Delete from Authentication tab" -ForegroundColor White
    Write-Host "  - Delete from Firestore 'users' collection" -ForegroundColor White
    Write-Host "  - Optional: Clean 'carts' and 'wishlists' collections" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Operation cancelled" -ForegroundColor Red
    Write-Host "   To delete manually, visit:" -ForegroundColor Yellow
    Write-Host "   https://console.firebase.google.com/project/omu-fusion/authentication/users" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
