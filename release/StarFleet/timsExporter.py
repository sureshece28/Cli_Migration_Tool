import re
import sys
import os
import subprocess
import zipfile
import shutil
import pdb
import errno
import glob
import time

def remove(path):
    """ param <path> could either be relative or absolute. """
    if os.path.isfile(path):
        os.remove(path)  # remove the file
    elif os.path.isdir(path):
        shutil.rmtree(path)  # remove dir and all contains

#/users/strottie/bin/SmartMan-cli request-run --router '172.28.10.36 2047' --cli-root 'show ip http' --exec-host bgl-ads-103 --desc TB1_show_ip_http
#resultFile = subprocess.check_output(r"",shell=True)
#/auto/isbufrt/ats5.1.0/venganes/timsExporter.py

var=sys.argv[1]
print(var)

#show ip http
#show ip admission

cli_input="/users/strottie/bin/SmartMan-cli request-run --router '172.28.10.36 2044' --cli-root "+"'"+var+"'"+ " --exec-host bgl-ads-103 --desc TB3_show_ip_http --cli-max-depth '15'"
print(cli_input)

resultFile = subprocess.check_output(cli_input,shell=True)
print (resultFile)

print "Sleep for 120 Secs to get Run_id"
time.sleep(120)

dataList = resultFile.split(",")

if "run_id" in dataList[0].split(":")[0]:  
    print (dataList[0].split(":")[1])

# for i in dataList:
    # if "run_id" in i.split(":")[0]:
        # print (i.split(":")[1])
# dataList[0].split(":")[1]

# dataList = resultFile.split(",")

# if "run_id" in dataList[0].split(":")[0]:  
    # print (dataList[0].split(":")[1])

print "Script to extracting the archive files"
run_id = dataList[0].split(":")[1]
run_id = [run_id]
print run_id
	
remove("/users/magsrini/pyats/sundar/clihunt/config_cat6k.txt")

print "Sleep to get Output Archive file"
#time.sleep(600)
run_str=run_id[0]

while True:
    val = subprocess.check_output("find /auto/bgl-smartman/archive/ -type f -name '*%s*.zip'"%(run_str), shell=True)
    time.sleep(5)
    if val :
         break

#run_id = ["68244","68237"]
#run_id = ["74901"]

for i in run_id:
        #pdb.set_trace()
        output =[]
        print "hi"
        val = subprocess.check_output("find /auto/bgl-smartman/archive/ -type f -name '*%s*.zip'"%(i), shell=True)
        output=val.split('\n')
        output.pop()
        print output
        for z in output:
            z=z.strip()
            print z
            zip_ref = zipfile.ZipFile(z,'r')
            zip_ref.extractall("/auto/tftpboot-blr-projects/isbu/SMARTMAN")
            zip_ref.close()
        print "Extracting file is done"

        ## To fetch show cli's
        #ls /auto/tftpboot-blr-projects/isbu/SMARTMAN/ | wc -l
        Result_xml="/auto/tftpboot-blr-projects/isbu/SMARTMAN/ResultsDetails.xml"
        f1=open(Result_xml,"r")
        Result_cli=f1.readlines()
        #print(Result_cli)
        print ("Total number of lines present in Result xml output log: %s" %len(Result_cli))

        Result_cli_log_filter = []
        Result_cli_log_filter2 = []

        # <runinfo>
               # <diag>Step 1: Discover CLI command 'show'</diag>
               # <diag>Step 2: Discover CLI command 'show ip'</diag>
               # <diag>Step 3: Discover CLI command 'show ip http'</diag>
              # </runinfo>

        #showclimatch = re.search(r"<diag>Step\s\d+:\sDiscover\sCLI\scommand\s('.*')<\/diag>",i)
        #showcli = showclimatch.group(1)

        for i in Result_cli:
            showclimatch = re.search(r"<diag>Step\s\d+:\sDiscover\sCLI\scommand\s'(.*)'<\/diag>",i,re.I)
            if showclimatch:
                Result_cli_log_filter.append(showclimatch.group(1))
        #print(Result_cli_log_filter)
        print ("Total number of lines present in Result_cli_log_filter output log: %s" %len(Result_cli_log_filter))

        config_cat6k=open("config_cat6k.txt","a")
        
        print("----All Filtered show Log file----")
        for i in Result_cli_log_filter:
            if "show" in i:
                config_cat6k.write(i.strip()+'\n')
        config_cat6k.close()
                            
        ##To remove the added Resultdetails.xml extracting file
        Resultxmlfiles_del = glob.glob('/auto/tftpboot-blr-projects/isbu/SMARTMAN/*')
        for f in Resultxmlfiles_del:
            remove(f)
            


