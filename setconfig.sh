echo "Set Config"
 D="$(pwd)"
 echo "Current Folder:  ${D}"
 echo "Parameter: $1"
 if [ -z "$1" ]
 then
   echo "Using Local Config (pass parameter for specific config)"
   C="local"
 else
   C="$1"
 fi
 CF="globalconfig_${C}.json"
 echo "Copying Config: ${CF}"
 cp "./globalconfigs/${CF}" "./globalconfig.json"

 components=("cdl" "dad" "ddb" "dlm" "dos" "dps" "dss" "ida" "oda" "tmm")
 echo "Copying into component directories"

for i in "${components[@]}"
do
    cp "./globalconfig.json" "./${i}/globalconfig.json"
done 
