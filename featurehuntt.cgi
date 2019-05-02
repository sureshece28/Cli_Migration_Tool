#!/usr/cisco/python-3.3.1/bin/python3
import cgi
import re
import os
import cgitb; cgitb.enable()
import subprocess
import os
import pickle

import multiprocessing as mp
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
		val1 = ""
		z=0
		pattern=form.getvalue('comment')
		pattern = pattern.strip()
		y=pattern.split('\n')
		#y=pattern.split('\r')
		length = len(y)
		
		
		x=0
		capt1="xx"
		
		fo = open("foo.html", "w+")
		pattern  = re.compile(r'interface (G|F|T|P|H).*',re.IGNORECASE)
		pattern1 = re.compile(r'ip address.*')
		pattern2 = re.compile(r'stackwise-virtual.*')
		pattern3 = re.compile(r'interface (G|F|T|P|H).*\.\d+$', re.IGNORECASE)
		pattern4 = re.compile(r'ipv6 address.*|ipv6 enable')
		pattern5 = re.compile(r'interface tunnel.*',re.IGNORECASE)
		for i in range(length):
			string = y[i].strip()
			
			if pattern3.match(string):
				b = y[i]
				
			elif pattern.match(string):
				tmp = []
				if i < length -1:
	
					for j in range(i,length):
						new_str = y[j].strip()
						if new_str != '!':
							tmp.append(new_str)
						else :
							break
	
					
					if len(tmp) == 1 :
	
							replace_str = y[i] + ' switchport' + '\n'
							#b = y[i].replace(y[i], replace_str)
							
					else :
						replace_str = y[i] + ' switchport' + '\n'
						for l in tmp:
							l = l.strip()
							if pattern1.match(l):
								replace_str = y[i] + ' no switchport' + '\n'
	
						for l in tmp:
							l = l.strip()
							if pattern4.match(l):
								replace_str = y[i] + ' no switchport' + '\n'
	
						for l in tmp:
							l = l.strip()
							if l == 'switchport mode access' or l == 'switchport mode trunk':
								replace_str = y[i] + ' switchport' + '\n'
	
						for l in tmp:
							l = l.strip()
							if l == 'no ip address':
								replace_str = y[i] + ' no switchport' + '\n'
	
						for l in tmp:
							l = l.strip()
							if l == 'switchport' or l == 'vrf forwarding Mgmt-vrf' or l == 'no switchport':
								replace_str = y[i]
						
						for l in tmp:
							l = l.strip()
							if pattern2.match(l):
								replace_str = y[i]
							
							elif pattern5.match(l):
								replace_str = y[i]
							
					b = y[i].replace(y[i], replace_str)
								
	
	
	
	
			else :
				b = y[i]
			val += b
			fo.write(b)
			
		fo.close()
		
		
		val = ('<pre style="border: none; color:black; font-family:serif; font:15px" >'+val+'</pre><br>')
		print(val)
		

		htmlTail()
	except:
		cgi.print_exception()
