#!/usr/cisco/python-3.3.1/bin/python3
import cgi
import re
import os
import cgitb; cgitb.enable()
import subprocess 
import multiprocessing
from multiprocessing import Pool
def htmlTop():
	print("""Content-type:text/html;charset=utf-8\n\n
		 <!DOCTYPE html>
		 <html lang="en">
		    <head>
				<meta charset="utf-8"/>
				<title>My server</title>
				<script type="text/javascript" src="fruit/js/fruit.js"></script>
				<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
			   </head>
			<style type="text/css">
    				a {text-decoration: none;}
    				a:hover {text-decoration: underline;}
    				pre {
    display: inline;
    margin: 0;
}
				}
			</style>			
	            <body>""")
def htmlTail():
	print("""<script>
			$(function(){
     $("a").click(function(){
    $(this).after("<img src='fruit/css/images/gif/progress.gif' alt='loading' height='15px'/>").fadeIn();  
  	});

	});
	</script>
	</body>
		</html>""")
#main

def process_line(filename, input):
	global val
	with open(filename,'r',buffering=100000) as result:
		for l2 in result:
			j=l2.strip()
			j=j.strip('.')
			j=j.strip()
			matchObj = re.match(r"^"+input[0],j,re.I)
			if matchObj:
				output=j.split(" ")
				length1=len(input)
				length2=len(output)
				if length1 == length2 :
					v=0
					cri=""
					for indexi in range(length1):
						if((input[indexi]==output[indexi])==1):
							cri+=input[indexi]+ " "
							v=v+1
						elif re.search(r"WORD|\<LINE\>|LINE|HOSTNAME|\<INTERFACE\>|\<[0-9]+\-[0-9]+\>|(A\.B\.C\.D)",output[indexi],re.I):
							cri+=input[indexi]
							v=v+1
						else:
							cri=""
							break
					if v == length1:
						val +=sub1+" " " ".join(input) + "\n"
						c1=0
						break

def mp_handler():
		p = multiprocessing.Pool(32)
		p.map(process_line, filename, input)


def read_in_chunks(f, size=1000000):
    while True:
        chunk = f.read(size)
        if not chunk:
            break
        yield chunk

