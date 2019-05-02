# conf_cat6k_file="/users/nehag4/WWW/clihunt/release/s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218/config.s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218.txt"
# exec_cat6k_file="/users/nehag4/WWW/clihunt/release/s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218/exec.s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218.txt"
# test_cat6k_file="/users/nehag4/WWW/clihunt/release/s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218/test.s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218.txt"
# conf_polaris_file="/users/nehag4/WWW/clihunt/release/sf.bin/config.sf.bin.txt"
# exec_polaris_file="/users/nehag4/WWW/clihunt/release/sf.bin/exec.sf.bin.txt"
# test_polaris_file="/users/nehag4/WWW/clihunt/release/sf.bin/test.sf.bin.txt"


conf_cat6k_file="/users/kanbunat/WWW/starcli/clihunt/release/input/config_s6t.txt"
conf_polaris_file="/users/kanbunat/WWW/starcli/clihunt/release/input/config_sflt_bin.txt"
#exec_cat6k_file="/users/kanbunat/WWW/starcli/clihunt/release/input/exec.s6t.txt"
#exec_polaris_file="/users/kanbunat/WWW/starcli/clihunt/release/input/exec.sf.bin.txt"
#test_cat6k_file="/users/kanbunat/WWW/starcli/clihunt/release/input/test.s6t.txt"
#test_polaris_file="/users/kanbunat/WWW/starcli/clihunt/release/input/test.sf.bin.txt"

f1=open(conf_cat6k_file,"r")
f2=open(conf_polaris_file,"r")

conf_cat6k_list=f1.readlines()
print ("Total number of conf cli's present in cat6k_ios: %s" %len(conf_cat6k_list))
conf_polaris_list=f2.readlines()
print len(conf_polaris_list)
print ("Total number of conf cli's present in Polaris_ios: %s" %len(conf_polaris_list))

conf_cat6k_list_fil = []
conf_polaris_list_fil = []
for i in conf_cat6k_list:
    if i.endswith(" ...\n"):
        conf_cat6k_list_fil.append(i.replace(" ...",""))
    else:
        conf_cat6k_list_fil.append(i)
print ("Total number of conf cli's present after filter in cat6k_ios: %s" %len(conf_cat6k_list_fil))		
for i in conf_polaris_list:
    if i.endswith(" ...\n"):
        conf_polaris_list_fil.append(i.replace(" ...",""))
    else:
        conf_polaris_list_fil.append(i)	
print ("Total number of conf cli's present after filter in Polaris_ios: %s" %len(conf_polaris_list_fil))
conf_count_equal_cat6k_polaris=0
conf_count_cat6k_cli_Not_present_in_polaris_ios=0
conf_count_equal_polaris_cat6k=0
conf_count_polaris_cli_Not_present_in_cat6k_ios=0

config_cat6K=open("config_cat6k.txt","w")
#conf_cat6k_cli_Not_present_in_polaris_ios=open("conf_cat6k_cli_Not_present_in_polaris_ios.txt","w")

print("----conf cli:From cat6k to polaris----")
for i in conf_cat6k_list_fil:
    if i in conf_polaris_list_fil:
#        print("Equivalent conf cli of cat6k and polaris: %s" %count_count_equal_cat6k_polaris)
        config_cat6K.write(i.strip()+' @\n')
        conf_count_equal_cat6k_polaris+=1
    else:
#        print("conf cli Not present in polaris: %s" %conf_count_cat6k_cli_Not_present_in_polaris_ios)
#        conf_cat6k_cli_Not_present_in_polaris_ios.write(i.strip()+' NO\n')
        config_cat6K.write(i.strip()+' !\n')
        conf_count_cat6k_cli_Not_present_in_polaris_ios+=1
print("Equivalent conf cli present in both cat6k and polaris by parenting cat6k: %s" %conf_count_equal_cat6k_polaris)        
print("Cat6k conf cli's which is Not present in polaris_ios: %s" %conf_count_cat6k_cli_Not_present_in_polaris_ios)

#### EXEC CLI  #####

f3=open(exec_cat6k_file,"r")
f4=open(exec_polaris_file,"r")

exec_cat6k_list=f3.readlines()
print len(exec_cat6k_list)
print ("Total number of exec cli's present in cat6k_ios: %s" %len(exec_cat6k_list))
exec_polaris_list=f4.readlines()
print len(exec_polaris_list)
print ("Total number of exec cli's present in Polaris_ios: %s" %len(exec_polaris_list))

