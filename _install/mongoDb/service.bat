rem set mongoPath=g:\mongodb
rem set mongoDataPath=g:\mongodb-data

rem paths to mongoDb and mongoDb data folders, see examples above
rem should be no slash \ in the end.
set mongoPath=
set mongoDataPath=

if %mongoPath%=="" (exit 1)
if %mongoDataPath%=="" (exit 1)

if not exist "%mongoPath%" (exit 2)
mkdir "%mongoDataPath%"
if not exist "%mongoDataPath%" (exit 3)
mkdir "%mongoDataPath%\log"

rem make config file
echo dbpath=%mongoDataPath%\>%mongoPath%\mongod.cfg"
echo logpath=%mongoDataPath%\log\mongo.log>>%mongoPath%\mongod.cfg"

rem install service
"%mongoPath%\bin\mongod.exe" --config "%mongoPath%\mongod.cfg" --install

pause
