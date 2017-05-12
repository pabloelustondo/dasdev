::Script presumes the presence of IDA_accessKeyID.txt & IDA_secretAccessKey.txt at root of C:\ . They can be blank.
::Change Installdir to your own install
::USE AS IS. Only works on windows. Contact Peter Maney.
::WARNING WARNING we recomend newcomers read README and do this installation/run module by module.
@echo off

SET installdir=D:\BI\BI\
cd %installdir%

::Install Everything

cd %installdir%\ddb
call npm install
cd %installdir%\oda
call npm install
cd %installdir%\dss\backend
call npm install
cd %installdir%\dss\
call npm install
cd %installdir%\ida\
call npm install
cd %installdir%\dad3\
call npm install

::Its Mongo Time
start cmd.exe /k 
mkdir data_folder
mongod -dbpath ./

::Start Everything
start cmd.exe /k 
cd %installdir%\ddb & start call npm start
start cmd.exe /k 
 cd %installdir%\oda & start call npm start
start cmd.exe /k 
 cd %installdir%\dss\backend & start call npm start
start cmd.exe /k 
 cd %installdir%\dss & start call npm start
start cmd.exe /k 
 cd %installdir%\ida & start call npm start
start cmd.exe /k 
 cd %installdir%\dad3 & start call npm start
start cmd.exe /k 
 cd %installdir%\dlm & start call npm start
start cmd.exe /k 

exit