exec_cat6k_list_fil = []
exec_polaris_list_fil = []
for i in exec_cat6k_list:
    if i.endswith(" ...\n"):
        exec_cat6k_list_fil.append(i.replace(" ...",""))
    else:
        exec_cat6k_list_fil.append(i)
print ("Total number of exec cli's present after filter in cat6k_ios: %s" %len(exec_cat6k_list_fil))		
for i in exec_polaris_list:
    if i.endswith(" ...\n"):
        exec_polaris_list_fil.append(i.replace(" ...",""))
    else:
        exec_polaris_list_fil.append(i)	
print ("Total number of exec cli's present after filter in Polaris_ios: %s" %len(exec_polaris_list_fil))

exec_count_equal_cat6k_polaris=0
exec_count_cat6k_cli_Not_present_in_polaris_ios=0
Exec_cat6K=open("Exec_cat6K.txt","w")

print("----Exec cli:From cat6k to polaris----")
for i in exec_cat6k_list_fil:
    if i in exec_polaris_list_fil:
#        print("Equivalent exec cli of cat6k and polaris: %s" %count_count_equal_cat6k_polaris)
        Exec_cat6K.write(i.strip()+' @\n')
        exec_count_equal_cat6k_polaris+=1
    else:
#        print("exec cli Not present in polaris: %s" %exec_count_cat6k_cli_Not_present_in_polaris_ios)
#        exec_cat6k_cli_Not_present_in_polaris_ios.write(i.strip()+' NO\n')
        Exec_cat6K.write(i.strip()+' !\n')
        exec_count_cat6k_cli_Not_present_in_polaris_ios+=1
print("Equivalent exec cli present in both cat6k and polaris by parenting cat6k: %s" %exec_count_equal_cat6k_polaris)        
print("Cat6k exec cli's which is Not present in polaris_ios: %s" %exec_count_cat6k_cli_Not_present_in_polaris_ios)

#### TEST CLI  #####

f5=open(test_cat6k_file,"r")
f6=open(test_polaris_file,"r")

test_cat6k_list=f5.readlines()
print len(test_cat6k_list)
print ("Total number of test cli's present in cat6k_ios: %s" %len(test_cat6k_list))
test_polaris_list=f6.readlines()
print len(test_polaris_list)
print ("Total number of test cli's present in Polaris_ios: %s" %len(test_polaris_list))
test_cat6k_list_fil = []
test_polaris_list_fil = []
for i in test_cat6k_list:
    if i.endswith(" ...\n"):
        test_cat6k_list_fil.append(i.replace(" ...",""))
    else:
        test_cat6k_list_fil.append(i)
print ("Total number of test cli's present after filter in cat6k_ios: %s" %len(test_cat6k_list_fil))		
for i in test_polaris_list:
    if i.endswith(" ...\n"):
        test_polaris_list_fil.append(i.replace(" ...",""))
    else:
        test_polaris_list_fil.append(i)	
print ("Total number of test cli's present after filter in Polaris_ios: %s" %len(test_polaris_list_fil))

test_count_equal_cat6k_polaris=0
test_count_cat6k_cli_Not_present_in_polaris_ios=0
test_cat6K=open("test_cat6K.txt","w")

print("----Test cli:From cat6k to polaris----")
for i in test_cat6k_list_fil:
    if i in test_polaris_list_fil:
#        print("Equivalent test cli of cat6k and polaris: %s" %count_count_equal_cat6k_polaris)
        test_cat6K.write(i.strip()+' @\n')
        test_count_equal_cat6k_polaris+=1
    else:
#        print("test cli Not present in polaris: %s" %test_count_cat6k_cli_Not_present_in_polaris_ios)
#        test_cat6k_cli_Not_present_in_polaris_ios.write(i.strip()+' NO\n')
        test_cat6K.write(i.strip()+' !\n')
        test_count_cat6k_cli_Not_present_in_polaris_ios+=1
print("Equivalent test cli present in both cat6k and polaris by parenting cat6k: %s" %test_count_equal_cat6k_polaris)        
print("Cat6k test cli's which is Not present in polaris_ios: %s" %test_count_cat6k_cli_Not_present_in_polaris_ios)