if True :
	try:
		htmlTop()
		form = cgi.FieldStorage()
		val=""
		z=0
		pattern=form.getvalue('comment')
		lines=pattern.split('\n')
		#print(p.pattern,'<br>')
		pattern="^"+pattern+".*"
		#print(pattern,'<br>')
		pattern=re.escape(pattern)
		p=re.compile(pattern,re.IGNORECASE)
		check2= "config.sflt.bin.txt"
		filename = "release/input/"+check2
		result=[]
		filename3 = "ios-config.txt"
		filename4  = "polaris-config.txt"
		"""
		if os.path.exists(filename):
			txt = open(filename)
			for line in txt:
				result.append(line)
		"""
		x=0
		capt1="xx"
		for ix in lines:
			ix=ix.rstrip()
			mt=re.match("^ *vlan +configuration +([0-9]+)",ix,re.I)
			if mt :
				capt1=mt.group(1)
				x = 1
				continue
			if ( x == 1) :
				if ( re.match("^ *ip igmp snooping last",ix,re.I)):
					str1="ip igmp snooping vlan %s last-member-query-count"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping explicit",ix,re.I)):
					str1="ip igmp snooping vlan %s explicit-tracking"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping immediate",ix,re.I)):
					str1="ip igmp snooping vlan %s immediate-leave"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping querier",ix,re.I)):
					str1="ip igmp snooping vlan %s querier"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping minimum\-version",ix,re.I)):
					str1="ip igmp snooping vlan %s minimum-version"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping mrouter",ix,re.I)):
					str1="ip igmp snooping vlan %s mrouter"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping static",ix,re.I)):
					str1="ip igmp snooping vlan %s static"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping robustness\-variable",ix,re.I)):
					str1="ip igmp snooping vlan %s robustness-variable"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping report\-suppression",ix,re.I)):
					str1="ip igmp snooping vlan %s report-suppression"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ip igmp snooping report\-suppression",ix,re.I)):
					str1="ip igmp snooping vlan %s report-suppression"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ipv6 mld snooping immediate",ix,re.I)):
					str1="ipv6 mld snooping vlan %s immediate-leave"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ipv6 mld snooping last\-listener\-query\-count",ix,re.I)):
					str1="ipv6 mld snooping vlan %s last-listener-query-count "%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ipv6 mld snooping querier",ix,re.I)):
					str1="ipv6 mld snooping vlan %s querier"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ipv6 mld snooping mrouter",ix,re.I)):
					str1="ipv6 mld snooping vlan %s mrouter"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ipv6 mld snooping robustness",ix,re.I)):
					str1="ipv6 mld snooping vlan %s robustness-variable"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
				elif ( re.match("^ *ipv6 mld snooping static",ix,re.I)):
					str1="ipv6 mld snooping vlan %s static"%(capt1)
					val+=str1 + "\n"
					#x=0
					#capt1=""
					continue
			pattern1="^"+ix+".*"
			pattern1=re.escape(pattern1)
			if (re.match("^ *$",ix,re.I)):
				continue
			#print(pattern,'<br>')
			pattern2 = re.sub("^(.*?) *([0-9]+)",r"\1",ix)
			objpat=re.search("^(.*?) *([0-9]+)",ix,re.I)
			if objpat:
				input_value=objpat.group(2)
			else:
				input_value=""
			pattern2 ="^"+pattern2+".*"
			pattern2=re.escape(pattern2)
			np=re.compile(pattern2,re.IGNORECASE)
			p=re.compile(pattern1,re.IGNORECASE)
			txt1 = open(filename3)
			txt1 = txt1.read().splitlines()
			flag=1
			lineno=[]
			scfl=[]
			result1=[]
			lno=0
			for line in txt1:
				line=line.strip()
				if re.search(r"^<.*?>",line,re.I):
					continue
				m=np.search(line)
				if m:
					flag=0
					result1.append(line)
					lineno.append(lno)
					break
				lno=lno+1
			txt2 =open(filename4)
			txt2=txt2.read().splitlines()
			newlineno=0
			for lno1 in lineno:
				for line in txt2:
					if newlineno == lno1:
						newlineno=0
						if (input_value !=""):
							line=re.sub("WORD",input_value,line)
						scfl.append(line)
						val+= "&" +line + "\n"
						break
					newlineno=newlineno+1
			if flag == 0:
				continue
			c1=1
			sp=re.match(r"^( )+",ix,re.I)
			sub1=""
			if sp :
				sub1=sp.group(1)
			i=ix.strip()
			if i=='!':
				val+="!"+"\n"
				continue
			if (re.search('^ *description',ix,re.I)):
				val+= ix + "\n"
				continue
			if (re.search('^\*|\&|\(|\^|\,|\!|\#|\?',ix,re.I)):
				val+= ix +"#" + "\n"
				continue				
			if (re.search('^(boot +system)',ix,re.I)):
				val+=r"boot system bootflash:(polaris image)" + "\n"
				continue
			if (re.search('^(Version)',ix,re.I)):
				val+=r"version (polaris version)" + "\n"
				continue
			input=re.sub(' +', ' ',i)
			input=input.split(" ")
			with open(filename,'r',buffering=200000) as result:
				#size = min(15000, os.stat(filename).st_size)
				#result.seek(-size, os.SEEK_END)
				#for l2 in read_in_chunks(result,size=200000):
				for l2 in result:
					#jobs.append( pool.apply_async(process,(l2)) )
					j=l2.strip()
					j=j.strip('.')
					j=j.strip()
					#input[0]=re.escape(input[0])
					matchObj = re.match(r"^"+input[0],j,re.I)
					if matchObj:
						output=j.split(" ")
						length1=len(input)
						length2=len(output)
						if length1 == length2 :
							v=0
							cri=""
							for indexi in range(length1):
								if((input[indexi]==output[indexi])==1):
									cri+=input[indexi]+ " "
									v=v+1
								elif re.search(r"WORD|\<LINE\>|LINE|HOSTNAME|\<INTERFACE\>|\<[0-9]+\-[0-9]+\>|(A\.B\.C\.D)",output[indexi],re.I):
									
									cri+=input[indexi]
									v=v+1
								else:
									cri=""
									break
							if v == length1:
								val +=sub1+" " " ".join(input) + "\n"
								c1=0
								break
				#for job in jobs:
				#	job.get()
				#pool.close()				
			if c1 ==1 :
				val+=ix + " " +"#" + "\n"
				#val+= "#" + ix + "\n"
				val1=ix
				#val+= ix + "\$"
				#val+=ix + " " +"\$" + "\n"
		vallist=val.split('\n')
		for val in vallist :
			#val=val.rstrip()
			if (re.search("#",val,re.I)):
				val=val.rstrip('#')
				#val.replace('ser', '')
				clnt = "cli is not there"
				print ('<pre style="border: none; color:#ff1a1a; font-family:serif;font:36px" >'+val+'</pre><br>')
			elif (re.search("^&.*",val,re.I)):
				val=val.lstrip('&')
				print ('<pre style="border: none; color:#00ff00; font-family:serif;font:36px" >'+val+'</pre><br>')
			elif (re.search("description|boot *system",val,re.I)):
				print ('<pre style="border: none; color:blue; font-family:serif;font:36px" >'+val+'</pre><br>')
			elif (re.search("vlan +[0-9]+",val,re.I)):
				print ('<pre style="border: none; color:#00ff00; font-family:serif;font:36px" >'+val+'</pre><br>')
			else:
				print ('<pre style="border: none; font-family:serif;font:36px" >'+val+'</pre><br>')
		
		
		
	
		fo = open("foo.docs", "w+")
		line = fo.readlines()
		fo.write("")
		fo.write(val)
		fo.close()


		htmlTail()
	except:
		cgi.print_exception()
