@echo off
REM Script to allow Docker ports through Windows Firewall
REM Run as Administrator

echo Configuring Windows Firewall for HanGuide development...
echo.

netsh advfirewall firewall add rule name="HanGuide - Port 4000" dir=in action=allow protocol=TCP localport=4000
netsh advfirewall firewall add rule name="HanGuide - Port 4001" dir=in action=allow protocol=TCP localport=4001
netsh advfirewall firewall add rule name="HanGuide - Port 4002" dir=in action=allow protocol=TCP localport=4002
netsh advfirewall firewall add rule name="HanGuide - Port 5432" dir=in action=allow protocol=TCP localport=5432
netsh advfirewall firewall add rule name="HanGuide - Port 6379" dir=in action=allow protocol=TCP localport=6379

echo.
echo Firewall configuration complete!
echo You can now access the API from your mobile device at: http://192.168.31.88:4000
echo.
pause

