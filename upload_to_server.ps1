# Upload updated frontend and backend to server
$serverIP = "18.222.11.22"
$keyPath = "C:\Users\beltr\Downloads\kamioi-server-key.pem"

Write-Host "Uploading updated frontend..."
scp -r -i $keyPath "C:\Users\beltr\100402025Kamioiv1\v10072025\frontend\dist\*" ubuntu@$serverIP`:~/temp-frontend/

Write-Host "Uploading updated backend..."
scp -i $keyPath "C:\Users\beltr\100402025Kamioiv1\v10072025\backend\app.py" ubuntu@$serverIP`:~/temp-backend/

Write-Host "Upload complete! Now run these commands on your server:"
Write-Host "sudo rm -rf /var/www/kamioi/*"
Write-Host "sudo mv ~/temp-frontend/* /var/www/kamioi/"
Write-Host "sudo mv ~/temp-backend/app.py /var/www/kamioi/backend/"
Write-Host "sudo chown -R www-data:www-data /var/www/kamioi"
Write-Host "sudo chmod -R 755 /var/www/kamioi"
Write-Host "sudo systemctl restart nginx"

